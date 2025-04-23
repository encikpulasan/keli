// Base class for API errors
export class APIError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

// 400 Bad Request
export class BadRequestError extends APIError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

// 403 Forbidden
export class ForbiddenError extends APIError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

// 404 Not Found
export class NotFoundError extends APIError {
  constructor(message = "Resource Not Found") {
    super(message, 404);
  }
}

// 409 Conflict
export class ConflictError extends APIError {
  constructor(message = "Resource Conflict") {
    super(message, 409);
  }
}

// 422 Unprocessable Entity
export class ValidationError extends APIError {
  errors?: Record<string, string[]>;

  constructor(message = "Validation Error", errors?: Record<string, string[]>) {
    super(message, 422);
    this.errors = errors;
  }
}

// 500 Internal Server Error
export class InternalServerError extends APIError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}

// Error response interface
interface ErrorResponse {
  success: boolean;
  error: {
    message: string;
    code: number;
    details?: Record<string, string[]>;
  };
}

// Format error response
export const formatErrorResponse = (error: Error | APIError) => {
  // Default to internal server error if not an APIError
  const statusCode = (error as APIError).statusCode || 500;
  const message = error.message || "An unexpected error occurred";

  // Basic error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      code: statusCode,
    },
  };

  // Add validation errors if available
  if ((error as ValidationError).errors) {
    errorResponse.error.details = (error as ValidationError).errors;
  }

  return { statusCode, body: errorResponse };
};
