import { atomic, create, list, read, update } from "../db/index.ts";
import {
  CreatePayment,
  Payment,
  PaymentStatus,
  UpdatePayment,
} from "../models/payment.ts";
import { BadRequestError, NotFoundError } from "../utils/error.ts";
import { getOrderById, updateOrder } from "./order-service.ts";

const COLLECTION = "payments";

// Create a new payment
export async function createPayment(
  paymentData: CreatePayment,
): Promise<Payment> {
  const now = new Date().toISOString();
  const paymentId = crypto.randomUUID();

  // Get order to verify it exists and payment amount matches
  const order = await getOrderById(paymentData.order_id);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (order.payment_status === "completed") {
    throw new BadRequestError("Order is already paid");
  }

  // In a production environment, we would integrate with a payment gateway here
  // For now, we'll simulate payment authorization

  const payment: Payment = {
    id: paymentId,
    order_id: paymentData.order_id,
    user_id: paymentData.user_id,
    amount: paymentData.amount,
    currency: paymentData.currency || "MYR",
    payment_method: paymentData.payment_method,
    payment_status: "authorized" as PaymentStatus, // Simulate successful authorization
    transaction_id: paymentData.transaction_id || `txn_${Date.now()}`,
    created_at: now,
    updated_at: now,
    gateway_response: paymentData.gateway_response ||
      { success: true, message: "Payment authorized" },
  };

  // Save payment
  await create<Payment>(COLLECTION, paymentId, payment);

  // Update order payment status
  await updateOrder(payment.order_id, {
    payment_status: "authorized",
  });

  return payment;
}

// Complete a payment after authorization (e.g., capture funds)
export async function completePayment(id: string): Promise<Payment> {
  return await atomic<Payment>(COLLECTION, id, (payment) => {
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    if (payment.payment_status !== "authorized") {
      throw new BadRequestError(
        `Cannot complete payment with status: ${payment.payment_status}`,
      );
    }

    // In a production environment, we would call the payment gateway to capture funds

    const updatedPayment: Payment = {
      ...payment,
      payment_status: "completed",
      updated_at: new Date().toISOString(),
      gateway_response: {
        ...payment.gateway_response,
        captured: true,
        captureTime: new Date().toISOString(),
      },
    };

    return updatedPayment;
  });
}

// Process refund for a payment
export async function refundPayment(
  id: string,
  amount?: number,
): Promise<Payment> {
  const payment = await getPaymentById(id);

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  if (payment.payment_status !== "completed") {
    throw new BadRequestError("Can only refund completed payments");
  }

  const refundAmount = amount || payment.amount;

  if (refundAmount > payment.amount) {
    throw new BadRequestError(
      "Refund amount cannot exceed original payment amount",
    );
  }

  // In a production environment, we would call the payment gateway to process refund

  const updatedPayment: Payment = {
    ...payment,
    payment_status: refundAmount === payment.amount
      ? "refunded"
      : "partially_refunded",
    refunded_amount: refundAmount,
    updated_at: new Date().toISOString(),
    gateway_response: {
      ...payment.gateway_response,
      refunded: true,
      refundAmount: refundAmount,
      refundTime: new Date().toISOString(),
    },
  };

  // Save the updated payment
  await update<Payment>(COLLECTION, id, updatedPayment);

  // Update order payment status if fully refunded
  if (refundAmount === payment.amount) {
    await updateOrder(payment.order_id, {
      payment_status: "refunded",
    });
  }

  return updatedPayment;
}

// Get payment by ID
export async function getPaymentById(id: string): Promise<Payment | null> {
  return await read<Payment>(COLLECTION, id);
}

// Get payments by order ID
export async function getPaymentsByOrderId(
  orderId: string,
): Promise<Payment[]> {
  const result = await list<Payment>(COLLECTION);

  return result.items.filter((payment) => payment.order_id === orderId);
}

// Get payments by user ID
export async function getPaymentsByUserId(
  userId: string,
  options: {
    limit?: number;
    cursor?: string;
  } = {},
): Promise<{ items: Payment[]; cursor: string | null }> {
  const { limit, cursor } = options;

  const result = await list<Payment>(COLLECTION, { limit, cursor });

  const filteredPayments = result.items.filter((payment) =>
    payment.user_id === userId
  );

  return {
    items: filteredPayments,
    cursor: result.cursor,
  };
}

// Update payment status (for webhook handling)
export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
): Promise<Payment> {
  const payment = await getPaymentById(id);

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  const updatedPayment: Payment = {
    ...payment,
    payment_status: status,
    updated_at: new Date().toISOString(),
  };

  // Save the updated payment
  await update<Payment>(COLLECTION, id, updatedPayment);

  // Update order payment status
  await updateOrder(payment.order_id, {
    payment_status: status as "pending" | "completed" | "failed" | "refunded",
  });

  // Send notification to user about payment status update
  try {
    // Import the notification service on demand to avoid circular dependencies
    const { createNotification } = await import("./notification-service.ts");

    let title = "";
    let message = "";

    // Customize notification based on status
    switch (status) {
      case "authorized":
        title = "Payment Authorized";
        message = `Your payment for order #${
          payment.order_id.substring(0, 8)
        } has been authorized.`;
        break;
      case "completed":
        title = "Payment Completed";
        message = `Your payment for order #${
          payment.order_id.substring(0, 8)
        } has been completed.`;
        break;
      case "failed":
        title = "Payment Failed";
        message = `Your payment for order #${
          payment.order_id.substring(0, 8)
        } has failed. Please try again.`;
        break;
      case "refunded":
        title = "Payment Refunded";
        message = `Your payment for order #${
          payment.order_id.substring(0, 8)
        } has been refunded.`;
        break;
      case "partially_refunded":
        title = "Payment Partially Refunded";
        message = `Your payment for order #${
          payment.order_id.substring(0, 8)
        } has been partially refunded.`;
        break;
      default:
        title = "Payment Update";
        message = `Your payment status for order #${
          payment.order_id.substring(0, 8)
        } has been updated to ${status}.`;
    }

    // Create notification
    await createNotification({
      user_id: payment.user_id,
      type: "payment_status",
      title,
      message,
      channels: ["push", "email", "in_app"],
      data: {
        order_id: payment.order_id,
        payment_id: id,
        status: status,
        amount: payment.amount,
      },
      action_url: `/orders/${payment.order_id}`,
    });
  } catch (error) {
    // Log error but don't fail the payment status update
    console.error(`Failed to send notification for payment ${id}:`, error);
  }

  return updatedPayment;
}
