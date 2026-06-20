import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { USERS_REPOSITORY } from './users.repository.interface.js'
import type { IUsersRepository, CreateUserData } from './users.repository.interface.js'

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepository: IUsersRepository,
  ) {}

  findByLogin(login: string) {
    return this.usersRepository.findByLogin(login)
  }

  async findById(id: number) {
    const user = await this.usersRepository.findById(id)
    if (!user) throw new NotFoundException('Пользователь не найден')

    const { passwordHash, ...safe } = user
    return safe
  }

  createUser(data: CreateUserData) {
    return this.usersRepository.createUser(data)
  }

  searchUsers(login: string, currentUserId: number) {
    return this.usersRepository.searchUsers(login, currentUserId)
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    const user = await this.usersRepository.updateAvatar(userId, avatarUrl)
    return { id: user.id, login: user.login, avatarUrl: user.avatarUrl }
  }

  async updateProfile(userId: number, data: { login?: string; email?: string }) {
    const user = await this.usersRepository.updateProfile(userId, data)
    const { passwordHash, ...safe } = user
    return safe
  }
}
