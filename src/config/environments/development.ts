export default {
  env: "development",
  port: 3000,
  apiVersion: "v1",
  cors: {
    allowOrigin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    exposeHeaders: ["Content-Length", "Date", "X-Request-Id"],
    maxAge: 86400,
  },
  jwt: {
    secret: "dev-jwt-secret-change-in-production",
    expiresIn: "1d",
  },
  logLevel: "debug",
};
