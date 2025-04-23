import { CreateOrder, Order, OrderItem, UpdateOrder } from "../models/order.ts";
import { atomic, create, list, read, remove, update } from "../db/index.ts";
import { getProductById } from "./product-service.ts";
import { getStoreById } from "./store-service.ts";
import { getUserById } from "./user-service.ts";
import { BadRequestError, NotFoundError } from "../utils/error.ts";
import {
  checkProductAvailability,
  updateInventoryFromOrder,
} from "./inventory-service.ts";
import { addPoints } from "./loyalty-service.ts";

const COLLECTION = "orders";
const ITEMS_COLLECTION = "order_items";

// Create a new order
export async function createOrder(orderData: CreateOrder): Promise<Order> {
  // Verify user and store exist
  await getUserById(orderData.user_id);
  await getStoreById(orderData.store_id);

  // Verify products exist and calculate prices
  const now = new Date().toISOString();
  const orderId = crypto.randomUUID();
  let subtotal = 0;

  // Process each item
  const orderItems: OrderItem[] = [];
  for (const item of orderData.items) {
    const product = await getProductById(item.product_id);

    if (!product) {
      throw new NotFoundError(`Product with ID ${item.product_id} not found`);
    }

    if (!product.is_active) {
      throw new BadRequestError(`Product ${product.name} is not available`);
    }

    // Check inventory availability
    const isAvailable = await checkProductAvailability(
      orderData.store_id,
      item.product_id,
      item.quantity,
    );

    if (!isAvailable) {
      throw new BadRequestError(
        `Product ${product.name} is out of stock or insufficient quantity`,
      );
    }

    const itemId = crypto.randomUUID();
    const unitPrice = product.base_price;
    const itemSubtotal = unitPrice * item.quantity;

    // Create order item
    const orderItem: OrderItem = {
      id: itemId,
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: unitPrice,
      subtotal: itemSubtotal,
      customizations: item.customizations,
      notes: item.notes,
    };

    orderItems.push(orderItem);
    subtotal += itemSubtotal;
  }

  // Calculate tax (assuming 8% tax rate)
  const taxRate = 0.08;
  const tax = subtotal * taxRate;

  // Calculate total
  const total = subtotal + tax;

  // Create order object
  const order: Order = {
    id: orderId,
    user_id: orderData.user_id,
    store_id: orderData.store_id,
    order_status: "pending",
    order_type: orderData.order_type,
    created_at: now,
    updated_at: now,
    subtotal,
    tax,
    discount: 0,
    total,
    payment_method: orderData.payment_method,
    payment_status: "pending",
    special_instructions: orderData.special_instructions,
    items: orderItems,
  };

  // Save order
  await create<Order>(COLLECTION, orderId, order);

  // Save order items
  for (const item of orderItems) {
    await create<OrderItem>(ITEMS_COLLECTION, item.id, item);
  }

  // If order is placed successfully, update inventory
  await updateInventoryFromOrder(
    orderId,
    orderData.store_id,
    orderItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    })),
  );

  return order;
}

// Get order by ID
export async function getOrderById(id: string): Promise<Order | null> {
  return await read<Order>(COLLECTION, id);
}

// List order items for an order
async function listOrderItems(
  orderId: string,
): Promise<{ items: OrderItem[] }> {
  const result = await list<OrderItem>(ITEMS_COLLECTION);

  const orderItems = result.items.filter((item) => item.order_id === orderId);

  return { items: orderItems };
}

// Update order status
export async function updateOrderStatus(
  id: string,
  status: Order["order_status"],
): Promise<Order> {
  const updatedOrder = await updateOrder(id, { order_status: status });

  // Send notification to user about order status update
  try {
    // Import the notification service on demand to avoid circular dependencies
    const { createNotification } = await import("./notification-service.ts");

    let title = "";
    let message = "";

    // Customize notification based on status
    switch (status) {
      case "pending":
        title = "Order Received";
        message = `Your order #${
          id.substring(0, 8)
        } has been received and is pending.`;
        break;
      case "preparing":
        title = "Order Being Prepared";
        message = `Your order #${id.substring(0, 8)} is now being prepared.`;
        break;
      case "ready":
        title = "Order Ready";
        message = `Your order #${id.substring(0, 8)} is ready for pickup.`;
        break;
      case "completed":
        title = "Order Completed";
        message = `Your order #${
          id.substring(0, 8)
        } has been completed. Thank you!`;
        break;
      case "cancelled":
        title = "Order Cancelled";
        message = `Your order #${id.substring(0, 8)} has been cancelled.`;
        break;
      default:
        title = "Order Update";
        message = `Your order #${
          id.substring(0, 8)
        } status has been updated to ${status}.`;
    }

    // Create notification
    await createNotification({
      user_id: updatedOrder.user_id,
      type: "order_status",
      title,
      message,
      channels: ["push", "email", "in_app"],
      data: {
        order_id: id,
        status: status,
      },
      action_url: `/orders/${id}`,
    });
  } catch (error) {
    // Log error but don't fail the order status update
    console.error(`Failed to send notification for order ${id}:`, error);
  }

  return updatedOrder;
}

// Award loyalty points for completed order
async function awardLoyaltyPoints(order: Order): Promise<void> {
  // Only award points for completed orders
  if (order.order_status !== "completed") {
    return;
  }

  // Only award points for orders with completed payment
  if (order.payment_status !== "completed") {
    return;
  }

  // Calculate points - typically 1 point per currency unit spent
  // Round down to nearest integer
  const pointsToAward = Math.floor(order.total);

  // Skip if no points to award
  if (pointsToAward <= 0) {
    return;
  }

  try {
    // Award points
    await addPoints(order.user_id, {
      user_id: order.user_id,
      points: pointsToAward,
      type: "earn",
      description: `Points for order #${order.id}`,
      reference_id: order.id,
    });
  } catch (error) {
    // Log error but don't fail the order completion
    console.error(
      `Failed to award loyalty points for order ${order.id}:`,
      error,
    );
  }
}

// Cancel an order
export async function cancelOrder(id: string): Promise<Order> {
  return await atomic<Order>(COLLECTION, id, (order) => {
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Cannot cancel completed orders
    if (order.order_status === "completed") {
      throw new BadRequestError("Cannot cancel a completed order");
    }

    // Already cancelled
    if (order.order_status === "cancelled") {
      return order;
    }

    return {
      ...order,
      order_status: "cancelled",
      updated_at: new Date().toISOString(),
    };
  });
}

// List orders with pagination and filtering
export async function listOrders(options: {
  limit?: number;
  cursor?: string;
  userId?: string;
  storeId?: string;
  status?: string;
  orderType?: string;
}): Promise<{ items: Order[]; cursor: string | null }> {
  const { limit, cursor } = options;

  // Get all orders
  const result = await list<Order>(COLLECTION, { limit, cursor });

  // Apply filters
  let filteredItems = result.items;

  // Filter by user
  if (options.userId) {
    filteredItems = filteredItems.filter(
      (order) => order.user_id === options.userId,
    );
  }

  // Filter by store
  if (options.storeId) {
    filteredItems = filteredItems.filter(
      (order) => order.store_id === options.storeId,
    );
  }

  // Filter by status
  if (options.status) {
    filteredItems = filteredItems.filter(
      (order) => order.order_status === options.status,
    );
  }

  // Filter by order type
  if (options.orderType) {
    filteredItems = filteredItems.filter(
      (order) => order.order_type === options.orderType,
    );
  }

  // Get order items for each order
  for (const order of filteredItems) {
    if (!order.items) {
      const { items } = await listOrderItems(order.id);
      order.items = items;
    }
  }

  return {
    items: filteredItems,
    cursor: result.cursor,
  };
}

// Get orders by user ID
export async function getOrdersByUserId(
  userId: string,
  options: {
    limit?: number;
    cursor?: string;
    status?: string;
  } = {},
): Promise<{ items: Order[]; cursor: string | null }> {
  const { limit, cursor } = options;

  // Get all orders
  const result = await list<Order>(COLLECTION, { limit, cursor });

  // Filter by user ID and status if provided
  let filteredOrders = result.items.filter((order) => order.user_id === userId);

  if (options.status) {
    filteredOrders = filteredOrders.filter(
      (order) => order.order_status === options.status,
    );
  }

  // Sort by created_at in descending order (newest first)
  filteredOrders.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Get order items for each order
  const { items: allOrderItems } = await list<OrderItem>(ITEMS_COLLECTION);

  // Add items to each order
  const ordersWithItems = await Promise.all(
    filteredOrders.map(async (order) => {
      const orderItems = allOrderItems.filter(
        (item) => item.order_id === order.id,
      );

      return {
        ...order,
        items: orderItems,
      };
    }),
  );

  return {
    items: ordersWithItems,
    cursor: result.cursor,
  };
}

// Get orders by store ID
export async function getOrdersByStoreId(
  storeId: string,
  options: {
    limit?: number;
    cursor?: string;
    status?: string;
  } = {},
): Promise<{ items: Order[]; cursor: string | null }> {
  const { limit, cursor } = options;

  // Get all orders
  const result = await list<Order>(COLLECTION, { limit, cursor });

  // Filter by store ID and status if provided
  let filteredOrders = result.items.filter((order) =>
    order.store_id === storeId
  );

  if (options.status) {
    filteredOrders = filteredOrders.filter(
      (order) => order.order_status === options.status,
    );
  }

  // Sort by created_at in descending order (newest first)
  filteredOrders.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Get order items for each order
  const { items: allOrderItems } = await list<OrderItem>(ITEMS_COLLECTION);

  // Add items to each order
  const ordersWithItems = await Promise.all(
    filteredOrders.map(async (order) => {
      const orderItems = allOrderItems.filter(
        (item) => item.order_id === order.id,
      );

      return {
        ...order,
        items: orderItems,
      };
    }),
  );

  return {
    items: ordersWithItems,
    cursor: result.cursor,
  };
}

// Update payment status
export async function updatePaymentStatus(
  id: string,
  status: Order["payment_status"],
): Promise<Order> {
  return updateOrder(id, { payment_status: status });
}

// Update order
export async function updateOrder(
  id: string,
  orderData: Partial<Order>,
): Promise<Order> {
  return await atomic<Order>(COLLECTION, id, (order) => {
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Cannot update completed or cancelled orders
    if (
      order.order_status === "completed" || order.order_status === "cancelled"
    ) {
      throw new BadRequestError(`Cannot update a ${order.order_status} order`);
    }

    const updatedOrder: Order = {
      ...order,
      ...orderData,
      updated_at: new Date().toISOString(),
    };

    // If order is marked as completed, set completion time
    if (
      orderData.order_status === "completed" && !updatedOrder.completion_time
    ) {
      updatedOrder.completion_time = new Date().toISOString();

      // Award loyalty points when order is completed
      // We'll do this asynchronously so it doesn't block the order update
      setTimeout(() => {
        awardLoyaltyPoints(updatedOrder).catch(console.error);
      }, 0);
    }

    return updatedOrder;
  });
}
