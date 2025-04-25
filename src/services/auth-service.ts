import { CreateUser, Login } from "../models/user.ts";
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateLastLogin,
} from "./user-service.ts";
import { generateToken, verifyPassword, verifyToken } from "../utils/auth.ts";
import { UnauthorizedError, ValidationError } from "../utils/error.ts";

// Register a new user
export async function register(userData: CreateUser, role: string = "user") {
  // This will throw if email already exists
  const user = await createUser(userData, role);

  // Generate token for new user
  const token = await generateToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  // Return user data and token
  const { password_hash, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
}

// Login user
export async function login(loginData: Login) {
  const { email, password } = loginData;

  // Find user by email
  const user = await getUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Update last login time
  const updatedUser = await updateLastLogin(user.id);

  // Generate token
  const token = await generateToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  // Return user data and token
  const { password_hash: _, ...userWithoutPassword } = updatedUser;

  return {
    user: userWithoutPassword,
    token,
  };
}

// Validate token and return user data
export async function validateToken(token: string) {
  try {
    // This will throw if token is invalid
    const payload = await verifyToken(token);

    if (!payload || !payload.sub) {
      throw new UnauthorizedError("Invalid token payload");
    }

    // Get user
    const user = await getUserById(payload.sub);

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;

    return userWithoutPassword;
  } catch (error) {
    throw new UnauthorizedError("Invalid token");
  }
}
