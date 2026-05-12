import type { User } from '@prisma/client'

export const AUTH_REPOSITORY = Symbol('IAuthRepository')

export interface IAuthRepository {
  findByLogin(login: string): Promise<User | null>
}
