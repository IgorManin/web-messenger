import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type { ISessionRepository } from './session.repository.interface.js'

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.prisma.session.create({ data: { userId, tokenHash, expiresAt } })
  }

  findByTokenHash(tokenHash: string) {
    return this.prisma.session.findUnique({ where: { tokenHash } })
  }

  async rotate(oldSessionId: string, userId: number, newTokenHash: string, expiresAt: Date): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.session.update({ where: { id: oldSessionId }, data: { used: true } }),
      this.prisma.session.create({ data: { userId, tokenHash: newTokenHash, expiresAt } }),
    ])
  }

  async deleteById(sessionId: string): Promise<void> {
    await this.prisma.session.delete({ where: { id: sessionId } })
  }

  async deleteAllByUserId(userId: number): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } })
  }
}
