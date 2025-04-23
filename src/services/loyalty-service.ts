import { atomic, create, list, read, update } from "../db/index.ts";
import {
  CreateLoyaltyAccount,
  CreateRewardInput,
  LoyaltyAccount,
  LoyaltyReward,
  LoyaltyTier,
  LoyaltyTransaction,
  LoyaltyTransactionInput,
  RedeemRewardInput,
  tierThresholds,
  UserReward,
} from "../models/loyalty.ts";
import { BadRequestError, NotFoundError } from "../utils/error.ts";
import { getUserById } from "./user-service.ts";

const ACCOUNT_COLLECTION = "loyalty_accounts";
const TRANSACTION_COLLECTION = "loyalty_transactions";
const REWARD_COLLECTION = "loyalty_rewards";
const USER_REWARD_COLLECTION = "user_rewards";

// Create a loyalty account
export async function createLoyaltyAccount(
  data: CreateLoyaltyAccount,
): Promise<LoyaltyAccount> {
  // Verify user exists
  await getUserById(data.user_id);

  // Check if account already exists
  const existingAccount = await getLoyaltyAccountByUserId(data.user_id);
  if (existingAccount) {
    throw new BadRequestError("Loyalty account already exists for this user");
  }

  const now = new Date().toISOString();
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const id = crypto.randomUUID();

  const account: LoyaltyAccount = {
    id,
    user_id: data.user_id,
    points_balance: data.points_balance || 0,
    lifetime_points: data.points_balance || 0,
    tier: data.tier || "bronze",
    tier_expiry_date: nextYear.toISOString(),
    created_at: now,
    updated_at: now,
    last_activity_date: now,
  };

  await create<LoyaltyAccount>(ACCOUNT_COLLECTION, id, account);

  return account;
}

// Get loyalty account by ID
export async function getLoyaltyAccountById(
  id: string,
): Promise<LoyaltyAccount | null> {
  return await read<LoyaltyAccount>(ACCOUNT_COLLECTION, id);
}

// Get loyalty account by user ID
export async function getLoyaltyAccountByUserId(
  userId: string,
): Promise<LoyaltyAccount | null> {
  const result = await list<LoyaltyAccount>(ACCOUNT_COLLECTION);

  return result.items.find((account) => account.user_id === userId) || null;
}

// Add loyalty points
export async function addPoints(
  userId: string,
  transactionData: LoyaltyTransactionInput,
): Promise<{ account: LoyaltyAccount; transaction: LoyaltyTransaction }> {
  // Get or create account
  let account = await getLoyaltyAccountByUserId(userId);

  if (!account) {
    account = await createLoyaltyAccount({
      user_id: userId,
      points_balance: 0,
      tier: "bronze",
    });
  }

  // Store the previous tier for notification purposes
  const previousTier = account.tier;

  // Add points using atomic operation
  account = await atomic<LoyaltyAccount>(
    ACCOUNT_COLLECTION,
    account.id,
    (currentAccount) => {
      if (!currentAccount) {
        throw new NotFoundError("Loyalty account not found");
      }

      const now = new Date().toISOString();
      const updatedPointsBalance = currentAccount.points_balance +
        transactionData.points;
      const updatedLifetimePoints = transactionData.points > 0
        ? currentAccount.lifetime_points + transactionData.points
        : currentAccount.lifetime_points;

      // Determine tier based on lifetime points
      const updatedTier = determineTier(updatedLifetimePoints);

      // If tier changed, update expiry date
      let tierExpiryDate = currentAccount.tier_expiry_date;
      if (updatedTier !== currentAccount.tier) {
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        tierExpiryDate = expiryDate.toISOString();
      }

      return {
        ...currentAccount,
        points_balance: updatedPointsBalance,
        lifetime_points: updatedLifetimePoints,
        tier: updatedTier,
        tier_expiry_date: tierExpiryDate,
        updated_at: now,
        last_activity_date: now,
      };
    },
  );

  // Create transaction record
  const transactionId = crypto.randomUUID();
  const transaction: LoyaltyTransaction = {
    id: transactionId,
    loyalty_account_id: account.id,
    user_id: userId,
    points: transactionData.points,
    type: transactionData.type,
    description: transactionData.description,
    reference_id: transactionData.reference_id,
    created_at: new Date().toISOString(),
  };

  await create<LoyaltyTransaction>(
    TRANSACTION_COLLECTION,
    transactionId,
    transaction,
  );

  // Send notifications
  try {
    // Import the notification service on demand to avoid circular dependencies
    const { createNotification } = await import("./notification-service.ts");

    // Points notification
    if (transactionData.points !== 0) {
      const pointsAction = transactionData.points > 0 ? "earned" : "used";
      const pointsAmount = Math.abs(transactionData.points);

      await createNotification({
        user_id: userId,
        type: "loyalty_points",
        title: `You've ${pointsAction} ${pointsAmount} points`,
        message: transactionData.points > 0
          ? `You've earned ${pointsAmount} loyalty points! Your balance is now ${account.points_balance} points.`
          : `You've used ${pointsAmount} loyalty points. Your balance is now ${account.points_balance} points.`,
        channels: ["push", "in_app"],
        data: {
          points: transactionData.points,
          balance: account.points_balance,
          type: transactionData.type,
          reference_id: transactionData.reference_id,
        },
        action_url: "/loyalty",
      });
    }

    // Tier change notification
    if (previousTier !== account.tier) {
      await createNotification({
        user_id: userId,
        type: "loyalty_points",
        title: `You're now ${account.tier} tier!`,
        message:
          `Congratulations! You've been upgraded from ${previousTier} to ${account.tier} tier. Enjoy your new benefits!`,
        channels: ["push", "email", "in_app"],
        data: {
          previous_tier: previousTier,
          new_tier: account.tier,
          expiry_date: account.tier_expiry_date,
        },
        action_url: "/loyalty/rewards",
      });
    }
  } catch (error) {
    // Log error but don't fail the points transaction
    console.error(
      `Failed to send loyalty notification for user ${userId}:`,
      error,
    );
  }

  return { account, transaction };
}

// Get loyalty transaction history
export async function getTransactionHistory(
  userId: string,
  options: {
    limit?: number;
    cursor?: string;
  } = {},
): Promise<{ items: LoyaltyTransaction[]; cursor: string | null }> {
  const { limit, cursor } = options;

  // Get account
  const account = await getLoyaltyAccountByUserId(userId);

  if (!account) {
    throw new NotFoundError("Loyalty account not found");
  }

  const result = await list<LoyaltyTransaction>(TRANSACTION_COLLECTION, {
    limit,
    cursor,
  });

  const filteredTransactions = result.items.filter(
    (transaction) => transaction.loyalty_account_id === account.id,
  );

  // Sort by created_at in descending order (newest first)
  filteredTransactions.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return {
    items: filteredTransactions,
    cursor: result.cursor,
  };
}

// Helper to determine tier based on lifetime points
function determineTier(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= tierThresholds.platinum) {
    return "platinum";
  } else if (lifetimePoints >= tierThresholds.gold) {
    return "gold";
  } else if (lifetimePoints >= tierThresholds.silver) {
    return "silver";
  } else {
    return "bronze";
  }
}

// Create a reward
export async function createReward(
  data: CreateRewardInput,
): Promise<LoyaltyReward> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const reward: LoyaltyReward = {
    id,
    name: data.name,
    description: data.description,
    points_cost: data.points_cost,
    tier_requirements: data.tier_requirements,
    expiry_days: data.expiry_days,
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  await create<LoyaltyReward>(REWARD_COLLECTION, id, reward);

  return reward;
}

// Get reward by ID
export async function getRewardById(id: string): Promise<LoyaltyReward | null> {
  return await read<LoyaltyReward>(REWARD_COLLECTION, id);
}

// List available rewards
export async function listAvailableRewards(
  tier: LoyaltyTier,
  options: {
    limit?: number;
    cursor?: string;
  } = {},
): Promise<{ items: LoyaltyReward[]; cursor: string | null }> {
  const { limit, cursor } = options;

  const result = await list<LoyaltyReward>(REWARD_COLLECTION, {
    limit,
    cursor,
  });

  // Filter active rewards that are available for the user's tier
  const filteredRewards = result.items.filter((reward) =>
    reward.is_active && reward.tier_requirements.includes(tier)
  );

  return {
    items: filteredRewards,
    cursor: result.cursor,
  };
}

// Redeem a reward
export async function redeemReward(
  data: RedeemRewardInput,
): Promise<{ userReward: UserReward; transaction: LoyaltyTransaction }> {
  // Get account
  const account = await getLoyaltyAccountByUserId(data.user_id);

  if (!account) {
    throw new NotFoundError("Loyalty account not found");
  }

  // Get reward
  const reward = await getRewardById(data.reward_id);

  if (!reward) {
    throw new NotFoundError("Reward not found");
  }

  if (!reward.is_active) {
    throw new BadRequestError("Reward is not active");
  }

  if (!reward.tier_requirements.includes(account.tier)) {
    throw new BadRequestError(
      `Your tier (${account.tier}) is not eligible for this reward`,
    );
  }

  // Check if user has enough points
  if (account.points_balance < reward.points_cost) {
    throw new BadRequestError("Insufficient points balance");
  }

  // Deduct points
  const { account: updatedAccount, transaction } = await addPoints(
    data.user_id,
    {
      user_id: data.user_id,
      points: -reward.points_cost,
      type: "redeem",
      description: `Redeemed reward: ${reward.name}`,
      reference_id: reward.id,
    },
  );

  // Create user reward
  const userRewardId = crypto.randomUUID();
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setDate(expiryDate.getDate() + reward.expiry_days);

  const userReward: UserReward = {
    id: userRewardId,
    user_id: data.user_id,
    reward_id: data.reward_id,
    status: "active",
    issued_at: now.toISOString(),
    expires_at: expiryDate.toISOString(),
    transaction_id: transaction.id,
  };

  await create<UserReward>(USER_REWARD_COLLECTION, userRewardId, userReward);

  return { userReward, transaction };
}

// Get user rewards
export async function getUserRewards(
  userId: string,
  options: {
    status?: "active" | "used" | "expired";
    limit?: number;
    cursor?: string;
  } = {},
): Promise<{ items: UserReward[]; cursor: string | null }> {
  const { status, limit, cursor } = options;

  const result = await list<UserReward>(USER_REWARD_COLLECTION, {
    limit,
    cursor,
  });

  // Filter by user ID and status if provided
  let filteredRewards = result.items.filter((reward) =>
    reward.user_id === userId
  );

  if (status) {
    filteredRewards = filteredRewards.filter((reward) =>
      reward.status === status
    );
  }

  // Sort by issued_at in descending order (newest first)
  filteredRewards.sort((a, b) => {
    return new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime();
  });

  return {
    items: filteredRewards,
    cursor: result.cursor,
  };
}
