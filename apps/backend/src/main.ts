import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import * as dotenv from 'dotenv';
import {ValidationPipe} from "@nestjs/common";
import cookieParser from 'cookie-parser'


dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',').map((s) => s.trim()) ?? true,
        credentials: true,
    })

    app.use(cookieParser())

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    )

    await app.listen(process.env.PORT || 3001)
}
bootstrap()
