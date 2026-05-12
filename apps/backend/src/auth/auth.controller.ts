import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { AuthService } from "./auth.service.js";
import { JwtAccessGuard } from "./guards/jwt-access.guard.js";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard.js";
import { CurrentUser } from "./decorators/current-user.decorator.js";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  private getCookieOptions() {
    const isProd = process.env.NODE_ENV === "production";
    const domain = process.env.COOKIE_DOMAIN || undefined;

    return {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? "none" : "lax") as "none" | "lax",
      path: "/auth/refresh",
      domain,
    };
  }

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(
      dto.login,
      dto.password,
      dto.email,
    );
    res.cookie("refresh", result.refreshToken, this.getCookieOptions());
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto.login, dto.password);
    res.cookie("refresh", result.refreshToken, this.getCookieOptions());
    return { accessToken: result.accessToken };
  }

  @UseGuards(JwtAccessGuard)
  @Get("me")
  me(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  async refresh(
    @CurrentUser() user: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh;
    const tokens = await this.authService.refresh(user, refreshToken);
    res.cookie("refresh", tokens.refreshToken, this.getCookieOptions());
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(JwtAccessGuard)
  @Post("logout")
  async logout(
    @CurrentUser() user: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id, req.cookies?.refresh);
    res.clearCookie("refresh", this.getCookieOptions());
    return { ok: true };
  }
}
