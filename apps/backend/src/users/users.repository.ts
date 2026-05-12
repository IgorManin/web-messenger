import { ConflictException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type { IUsersRepository, CreateUserData, UserSearchResult } from './users.repository.interface.js'
import type { User } from '@prisma/client'

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  findByLogin(login: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { login } })
  }

  private findByUserName(userName: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { userName } })
  }

  createUser(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({ data })
  }

  async updateRefreshTokenHash(userId: number, hash: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    })
  }

  updateAvatar(userId: number, avatarUrl: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    })
  }

  searchUsers(query: string, currentUserId: number): Promise<UserSearchResult[]> {
    return this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        login: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true,
        login: true,
        avatarUrl: true,
      },
      take: 20,
      orderBy: { login: 'asc' },
    })
  }

  async generateUserName(login: string): Promise<string> {
    const sanitized = login.replace(/[^a-zA-Zа-яА-ЯёЁ0-9_]/g, '')
    const base = `@${sanitized}`

    for (let i = 1; i <= 10; i++) {
      const candidate = i === 1 ? base : `${base}${i}`
      const taken = await this.findByUserName(candidate)
      if (!taken) return candidate
    }

    throw new ConflictException('Не удалось сгенерировать уникальный userName')
  }
}
