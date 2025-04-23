import { Context } from "hono";
import {
  adjustInventory,
  checkProductAvailability,
  createInventoryItem,
  getInventoryItemById,
  getStoreInventory,
  updateInventoryItem,
} from "../services/inventory-service.ts";
import {
  CreateInventoryItemSchema,
  InventoryAdjustmentSchema,
  UpdateInventoryItemSchema,
} from "../models/inventory.ts";
import { validate } from "../utils/validation.ts";
import {
  createdResponse,
  paginatedResponse,
  successResponse,
} from "../utils/response.ts";
import { BadRequestError, NotFoundError } from "../utils/error.ts";

// Create a new inventory item
export async function createInventoryItemHandler(c: Context) {
  const data = await c.req.json();

  // Validate inventory data
  const inventoryData = validate(CreateInventoryItemSchema, data);

  // Create inventory item
  const result = await createInventoryItem(inventoryData);

  // Return success response
  return createdResponse(c, result);
}

// Get an inventory item by ID
export async function getInventoryItemHandler(c: Context) {
  const id = c.req.param("id");

  // Get inventory item
  const inventoryItem = await getInventoryItemById(id);

  if (!inventoryItem) {
    throw new NotFoundError("Inventory item not found");
  }

  // Return success response
  return successResponse(c, inventoryItem);
}

// Update an inventory item
export async function updateInventoryItemHandler(c: Context) {
  const id = c.req.param("id");
  const data = await c.req.json();

  // Validate inventory data
  const inventoryData = validate(UpdateInventoryItemSchema, data);

  // Update inventory item
  const result = await updateInventoryItem(id, inventoryData);

  // Return success response
  return successResponse(c, result);
}

// Adjust inventory (add or subtract)
export async function adjustInventoryHandler(c: Context) {
  const data = await c.req.json();

  // Validate adjustment data
  const adjustmentData = validate(InventoryAdjustmentSchema, data);

  // Adjust inventory
  const result = await adjustInventory(adjustmentData);

  // Return success response
  return successResponse(c, result);
}

// Check product availability
export async function checkProductAvailabilityHandler(c: Context) {
  const storeId = c.req.query("store_id");
  const productId = c.req.query("product_id");
  const quantityStr = c.req.query("quantity");

  if (!storeId || !productId) {
    throw new BadRequestError("Store ID and Product ID are required");
  }

  const quantity = quantityStr ? parseInt(quantityStr) : 1;

  // Check availability
  const isAvailable = await checkProductAvailability(
    storeId,
    productId,
    quantity,
  );

  // Return success response
  return successResponse(c, { available: isAvailable, quantity });
}

// List inventory for a store
export async function listStoreInventoryHandler(c: Context) {
  const storeId = c.req.param("storeId");

  // Get query parameters
  const limit = c.req.query("limit")
    ? parseInt(c.req.query("limit") || "10")
    : 10;
  const cursor = c.req.query("cursor");
  const lowStock = c.req.query("low_stock") === "true";

  // Get store inventory
  const result = await getStoreInventory(storeId, {
    limit,
    cursor,
    lowStock,
  });

  // Return paginated response
  return paginatedResponse(c, result.items, {
    cursor: result.cursor,
    limit,
    hasMore: !!result.cursor,
  });
}
