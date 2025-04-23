import { Context, MiddlewareHandler, Next } from "hono";
import logger from "../utils/logger.ts";

// Request logging middleware
export const requestLogger: MiddlewareHandler = async (
  c: Context,
  next: Next,
) => {
  const requestId = crypto.randomUUID();
  const method = c.req.method;
  const url = c.req.url;
  const start = Date.now();

  // Add request ID to response headers
  c.header("X-Request-ID", requestId);

  // Log request start
  logger.info(`Request started`, {
    requestId,
    method,
    url,
  });

  try {
    // Process the request
    await next();

    // Calculate response time
    const responseTime = Date.now() - start;

    // Log request completion
    logger.info(`Request completed`, {
      requestId,
      method,
      url,
      status: c.res.status,
      responseTime: `${responseTime}ms`,
    });
  } catch (error) {
    // Calculate response time even in case of error
    const responseTime = Date.now() - start;

    // Log request error
    logger.error(`Request error`, {
      requestId,
      method,
      url,
      error: error instanceof Error ? error.message : String(error),
      responseTime: `${responseTime}ms`,
    });

    // Re-throw the error to be handled by error middleware
    throw error;
  }
};
