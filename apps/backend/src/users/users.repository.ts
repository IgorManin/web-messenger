import { Injectable } from '@nestjs/common'
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
    return this.prisma.user.findFirst({
      where: { login: { equals: login, mode: 'insensitive' } },
    })
  }

  createUser(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({ data })
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

}
