import { Module } from '@nestjs/common'
import { ChatController } from './chat.controller.js'
import { ChatService } from './chat.service.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { UsersModule } from '../users/users.module.js'
import { WsModule } from '../ws/ws.module.js'
import { ChatRepository } from './chat.repository.js'
import { CHAT_REPOSITORY } from './chat.repository.interface.js'
import { MessageRepository } from './message.repository.js'
import { MESSAGE_REPOSITORY } from './message.repository.interface.js'

@Module({
  imports: [PrismaModule, UsersModule, WsModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    { provide: CHAT_REPOSITORY, useClass: ChatRepository },
    { provide: MESSAGE_REPOSITORY, useClass: MessageRepository },
  ],
})
export class ChatModule {}
