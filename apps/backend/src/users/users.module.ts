import { Module } from '@nestjs/common'
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js'
import { UsersService } from './users.service.js'
import { UsersController } from './users.controller.js'
import { UsersRepository } from './users.repository.js'
import { USERS_REPOSITORY } from './users.repository.interface.js'

@Module({
  imports: [CloudinaryModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: USERS_REPOSITORY, useClass: UsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
