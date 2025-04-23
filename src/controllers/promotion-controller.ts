import { Context } from "hono";
import {
  applyPromotion,
  createPromotion,
  getPromotionById,
  listActivePromotions,
  updatePromotion,
} from "../services/promotion-service.ts";
import {
  ApplyPromotionSchema,
  CreatePromotionSchema,
  UpdatePromotionSchema,
} from "../models/promotion.ts";
import { validate } from "../utils/validation.ts";
import {
  createdResponse,
  paginatedResponse,
  successResponse,
} from "../utils/response.ts";
import { ForbiddenError, NotFoundError } from "../utils/error.ts";

// Create a new promotion (admin only)
export async function createPromotionHandler(c: Context) {
  const data = await c.req.json();

  // Validate promotion data
  const promotionData = validate(CreatePromotionSchema, data);

  // Create promotion
  const result = await createPromotion(promotionData);

  // Return success response
  return createdResponse(c, result);
}

// Get a promotion by ID
export async function getPromotionHandler(c: Context) {
  const id = c.req.param("id");

  // Get promotion
  const promotion = await getPromotionById(id);

  if (!promotion) {
    throw new NotFoundError("Promotion not found");
  }

  // Return success response
  return successResponse(c, promotion);
}

// Update a promotion (admin only)
export async function updatePromotionHandler(c: Context) {
  const id = c.req.param("id");
  const data = await c.req.json();

  // Validate promotion data
  const promotionData = validate(UpdatePromotionSchema, data);

  // Update promotion
  const result = await updatePromotion(id, promotionData);

  // Return success response
  return successResponse(c, result);
}

// List active promotions
export async function listActivePromotionsHandler(c: Context) {
  // Get query parameters
  const limit = c.req.query("limit")
    ? parseInt(c.req.query("limit") || "10")
    : 10;
  const cursor = c.req.query("cursor");

  // List promotions
  const result = await listActivePromotions({
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

// Apply a promotion code to an order
export async function applyPromotionHandler(c: Context) {
  const data = await c.req.json();
  const authenticatedUser = c.get("user");

  // Validate promotion data
  const promotionData = validate(ApplyPromotionSchema, data);

  // Ensure user can only apply promotions to their own orders
  if (
    authenticatedUser.role !== "admin" &&
    promotionData.user_id !== authenticatedUser.id
  ) {
    throw new ForbiddenError(
      "You can only apply promotions to your own orders",
    );
  }

  // Apply promotion
  const result = await applyPromotion(promotionData);

  // Return success response
  return successResponse(c, result);
}
