import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type { IMessageRepository, MessageAuthorRef } from './message.repository.interface.js'
import type { CreateMessageData } from './chat.types.js'

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByClientMessageId(chatId: string, clientMessageId: string, authorId: number) {
    return this.prisma.message.findFirst({
      where: { chatId, clientMessageId, authorId },
    })
  }

  create(data: CreateMessageData) {
    return this.prisma.message.create({ data })
  }

  getByChat(chatId: string) {
    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async markDelivered(messageId: string): Promise<void> {
    await this.prisma.message.updateMany({
      where: { id: messageId, status: 'sent' },
      data: { status: 'delivered' },
    })
  }

  async markChatAsRead(chatId: string, readerId: number): Promise<MessageAuthorRef[]> {
    const unread = await this.prisma.message.findMany({
      where: {
        chatId,
        authorId: { not: readerId },
        status: { not: 'read' },
      },
      select: { id: true, authorId: true },
    })

    if (unread.length === 0) return []

    await this.prisma.message.updateMany({
      where: { id: { in: unread.map((m) => m.id) } },
      data: { status: 'read' },
    })

    return unread
  }
}
