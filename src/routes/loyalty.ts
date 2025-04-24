import { Hono } from "hono";
import {
  addPointsHandler,
  createLoyaltyAccountHandler,
  createRewardHandler,
  getLoyaltyAccountHandler,
  getRewardHandler,
  getTransactionHistoryHandler,
  getUserPointsHandler,
  getUserRewardsHandler,
  listAvailableRewardsHandler,
  redeemPointsHandler,
  redeemRewardHandler,
} from "../controllers/loyalty-controller.ts";
import { authenticate, authorize } from "../middlewares/auth.ts";

// Create router
const router = new Hono();

// All routes require authentication
router.use("*", authenticate);

// Routes accessible to authenticated users
router.get("/account", getLoyaltyAccountHandler);
router.post("/account", createLoyaltyAccountHandler);
router.get("/transactions", getTransactionHistoryHandler);
router.get("/rewards", listAvailableRewardsHandler);
router.post("/rewards/redeem", redeemRewardHandler);
router.get("/user-rewards", getUserRewardsHandler);

// Loyalty points endpoints
router.get("/points", getUserPointsHandler);
router.get("/points/status/:userId", getUserPointsHandler);
router.post("/points/redeem", redeemPointsHandler);
router.post("/points/apply-promotion", async (c) => {
  try {
    const data = await c.req.json();
    const { userId, promoCode } = data;

    // In a real implementation, this would validate the promo code
    // and apply the correct number of points

    // Mock implementation - adding points based on promo code
    let pointsToAdd = 0;
    let message = "";

    if (promoCode === "WELCOME") {
      pointsToAdd = 50;
      message = "Welcome bonus applied!";
    } else if (promoCode === "BIRTHDAY") {
      pointsToAdd = 100;
      message = "Birthday bonus applied!";
    } else if (promoCode === "HOLIDAY") {
      pointsToAdd = 75;
      message = "Holiday bonus applied!";
    } else {
      return c.json({ success: false, message: "Invalid promotion code" }, 400);
    }

    // This would call the service to actually add the points
    return c.json({
      success: true,
      data: {
        userId,
        promoCode,
        pointsAdded: pointsToAdd,
        message,
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    }, 400);
  }
});

// Admin-only routes
router.post("/points", authorize(["admin"]), addPointsHandler);
router.post("/rewards", authorize(["admin"]), createRewardHandler);
router.get("/rewards/:id", getRewardHandler);

export default router;
