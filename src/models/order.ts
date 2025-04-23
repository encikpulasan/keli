import { z } from "npm:zod";

// Define the OrderItem schema
export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
  subtotal: z.number().positive(),
  customizations: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});

// Define the Order schema
export const OrderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  store_id: z.string().uuid(),
  order_status: z.enum([
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "in_delivery",
    "delivered",
    "completed",
    "cancelled",
  ]),
  order_type: z.enum(["pickup", "delivery"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  payment_method: z.enum(["credit_card", "wallet", "points", "cash"]),
  payment_status: z.enum(["pending", "completed", "failed", "refunded"]),
  special_instructions: z.string().optional(),
  estimated_ready_time: z.string().datetime().optional(),
  completion_time: z.string().datetime().optional(),
  items: z.array(OrderItemSchema).optional(),
});

// Define the CreateOrder schema
export const CreateOrderSchema = z.object({
  user_id: z.string().uuid(),
  store_id: z.string().uuid(),
  order_type: z.enum(["pickup", "delivery"]),
  payment_method: z.enum(["credit_card", "wallet", "points", "cash"]),
  special_instructions: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    customizations: z.record(z.unknown()).optional(),
    notes: z.string().optional(),
  })),
});

// Define the UpdateOrder schema
export const UpdateOrderSchema = z.object({
  order_status: z.enum([
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "in_delivery",
    "delivered",
    "completed",
    "cancelled",
  ]).optional(),
  payment_status: z.enum(["pending", "completed", "failed", "refunded"])
    .optional(),
  estimated_ready_time: z.string().datetime().optional(),
  completion_time: z.string().datetime().optional(),
});

// Define the Order types
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;
