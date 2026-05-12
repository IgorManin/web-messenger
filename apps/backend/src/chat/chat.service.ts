import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UsersService } from '../users/users.service.js'
import { CreateDirectFirstMessageDto } from './dto/create-direct-first-message.dto.js'
import { CHAT_REPOSITORY, type IChatRepository } from './chat.repository.interface.js'
import { MESSAGE_REPOSITORY, type IMessageRepository } from './message.repository.interface.js'
import type { ChatWithRelations } from './chat.types.js'

type ChatListItem = {
  id: string
  title: string
  type: string
  lastMessage: string
  updatedAt: string
  companion: {
    id: number
    login: string
    avatarUrl: string | null
  } | null
}

type CreateOrGetDirectChatResult = {
  chat: ChatListItem
  chatForTargetUser: ChatListItem
  created: boolean
  targetUserId: number
}

type CreateDirectFirstMessageResult = {
  chat: ChatListItem
  chatForTargetUser: ChatListItem
  message: {
    id: string
    clientMessageId: string
    chatId: string
    authorId: string
    text: string
    createdAt: string
  }
  createdChat: boolean
  targetUserId: number
}

@Injectable()
export class ChatService {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly chatRepository: IChatRepository,
    @Inject(MESSAGE_REPOSITORY) private readonly messageRepository: IMessageRepository,
    private readonly usersService: UsersService,
  ) {}

  private buildDirectChatKey(firstUserId: number, secondUserId: number) {
    const [minUserId, maxUserId] = [firstUserId, secondUserId].sort((a, b) => a - b)
    return `${minUserId}:${maxUserId}`
  }

  private mapChatListItem(chat: ChatWithRelations, currentUserId: number): ChatListItem {
    const lastMessage = chat.messages[0] ?? null
    const actualUpdatedAt = lastMessage?.createdAt ?? chat.updatedAt

    const companion =
      chat.type === 'direct'
        ? (chat.participants.find((p) => p.userId !== currentUserId)?.user ?? null)
        : null

    return {
      id: chat.id,
      title: chat.type === 'direct' ? (companion?.login ?? chat.title) : chat.title,
      type: chat.type,
      lastMessage: lastMessage?.text ?? '',
      updatedAt: actualUpdatedAt.toISOString(),
      companion,
    }
  }

  async getChatsForUser(userId: number) {
    const chats = await this.chatRepository.getChatsForUser(userId)
    return chats
      .map((chat) => this.mapChatListItem(chat, userId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  async getMessagesByChat(chatId: string, userId: number) {
    const participant = await this.chatRepository.findParticipant(chatId, userId)

    if (!participant) {
      const chat = await this.chatRepository.findById(chatId)
      if (!chat) {
        throw new NotFoundException('Чат не найден')
      }
      throw new ForbiddenException('Нет доступа к этому чату')
    }

    const messages = await this.messageRepository.getByChat(chatId)

    return messages.map((message) => ({
      id: message.id,
      clientMessageId: message.clientMessageId ?? '',
      chatId: message.chatId,
      authorId: String(message.authorId),
      text: message.text,
      createdAt: message.createdAt.toISOString(),
    }))
  }

  async createOrGetDirectChat(
    currentUserId: number,
    targetUserId: number,
  ): Promise<CreateOrGetDirectChatResult> {
    if (currentUserId === targetUserId) {
      throw new BadRequestException('Нельзя создать чат с самим собой')
    }

    const targetUser = await this.usersService.findById(targetUserId)
    if (!targetUser) {
      throw new NotFoundException('Пользователь не найден')
    }

    const directChatKey = this.buildDirectChatKey(currentUserId, targetUserId)
    const existingChat = await this.chatRepository.findByDirectKey(directChatKey)

    if (existingChat) {
      return {
        chat: this.mapChatListItem(existingChat, currentUserId),
        chatForTargetUser: this.mapChatListItem(existingChat, targetUserId),
        created: false,
        targetUserId,
      }
    }

    const createdChat = await this.chatRepository.createDirect({
      title: targetUser.login,
      directChatKey,
      participantIds: [currentUserId, targetUserId],
    })

    return {
      chat: this.mapChatListItem(createdChat, currentUserId),
      chatForTargetUser: this.mapChatListItem(createdChat, targetUserId),
      created: true,
      targetUserId,
    }
  }

  async createDirectFirstMessage(
    currentUserId: number,
    dto: CreateDirectFirstMessageDto,
  ): Promise<CreateDirectFirstMessageResult> {
    if (currentUserId === dto.targetUserId) {
      throw new BadRequestException('Нельзя создать чат с самим собой')
    }

    const targetUser = await this.usersService.findById(dto.targetUserId)
    if (!targetUser) {
      throw new NotFoundException('Пользователь не найден')
    }

    const text = dto.text.trim()
    if (!text) {
      throw new BadRequestException('Сообщение не должно быть пустым')
    }

    const directChatKey = this.buildDirectChatKey(currentUserId, dto.targetUserId)
    let chat = await this.chatRepository.findByDirectKey(directChatKey)
    let createdChat = false

    if (!chat) {
      chat = await this.chatRepository.createDirect({
        title: targetUser.login,
        directChatKey,
        participantIds: [currentUserId, dto.targetUserId],
      })
      createdChat = true
    }

    if (dto.clientMessageId) {
      const existingMessage = await this.messageRepository.findByClientMessageId(
        chat.id,
        dto.clientMessageId,
        currentUserId,
      )

      if (existingMessage) {
        return {
          chat: this.mapChatListItem(chat, currentUserId),
          chatForTargetUser: this.mapChatListItem(chat, dto.targetUserId),
          createdChat,
          targetUserId: dto.targetUserId,
          message: {
            id: existingMessage.id,
            clientMessageId: existingMessage.clientMessageId ?? '',
            chatId: existingMessage.chatId,
            authorId: String(existingMessage.authorId),
            text: existingMessage.text,
            createdAt: existingMessage.createdAt.toISOString(),
          },
        }
      }
    }

    const message = await this.messageRepository.create({
      chatId: chat.id,
      authorId: currentUserId,
      text,
      clientMessageId: dto.clientMessageId ?? null,
    })

    await this.chatRepository.updateTimestamp(chat.id, message.createdAt)

    const refreshedChat = await this.chatRepository.findById(chat.id)
    if (!refreshedChat) {
      throw new NotFoundException('Чат не найден')
    }

    return {
      chat: this.mapChatListItem(refreshedChat, currentUserId),
      chatForTargetUser: this.mapChatListItem(refreshedChat, dto.targetUserId),
      createdChat,
      targetUserId: dto.targetUserId,
      message: {
        id: message.id,
        clientMessageId: message.clientMessageId ?? '',
        chatId: message.chatId,
        authorId: String(message.authorId),
        text: message.text,
        createdAt: message.createdAt.toISOString(),
      },
    }
  }
}
