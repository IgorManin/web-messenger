import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type { IMessageRepository } from './message.repository.interface.js'
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
}
