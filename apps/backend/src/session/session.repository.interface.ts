import type { Session } from '@prisma/client'

export const SESSION_REPOSITORY = Symbol('ISessionRepository')

export interface ISessionRepository {
  create(userId: number, tokenHash: string, expiresAt: Date): Promise<void>
  findByTokenHash(tokenHash: string): Promise<Session | null>
  rotate(oldSessionId: string, userId: number, newTokenHash: string, expiresAt: Date): Promise<void>
  deleteById(sessionId: string): Promise<void>
  deleteAllByUserId(userId: number): Promise<void>
}
