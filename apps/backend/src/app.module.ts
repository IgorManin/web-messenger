import { Module } from '@nestjs/common';
import {HealthModule} from "./health.module.js";
import {MessagesModule} from "./messages.module.js";

@Module({ imports: [HealthModule, MessagesModule] })
export class AppModule {}
