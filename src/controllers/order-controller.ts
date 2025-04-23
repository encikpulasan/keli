import { Context } from "hono";
import { z } from "npm:zod";
import {
  cancelOrder,
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from "../services/order-service.ts";
import { CreateOrderSchema, UpdateOrderSchema } from "../models/order.ts";
import { validate } from "../utils/validation.ts";
import {
  createdResponse,
  noContentResponse,
  paginatedResponse,
  successResponse,
} from "../utils/response.ts";
import { ForbiddenError } from "../utils/error.ts";

// Create a new order
export async function createOrderHandler(c: Context) {
  const data = await c.req.json();
  const authenticatedUser = c.get("user");

  // Validate order data
  const orderData = validate(CreateOrderSchema, data);

  // Ensure user can only create orders for themselves
  if (
    authenticatedUser.role !== "admin" &&
    orderData.user_id !== authenticatedUser.id
  ) {
    throw new ForbiddenError("You can only create orders for yourself");
  }

  // Create order
  const result = await createOrder(orderData);

  // Return success response
  return createdResponse(c, result);
}

// Get an order by ID
export async function getOrderHandler(c: Context) {
  const id = c.req.param("id");
  const authenticatedUser = c.get("user");

  // Get order
  const order = await getOrderById(id);

  // Ensure user can only view their own orders unless they're an admin
  if (
    authenticatedUser.role !== "admin" && order.user_id !== authenticatedUser.id
  ) {
    throw new ForbiddenError("You can only view your own orders");
  }

  // Return success response
  return successResponse(c, order);
}

// Update an order status
export async function updateOrderStatusHandler(c: Context) {
  const id = c.req.param("id");
  const data = await c.req.json();

  // Validate order data
  const orderData = validate(UpdateOrderSchema, data);

  // Update order status
  const result = await updateOrderStatus(id, orderData);

  // Return success response
  return successResponse(c, result);
}

// Cancel an order
export async function cancelOrderHandler(c: Context) {
  const id = c.req.param("id");
  const authenticatedUser = c.get("user");

  // Get order first to check permissions
  const order = await getOrderById(id);

  // Ensure user can only cancel their own orders unless they're an admin
  if (
    authenticatedUser.role !== "admin" && order.user_id !== authenticatedUser.id
  ) {
    throw new ForbiddenError("You can only cancel your own orders");
  }

  // Cancel order
  const result = await cancelOrder(id);

  // Return success response
  return successResponse(c, result);
}

// List orders with pagination and filtering
export async function listOrdersHandler(c: Context) {
  const authenticatedUser = c.get("user");

  // Get query parameters
  const limit = c.req.query("limit")
    ? parseInt(c.req.query("limit") || "10")
    : 10;
  const cursor = c.req.query("cursor");
  const storeId = c.req.query("store_id");
  const status = c.req.query("status");
  const orderType = c.req.query("order_type");

  // Default to user's own orders if not admin
  let userId = c.req.query("user_id");
  if (authenticatedUser.role !== "admin") {
    // Non-admins can only see their own orders
    userId = authenticatedUser.id;
  }

  // List orders
  const result = await listOrders({
    limit,
    cursor,
    userId,
    storeId,
    status,
    orderType,
  });

  // Return paginated response
  return paginatedResponse(c, result.items, {
    cursor: result.cursor,
    limit,
    hasMore: !!result.cursor,
  });
}
