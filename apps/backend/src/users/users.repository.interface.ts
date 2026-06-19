import type { User } from '@prisma/client'

export const USERS_REPOSITORY = Symbol('IUsersRepository')

export type CreateUserData = {
  login: string
  passwordHash: string
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
  updateAvatar(userId: number, avatarUrl: string): Promise<User>
  searchUsers(query: string, currentUserId: number): Promise<UserSearchResult[]>
}
