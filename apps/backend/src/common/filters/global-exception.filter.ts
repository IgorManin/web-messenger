import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import type { Response } from 'express';
import type { Socket } from 'socket.io';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() === 'ws') {
      const client = host.switchToWs().getClient<Socket>();

      if (exception instanceof HttpException) {
        client.emit('error', {
          statusCode: exception.getStatus(),
          message: exception.message,
        });
        return;
      }

      this.logger.error('WS unhandled exception', exception instanceof Error ? exception.stack : String(exception));
      client.emit('error', {
        statusCode: 500,
        message: 'Внутренняя ошибка сервера',
      });
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>).message ?? exception.message;

      response.status(status).json({
        statusCode: status,
        message: Array.isArray(message) ? message.join(', ') : message,
      });
      return;
    }

    if (exception instanceof PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'Запись уже существует',
        });
        return;
      }

      if (exception.code === 'P2025') {
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Запись не найдена',
        });
        return;
      }

      this.logger.error(`Prisma error ${exception.code}`, exception.message);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Внутренняя ошибка сервера',
      });
      return;
    }

    this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : String(exception));
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Внутренняя ошибка сервера',
    });
  }
}
