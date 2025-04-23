import { z } from "npm:zod";

// Loyalty tier levels
export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

// Loyalty account model
export interface LoyaltyAccount {
  id: string;
  user_id: string;
  points_balance: number;
  lifetime_points: number;
  tier: LoyaltyTier;
  tier_expiry_date: string;
  created_at: string;
  updated_at: string;
  last_activity_date: string;
}

// Loyalty point transaction model
export interface LoyaltyTransaction {
  id: string;
  loyalty_account_id: string;
  user_id: string;
  points: number; // Positive for earned, negative for spent
  type: "earn" | "redeem" | "expire" | "adjustment";
  description: string;
  reference_id?: string; // Order ID or other reference
  created_at: string;
}

// Create loyalty account schema
export const CreateLoyaltyAccountSchema = z.object({
  user_id: z.string().uuid(),
  points_balance: z.number().nonnegative().default(0),
  tier: z.enum(["bronze", "silver", "gold", "platinum"]).default("bronze"),
});

export type CreateLoyaltyAccount = z.infer<typeof CreateLoyaltyAccountSchema>;

// Loyalty point transaction schema
export const LoyaltyTransactionSchema = z.object({
  user_id: z.string().uuid(),
  points: z.number(),
  type: z.enum(["earn", "redeem", "expire", "adjustment"]),
  description: z.string(),
  reference_id: z.string().optional(),
});

export type LoyaltyTransactionInput = z.infer<typeof LoyaltyTransactionSchema>;

// Available rewards
export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  is_active: boolean;
  tier_requirements: LoyaltyTier[];
  expiry_days: number; // Days until reward expires after redemption
  created_at: string;
  updated_at: string;
}

// Redemption schema
export const RedeemRewardSchema = z.object({
  user_id: z.string().uuid(),
  reward_id: z.string().uuid(),
});

export type RedeemRewardInput = z.infer<typeof RedeemRewardSchema>;

// User reward model
export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  status: "active" | "used" | "expired";
  issued_at: string;
  expires_at: string;
  used_at?: string;
  transaction_id: string; // Reference to the transaction that created this reward
}

// Reward CRUD schema
export const CreateRewardSchema = z.object({
  name: z.string(),
  description: z.string(),
  points_cost: z.number().positive(),
  tier_requirements: z.array(z.enum(["bronze", "silver", "gold", "platinum"])),
  expiry_days: z.number().positive(),
});

export type CreateRewardInput = z.infer<typeof CreateRewardSchema>;

// Tier configuration
export const tierThresholds = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 10000,
};
