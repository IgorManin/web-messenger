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

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
  ) {}

  private async issueTokens(user: { id: number; login: string }) {
    const payload = { sub: user.id, login: user.login }
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccess(payload),
      this.tokenService.signRefresh(payload),
    ])
    return { accessToken, refreshToken }
  }

  private async setRefreshHash(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10)
    await this.authRepository.updateRefreshTokenHash(userId, hash)
  }

  async register(login: string, password: string, email?: string) {
    const existing = await this.authRepository.findByLogin(login)
    if (existing) throw new ConflictException('Логин уже занят')

    const passwordHash = await bcrypt.hash(password, 10)
    const userName = await this.usersService.generateUserName(login)
    const user = await this.usersService.createUser({ login, passwordHash, userName, email })

    const tokens = await this.issueTokens({ id: user.id, login: user.login })
    await this.setRefreshHash(user.id, tokens.refreshToken)

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
    await this.setRefreshHash(user.id, tokens.refreshToken)

    return tokens
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.authRepository.findByIdWithRefresh(userId)
    if (!user?.refreshTokenHash) throw new UnauthorizedException('Нет активной сессии')

    const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash)
    if (!ok) throw new UnauthorizedException('Refresh token невалиден')

    const tokens = await this.issueTokens({ id: user.id, login: user.login })
    await this.setRefreshHash(user.id, tokens.refreshToken)

    return tokens
  }

  async logout(userId: number) {
    await this.authRepository.updateRefreshTokenHash(userId, null)
    return { ok: true }
  }
}
