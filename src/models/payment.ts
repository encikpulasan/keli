import { z } from "npm:zod";

// Payment status types
export type PaymentStatus =
  | "pending"
  | "authorized"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded";

// Payment method types
export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "wallet"
  | "gift_card"
  | "loyalty_points"
  | "cash";

// Payment model
export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
  refunded_amount?: number;
  gateway_response?: Record<string, unknown>;
}

// Create payment schema
export const CreatePaymentSchema = z.object({
  order_id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default("MYR"),
  payment_method: z.enum([
    "credit_card",
    "debit_card",
    "wallet",
    "gift_card",
    "loyalty_points",
    "cash",
  ]),
  transaction_id: z.string().optional(),
  gateway_response: z.record(z.unknown()).optional(),
});

export type CreatePayment = z.infer<typeof CreatePaymentSchema>;

// Update payment schema
export const UpdatePaymentSchema = z.object({
  payment_status: z.enum([
    "pending",
    "authorized",
    "completed",
    "failed",
    "refunded",
    "partially_refunded",
  ]),
  transaction_id: z.string().optional(),
  refunded_amount: z.number().optional(),
  gateway_response: z.record(z.unknown()).optional(),
});

export type UpdatePayment = z.infer<typeof UpdatePaymentSchema>;
