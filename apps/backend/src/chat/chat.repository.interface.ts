import type { ChatWithRelations, CreateDirectChatData } from './chat.types.js'

export const CHAT_REPOSITORY = Symbol('IChatRepository')

export interface IChatRepository {
  findByDirectKey(directChatKey: string): Promise<ChatWithRelations | null>
  findById(chatId: string): Promise<ChatWithRelations | null>
  findParticipant(chatId: string, userId: number): Promise<{ userId: number } | null>
  createDirect(data: CreateDirectChatData): Promise<ChatWithRelations>
  getChatsForUser(userId: number): Promise<ChatWithRelations[]>
  updateTimestamp(chatId: string, timestamp: Date): Promise<void>
}
