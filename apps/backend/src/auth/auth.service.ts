import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service.js";
import { JwtService } from "@nestjs/jwt";
import type { SignOptions } from "jsonwebtoken";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private get accessSecret() {
    return process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET ?? "dev";
  }
  private get refreshSecret() {
    return process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? "dev";
  }
  private get accessExpiresIn(): SignOptions["expiresIn"] {
    return (process.env.JWT_ACCESS_EXPIRES_IN ??
      "15m") as SignOptions["expiresIn"];
  }
  private get refreshExpiresIn(): SignOptions["expiresIn"] {
    return (process.env.JWT_REFRESH_EXPIRES_IN ??
      "7d") as SignOptions["expiresIn"];
  }

  private async issueTokens(user: { id: number; login: string }) {
    const payload = { sub: user.id, login: user.login };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  private async setRefreshHash(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(userId, hash);
  }

  async register(login: string, password: string) {
    const existing = await this.usersService.findByLogin(login);
    if (existing) throw new ConflictException("Логин уже занят");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser({ login, passwordHash });

    const tokens = await this.issueTokens({ id: user.id, login: user.login });
    await this.setRefreshHash(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, login: user.login, createdAt: user.createdAt },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(login: string, password: string) {
    const user = await this.usersService.findByLogin(login);
    if (!user) throw new UnauthorizedException("Неверный логин или пароль");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Неверный логин или пароль");

    const tokens = await this.issueTokens({ id: user.id, login: user.login });
    await this.setRefreshHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.usersService.findByIdWithRefresh(userId);
    if (!user?.refreshTokenHash)
      throw new UnauthorizedException("Нет активной сессии");

    const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!ok) throw new UnauthorizedException("Refresh token невалиден");

    const tokens = await this.issueTokens({ id: user.id, login: user.login });
    await this.setRefreshHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number) {
    await this.usersService.updateRefreshTokenHash(userId, null);
    return { ok: true };
  }
}
