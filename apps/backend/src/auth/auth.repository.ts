import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type { IAuthRepository } from './auth.repository.interface.js'

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByLogin(login: string) {
    return this.prisma.user.findUnique({ where: { login } })
  }
}
