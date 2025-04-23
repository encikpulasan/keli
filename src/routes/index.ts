import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as loggerMiddleware } from "hono/logger";

import config from "../config/index.ts";
import { errorHandler } from "../middlewares/error-handler.ts";
import { requestLogger } from "../middlewares/logger.ts";

import authRoutes from "./auth.ts";
import productRoutes from "./products.ts";
import orderRoutes from "./orders.ts";
import storeRoutes from "./stores.ts";
import paymentRoutes from "./payments.ts";
import inventoryRoutes from "./inventory.ts";
import loyaltyRoutes from "./loyalty.ts";
import promotionRoutes from "./promotions.ts";
import notificationRoutes from "./notifications.ts";

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

// Health check endpoint
api.get("/health", (c) => c.json({ status: "ok", environment: config.env }));

// Mount API routes
api.route("/auth", authRoutes);
api.route("/products", productRoutes);
api.route("/orders", orderRoutes);
api.route("/stores", storeRoutes);
api.route("/payments", paymentRoutes);
api.route("/inventory", inventoryRoutes);
api.route("/loyalty", loyaltyRoutes);
api.route("/promotions", promotionRoutes);
api.route("/notifications", notificationRoutes);

export default api;
