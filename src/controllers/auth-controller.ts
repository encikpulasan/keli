import { Context } from "hono";
import { z } from "npm:zod";
import { login, register } from "../services/auth-service.ts";
import { CreateUserSchema, LoginSchema } from "../models/user.ts";
import { validate } from "../utils/validation.ts";
import { createdResponse, successResponse } from "../utils/response.ts";
import { generateToken } from "../utils/auth.ts";

// Register a new user
export async function registerHandler(c: Context) {
  const data = await c.req.json();

  // Validate user data
  const userData = validate(CreateUserSchema, data);

  // Register user
  const result = await register(userData);

  // Return success response
  return createdResponse(c, result);
}

// Register a new admin user
export async function registerAdminHandler(c: Context) {
  const data = await c.req.json();

  // Validate user data
  const userData = validate(CreateUserSchema, data);

  // Register admin user
  const result = await register(userData, "admin");

  // Return success response
  return createdResponse(c, result);
}

// Login user
export async function loginHandler(c: Context) {
  const data = await c.req.json();

  // Validate login data
  const loginData = validate(LoginSchema, data);

  // Login user
  const result = await login(loginData);

  // Return success response
  return successResponse(c, result);
}

// Get current user profile
export async function getCurrentUserHandler(c: Context) {
  // User is already authenticated via middleware
  const user = c.get("user");

  return successResponse(c, { user });
}

// Refresh token
export async function refreshTokenHandler(c: Context) {
  // User is already authenticated via middleware
  const user = c.get("user");

  // Generate new token
  const token = await generateToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return successResponse(c, { token });
}
