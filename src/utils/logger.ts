/**
 * Application Logger utility.
 * Logs are only outputted when running in development mode (__DEV__ === true).
 * In standalone APK / production builds, all logging methods are completely no-ops,
 * ensuring zero performance impact and preventing sensitive data leakage in production.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'action';

function formatPrefix(level: LogLevel, category?: string): string {
  const cat = category ? `[${category}]` : '';
  switch (level) {
    case 'action':
      return `[ImagineStyle:ACTION]${cat} 🚀`;
    case 'info':
      return `[ImagineStyle:INFO]${cat} ℹ️`;
    case 'warn':
      return `[ImagineStyle:WARN]${cat} ⚠️`;
    case 'error':
      return `[ImagineStyle:ERROR]${cat} ❌`;
    case 'debug':
    default:
      return `[ImagineStyle:DEBUG]${cat}`;
  }
}

export const logger = {
  /**
   * General debugging log (dev only)
   */
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log(formatPrefix('debug'), ...args);
    }
  },

  /**
   * Informational logs for important lifecycle events (e.g. database loaded, initialized)
   */
  info: (category: string, message: string, ...extra: any[]) => {
    if (__DEV__) {
      console.info(formatPrefix('info', category), message, ...extra);
    }
  },

  /**
   * Action logs when an important action is taken (e.g. like, save, follow, publish, comment)
   */
  action: (actionName: string, payload?: any) => {
    if (__DEV__) {
      if (payload !== undefined) {
        console.log(formatPrefix('action'), actionName, payload);
      } else {
        console.log(formatPrefix('action'), actionName);
      }
    }
  },

  /**
   * Waiting / pending operations (e.g. AI generation in progress, waiting for database query)
   */
  waiting: (operation: string, details?: any) => {
    if (__DEV__) {
      if (details !== undefined) {
        console.log(`[ImagineStyle:WAITING] ⏳ ${operation}`, details);
      } else {
        console.log(`[ImagineStyle:WAITING] ⏳ ${operation}`);
      }
    }
  },

  /**
   * Warning logs
   */
  warn: (category: string, message: string, ...extra: any[]) => {
    if (__DEV__) {
      console.warn(formatPrefix('warn', category), message, ...extra);
    }
  },

  /**
   * Error logs
   */
  error: (category: string, message: string, error?: any) => {
    if (__DEV__) {
      console.error(formatPrefix('error', category), message, error ?? '');
    }
  },
};
