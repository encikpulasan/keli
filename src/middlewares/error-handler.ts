import { Context, MiddlewareHandler, Next } from "hono";
import { APIError } from "../utils/error.ts";
import logger from "../utils/logger.ts";
import { z } from "npm:zod";

// Valid status codes for error responses
type ErrorStatusCode = 400 | 401 | 403 | 404 | 409 | 422 | 500;

// Error handling middleware
export const errorHandler: MiddlewareHandler = async (
  c: Context,
  next: Next,
) => {
  try {
    await next();
  } catch (error) {
    logger.error("Error caught by middleware", error);

    // Handle ZodError
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};

      for (const issue of error.errors) {
        const path = issue.path.join(".");
        const field = path || "general";

        if (!errors[field]) {
          errors[field] = [];
        }

        errors[field].push(issue.message);
      }

      c.status(422);
      return c.json({
        success: false,
        error: {
          message: "Validation error",
          code: 422,
          details: errors,
        },
      });
    }

    // Handle API errors
    if (error instanceof APIError) {
      // Ensure status code is a valid HTTP status code
      const statusCode = error.statusCode as ErrorStatusCode;
      c.status(statusCode);

      // Basic error response
      const errorResponse: Record<string, unknown> = {
        success: false,
        error: {
          message: error.message || "An unexpected error occurred",
          code: statusCode,
        },
      };

      return c.json(errorResponse);
    }

    // Default to internal server error for unexpected errors
    c.status(500);
    return c.json({
      success: false,
      error: {
        message: "An unexpected error occurred",
        code: 500,
      },
    });
  }
};
