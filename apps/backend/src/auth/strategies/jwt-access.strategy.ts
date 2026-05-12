import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { TokenService } from '../../token/token.service.js'
import type { JwtPayload } from '../../token/token.types.js'

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(tokenService: TokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: tokenService.getAccessSecret(),
      ignoreExpiration: false,
    })
  }

  validate(payload: JwtPayload) {
    return { id: Number(payload.sub), login: payload.login }
  }
}
