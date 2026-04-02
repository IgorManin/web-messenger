import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { JwtAccessGuard } from "../auth/guards/jwt-access.guard.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { CreateDirectChatDto } from "./dto/create-direct-chat.dto.js";
import { CreateDirectFirstMessageDto } from "./dto/create-direct-first-message.dto.js";
import { WsGateway } from "../ws/ws.gateway.js";

type CurrentAuthUser = {
  id: number;
  login: string;
};

@UseGuards(JwtAccessGuard)
@Controller("chats")
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly wsGateway: WsGateway,
  ) {}

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

  @Post("direct/first-message")
  async createDirectFirstMessage(
    @Body() dto: CreateDirectFirstMessageDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const result = await this.chatService.createDirectFirstMessage(
      user.id,
      dto,
    );

    this.wsGateway.notifyChatCreated(
      result.targetUserId,
      result.chatForTargetUser,
    );

    return {
      chat: result.chat,
      message: result.message,
      createdChat: result.createdChat,
    };
  }
}
