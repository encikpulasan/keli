import { Hono } from "hono";
import {
  addPointsHandler,
  createLoyaltyAccountHandler,
  createRewardHandler,
  getLoyaltyAccountHandler,
  getRewardHandler,
  getTransactionHistoryHandler,
  getUserRewardsHandler,
  listAvailableRewardsHandler,
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

// Admin-only routes
router.post("/points", authorize(["admin"]), addPointsHandler);
router.post("/rewards", authorize(["admin"]), createRewardHandler);
router.get("/rewards/:id", getRewardHandler);

export default router;
