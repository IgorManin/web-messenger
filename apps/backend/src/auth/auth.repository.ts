import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type { IAuthRepository } from './auth.repository.interface.js'

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByLogin(login: string) {
    return this.prisma.user.findUnique({ where: { login } })
  }

  findByIdWithRefresh(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        refreshTokenHash: true,
      },
    })
  }

  async updateRefreshTokenHash(userId: number, hash: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    })
  }
}
