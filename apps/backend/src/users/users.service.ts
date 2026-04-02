import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByLogin(login: string) {
    return this.prisma.user.findUnique({ where: { login } });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createUser(data: { login: string; passwordHash: string }) {
    return this.prisma.user.create({ data });
  }

  updateRefreshTokenHash(userId: number, refreshTokenHash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  searchUsers(login: string, currentUserId: number) {
    return this.prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
        login: {
          contains: login,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        login: true,
        avatarUrl: true,
      },
      take: 20,
      orderBy: {
        login: "asc",
      },
    });
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        login: true,
        avatarUrl: true,
      },
    });
  }
}
