import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from '../types/jwt-payload.type.js'

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>('jwt.accessSecret')!,
            ignoreExpiration: false,
        })
    }

    validate(payload: JwtPayload) {
        return { id: payload.sub, login: payload.login }
    }
}