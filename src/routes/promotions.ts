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
router.get("/current", async (c) => {
  return c.json({
    success: true,
    data: [
      {
        id: "promo-001",
        code: "SUMMER20",
        name: "Summer Discount",
        description: "20% off all drinks for the summer season",
        discount_type: "percentage",
        discount_value: 20,
        start_date: "2025-06-01T00:00:00Z",
        end_date: "2025-08-31T23:59:59Z",
        is_active: true,
      },
      {
        id: "promo-002",
        code: "WELCOME10",
        name: "Welcome Discount",
        description: "10% off your first order",
        discount_type: "percentage",
        discount_value: 10,
        is_active: true,
      },
    ],
  });
});

// Routes that require authentication
router.use("*", authenticate);

// Routes accessible to authenticated users
router.post("/apply", applyPromotionHandler);

// Admin-only routes
router.post("/", authorize(["admin"]), createPromotionHandler);
router.get("/:id", authorize(["admin"]), getPromotionHandler);
router.put("/:id", authorize(["admin"]), updatePromotionHandler);

export default router;
