import { Hono } from "hono";
import {
  createStoreHandler,
  deleteStoreHandler,
  findNearbyStoresHandler,
  getStoreHandler,
  listStoresHandler,
  updateStoreHandler,
} from "../controllers/store-controller.ts";
import { authenticate, authorize } from "../middlewares/auth.ts";

// Create router
const router = new Hono();

// Public routes - Anyone can view stores
router.get("/", listStoresHandler);
router.get("/nearby", findNearbyStoresHandler);
router.get("/:id", getStoreHandler);

// Protected routes - Only admin can manage stores
router.post("/", authenticate, authorize(["admin"]), createStoreHandler);
router.put("/:id", authenticate, authorize(["admin"]), updateStoreHandler);
router.delete("/:id", authenticate, authorize(["admin"]), deleteStoreHandler);

export default router;
