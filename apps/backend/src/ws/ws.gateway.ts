import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { Logger } from "@nestjs/common";
import type { Socket } from "socket.io";

type JwtPayload = {
  sub: string;
  login?: string;
  iat?: number;
  exp?: number;
};

type ChatJoinDto = {
  chatId: string;
};

type SendMessageDto = {
  chatId: string;
  text: string;
  clientMessageId?: string;
};

type TypingUpdateDto = {
  chatId: string;
  isTyping: boolean;
};

@WebSocketGateway({
  namespace: "/ws",
  cors: {
    origin:
      process.env.ALLOWED_ORIGINS?.split(",").map((s) => s.trim()) ?? true,
    credentials: true,
  },
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WsGateway.name);

  constructor(private readonly jwt: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = this.jwt.verify<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      client.data.user = { id: payload.sub, login: payload.login };

      client.join(`user:${payload.sub}`);

      this.logger.log(`WS connected: socket=${client.id}, user=${payload.sub}`);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.user?.id;
    this.logger.log(
      `WS disconnected: socket=${client.id}, user=${userId ?? "unknown"}`,
    );
  }

  @SubscribeMessage("chat:join")
  async joinChat(
    @MessageBody() dto: ChatJoinDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.ensureAuth(client);
    await client.join(`chat:${dto.chatId}`);
    return { ok: true };
  }

  @SubscribeMessage("message:new")
  async newMessage(
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.ensureAuth(client);

    const user = client.data.user as { id: string; login?: string };

    const message = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      chatId: dto.chatId,
      text: dto.text,
      authorId: user.id,
      createdAt: new Date().toISOString(),
      clientMessageId: dto.clientMessageId ?? null,
    };

    client.to(`chat:${dto.chatId}`).emit("message:new", message);

    return message;
  }

  @SubscribeMessage("typing:update")
  async typingUpdate(
    @MessageBody() dto: TypingUpdateDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.ensureAuth(client);

    const user = client.data.user as { id: string; login?: string };

    client.to(`chat:${dto.chatId}`).emit("typing:update", {
      chatId: dto.chatId,
      userId: user.id,
      isTyping: dto.isTyping,
    });

    return { ok: true };
  }

  private extractToken(client: Socket): string | null {
    const raw = client.handshake.auth?.token;
    if (typeof raw === "string" && raw.trim().length > 0) return raw.trim();
    return null;
  }

  private ensureAuth(client: Socket) {
    if (!client.data?.user?.id) {
      client.disconnect(true);
      throw new Error("Unauthorized");
    }
  }
}
