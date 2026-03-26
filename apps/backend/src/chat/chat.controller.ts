import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { JwtAccessGuard } from "../auth/guards/jwt-access.guard.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { CreateDirectChatDto } from "./dto/create-direct-chat.dto.js";

type CurrentAuthUser = {
  id: number;
  login: string;
};

@UseGuards(JwtAccessGuard)
@Controller("chats")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getChats(@CurrentUser() user: CurrentAuthUser) {
    return this.chatService.getChatsForUser(user.id);
  }

  @Get(":chatId/messages")
  getChatMessages(
    @Param("chatId") chatId: string,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    return this.chatService.getMessagesByChat(chatId, user.id);
  }

  @Post("direct")
  async createOrGetDirectChat(
    @Body() dto: CreateDirectChatDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const result = await this.chatService.createOrGetDirectChat(
      user.id,
      dto.targetUserId,
    );

    return result.chat;
  }
}
