import type { User } from '@prisma/client'

export const AUTH_REPOSITORY = Symbol('IAuthRepository')

export interface IAuthRepository {
  findByLogin(login: string): Promise<User | null>
  findByIdWithRefresh(id: number): Promise<{ id: number; login: string; refreshTokenHash: string | null } | null>
  updateRefreshTokenHash(userId: number, hash: string | null): Promise<void>
}
