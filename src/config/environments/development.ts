import { load } from "https://deno.land/std@0.185.0/dotenv/mod.ts";

// Load environment variables
await load({ export: true });

export default {
  env: "development",
  port: Number(Deno.env.get("PORT")),
  apiVersion: "v1",
  cors: {
    allowOrigin: ["https://app.zascoffee.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept", "X-API-Key"],
    exposeHeaders: ["Content-Length", "Date", "X-Request-Id"],
    maxAge: 86400,
  },
  jwt: {
    secret: Deno.env.get("DEV_JWT_SECRET"),
    expiresIn: Deno.env.get("DEV_JWT_EXPIRY"),
  },
  apiKey: {
    defaultKey: Deno.env.get("DEV_API_KEY"),
    headerName: "X-API-Key",
    requireApiKey: true,
    trackUsage: true,
  },
  logLevel: "debug",
  // Default admin user for development environment - uses environment variables for security
  defaultAdmin: {
    email: Deno.env.get("DEV_ADMIN_EMAIL"),
    password: Deno.env.get("DEV_ADMIN_PASSWORD"),
  },
};
