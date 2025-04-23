import config from "../config/index.ts";

// Define log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Map string log level to enum
const logLevelMap: Record<string, LogLevel> = {
  "debug": LogLevel.DEBUG,
  "info": LogLevel.INFO,
  "warn": LogLevel.WARN,
  "error": LogLevel.ERROR,
};

// Get the configured log level
const configuredLevel = logLevelMap[config.logLevel] ?? LogLevel.INFO;

// Format a log message
function formatLogMessage(
  level: string,
  message: string,
  details?: unknown,
): string {
  const timestamp = new Date().toISOString();
  const detailsString = details ? ` - ${JSON.stringify(details)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${detailsString}`;
}

// Log a message if its level is higher than or equal to the configured level
function log(
  level: LogLevel,
  levelName: string,
  message: string,
  details?: unknown,
): void {
  if (level >= configuredLevel) {
    const formattedMessage = formatLogMessage(levelName, message, details);
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
    }
  }
}

// Logger object
export const logger = {
  debug: (message: string, details?: unknown) =>
    log(LogLevel.DEBUG, "debug", message, details),
  info: (message: string, details?: unknown) =>
    log(LogLevel.INFO, "info", message, details),
  warn: (message: string, details?: unknown) =>
    log(LogLevel.WARN, "warn", message, details),
  error: (message: string, details?: unknown) =>
    log(LogLevel.ERROR, "error", message, details),
};

export default logger;
