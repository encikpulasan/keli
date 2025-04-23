import { Hono } from "hono";
import {
  applyPromotionHandler,
  createPromotionHandler,
  getPromotionHandler,
  listActivePromotionsHandler,
  updatePromotionHandler,
} from "../controllers/promotion-controller.ts";
import { authenticate, authorize } from "../middlewares/auth.ts";

// Create router
const router = new Hono();

// Routes accessible to all
router.get("/active", listActivePromotionsHandler);

// Routes that require authentication
router.use("*", authenticate);

// Routes accessible to authenticated users
router.post("/apply", applyPromotionHandler);

// Admin-only routes
router.post("/", authorize(["admin"]), createPromotionHandler);
router.get("/:id", authorize(["admin"]), getPromotionHandler);
router.put("/:id", authorize(["admin"]), updatePromotionHandler);

export default router;
