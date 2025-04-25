import { load } from "https://deno.land/std@0.185.0/dotenv/mod.ts";

// Load environment variables
await load({ export: true });

export default {
  env: "production",
  port: Deno.env.get("PORT") || 8000,
  apiVersion: "v1",
  cors: {
    allowOrigin: ["https://app.zascoffee.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept", "X-API-Key"],
    exposeHeaders: ["Content-Length", "Date", "X-Request-Id"],
    maxAge: 86400,
  },
  jwt: {
    secret: Deno.env.get("PROD_JWT_SECRET"),
    expiresIn: Deno.env.get("PROD_JWT_EXPIRY"),
  },
  apiKey: {
    defaultKey: Deno.env.get("PROD_API_KEY"),
    headerName: "X-API-Key",
    requireApiKey: true,
    trackUsage: true,
  },
  logLevel: "warn",
  // Default admin user for production environment - uses environment variables for security
  defaultAdmin: {
    email: Deno.env.get("PROD_ADMIN_EMAIL"),
    password: Deno.env.get("PROD_ADMIN_PASSWORD"),
  },
};
