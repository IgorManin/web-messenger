import type { User } from '@prisma/client'

export const USERS_REPOSITORY = Symbol('IUsersRepository')

export type CreateUserData = {
  login: string
  passwordHash: string
  userName?: string
  email?: string
}

export type UserSearchResult = {
  id: number
  login: string
  avatarUrl: string | null
}

export interface IUsersRepository {
  findById(id: number): Promise<User | null>
  findByLogin(login: string): Promise<User | null>
  createUser(data: CreateUserData): Promise<User>
  updateRefreshTokenHash(userId: number, hash: string | null): Promise<void>
  updateAvatar(userId: number, avatarUrl: string): Promise<User>
  searchUsers(query: string, currentUserId: number): Promise<UserSearchResult[]>
  generateUserName(login: string): Promise<string>
}
