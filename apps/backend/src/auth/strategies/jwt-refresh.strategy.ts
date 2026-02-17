import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import { JwtPayload } from '../types/jwt-payload.type.js'

const cookieExtractor = (req: any): string | null => {
    return req?.cookies?.refresh ?? null
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        const secret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET
        if (!secret) {
            throw new Error('JWT refresh secret is not set (JWT_REFRESH_SECRET/JWT_SECRET)')
        }

        super({
            jwtFromRequest: cookieExtractor,
            secretOrKey: secret,
            ignoreExpiration: false,
        })
    }

    validate(payload: JwtPayload) {
        return { id: payload.sub, login: payload.login }
    }
}