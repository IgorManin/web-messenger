import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByLogin(login: string) {
    return this.prisma.user.findUnique({ where: { login } });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        userName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    return user;
  }

  findByIdWithRefresh(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        refreshTokenHash: true,
      },
    });
  }

  findByUserName(userName: string) {
    return this.prisma.user.findUnique({ where: { userName } });
  }

  async generateUserName(login: string): Promise<string> {
    const sanitized = login.replace(/[^a-zA-Zа-яА-ЯёЁ0-9_]/g, "");
    const base = `@${sanitized}`;

    for (let i = 1; i <= 10; i++) {
      const candidate = i === 1 ? base : `${base}${i}`;
      const taken = await this.findByUserName(candidate);
      if (!taken) return candidate;
    }

    throw new ConflictException("Не удалось сгенерировать уникальный userName");
  }

  createUser(data: {
    login: string;
    passwordHash: string;
    userName?: string;
    email?: string;
  }) {
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
