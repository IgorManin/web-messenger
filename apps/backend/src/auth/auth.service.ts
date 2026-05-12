import { createHash } from 'crypto'
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service.js'
import { TokenService } from '../token/token.service.js'
import { AUTH_REPOSITORY } from './auth.repository.interface.js'
import type { IAuthRepository } from './auth.repository.interface.js'
import { SESSION_REPOSITORY } from '../session/session.repository.interface.js'
import type { ISessionRepository } from '../session/session.repository.interface.js'

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessionRepository: ISessionRepository,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  private async issueTokens(user: { id: number; login: string }) {
    const payload = { sub: user.id, login: user.login }
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccess(payload),
      this.tokenService.signRefresh(payload),
    ])
    return { accessToken, refreshToken }
  }

  private async createSession(userId: number, refreshToken: string): Promise<void> {
    const hash = this.hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
    await this.sessionRepository.create(userId, hash, expiresAt)
  }

  async register(login: string, password: string, email?: string) {
    const existing = await this.authRepository.findByLogin(login)
    if (existing) throw new ConflictException('Логин уже занят')

    const passwordHash = await bcrypt.hash(password, 10)
    const userName = await this.usersService.generateUserName(login)
    const user = await this.usersService.createUser({ login, passwordHash, userName, email })

    const tokens = await this.issueTokens({ id: user.id, login: user.login })
    await this.createSession(user.id, tokens.refreshToken)

    return {
      user: {
        id: user.id,
        login: user.login,
        userName: user.userName,
        createdAt: user.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }

  async login(login: string, password: string) {
    const user = await this.authRepository.findByLogin(login)
    if (!user) throw new UnauthorizedException('Неверный логин или пароль')

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new UnauthorizedException('Неверный логин или пароль')

    const tokens = await this.issueTokens({ id: user.id, login: user.login })
    await this.createSession(user.id, tokens.refreshToken)

    return tokens
  }

  async refresh(user: { id: number; login: string }, refreshToken: string) {
    const hash = this.hashToken(refreshToken)
    const session = await this.sessionRepository.findByTokenHash(hash)

    if (!session) throw new UnauthorizedException('Нет активной сессии')

    if (session.used) {
      await this.sessionRepository.deleteAllByUserId(session.userId)
      throw new UnauthorizedException('Сессия недействительна')
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.deleteById(session.id)
      throw new UnauthorizedException('Сессия истекла')
    }

    const tokens = await this.issueTokens({ id: user.id, login: user.login })
    const newHash = this.hashToken(tokens.refreshToken)
    const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS)
    await this.sessionRepository.rotate(session.id, user.id, newHash, newExpiresAt)

    return tokens
  }

  async logout(userId: number, refreshToken?: string) {
    if (refreshToken) {
      const hash = this.hashToken(refreshToken)
      const session = await this.sessionRepository.findByTokenHash(hash)
      if (session) {
        await this.sessionRepository.deleteById(session.id)
      }
    } else {
      await this.sessionRepository.deleteAllByUserId(userId)
    }
    return { ok: true }
  }
}
