import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: (process.env.ALLOWED_ORIGINS || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean),
            credentials: true
        }
    });
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port, '0.0.0.0');
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
}
bootstrap();
