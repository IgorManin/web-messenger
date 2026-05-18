import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets'
import {
  ForbiddenException,
  Inject,
  Logger,
  NotFoundException,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Server, Socket } from 'socket.io'
import { TokenService } from '../token/token.service.js'
import { CHAT_REPOSITORY } from '../chat/chat.repository.interface.js'
import type { IChatRepository } from '../chat/chat.repository.interface.js'
import { MESSAGE_REPOSITORY } from '../chat/message.repository.interface.js'
import type { IMessageRepository } from '../chat/message.repository.interface.js'
import { GlobalExceptionFilter } from '../common/filters/global-exception.filter.js'
import { ChatJoinDto, SendMessageDto, TypingUpdateDto } from './dto/ws.dto.js'

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

@UseFilters(GlobalExceptionFilter)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@WebSocketGateway({ namespace: '/ws' })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server!: Server

  private readonly logger = new Logger(WsGateway.name)

  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    @Inject(CHAT_REPOSITORY) private readonly chatRepository: IChatRepository,
    @Inject(MESSAGE_REPOSITORY) private readonly messageRepository: IMessageRepository,
  ) {}

  afterInit(server: Server) {
    server.engine.opts.cors = {
      origin: this.configService.get<string[]>('cors.allowedOrigins'),
      credentials: true,
    }
  }

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

    const userId = this.parseUserId(client)

    await this.ensureChatAccess(dto.chatId, userId)

    await client.join(`chat:${dto.chatId}`)

    return { ok: true }
  }

  @SubscribeMessage('message:new')
  async newMessage(
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.ensureAuth(client)

    const userId = this.parseUserId(client)
    const text = dto.text.trim()

    if (!text) {
      throw new ForbiddenException('Текст сообщения не может быть пустым')
    }

    await this.ensureChatAccess(dto.chatId, userId)

    if (dto.clientMessageId) {
      const existingMessage = await this.messageRepository.findByClientMessageId(
        dto.chatId,
        dto.clientMessageId,
        userId,
      )

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

    const createdMessage = await this.messageRepository.create({
      chatId: dto.chatId,
      authorId: userId,
      text,
      clientMessageId: dto.clientMessageId ?? null,
    })

    await this.chatRepository.updateTimestamp(dto.chatId, createdMessage.createdAt)

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
    const userId = this.parseUserId(client)

    await this.ensureChatAccess(dto.chatId, userId)

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
      throw new ForbiddenException('Unauthorized')
    }
  }

  private parseUserId(client: Socket): number {
    const userId = parseInt(String(client.data.user.id), 10)
    if (isNaN(userId)) {
      client.disconnect(true)
      throw new ForbiddenException('Invalid user identity')
    }
    return userId
  }

  private async ensureChatAccess(chatId: string, userId: number) {
    const participant = await this.chatRepository.findParticipant(chatId, userId)

    if (participant) return

    const chat = await this.chatRepository.findById(chatId)

    if (!chat) throw new NotFoundException('Чат не найден')

    throw new ForbiddenException('Нет доступа к этому чату')
  }
}
