import { Hono } from "hono";
import {
  adjustInventoryHandler,
  checkProductAvailabilityHandler,
  createInventoryItemHandler,
  getInventoryItemHandler,
  listStoreInventoryHandler,
  updateInventoryItemHandler,
} from "../controllers/inventory-controller.ts";
import { authenticate, authorize } from "../middlewares/auth.ts";

// Create router
const router = new Hono();

// All routes require authentication
router.use("*", authenticate);

// Admin-only routes
router.post("/", authorize(["admin"]), createInventoryItemHandler);
router.get("/item/:id", authorize(["admin"]), getInventoryItemHandler);
router.put("/item/:id", authorize(["admin"]), updateInventoryItemHandler);
router.post("/adjust", authorize(["admin"]), adjustInventoryHandler);

// Admin and staff routes
router.get(
  "/availability",
  authorize(["admin", "staff"]),
  checkProductAvailabilityHandler,
);
router.get(
  "/store/:storeId",
  authorize(["admin", "staff"]),
  listStoreInventoryHandler,
);

export default router;
