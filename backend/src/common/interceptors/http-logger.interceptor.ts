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

interface AuthedRequest extends Request {
  user?: { sub?: string };
}

/**
 * Global interceptor that emits two JSON log lines per HTTP request:
 *   → GET /dex/abc/all  (userId: user-123)
 *   ← 200 GET /dex/abc/all  (43ms)
 *
 * Error responses (4xx/5xx) are handled by AllExceptionsFilter; those
 * requests still get the inbound "→" line but the outbound "←" line
 * is skipped here (no double-logging on errors).
 */
@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: JsonLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const { method, url } = req;
    const userId = req.user?.sub ?? 'anonymous';
    const start = Date.now();

    // Line 1 — inbound request
    this.logger.log(`→ ${method} ${url}  (userId: ${userId})`, 'HttpLogger');

    return next.handle().pipe(
      tap(() => {
        // Line 2 — outbound response (only on success; errors go via AllExceptionsFilter)
        const res = context.switchToHttp().getResponse<Response>();
        const ms = Date.now() - start;
        this.logger.log(
          `← ${res.statusCode} ${method} ${url}  (${ms}ms)`,
          'HttpLogger',
        );
      }),
    );
  }
}
