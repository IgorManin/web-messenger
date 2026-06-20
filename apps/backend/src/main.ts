import { NestFactory } from "@nestjs/core";
import * as dotenv from "dotenv";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";
import helmet from "helmet";

dotenv.config();

async function bootstrap() {
  // Динамический импорт — гарантирует, что process.env заполнен до того,
  // как выполнится статическая метадата @WebSocketGateway() внутри AppModule.
  const { AppModule } = await import("./app.module.js");
  const { GlobalExceptionFilter } = await import(
    "./common/filters/global-exception.filter.js"
  );

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const allowedOrigins = configService.get<string[]>("cors.allowedOrigins")!;

  app.use(helmet());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(configService.get<number>("app.port")!);
}
bootstrap();
