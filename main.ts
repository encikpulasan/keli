import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { prettyJSON } from "hono/pretty-json";
import { logger as loggerMiddleware } from "hono/logger";

import config from "./src/config/index.ts";
import logger from "./src/utils/logger.ts";
import api from "./src/routes/index.ts";
import { getRedocHTML } from "./src/utils/redoc.ts";
import { openAPIDocument } from "./src/utils/openapi.ts";
import { initializeDefaultAdmin } from "./src/utils/init-admin.ts";

// Create main app
const app = new Hono();

// Global middleware
app.use("*", poweredBy());
app.use("*", prettyJSON());
app.use("*", loggerMiddleware());

// Mount API with version prefix
app.route(`/api/${config.apiVersion}`, api);

// Update OpenAPI document to include audience-specific routes
const updatedOpenApiDoc = {
  ...openAPIDocument,
  info: {
    ...openAPIDocument.info,
    description: `
API documentation for the Keli application

## API Structure
- Public endpoints: available to all users
- Admin endpoints: /api/v1/admin/* - available only to admin users
- Customer endpoints: /api/v1/customer/* - available for mobile app customers
- POS endpoints: /api/v1/pos/* - available for in-store Point of Sale systems

Each endpoint is tagged with "Admin", "Customer", "POS", or a combination to indicate intended audience.
    `,
  },
};

// Serve OpenAPI schema
app.get("/api/openapi.json", (c) => {
  return c.json(updatedOpenApiDoc);
});

// Add ReDoc UI
app.get("/docs", (c) => c.html(getRedocHTML("/api/openapi.json")));

// Redirect root to API health check
app.get("/", (c) => c.redirect(`/api/${config.apiVersion}/health`));

// Start server
const port = config.port;

// Initialize the default admin user
await initializeDefaultAdmin();

logger.info(
  `Starting ZAS Coffee API server in ${config.env} mode on port ${port}`,
);

Deno.serve({ port }, app.fetch);

logger.info(`ZAS Coffee API server is running on http://localhost:${port}`);
logger.info(`API Documentation available at http://localhost:${port}/docs`);
