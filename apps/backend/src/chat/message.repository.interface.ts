import type { Message } from '@prisma/client'
import type { CreateMessageData } from './chat.types.js'

export const MESSAGE_REPOSITORY = Symbol('IMessageRepository')

export type MessageAuthorRef = { id: string; authorId: number }

export interface IMessageRepository {
  findByClientMessageId(chatId: string, clientMessageId: string, authorId: number): Promise<Message | null>
  create(data: CreateMessageData): Promise<Message>
  getByChat(chatId: string): Promise<Message[]>
  markDelivered(messageId: string): Promise<void>
  markChatAsRead(chatId: string, readerId: number): Promise<MessageAuthorRef[]>
}
