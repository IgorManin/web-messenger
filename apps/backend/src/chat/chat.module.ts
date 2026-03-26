import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller.js";
import { ChatService } from "./chat.service.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { UsersModule } from "../users/users.module.js";
import { WsModule } from "../ws/ws.module.js";

@Module({
  imports: [PrismaModule, UsersModule, WsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
