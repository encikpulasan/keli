import { Context } from "hono";
import {
  addPoints,
  createLoyaltyAccount,
  createReward,
  getLoyaltyAccountByUserId,
  getRewardById,
  getTransactionHistory,
  getUserRewards,
  listAvailableRewards,
  redeemReward,
} from "../services/loyalty-service.ts";
import {
  CreateLoyaltyAccountSchema,
  CreateRewardSchema,
  LoyaltyTransactionSchema,
  RedeemRewardSchema,
} from "../models/loyalty.ts";
import { validate } from "../utils/validation.ts";
import {
  createdResponse,
  paginatedResponse,
  successResponse,
} from "../utils/response.ts";
import { ForbiddenError, NotFoundError } from "../utils/error.ts";

// Get user's loyalty account
export async function getLoyaltyAccountHandler(c: Context) {
  const authenticatedUser = c.get("user");
  const userId = c.req.query("user_id") || authenticatedUser.id;

  // Non-admins can only view their own loyalty account
  if (authenticatedUser.role !== "admin" && userId !== authenticatedUser.id) {
    throw new ForbiddenError("You can only view your own loyalty account");
  }

  // Get loyalty account
  const account = await getLoyaltyAccountByUserId(userId);

  if (!account) {
    throw new NotFoundError("Loyalty account not found");
  }

  // Return success response
  return successResponse(c, account);
}

// Create a loyalty account
export async function createLoyaltyAccountHandler(c: Context) {
  const data = await c.req.json();
  const authenticatedUser = c.get("user");

  // Validate loyalty account data
  const accountData = validate(CreateLoyaltyAccountSchema, data);

  // Non-admins can only create accounts for themselves
  if (
    authenticatedUser.role !== "admin" &&
    accountData.user_id !== authenticatedUser.id
  ) {
    throw new ForbiddenError(
      "You can only create a loyalty account for yourself",
    );
  }

  // Create loyalty account
  const result = await createLoyaltyAccount(accountData);

  // Return success response
  return createdResponse(c, result);
}

// Add loyalty points
export async function addPointsHandler(c: Context) {
  const data = await c.req.json();
  const authenticatedUser = c.get("user");

  // Validate transaction data
  const transactionData = validate(LoyaltyTransactionSchema, data);

  // Only admins can add points
  if (authenticatedUser.role !== "admin") {
    throw new ForbiddenError("Only admins can add loyalty points");
  }

  // Add points
  const result = await addPoints(transactionData.user_id, transactionData);

  // Return success response
  return successResponse(c, result);
}

// Get transaction history
export async function getTransactionHistoryHandler(c: Context) {
  const authenticatedUser = c.get("user");
  const userId = c.req.query("user_id") || authenticatedUser.id;

  // Non-admins can only view their own transactions
  if (authenticatedUser.role !== "admin" && userId !== authenticatedUser.id) {
    throw new ForbiddenError("You can only view your own transactions");
  }

  // Get query parameters
  const limit = c.req.query("limit")
    ? parseInt(c.req.query("limit") || "10")
    : 10;
  const cursor = c.req.query("cursor");

  // Get transaction history
  const result = await getTransactionHistory(userId, {
    limit,
    cursor,
  });

  // Return paginated response
  return paginatedResponse(c, result.items, {
    cursor: result.cursor,
    limit,
    hasMore: !!result.cursor,
  });
}

// Create a reward (admin only)
export async function createRewardHandler(c: Context) {
  const data = await c.req.json();

  // Validate reward data
  const rewardData = validate(CreateRewardSchema, data);

  // Create reward
  const result = await createReward(rewardData);

  // Return success response
  return createdResponse(c, result);
}

// Get reward by ID
export async function getRewardHandler(c: Context) {
  const id = c.req.param("id");

  // Get reward
  const reward = await getRewardById(id);

  if (!reward) {
    throw new NotFoundError("Reward not found");
  }

  // Return success response
  return successResponse(c, reward);
}

// List available rewards for a user
export async function listAvailableRewardsHandler(c: Context) {
  const authenticatedUser = c.get("user");
  const userId = c.req.query("user_id") || authenticatedUser.id;

  // Non-admins can only view their own available rewards
  if (authenticatedUser.role !== "admin" && userId !== authenticatedUser.id) {
    throw new ForbiddenError("You can only view rewards available to you");
  }

  // Get loyalty account
  const account = await getLoyaltyAccountByUserId(userId);

  if (!account) {
    throw new NotFoundError("Loyalty account not found");
  }

  // Get query parameters
  const limit = c.req.query("limit")
    ? parseInt(c.req.query("limit") || "10")
    : 10;
  const cursor = c.req.query("cursor");

  // Get available rewards
  const result = await listAvailableRewards(account.tier, {
    limit,
    cursor,
  });

  // Return paginated response
  return paginatedResponse(c, result.items, {
    cursor: result.cursor,
    limit,
    hasMore: !!result.cursor,
  });
}

// Redeem a reward
export async function redeemRewardHandler(c: Context) {
  const data = await c.req.json();
  const authenticatedUser = c.get("user");

  // Validate redemption data
  const redemptionData = validate(RedeemRewardSchema, data);

  // Non-admins can only redeem rewards for themselves
  if (
    authenticatedUser.role !== "admin" &&
    redemptionData.user_id !== authenticatedUser.id
  ) {
    throw new ForbiddenError("You can only redeem rewards for yourself");
  }

  // Redeem reward
  const result = await redeemReward(redemptionData);

  // Return success response
  return successResponse(c, result);
}

// Get user rewards
export async function getUserRewardsHandler(c: Context) {
  const authenticatedUser = c.get("user");
  const userId = c.req.query("user_id") || authenticatedUser.id;

  // Non-admins can only view their own rewards
  if (authenticatedUser.role !== "admin" && userId !== authenticatedUser.id) {
    throw new ForbiddenError("You can only view your own rewards");
  }

  // Get query parameters
  const limit = c.req.query("limit")
    ? parseInt(c.req.query("limit") || "10")
    : 10;
  const cursor = c.req.query("cursor");
  const status = c.req.query("status") as
    | "active"
    | "used"
    | "expired"
    | undefined;

  // Get user rewards
  const result = await getUserRewards(userId, {
    status,
    limit,
    cursor,
  });

  // Return paginated response
  return paginatedResponse(c, result.items, {
    cursor: result.cursor,
    limit,
    hasMore: !!result.cursor,
  });
}
