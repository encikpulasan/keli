import { atomic, create, list, read, update } from "../db/index.ts";
import {
  CreateInventoryItem,
  InventoryAdjustment,
  InventoryItem,
  UpdateInventoryItem,
} from "../models/inventory.ts";
import { BadRequestError, NotFoundError } from "../utils/error.ts";
import { getProductById } from "./product-service.ts";
import { getStoreById } from "./store-service.ts";

const COLLECTION = "inventory";
const ADJUSTMENT_COLLECTION = "inventory_adjustments";

// Create a new inventory item
export async function createInventoryItem(
  data: CreateInventoryItem,
): Promise<InventoryItem> {
  // Verify store and product exist
  await getStoreById(data.store_id);
  await getProductById(data.product_id);

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const inventoryItem: InventoryItem = {
    id,
    store_id: data.store_id,
    product_id: data.product_id,
    quantity: data.quantity,
    unit_of_measure: data.unit_of_measure,
    reorder_threshold: data.reorder_threshold,
    last_restocked_at: now,
    updated_at: now,
    created_at: now,
  };

  await create<InventoryItem>(COLLECTION, id, inventoryItem);

  return inventoryItem;
}

// Get inventory item by store and product
export async function getInventoryItem(
  storeId: string,
  productId: string,
): Promise<InventoryItem | null> {
  const result = await list<InventoryItem>(COLLECTION);

  return result.items.find(
    (item) => item.store_id === storeId && item.product_id === productId,
  ) || null;
}

// Get inventory item by ID
export async function getInventoryItemById(
  id: string,
): Promise<InventoryItem | null> {
  return await read<InventoryItem>(COLLECTION, id);
}

// Update inventory item
export async function updateInventoryItem(
  id: string,
  data: UpdateInventoryItem,
): Promise<InventoryItem> {
  const inventoryItem = await getInventoryItemById(id);

  if (!inventoryItem) {
    throw new NotFoundError("Inventory item not found");
  }

  const updatedItem: InventoryItem = {
    ...inventoryItem,
    ...data,
    updated_at: new Date().toISOString(),
  };

  await update<InventoryItem>(COLLECTION, id, updatedItem);

  return updatedItem;
}

// Adjust inventory quantity (add or subtract)
export async function adjustInventory(
  adjustmentData: InventoryAdjustment,
): Promise<InventoryItem> {
  // Find the inventory item
  const inventoryItem = await getInventoryItem(
    adjustmentData.store_id,
    adjustmentData.product_id,
  );

  if (!inventoryItem) {
    throw new NotFoundError("Inventory item not found");
  }

  // Apply the adjustment - atomic operation to prevent race conditions
  return await atomic<InventoryItem>(COLLECTION, inventoryItem.id, (item) => {
    if (!item) {
      throw new NotFoundError("Inventory item not found");
    }

    const newQuantity = item.quantity + adjustmentData.quantity;

    // Prevent negative inventory unless it's an intentional adjustment
    if (newQuantity < 0 && adjustmentData.reason !== "inventory_correction") {
      throw new BadRequestError("Insufficient inventory");
    }

    const now = new Date().toISOString();

    // If we're adding inventory, update last_restocked_at
    const lastRestocked = adjustmentData.quantity > 0
      ? now
      : item.last_restocked_at;

    // Save the adjustment record for audit trail
    const adjustmentId = crypto.randomUUID();
    create(ADJUSTMENT_COLLECTION, adjustmentId, {
      id: adjustmentId,
      inventory_item_id: item.id,
      store_id: item.store_id,
      product_id: item.product_id,
      quantity_before: item.quantity,
      quantity_after: newQuantity,
      adjustment_amount: adjustmentData.quantity,
      reason: adjustmentData.reason,
      created_at: now,
    });

    return {
      ...item,
      quantity: newQuantity,
      last_restocked_at: lastRestocked,
      updated_at: now,
    };
  });
}

// Check if product is available at store
export async function checkProductAvailability(
  storeId: string,
  productId: string,
  quantityNeeded: number = 1,
): Promise<boolean> {
  const inventoryItem = await getInventoryItem(storeId, productId);

  if (!inventoryItem) {
    return false;
  }

  return inventoryItem.quantity >= quantityNeeded;
}

// List inventory for a store
export async function getStoreInventory(
  storeId: string,
  options: {
    limit?: number;
    cursor?: string;
    lowStock?: boolean;
  } = {},
): Promise<{ items: InventoryItem[]; cursor: string | null }> {
  const { limit, cursor, lowStock } = options;

  const result = await list<InventoryItem>(COLLECTION, { limit, cursor });

  // Filter by store
  let filteredItems = result.items.filter(
    (item) => item.store_id === storeId,
  );

  // Filter low stock items if requested
  if (lowStock) {
    filteredItems = filteredItems.filter(
      (item) => item.quantity <= item.reorder_threshold,
    );
  }

  return {
    items: filteredItems,
    cursor: result.cursor,
  };
}

// Update inventory based on order
export async function updateInventoryFromOrder(
  orderId: string,
  storeId: string,
  items: Array<{
    product_id: string;
    quantity: number;
  }>,
): Promise<void> {
  // For each item in the order, reduce inventory
  for (const item of items) {
    const { product_id, quantity } = item;

    // Reduce inventory
    await adjustInventory({
      store_id: storeId,
      product_id,
      quantity: -quantity, // Negative for reduction
      reason: `order_${orderId}`,
    });
  }
}
