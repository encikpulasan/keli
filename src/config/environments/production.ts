export default {
  env: "production",
  port: 3000,
  apiVersion: "v1",
  cors: {
    allowOrigin: ["https://app.zascoffee.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    exposeHeaders: ["Content-Length", "Date", "X-Request-Id"],
    maxAge: 86400,
  },
  jwt: {
    secret: Deno.env.get("JWT_SECRET") ||
      "must-be-set-in-environment-variables",
    expiresIn: "1d",
  },
  logLevel: "warn",
  // Default admin user for production environment - uses environment variables for security
  defaultAdmin: {
    email: Deno.env.get("DEFAULT_ADMIN_EMAIL") || "admin@keli.com",
    password: Deno.env.get("DEFAULT_ADMIN_PASSWORD") || "change_in_production",
  },
};
