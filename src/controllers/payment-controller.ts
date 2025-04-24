import { Context } from "hono";
import {
  completePayment,
  createPayment,
  getPaymentById,
  getPaymentsByOrderId,
  getPaymentsByUserId,
  refundPayment,
  updatePaymentStatus,
} from "../services/payment-service.ts";
import { CreatePaymentSchema, UpdatePaymentSchema } from "../models/payment.ts";
import { validate } from "../utils/validation.ts";
import {
  createdResponse,
  paginatedResponse,
  successResponse,
} from "../utils/response.ts";
import { ForbiddenError, NotFoundError } from "../utils/error.ts";
import { getOrderById } from "../services/order-service.ts";
import { z } from "npm:zod";

// Payment schema
const PaymentSchema = z.object({
  orderId: z.string(),
  paymentMethod: z.enum([
    "credit_card",
    "debit_card",
    "mobile_payment",
    "points",
  ]),
  amount: z.number().positive(),
  cardDetails: z.object({
    cardNumber: z.string(),
    expiryMonth: z.string(),
    expiryYear: z.string(),
    cvv: z.string(),
  }).optional(),
});

// Create a new payment
export async function createPaymentHandler(c: Context) {
  const data = await c.req.json();
  const authenticatedUser = c.get("user");

  // Validate payment data
  const paymentData = validate(CreatePaymentSchema, data);

  // Ensure user can only make payments for their own orders
  if (
    authenticatedUser.role !== "admin" &&
    paymentData.user_id !== authenticatedUser.id
  ) {
    throw new ForbiddenError("You can only make payments for your own orders");
  }

  // Verify the order belongs to the user
  const order = await getOrderById(paymentData.order_id);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (
    authenticatedUser.role !== "admin" && order.user_id !== authenticatedUser.id
  ) {
    throw new ForbiddenError("You can only make payments for your own orders");
  }

  // Create payment
  const result = await createPayment(paymentData);

  // Return success response
  return createdResponse(c, result);
}

// Get a payment by ID
export async function getPaymentHandler(c: Context) {
  const id = c.req.param("id");
  const authenticatedUser = c.get("user");

  // Get payment
  const payment = await getPaymentById(id);

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  // Ensure user can only view their own payments unless they're an admin
  if (
    authenticatedUser.role !== "admin" &&
    payment.user_id !== authenticatedUser.id
  ) {
    throw new ForbiddenError("You can only view your own payments");
  }

  // Return success response
  return successResponse(c, payment);
}

// Complete a payment (admin only)
export async function completePaymentHandler(c: Context) {
  const id = c.req.param("id");

  // Complete payment
  const result = await completePayment(id);

  // Return success response
  return successResponse(c, result);
}

// Refund a payment (admin only)
export async function refundPaymentHandler(c: Context) {
  const id = c.req.param("id");
  const data = await c.req.json();

  // Refund payment
  const result = await refundPayment(id, data.amount);

  // Return success response
  return successResponse(c, result);
}

// Get payments by order ID
export async function getPaymentsByOrderIdHandler(c: Context) {
  const orderId = c.req.param("orderId");
  const authenticatedUser = c.get("user");

  // Verify the order belongs to the user
  const order = await getOrderById(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (
    authenticatedUser.role !== "admin" && order.user_id !== authenticatedUser.id
  ) {
    throw new ForbiddenError("You can only view payments for your own orders");
  }

  // Get payments
  const payments = await getPaymentsByOrderId(orderId);

  // Return success response
  return successResponse(c, payments);
}

// List payments by user ID
export async function listUserPaymentsHandler(c: Context) {
  const authenticatedUser = c.get("user");

  // Get query parameters
  const limit = c.req.query("limit")
    ? parseInt(c.req.query("limit") || "10")
    : 10;
  const cursor = c.req.query("cursor");

  // Default to user's own payments if not admin
  let userId = c.req.query("user_id");
  if (authenticatedUser.role !== "admin") {
    // Non-admins can only see their own payments
    userId = authenticatedUser.id;
  }

  if (!userId) {
    throw new ForbiddenError("User ID is required");
  }

  // List payments
  const result = await getPaymentsByUserId(userId, {
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

// Webhook handler for payment status updates (from payment gateway)
export async function paymentWebhookHandler(c: Context) {
  const data = await c.req.json();

  // In a real implementation, we'd verify the webhook signature here

  // Process the webhook event
  if (data.type === "payment_updated" && data.payment_id && data.status) {
    await updatePaymentStatus(data.payment_id, data.status);
  }

  // Return success response
  return successResponse(c, { received: true });
}

// Process payment
export async function processPaymentHandler(c: Context) {
  const data = await c.req.json();
  const validatedData = validate(PaymentSchema, data);

  // In a real implementation, this would connect to a payment processor
  // For now, we'll simulate a successful payment

  const paymentId = crypto.randomUUID();
  const now = new Date().toISOString();

  const payment = {
    paymentId,
    status: "success",
    orderId: validatedData.orderId,
    amount: validatedData.amount,
    currency: "USD",
    timestamp: now,
  };

  return successResponse(c, payment);
}

// Process in-store payment (POS)
export async function processInStorePaymentHandler(c: Context) {
  const data = await c.req.json();
  const validatedData = validate(PaymentSchema, data);

  // In a real implementation, this would connect to an in-store payment processor
  // For now, we'll simulate a successful payment

  const paymentId = crypto.randomUUID();
  const now = new Date().toISOString();

  const payment = {
    paymentId,
    status: "success",
    orderId: validatedData.orderId,
    amount: validatedData.amount,
    currency: "USD",
    timestamp: now,
    receiptUrl: `https://example.com/receipts/${paymentId}`,
  };

  return successResponse(c, payment);
}
