import { ConflictException, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import {UsersService} from "../users/users.service.js";

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async register(login: string, password: string) {
        const existing = await this.usersService.findByLogin(login)
        if (existing) {
            throw new ConflictException('Логин уже занят')
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const user = await this.usersService.createUser({ login, passwordHash })

        return {
            id: user.id,
            login: user.login,
            createdAt: user.createdAt,
        }
    }
}