import { Module } from "@nestjs/common";
import { HealthModule } from "./health.module.js";
import { MessagesModule } from "./messages.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { WsModule } from "./ws/ws.module.js";
import { ChatModule } from "./chat/chat.module.js";

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    MessagesModule,
    AuthModule,
    WsModule,
    ChatModule,
  ],
})
export class AppModule {}
