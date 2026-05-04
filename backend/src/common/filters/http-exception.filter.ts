import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JsonLoggerService } from '../logger/json-logger.service';

interface AuthedRequest extends Request {
  user?: { sub?: string };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: JsonLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AuthedRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? ((exception.getResponse() as { message?: string }).message ??
          exception.message)
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    const meta = {
      method: request.method,
      path: request.url,
      status_code: status,
      user_id: request.user?.sub ?? 'anonymous',
      error_type:
        exception instanceof Error
          ? exception.constructor.name
          : 'UnknownError',
    };

    if (status >= 500) {
      this.logger.logMeta(
        'error',
        message,
        { ...meta, stack: (exception as Error).stack },
        AllExceptionsFilter.name,
      );
    } else if (status >= 400) {
      this.logger.logMeta('warn', message, meta, AllExceptionsFilter.name);
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
