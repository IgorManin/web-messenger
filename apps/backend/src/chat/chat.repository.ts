import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type { IChatRepository } from './chat.repository.interface.js'
import type { ChatWithRelations, CreateDirectChatData } from './chat.types.js'

const userSelect = { select: { id: true, login: true, avatarUrl: true } } as const
const participantsInclude = { include: { user: userSelect } } as const
const messagesInclude = { orderBy: { createdAt: 'desc' as const }, take: 1 } as const

const chatInclude = {
  participants: participantsInclude,
  messages: messagesInclude,
} as const

@Injectable()
export class ChatRepository implements IChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByDirectKey(directChatKey: string): Promise<ChatWithRelations | null> {
    return this.prisma.chat.findUnique({
      where: { directChatKey },
      include: chatInclude,
    })
  }

  findById(chatId: string): Promise<ChatWithRelations | null> {
    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: chatInclude,
    })
  }

  findParticipant(chatId: string, userId: number) {
    return this.prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } },
    })
  }

  createDirect(data: CreateDirectChatData): Promise<ChatWithRelations> {
    return this.prisma.chat.create({
      data: {
        title: data.title,
        type: 'direct',
        directChatKey: data.directChatKey,
        participants: {
          create: data.participantIds.map((userId) => ({ userId })),
        },
      },
      include: chatInclude,
    })
  }

  getChatsForUser(userId: number): Promise<ChatWithRelations[]> {
    return this.prisma.chat.findMany({
      where: {
        participants: { some: { userId } },
        OR: [
          { type: 'group' },
          { type: 'direct', messages: { some: {} } },
        ],
      },
      include: chatInclude,
      orderBy: { updatedAt: 'desc' },
    })
  }

  async updateTimestamp(chatId: string, timestamp: Date): Promise<void> {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: timestamp },
    })
  }

  async getCoParticipantUserIds(userId: number): Promise<number[]> {
    const rows = await this.prisma.chatParticipant.findMany({
      where: {
        chat: { participants: { some: { userId } } },
        userId: { not: userId },
      },
      select: { userId: true },
      distinct: ['userId'],
    })
    return rows.map((row) => row.userId)
  }
}
