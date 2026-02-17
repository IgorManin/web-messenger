import { Module } from '@nestjs/common';
import {HealthModule} from "./health.module.js";
import {MessagesModule} from "./messages.module.js";
import {PrismaModule} from "./prisma/prisma.module.js";
import {AuthModule} from "./auth/auth.module.js";

@Module({ imports: [PrismaModule, HealthModule, MessagesModule,AuthModule]})
export class AppModule {}
