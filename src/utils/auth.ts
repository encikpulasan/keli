import {
  JWTPayload as JoseJWTPayload,
  jwtVerify,
  SignJWT,
} from "npm:jose@^6.0.10";
import config from "../config/index.ts";
import { UnauthorizedError } from "./error.ts";

// JWT payload interface
export interface JWTPayload extends JoseJWTPayload {
  sub: string; // User ID
  email: string;
  role: string;
  exp?: number;
  iat?: number;
}

// Generate a JWT token
export async function generateToken(
  payload: Omit<JWTPayload, "exp" | "iat">,
): Promise<string> {
  const expiresInMs = parseExpiresIn(config.jwt.expiresIn);
  const now = Date.now();

  const expTime = Math.floor((now + expiresInMs) / 1000);

  // Create a JWT with HMAC using a secret
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expTime)
    .sign(new TextEncoder().encode(config.jwt.secret));
}

// Verify a JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    // Verify the JWT
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(config.jwt.secret),
    );

    return payload as JWTPayload;
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

// Helper to parse JWT expiration time
function parseExpiresIn(expiresIn: string): number {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1));

  const units: Record<string, number> = {
    s: 1000, // seconds
    m: 60 * 1000, // minutes
    h: 60 * 60 * 1000, // hours
    d: 24 * 60 * 60 * 1000, // days
  };

  if (!units[unit]) {
    throw new Error(`Invalid expiration format: ${expiresIn}`);
  }

  return value * units[unit];
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  // Convert the password to an ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // Hash the password with SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert to base64 string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(
    "",
  );

  return hashHex;
}

// Verify a password
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hashedPassword;
}
