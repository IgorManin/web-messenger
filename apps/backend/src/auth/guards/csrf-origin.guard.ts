import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";

@Injectable()
export class CsrfOriginGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.headers.origin;

    const allowedOrigins =
      this.configService.get<string[]>("cors.allowedOrigins") ?? [];

    if (!origin || !allowedOrigins.includes(origin)) {
      throw new ForbiddenException("Недопустимый источник запроса");
    }

    return true;
  }
}
