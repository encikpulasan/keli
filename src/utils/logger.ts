import config from "../config/index.ts";

// Define log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Define colors for log levels
const colors = {
  debug: "\x1b[36m", // Cyan
  info: "\x1b[32m", // Green
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
  reset: "\x1b[0m", // Reset
};

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
    const color = colors[levelName as keyof typeof colors] || colors.reset;

    switch (level) {
      case LogLevel.ERROR:
        console.error(`${color}${formattedMessage}${colors.reset}`);
        break;
      case LogLevel.WARN:
        console.warn(`${color}${formattedMessage}${colors.reset}`);
        break;
      case LogLevel.INFO:
        console.info(`${color}${formattedMessage}${colors.reset}`);
        break;
      case LogLevel.DEBUG:
        console.debug(`${color}${formattedMessage}${colors.reset}`);
        break;
    }

    // Also log to a file in development mode
    if (config.env === "development") {
      try {
        const logEntry = `${formattedMessage}\n`;
        Deno.writeTextFileSync("server.log", logEntry, { append: true });
      } catch (error) {
        console.error("Failed to write to log file:", error);
      }
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
