import { z } from "npm:zod";

// Promotion types
export type PromotionType =
  | "percentage"
  | "fixed_amount"
  | "free_item"
  | "bogo" // Buy one get one
  | "bundle"; // Bundle discount

// Target types
export type PromotionTarget =
  | "all"
  | "product"
  | "category"
  | "order";

// Condition types
export type PromotionCondition =
  | "min_order_amount"
  | "min_quantity"
  | "specific_products"
  | "first_order"
  | "loyalty_tier";

// Promotion model
export interface Promotion {
  id: string;
  name: string;
  description: string;
  code?: string; // Optional for automatic promotions
  type: PromotionType;
  value: number; // Percentage or fixed amount depending on type
  target: PromotionTarget;
  target_ids?: string[]; // IDs of products or categories if target is specific
  conditions: {
    type: PromotionCondition;
    value: any; // Different types based on condition
  }[];
  max_discount_amount?: number; // Maximum discount amount for percentage discounts
  max_uses_total?: number; // Maximum total uses
  max_uses_per_user?: number; // Maximum uses per user
  is_active: boolean;
  start_date: string;
  end_date?: string; // Optional for ongoing promotions
  created_at: string;
  updated_at: string;
  required_loyalty_tier?: string; // Optional loyalty tier requirement
  stores?: string[]; // Optional store IDs for store-specific promotions
}

// Promotion usage model
export interface PromotionUsage {
  id: string;
  promotion_id: string;
  user_id: string;
  order_id: string;
  discount_amount: number;
  created_at: string;
}

// Create promotion schema
export const CreatePromotionSchema = z.object({
  name: z.string(),
  description: z.string(),
  code: z.string().optional(),
  type: z.enum(["percentage", "fixed_amount", "free_item", "bogo", "bundle"]),
  value: z.number().positive(),
  target: z.enum(["all", "product", "category", "order"]),
  target_ids: z.array(z.string()).optional(),
  conditions: z.array(
    z.object({
      type: z.enum([
        "min_order_amount",
        "min_quantity",
        "specific_products",
        "first_order",
        "loyalty_tier",
      ]),
      value: z.any(),
    }),
  ),
  max_discount_amount: z.number().positive().optional(),
  max_uses_total: z.number().positive().optional(),
  max_uses_per_user: z.number().positive().optional(),
  is_active: z.boolean().default(true),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  required_loyalty_tier: z.string().optional(),
  stores: z.array(z.string()).optional(),
});

export type CreatePromotion = z.infer<typeof CreatePromotionSchema>;

// Update promotion schema
export const UpdatePromotionSchema = CreatePromotionSchema.partial().omit({
  code: true,
});

export type UpdatePromotion = z.infer<typeof UpdatePromotionSchema>;

// Apply promotion schema
export const ApplyPromotionSchema = z.object({
  code: z.string(),
  order_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export type ApplyPromotionInput = z.infer<typeof ApplyPromotionSchema>;
