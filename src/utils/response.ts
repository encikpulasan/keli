import { Context } from "hono";

// Success response with pagination
export function paginatedResponse<T>(
  c: Context,
  data: T[],
  meta: {
    cursor?: string | null;
    total?: number;
    limit: number;
    hasMore?: boolean;
  },
  status: 200 | 206 = 200,
) {
  return c.json(
    {
      success: true,
      data,
      meta: {
        ...meta,
        count: data.length,
      },
    },
    status,
  );
}

// Simple success response
export function successResponse<T>(
  c: Context,
  data: T,
  status: 200 | 202 = 200,
) {
  return c.json(
    {
      success: true,
      data,
    },
    status,
  );
}

// Error response
export function errorResponse(
  c: Context,
  message: string,
  status: 400 | 401 | 403 | 404 | 409 | 422 | 500 = 400,
  details?: Record<string, unknown>,
) {
  return c.json(
    {
      success: false,
      error: {
        message,
        ...(details && { details }),
      },
    },
    status,
  );
}

// Created response (201)
export function createdResponse<T>(
  c: Context,
  data: T,
  message = "Resource created successfully",
) {
  return c.json(
    {
      success: true,
      message,
      data,
    },
    201,
  );
}

// No content response (204)
export function noContentResponse(c: Context) {
  c.status(204);
  return c.body(null);
}

// Not found response (404)
export function notFoundResponse(
  c: Context,
  message = "Resource not found",
) {
  return errorResponse(c, message, 404);
}
