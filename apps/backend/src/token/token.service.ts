import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import type { SignOptions } from 'jsonwebtoken'
import type { JwtPayload } from './token.types.js'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  signAccess(payload: { sub: number; login: string }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('jwt.accessSecret')!,
      expiresIn: this.config.get<string>('jwt.accessExpiresIn') as SignOptions['expiresIn'],
    })
  }

  signRefresh(payload: { sub: number; login: string }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('jwt.refreshSecret')!,
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn') as SignOptions['expiresIn'],
    })
  }

  verifyAccess(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.config.get<string>('jwt.accessSecret')!,
    })
  }

  verifyRefresh(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.config.get<string>('jwt.refreshSecret')!,
    })
  }

  getAccessSecret(): string {
    return this.config.get<string>('jwt.accessSecret')!
  }

  getRefreshSecret(): string {
    return this.config.get<string>('jwt.refreshSecret')!
  }
}
