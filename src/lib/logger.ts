/**
 * Comprehensive logging system for debugging API integrations
 * Provides structured logging with different levels and detailed context
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  requestId?: string;
  userId?: string;
}

export interface ApiLogContext {
  endpoint: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  response?: any;
  statusCode?: number;
  duration?: number;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private logLevel = LogLevel.DEBUG;

  constructor() {
    // Enable detailed logging in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      this.logLevel = LogLevel.DEBUG;
    }
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context,
      error,
      requestId: this.generateRequestId(),
    };

    // Store log entry
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    return entry;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatLogMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context ? JSON.stringify(entry.context, null, 2) : '';
    const errorStr = entry.error ? `\nError: ${entry.error.message}\nStack: ${entry.error.stack}` : '';
    
    return `[${entry.timestamp}] ${levelName} [${entry.category}] ${entry.message}${contextStr ? `\nContext: ${contextStr}` : ''}${errorStr}`;
  }

  debug(category: string, message: string, context?: Record<string, any>): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      const entry = this.createLogEntry(LogLevel.DEBUG, category, message, context);
      console.debug(this.formatLogMessage(entry));
    }
  }

  info(category: string, message: string, context?: Record<string, any>): void {
    if (this.logLevel <= LogLevel.INFO) {
      const entry = this.createLogEntry(LogLevel.INFO, category, message, context);
      console.info(this.formatLogMessage(entry));
    }
  }

  warn(category: string, message: string, context?: Record<string, any>): void {
    if (this.logLevel <= LogLevel.WARN) {
      const entry = this.createLogEntry(LogLevel.WARN, category, message, context);
      console.warn(this.formatLogMessage(entry));
    }
  }

  error(category: string, message: string, context?: Record<string, any>, error?: Error): void {
    if (this.logLevel <= LogLevel.ERROR) {
      const entry = this.createLogEntry(LogLevel.ERROR, category, message, context, error);
      console.error(this.formatLogMessage(entry));
    }
  }

  critical(category: string, message: string, context?: Record<string, any>, error?: Error): void {
    const entry = this.createLogEntry(LogLevel.CRITICAL, category, message, context, error);
    console.error(`🚨 CRITICAL ERROR 🚨\n${this.formatLogMessage(entry)}`);
  }

  // Specialized API logging
  apiRequest(category: string, context: ApiLogContext): void {
    this.info(category, `API Request: ${context.method} ${context.endpoint}`, {
      method: context.method,
      endpoint: context.endpoint,
      headers: this.sanitizeHeaders(context.headers),
      bodySize: context.body ? JSON.stringify(context.body).length : 0,
    });
  }

  apiResponse(category: string, context: ApiLogContext): void {
    const level = context.statusCode && context.statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `API Response: ${context.method} ${context.endpoint} - ${context.statusCode}`;
    
    if (level === LogLevel.ERROR) {
      this.error(category, message, {
        method: context.method,
        endpoint: context.endpoint,
        statusCode: context.statusCode,
        duration: context.duration,
        response: context.response,
      }, context.error);
    } else {
      this.info(category, message, {
        method: context.method,
        endpoint: context.endpoint,
        statusCode: context.statusCode,
        duration: context.duration,
        responseSize: context.response ? JSON.stringify(context.response).length : 0,
      });
    }
  }

  apiError(category: string, context: ApiLogContext, error: Error): void {
    this.error(category, `API Error: ${context.method} ${context.endpoint}`, {
      method: context.method,
      endpoint: context.endpoint,
      headers: this.sanitizeHeaders(context.headers),
      body: context.body,
      duration: context.duration,
    }, error);
  }

  private sanitizeHeaders(headers?: Record<string, string>): Record<string, string> {
    if (!headers) return {};
    
    const sanitized = { ...headers };
    // Remove sensitive information
    const sensitiveKeys = ['authorization', 'x-api-key', 'cookie', 'set-cookie'];
    
    for (const key of sensitiveKeys) {
      if (sanitized[key.toLowerCase()]) {
        sanitized[key.toLowerCase()] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  // Get logs for debugging
  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    return this.logs.filter(log => {
      if (level !== undefined && log.level < level) return false;
      if (category && log.category !== category) return false;
      return true;
    });
  }

  // Get error summary
  getErrorSummary(): { category: string; count: number; lastError: string }[] {
    const errorLogs = this.logs.filter(log => log.level >= LogLevel.ERROR);
    const summary: Record<string, { count: number; lastError: string }> = {};
    
    for (const log of errorLogs) {
      if (!summary[log.category]) {
        summary[log.category] = { count: 0, lastError: '' };
      }
      summary[log.category].count++;
      summary[log.category].lastError = log.message;
    }
    
    return Object.entries(summary).map(([category, data]) => ({
      category,
      count: data.count,
      lastError: data.lastError,
    }));
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }
}

// Global logger instance
export const logger = new Logger();

// Convenience functions
export const logApiRequest = (category: string, context: ApiLogContext) => logger.apiRequest(category, context);
export const logApiResponse = (category: string, context: ApiLogContext) => logger.apiResponse(category, context);
export const logApiError = (category: string, context: ApiLogContext, error: Error) => logger.apiError(category, context, error);
