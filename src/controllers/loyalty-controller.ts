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
import { z } from "npm:zod";
import { errorResponse } from "../utils/response.ts";

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

// In-memory storage for loyalty points
const userPoints = new Map<string, number>();

// Schema for adding points
const AddPointsSchema = z.object({
  userId: z.string(),
  points: z.number().positive(),
  orderId: z.string().optional(),
});

// Schema for redeeming points
const RedeemPointsSchema = z.object({
  userId: z.string(),
  points: z.number().positive(),
  orderId: z.string().optional(),
});

/**
 * Get user's loyalty points
 */
export const getUserPointsHandler = async (c: Context) => {
  const userId = c.req.param("userId");

  // Get user points (default to 0 if not found)
  const points = userPoints.get(userId) || 0;

  return successResponse(c, {
    userId,
    points,
    tier: calculateTier(points),
    history: [], // In a real implementation, would fetch point history
  });
};

/**
 * Add loyalty points to a user
 */
export const addPointsHandler = async (c: Context) => {
  try {
    const validateData = await c.req.json();
    const data = AddPointsSchema.parse(validateData);
    const { userId, points } = data;

    // Get current points
    const currentPoints = userPoints.get(userId) || 0;

    // Add points
    userPoints.set(userId, currentPoints + points);

    return successResponse(c, {
      userId,
      previousPoints: currentPoints,
      addedPoints: points,
      newTotal: currentPoints + points,
      tier: calculateTier(currentPoints + points),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message, 400);
    }
    return errorResponse(c, "Unknown error occurred", 400);
  }
};

/**
 * Redeem loyalty points
 */
export const redeemPointsHandler = async (c: Context) => {
  try {
    const validateData = await c.req.json();
    const data = RedeemPointsSchema.parse(validateData);
    const { userId, points } = data;

    // Get current points
    const currentPoints = userPoints.get(userId) || 0;

    // Check if user has enough points
    if (currentPoints < points) {
      return errorResponse(c, "Insufficient points", 400);
    }

    // Deduct points
    userPoints.set(userId, currentPoints - points);

    return successResponse(c, {
      userId,
      previousPoints: currentPoints,
      redeemedPoints: points,
      newTotal: currentPoints - points,
      tier: calculateTier(currentPoints - points),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message, 400);
    }
    return errorResponse(c, "Unknown error occurred", 400);
  }
};

// Helper function to calculate loyalty tier
function calculateTier(points: number): string {
  if (points >= 1000) return "Platinum";
  if (points >= 500) return "Gold";
  if (points >= 200) return "Silver";
  return "Bronze";
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
