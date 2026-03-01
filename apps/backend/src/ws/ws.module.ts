import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { WsGateway } from './ws.gateway.js'

@Module({
    imports: [JwtModule.register({})],
    providers: [WsGateway],
})
export class WsModule {}