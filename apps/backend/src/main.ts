import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import * as dotenv from 'dotenv';
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    const configService = app.get(ConfigService)
    const allowedOrigins = configService.get<string>('cors.allowedOrigins')!.split(',').map((s) => s.trim())

    app.use(helmet())

    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    })

    app.use(cookieParser())

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    )

    app.useGlobalFilters(new GlobalExceptionFilter())

    await app.listen(configService.get<number>('app.port')!)
}
bootstrap()
