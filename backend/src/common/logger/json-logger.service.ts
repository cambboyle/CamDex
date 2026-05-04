import { LoggerService, LogLevel } from '@nestjs/common';
import { Logtail } from '@logtail/node';

export interface JsonLogEntry {
  timestamp: string;
  level: LogLevel | 'verbose';
  context?: string;
  message: string;
  stack?: string;
  [key: string]: unknown;
}

/**
 * Custom NestJS logger that:
 *  1. Writes one JSON line per call to stdout (Railway / local)
 *  2. Ships the same structured entry to BetterStack Logtail when
 *     BETTERSTACK_TOKEN is set — no Railway log drain needed.
 */
export class JsonLoggerService implements LoggerService {
  private readonly logtail: Logtail | null;

  constructor() {
    const token = process.env.BETTERSTACK_TOKEN;
    this.logtail = token ? new Logtail(token) : null;
  }

  private write(entry: JsonLogEntry): void {
    process.stdout.write(JSON.stringify(entry) + '\n');

    // Ship to BetterStack asynchronously — never blocks the request
    if (this.logtail) {
      // Strip logger-internal fields — Logtail adds its own timestamp
      const logtailMeta = { ...entry } as Record<string, unknown>;
      delete logtailMeta['level'];
      delete logtailMeta['message'];
      delete logtailMeta['timestamp'];
      const { level, message } = entry;
      const meta = logtailMeta;
      switch (level) {
        case 'error':
          void this.logtail.error(message, meta);
          break;
        case 'warn':
          void this.logtail.warn(message, meta);
          break;
        case 'debug':
        case 'verbose':
          void this.logtail.debug(message, meta);
          break;
        default:
          void this.logtail.info(message, meta);
      }
    }
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
   * Used by HttpLoggerInterceptor and AllExceptionsFilter.
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

  /** Flush pending BetterStack shipments — call before process exit if needed. */
  async flush(): Promise<void> {
    if (this.logtail) await this.logtail.flush();
  }
}
