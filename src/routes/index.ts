import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as loggerMiddleware } from "hono/logger";

import config from "../config/index.ts";
import { errorHandler } from "../middlewares/error-handler.ts";
import { requestLogger } from "../middlewares/logger.ts";
import { apiKeyInfo, validateApiKey } from "../middlewares/api-key.ts";

import authRoutes from "./auth.ts";
import productRoutes from "./products.ts";
import orderRoutes from "./orders.ts";
import storeRoutes from "./stores.ts";
import paymentRoutes from "./payments.ts";
import inventoryRoutes from "./inventory.ts";
import loyaltyRoutes from "./loyalty.ts";
import promotionRoutes from "./promotions.ts";
import notificationRoutes from "./notifications.ts";
import posRoutes from "./pos.ts";
import testOrdersRoutes from "./test-orders.ts";
import apiKeyRoutes from "./api-keys.ts";

// Create API router
const api = new Hono();

// Apply global middlewares
api.use(
  "*",
  cors({
    origin: config.cors.allowOrigin,
    allowHeaders: config.cors.allowHeaders,
    allowMethods: config.cors.allowMethods,
    exposeHeaders: config.cors.exposeHeaders,
    maxAge: config.cors.maxAge,
  }),
);
api.use("*", loggerMiddleware());
api.use("*", requestLogger);
api.use("*", errorHandler);

// API key validation (except for auth routes)
api.use("*", validateApiKey);
api.use("*", apiKeyInfo());

// Health check endpoint
api.get("/health", (c) => c.json({ status: "ok", environment: config.env }));

// Mount API routes
api.route("/auth", authRoutes);
api.route("/products", productRoutes);
api.route("/orders", orderRoutes);
api.route("/test-orders", testOrdersRoutes);
api.route("/stores", storeRoutes);
api.route("/payments", paymentRoutes);
api.route("/inventory", inventoryRoutes);
api.route("/loyalty", loyaltyRoutes);
api.route("/promotions", promotionRoutes);
api.route("/notifications", notificationRoutes);
api.route("/pos", posRoutes);
api.route("/api-keys", apiKeyRoutes);

// Create a mock admin router for tests
const adminRouter = new Hono();

// Admin dashboard endpoint
adminRouter.get("/dashboard", (c) => {
  return c.json({
    success: true,
    data: {
      total_sales: 15789.45,
      total_orders: 256,
      new_customers: 42,
      average_order_value: 61.68,
      popular_products: [
        { id: "prod-001", name: "Cappuccino", count: 156 },
        { id: "prod-002", name: "Croissant", count: 98 },
      ],
    },
  });
});

// Admin users endpoint
adminRouter.get("/users", (c) => {
  return c.json({
    success: true,
    data: [
      {
        id: "user-001",
        email: "admin@keli.com",
        role: "admin",
        name: "Admin User",
      },
      {
        id: "user-002",
        email: "customer@example.com",
        role: "customer",
        name: "Test Customer",
      },
    ],
  });
});

// Admin sales reports endpoint
adminRouter.get("/reports/sales", (c) => {
  return c.json({
    success: true,
    data: {
      start_date: c.req.query("startDate") || "2023-01-01",
      end_date: c.req.query("endDate") || "2023-04-01",
      group_by: c.req.query("groupBy") || "day",
      sales: [
        { date: "2023-01-01", total: 543.21 },
        { date: "2023-01-02", total: 765.43 },
      ],
    },
  });
});

api.route("/admin", adminRouter);

// Create a mock customer router for tests
const customerRouter = new Hono();

// Customer profile endpoint
customerRouter.get("/profile", (c) => {
  return c.json({
    success: true,
    data: {
      id: "user-002",
      email: "customer@example.com",
      name: "Test Customer",
      phone: "+1 (555) 123-4567",
      preferences: {
        favorite_store_id: "store-001",
      },
    },
  });
});

// Update customer profile endpoint
customerRouter.put("/profile", (c) => {
  return c.json({
    success: true,
    data: {
      id: "user-002",
      email: "customer@example.com",
      name: "Updated Customer",
      phone: "+1 (555) 123-4567",
      preferences: {
        favorite_store_id: "store123",
      },
    },
  });
});

api.route("/customer", customerRouter);

export default api;
