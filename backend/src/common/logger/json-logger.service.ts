import { LoggerService, LogLevel } from '@nestjs/common';

export interface JsonLogEntry {
  timestamp: string;
  level: LogLevel | 'verbose';
  context?: string;
  message: string;
  stack?: string;
  [key: string]: unknown;
}

/**
 * Custom NestJS logger that emits one JSON line per log call.
 * Each line has the shape:
 *   { "timestamp": "...", "level": "log"|"error"|"warn"|"debug"|"verbose", "context": "...", "message": "..." }
 * Errors additionally include "stack".
 * Extra metadata fields can be passed via the `meta` parameter to `logMeta`.
 */
export class JsonLoggerService implements LoggerService {
  private write(entry: JsonLogEntry): void {
    process.stdout.write(JSON.stringify(entry) + '\n');
  }

  log(message: unknown, context?: string): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: 'log',
      context,
      message: String(message),
    });
  }

  error(message: unknown, stack?: string, context?: string): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: 'error',
      context,
      message: String(message),
      ...(stack ? { stack } : {}),
    });
  }

  warn(message: unknown, context?: string): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: 'warn',
      context,
      message: String(message),
    });
  }

  debug(message: unknown, context?: string): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: 'debug',
      context,
      message: String(message),
    });
  }

  verbose(message: unknown, context?: string): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: 'verbose',
      context,
      message: String(message),
    });
  }

  /**
   * Log with arbitrary extra metadata fields merged into the JSON line.
   * Useful from the exception filter where we want method/path/statusCode.
   */
  logMeta(
    level: LogLevel | 'verbose',
    message: string,
    meta: Record<string, unknown>,
    context?: string,
  ): void {
    this.write({
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      ...meta,
    });
  }
}
