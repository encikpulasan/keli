import { Hono } from "npm:hono";
import { Context } from "npm:hono";
import {
  cancelOrderHandler,
  createOrderHandler,
  getOrderHandler,
  listOrdersHandler,
  updateOrderStatusHandler,
} from "../controllers/order-controller.ts";
import { authenticate } from "../middlewares/auth.ts";

// Define app type with correct environment
type AppEnv = {
  variables: {
    userId: string;
    role: string;
  };
};

const router = new Hono<AppEnv>();

// Protected routes for all authenticated users
router.use("*", authenticate);

// Routes accessible to authenticated users
router.get("/", listOrdersHandler);
router.post("/", createOrderHandler);
router.get("/:id", getOrderHandler);
router.delete("/:id", cancelOrderHandler);

// Admin-only routes - using regular middleware check instead of authorizeAdmin
router.put("/:id/status", async (c: Context<AppEnv>, next) => {
  // Check if user is admin
  if (c.get("role") !== "admin") {
    return c.json({ success: false, message: "Unauthorized" }, 403);
  }
  await next();
}, updateOrderStatusHandler);

export default router;
