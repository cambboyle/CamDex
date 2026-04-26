import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { JsonLoggerService } from '../logger/json-logger.service';

/**
 * Global interceptor that emits one JSON log line per successful HTTP response.
 * Format: GET /dex/abc/all → 200 (43ms)
 *
 * Error responses (4xx/5xx) are already handled by AllExceptionsFilter,
 * so this interceptor only fires when the handler resolves without throwing.
 */
@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: JsonLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        const ms = Date.now() - start;
        this.logger.log(
          `${req.method} ${req.url} → ${res.statusCode} (${ms}ms)`,
          'HttpLogger',
        );
      }),
    );
  }
}
