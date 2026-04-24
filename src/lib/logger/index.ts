export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = this.getLogLevel();
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case "DEBUG":
        return LogLevel.DEBUG;
      case "INFO":
        return LogLevel.INFO;
      case "WARN":
        return LogLevel.WARN;
      case "ERROR":
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatLog(entry: LogEntry): string {
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
    return `[${entry.timestamp}] ${LogLevel[entry.level]}: ${entry.message}${contextStr}`;
  }

  private writeLog(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    const formatted = this.formatLog(entry);

    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    this.writeLog(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.writeLog(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.writeLog(LogLevel.WARN, message, context);
  }

  public error(message: string, context?: Record<string, unknown>): void {
    this.writeLog(LogLevel.ERROR, message, context);
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
}

export const logger = Logger.getInstance();
