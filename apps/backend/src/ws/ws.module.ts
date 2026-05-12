import { Module } from '@nestjs/common'
import { TokenModule } from '../token/token.module.js'
import { WsGateway } from './ws.gateway.js'

@Module({
  imports: [TokenModule],
  providers: [WsGateway],
  exports: [WsGateway],
})
export class WsModule {}
