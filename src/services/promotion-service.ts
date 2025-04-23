import { atomic, create, list, read, update } from "../db/index.ts";
import {
  ApplyPromotionInput,
  CreatePromotion,
  Promotion,
  PromotionUsage,
  UpdatePromotion,
} from "../models/promotion.ts";
import { BadRequestError, NotFoundError } from "../utils/error.ts";
import { getOrderById, updateOrder } from "./order-service.ts";
import { getLoyaltyAccountByUserId } from "./loyalty-service.ts";

const COLLECTION = "promotions";
const USAGE_COLLECTION = "promotion_usage";

// Create a new promotion
export async function createPromotion(
  data: CreatePromotion,
): Promise<Promotion> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  // Validate dates
  const startDate = new Date(data.start_date);
  const endDate = data.end_date ? new Date(data.end_date) : undefined;

  if (endDate && startDate >= endDate) {
    throw new BadRequestError("End date must be after start date");
  }

  const promotion: Promotion = {
    id,
    name: data.name,
    description: data.description,
    code: data.code,
    type: data.type,
    value: data.value,
    target: data.target,
    target_ids: data.target_ids,
    conditions: data.conditions,
    max_discount_amount: data.max_discount_amount,
    max_uses_total: data.max_uses_total,
    max_uses_per_user: data.max_uses_per_user,
    is_active: data.is_active ?? true,
    start_date: data.start_date,
    end_date: data.end_date,
    created_at: now,
    updated_at: now,
    required_loyalty_tier: data.required_loyalty_tier,
    stores: data.stores,
  };

  await create<Promotion>(COLLECTION, id, promotion);

  return promotion;
}

// Get promotion by ID
export async function getPromotionById(id: string): Promise<Promotion | null> {
  return await read<Promotion>(COLLECTION, id);
}

// Get promotion by code
export async function getPromotionByCode(
  code: string,
): Promise<Promotion | null> {
  const result = await list<Promotion>(COLLECTION);

  return result.items.find(
    (promotion) => promotion.code === code && promotion.is_active,
  ) || null;
}

// Update promotion
export async function updatePromotion(
  id: string,
  data: UpdatePromotion,
): Promise<Promotion> {
  const promotion = await getPromotionById(id);

  if (!promotion) {
    throw new NotFoundError("Promotion not found");
  }

  // Validate dates if provided
  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (startDate >= endDate) {
      throw new BadRequestError("End date must be after start date");
    }
  } else if (data.start_date && promotion.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(promotion.end_date);

    if (startDate >= endDate) {
      throw new BadRequestError("End date must be after start date");
    }
  } else if (data.end_date && promotion.start_date) {
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(data.end_date);

    if (startDate >= endDate) {
      throw new BadRequestError("End date must be after start date");
    }
  }

  const updatedPromotion: Promotion = {
    ...promotion,
    ...data,
    updated_at: new Date().toISOString(),
  };

  await update<Promotion>(COLLECTION, id, updatedPromotion);

  return updatedPromotion;
}

// List active promotions
export async function listActivePromotions(
  options: {
    limit?: number;
    cursor?: string;
  } = {},
): Promise<{ items: Promotion[]; cursor: string | null }> {
  const { limit, cursor } = options;

  const result = await list<Promotion>(COLLECTION, { limit, cursor });

  const now = new Date();

  // Filter active promotions
  const filteredItems = result.items.filter((promotion) => {
    if (!promotion.is_active) return false;

    const startDate = new Date(promotion.start_date);
    if (startDate > now) return false;

    if (promotion.end_date) {
      const endDate = new Date(promotion.end_date);
      if (endDate < now) return false;
    }

    return true;
  });

  return {
    items: filteredItems,
    cursor: result.cursor,
  };
}

// Check if promotion is valid for a user
export async function isPromotionValidForUser(
  promotion: Promotion,
  userId: string,
): Promise<boolean> {
  // Check max uses per user if set
  if (promotion.max_uses_per_user) {
    const usageCount = await getUserPromotionUsageCount(promotion.id, userId);
    if (usageCount >= promotion.max_uses_per_user) {
      return false;
    }
  }

  // Check loyalty tier requirement if set
  if (promotion.required_loyalty_tier) {
    const loyaltyAccount = await getLoyaltyAccountByUserId(userId);
    if (
      !loyaltyAccount || loyaltyAccount.tier !== promotion.required_loyalty_tier
    ) {
      return false;
    }
  }

  return true;
}

// Get usage count for a user and promotion
export async function getUserPromotionUsageCount(
  promotionId: string,
  userId: string,
): Promise<number> {
  const result = await list<PromotionUsage>(USAGE_COLLECTION);

  return result.items.filter(
    (usage) => usage.promotion_id === promotionId && usage.user_id === userId,
  ).length;
}

// Get total usage count for a promotion
export async function getPromotionUsageCount(
  promotionId: string,
): Promise<number> {
  const result = await list<PromotionUsage>(USAGE_COLLECTION);

  return result.items.filter((usage) => usage.promotion_id === promotionId)
    .length;
}

// Apply promotion to order
export async function applyPromotion(
  data: ApplyPromotionInput,
): Promise<{ order: any; discountAmount: number }> {
  // Get promotion
  const promotion = await getPromotionByCode(data.code);

  if (!promotion) {
    throw new NotFoundError("Promotion not found or inactive");
  }

  // Get order
  const order = await getOrderById(data.order_id);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  // Check promotion validity
  const now = new Date();
  const startDate = new Date(promotion.start_date);
  const endDate = promotion.end_date ? new Date(promotion.end_date) : undefined;

  if (startDate > now || (endDate && endDate < now)) {
    throw new BadRequestError("Promotion is not active at this time");
  }

  // Check max total uses if set
  if (promotion.max_uses_total) {
    const usageCount = await getPromotionUsageCount(promotion.id);
    if (usageCount >= promotion.max_uses_total) {
      throw new BadRequestError("Promotion has reached maximum usage");
    }
  }

  // Check if valid for user
  const isValid = await isPromotionValidForUser(promotion, data.user_id);
  if (!isValid) {
    throw new BadRequestError("Promotion is not valid for this user");
  }

  // Check store specific promotions
  if (promotion.stores && promotion.stores.length > 0) {
    if (!promotion.stores.includes(order.store_id)) {
      throw new BadRequestError("Promotion is not valid for this store");
    }
  }

  // Calculate discount
  let discountAmount = 0;

  // Logic based on promotion type and target
  if (promotion.type === "percentage") {
    // Percentage discount on order or specific products
    if (promotion.target === "order") {
      discountAmount = (order.subtotal * promotion.value) / 100;
    } else if (promotion.target === "product" && promotion.target_ids) {
      // Calculate discount only for specified products
      const targetProducts = order.items.filter((item: any) =>
        promotion.target_ids!.includes(item.product_id)
      );

      if (targetProducts.length === 0) {
        throw new BadRequestError(
          "Order does not contain any products eligible for this promotion",
        );
      }

      const targetSubtotal = targetProducts.reduce(
        (sum: number, item: any) => sum + item.subtotal,
        0,
      );

      discountAmount = (targetSubtotal * promotion.value) / 100;
    }
  } else if (promotion.type === "fixed_amount") {
    // Fixed amount discount
    discountAmount = promotion.value;
  }

  // Apply max discount if specified
  if (
    promotion.max_discount_amount &&
    discountAmount > promotion.max_discount_amount
  ) {
    discountAmount = promotion.max_discount_amount;
  }

  // Ensure discount doesn't exceed order subtotal
  if (discountAmount > order.subtotal) {
    discountAmount = order.subtotal;
  }

  // Round to 2 decimal places
  discountAmount = Math.round(discountAmount * 100) / 100;

  // Update order with discount
  const updatedTotal = order.total - discountAmount;

  const updatedOrder = await updateOrder(order.id, {
    discount: discountAmount,
    total: updatedTotal,
  });

  // Record promotion usage
  const usageId = crypto.randomUUID();
  const usage: PromotionUsage = {
    id: usageId,
    promotion_id: promotion.id,
    user_id: data.user_id,
    order_id: data.order_id,
    discount_amount: discountAmount,
    created_at: new Date().toISOString(),
  };

  await create<PromotionUsage>(USAGE_COLLECTION, usageId, usage);

  return {
    order: updatedOrder,
    discountAmount,
  };
}
