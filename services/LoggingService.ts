/**
 * Centralized logging service for production error tracking.
 */

interface ErrorDetails {
  message: string;
  stack?: string;
  url?: string;
  user_id?: string | null;
  userAgent?: string;
  timestamp: string;
}

class LoggingService {
  private static instance: LoggingService;
  private backendUrl = import.meta.env.VITE_API_URL || '';
  private lastErrorTime: number = 0;
  private throttleMs = 5000; // Minimal interval between error reports to avoid spam

  private constructor() {}

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  /**
   * Captures and reports an error to the backend.
   */
  public async logError(error: Error | string, context: string = 'unknown'): Promise<void> {
    const now = Date.now();
    if (now - this.lastErrorTime < this.throttleMs) {
      console.warn('[LoggingService] Error reporting throttled');
      return;
    }
    this.lastErrorTime = now;

    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : new Error().stack;
    const userId = localStorage.getItem('neuroprofile_user_id');
    
    // Attempt to get telegram user id if logged in
    let telegramUser = null;
    try {
        const auth = localStorage.getItem('auth_token') || localStorage.getItem('telegram_auth');
        if (auth) {
            const data = JSON.parse(auth);
            telegramUser = data.user?.id || data.id;
        }
    } catch (e) { /* ignore */ }

    const details: ErrorDetails = {
      message: `[${context}] ${message}`,
      stack,
      url: window.location.href,
      user_id: telegramUser ? `tg_${telegramUser}` : userId,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    console.error('[LoggingService] Reporting error:', details);

    try {
      const response = await fetch(`${this.backendUrl}/api/logs/error`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(details),
      });

      if (!response.ok) {
        console.error('[LoggingService] Failed to send error to backend:', response.statusText);
      }
    } catch (err) {
      console.error('[LoggingService] Networking error while reporting:', err);
    }
  }

  /**
   * Setup global error listeners.
   */
  public setupGlobalHandlers(): void {
    window.onerror = (message, source, lineno, colno, error) => {
      this.logError(error || String(message), 'window.onerror');
      return false; // Let browser handle it as well
    };

    window.onunhandledrejection = (event) => {
      this.logError(event.reason, 'unhandledrejection');
    };
  }
}

export const logger = LoggingService.getInstance();
