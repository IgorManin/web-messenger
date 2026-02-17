import { Injectable } from '@nestjs/common'
import {PrismaService} from "../prisma/prisma.service.js";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    findByLogin(login: string) {
        return this.prisma.user.findUnique({ where: { login } })
    }

    createUser(data: { login: string; passwordHash: string }) {
        return this.prisma.user.create({ data })
    }
}