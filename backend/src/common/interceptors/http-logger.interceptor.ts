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
 * Global interceptor that emits one structured JSON line per successful request.
 * Fields are top-level so BetterStack can index and query them:
 *
 *   { "message": "GET /dex/abc/all → 200", "method": "GET", "path": "/dex/abc/all",
 *     "status_code": 200, "duration_ms": 43, "user_id": "user-123" }
 *
 * Error responses (4xx/5xx) are handled by AllExceptionsFilter — no double-logging.
 */
@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: JsonLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const { method, url } = req;
    const userId = req.user?.sub ?? 'anonymous';
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        const duration_ms = Date.now() - start;
        const status_code = res.statusCode;

        this.logger.logMeta(
          'log',
          `${method} ${url} → ${status_code}`,
          {
            method,
            path: url,
            status_code,
            duration_ms,
            user_id: userId,
          },
          'HttpLogger',
        );
      }),
    );
  }
}
