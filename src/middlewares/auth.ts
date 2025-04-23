import { Context, MiddlewareHandler, Next } from "hono";
import { verifyToken } from "../utils/auth.ts";
import { ForbiddenError, UnauthorizedError } from "../utils/error.ts";
import logger from "../utils/logger.ts";

// Declaration merging for Context to include auth data
declare module "hono" {
  interface ContextVariableMap {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
}

// Authentication middleware: checks if the user is authenticated
export const authenticate: MiddlewareHandler = async (
  c: Context,
  next: Next,
) => {
  try {
    // Get token from Authorization header
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication required");
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);

    // Set user info in context
    c.set("user", {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    });

    await next();
  } catch (error) {
    logger.error("Authentication error", error);

    if (error instanceof UnauthorizedError) {
      throw error;
    }

    throw new UnauthorizedError("Invalid or expired token");
  }
};

// Role-based authorization middleware
export const authorize = (allowedRoles: string[]): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    // This middleware must be used after authenticate
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    await next();
  };
};
