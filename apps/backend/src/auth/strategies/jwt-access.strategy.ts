import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from '../types/jwt-payload.type.js'

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor() {
        const secret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET
        if (!secret) throw new Error('JWT access secret is not set (JWT_ACCESS_SECRET/JWT_SECRET)')

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
            ignoreExpiration: false,
        })
    }

    validate(payload: JwtPayload) {
        return { id: payload.sub, login: payload.login }
    }
}