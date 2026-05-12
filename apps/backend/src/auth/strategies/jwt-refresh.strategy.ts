import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import { JwtPayload } from '../types/jwt-payload.type.js'

const cookieExtractor = (req: any): string | null => {
    return req?.cookies?.refresh ?? null
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: cookieExtractor,
            secretOrKey: config.get<string>('jwt.refreshSecret')!,
            ignoreExpiration: false,
        })
    }

    validate(payload: JwtPayload) {
        return { id: payload.sub, login: payload.login }
    }
}