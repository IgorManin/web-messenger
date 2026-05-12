import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { WsModule } from "./ws/ws.module.js";
import { ChatModule } from "./chat/chat.module.js";
import configuration from "./config/configuration.js";
import { validationSchema } from "./config/validation.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    WsModule,
    ChatModule,
  ],
})
export class AppModule {}
