import { Module } from '@nestjs/common'
import { TokenModule } from '../token/token.module.js'
import { WsGateway } from './ws.gateway.js'
import { ChatRepository } from '../chat/chat.repository.js'
import { CHAT_REPOSITORY } from '../chat/chat.repository.interface.js'
import { MessageRepository } from '../chat/message.repository.js'
import { MESSAGE_REPOSITORY } from '../chat/message.repository.interface.js'

@Module({
  imports: [TokenModule],
  providers: [
    WsGateway,
    { provide: CHAT_REPOSITORY, useClass: ChatRepository },
    { provide: MESSAGE_REPOSITORY, useClass: MessageRepository },
  ],
  exports: [WsGateway],
})
export class WsModule {}
