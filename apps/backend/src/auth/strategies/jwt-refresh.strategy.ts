import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import { TokenService } from '../../token/token.service.js'
import type { JwtPayload } from '../../token/token.types.js'

const cookieExtractor = (req: any): string | null => {
  return req?.cookies?.refresh ?? null
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(tokenService: TokenService) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: tokenService.getRefreshSecret(),
      ignoreExpiration: false,
    })
  }

  validate(payload: JwtPayload) {
    return { id: Number(payload.sub), login: payload.login }
  }
}
