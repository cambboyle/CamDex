import { Logtail } from '@logtail/browser';

const token = import.meta.env.VITE_BETTERSTACK_TOKEN;

// Gracefully no-op if token isn't configured (local dev without token)
const logtail: Logtail | null = token ? new Logtail(token) : null;

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    logtail?.info(message, meta);
  },

  warn(message: string, meta?: Record<string, unknown>) {
    logtail?.warn(message, meta);
  },

  error(message: string, meta?: Record<string, unknown>) {
    logtail?.error(message, meta);
  },
};

/**
 * Call once at app startup. Captures:
 * - Unhandled JS errors (window.onerror)
 * - Unhandled promise rejections
 */
export function setupGlobalErrorTracking() {
  if (!logtail) return;

  window.addEventListener('error', (event) => {
    logtail.error('Unhandled error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    logtail.error('Unhandled promise rejection', {
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });
}
