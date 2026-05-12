import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common'
import type { Server, Socket } from 'socket.io'
import { PrismaService } from '../prisma/prisma.service.js'
import { TokenService } from '../token/token.service.js'

type ChatJoinDto = {
  chatId: string
}

type SendMessageDto = {
  chatId: string
  text: string
  clientMessageId?: string
}

type TypingUpdateDto = {
  chatId: string
  isTyping: boolean
}

type ChatNewPayload = {
  id: string
  title: string
  type: string
  lastMessage: string
  updatedAt: string
  companion: {
    id: number
    login: string
  } | null
}

@WebSocketGateway({
  namespace: '/ws',
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',').map((s) => s.trim()) ?? true,
    credentials: true,
  },
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server

  private readonly logger = new Logger(WsGateway.name)

  constructor(
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client)
      if (!token) {
        client.disconnect(true)
        return
      }

      const payload = this.tokenService.verifyAccess(token)

      client.data.user = { id: payload.sub, login: payload.login }

      client.join(`user:${payload.sub}`)

      this.logger.log(`WS connected: socket=${client.id}, user=${payload.sub}`)
    } catch {
      client.disconnect(true)
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.user?.id
    this.logger.log(`WS disconnected: socket=${client.id}, user=${userId ?? 'unknown'}`)
  }

  notifyChatCreated(userId: number, chat: ChatNewPayload) {
    this.server.to(`user:${userId}`).emit('chat:new', chat)
  }

  @SubscribeMessage('chat:join')
  async joinChat(
    @MessageBody() dto: ChatJoinDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.ensureAuth(client)

    const user = client.data.user as { id: string; login?: string }

    await this.ensureChatAccess(dto.chatId, Number(user.id))

    await client.join(`chat:${dto.chatId}`)

    return { ok: true }
  }

  @SubscribeMessage('message:new')
  async newMessage(
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.ensureAuth(client)

    const user = client.data.user as { id: string; login?: string }
    const userId = Number(user.id)
    const text = dto.text.trim()

    if (!text) {
      throw new Error('Message text is empty')
    }

    await this.ensureChatAccess(dto.chatId, userId)

    if (dto.clientMessageId) {
      const existingMessage = await this.prisma.message.findFirst({
        where: {
          chatId: dto.chatId,
          clientMessageId: dto.clientMessageId,
          authorId: userId,
        },
      })

      if (existingMessage) {
        const mappedExistingMessage = {
          id: existingMessage.id,
          clientMessageId: existingMessage.clientMessageId ?? '',
          chatId: existingMessage.chatId,
          authorId: String(existingMessage.authorId),
          text: existingMessage.text,
          createdAt: existingMessage.createdAt.toISOString(),
        }

        client.to(`chat:${dto.chatId}`).emit('message:new', mappedExistingMessage)

        return mappedExistingMessage
      }
    }

    const createdMessage = await this.prisma.message.create({
      data: {
        chatId: dto.chatId,
        authorId: userId,
        text,
        clientMessageId: dto.clientMessageId ?? null,
      },
    })

    await this.prisma.chat.update({
      where: { id: dto.chatId },
      data: { updatedAt: createdMessage.createdAt },
    })

    const message = {
      id: createdMessage.id,
      clientMessageId: createdMessage.clientMessageId ?? '',
      chatId: createdMessage.chatId,
      authorId: String(createdMessage.authorId),
      text: createdMessage.text,
      createdAt: createdMessage.createdAt.toISOString(),
    }

    client.to(`chat:${dto.chatId}`).emit('message:new', message)

    return message
  }

  @SubscribeMessage('typing:update')
  async typingUpdate(
    @MessageBody() dto: TypingUpdateDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.ensureAuth(client)

    const user = client.data.user as { id: string; login?: string }

    await this.ensureChatAccess(dto.chatId, Number(user.id))

    client.to(`chat:${dto.chatId}`).emit('typing:update', {
      chatId: dto.chatId,
      userId: user.id,
      isTyping: dto.isTyping,
    })

    return { ok: true }
  }

  private extractToken(client: Socket): string | null {
    const raw = client.handshake.auth?.token
    if (typeof raw === 'string' && raw.trim().length > 0) return raw.trim()
    return null
  }

  private ensureAuth(client: Socket) {
    if (!client.data?.user?.id) {
      client.disconnect(true)
      throw new Error('Unauthorized')
    }
  }

  private async ensureChatAccess(chatId: string, userId: number) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } },
    })

    if (participant) return

    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      select: { id: true },
    })

    if (!chat) throw new NotFoundException('Чат не найден')

    throw new ForbiddenException('Нет доступа к этому чату')
  }
}
