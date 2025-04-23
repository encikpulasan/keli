import { z } from "npm:zod";

// Inventory model
export interface InventoryItem {
  id: string;
  store_id: string;
  product_id: string;
  quantity: number;
  unit_of_measure: string;
  reorder_threshold: number;
  last_restocked_at: string;
  updated_at: string;
  created_at: string;
}

// Create inventory item schema
export const CreateInventoryItemSchema = z.object({
  store_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().nonnegative(),
  unit_of_measure: z.string(),
  reorder_threshold: z.number().nonnegative(),
});

export type CreateInventoryItem = z.infer<typeof CreateInventoryItemSchema>;

// Update inventory item schema
export const UpdateInventoryItemSchema = z.object({
  quantity: z.number().nonnegative().optional(),
  reorder_threshold: z.number().nonnegative().optional(),
  unit_of_measure: z.string().optional(),
});

export type UpdateInventoryItem = z.infer<typeof UpdateInventoryItemSchema>;

// Inventory adjustment schema
export const InventoryAdjustmentSchema = z.object({
  store_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number(),
  reason: z.string(),
});

export type InventoryAdjustment = z.infer<typeof InventoryAdjustmentSchema>;
