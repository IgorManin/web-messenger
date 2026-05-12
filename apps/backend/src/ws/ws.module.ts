import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { WsGateway } from "./ws.gateway.js";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret')!,
      }),
    }),
  ],
  providers: [WsGateway],
  exports: [WsGateway],
})
export class WsModule {}
