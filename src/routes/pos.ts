import { Hono } from "hono";
import { processInStorePaymentHandler } from "../controllers/payment-controller.ts";
import { authenticate } from "../middlewares/auth.ts";
import {
  addPointsHandler,
  getUserPointsHandler,
  redeemPointsHandler,
} from "../controllers/loyalty-controller.ts";
import { generateToken } from "../utils/auth.ts";

// Main router for POS operations
const router = new Hono();

// Create auth router (no authentication required)
const authRouter = new Hono();

// Auth routes
authRouter.post("/login", async (c) => {
  try {
    // In a real implementation, we would validate credentials here
    // For now, just create a mock POS user and token
    const user = {
      id: crypto.randomUUID(),
      email: "pos@sofehaus.com",
      name: "POS Terminal",
      role: "pos",
      store_id: "store-123",
    };

    // Generate a proper JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await generateToken(payload);

    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          store_id: user.store_id,
        },
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Authentication failed",
    }, 401);
  }
});

// Protected routes that require authentication
const protectedRouter = new Hono();
protectedRouter.use("*", authenticate);

// Payment routes
protectedRouter.post("/payments/process", async (c) => {
  const data = await c.req.json();

  // In a real implementation, we would process the payment here
  // For now, just return a success response
  return c.json({
    success: true,
    data: {
      transaction_id: crypto.randomUUID(),
      order_id: data.orderId,
      amount: data.amount,
      status: "completed",
      payment_method: data.paymentMethod,
      timestamp: new Date().toISOString(),
    },
  });
});

// Orders routes
protectedRouter.get("/orders/queue", async (c) => {
  // In a real implementation, we would fetch the order queue from the database
  // For now, just return a mock order
  return c.json({
    success: true,
    data: {
      orders: [
        {
          id: "order-123",
          status: "preparing",
          customer_name: "John Doe",
          items: [
            { name: "Coffee", quantity: 2 },
            { name: "Croissant", quantity: 1 },
          ],
          created_at: new Date().toISOString(),
        },
      ],
    },
  });
});

// Add order pickup endpoint
protectedRouter.post("/orders/pickup", async (c) => {
  const data = await c.req.json();

  if (!data.orderId) {
    return c.json({
      success: false,
      message: "Order ID is required",
    }, 400);
  }

  // In a real implementation, you would:
  // 1. Verify the order exists
  // 2. Check if the user has permission to mark this order as picked up
  // 3. Update the order status in the database

  return c.json({
    success: true,
    data: {
      id: data.orderId,
      status: "completed",
      pickedUpAt: new Date().toISOString(),
      message: "Order has been marked as picked up",
    },
  });
});

// Add a new endpoint for creating orders that matches the validation schema
protectedRouter.post("/orders", async (c) => {
  const data = await c.req.json();
  const user = c.get("user");

  // Prepare the order data according to the schema requirements
  const orderData = {
    user_id: user.id, // Use the authenticated user's ID
    store_id: data.storeId || "store-123", // Use store ID from request or default value
    order_type: data.orderType || "pickup", // Default to pickup if not specified
    payment_method: data.paymentMethod || "credit_card", // Default to credit card if not specified
    special_instructions: data.specialInstructions,
    items: data.items.map((item: any) => ({
      product_id: item.productId,
      quantity: item.quantity,
      customizations: item.customizations
        ? Object.fromEntries(
          // Convert array of customizations to object if needed
          Array.isArray(item.customizations)
            ? item.customizations.map((c: any) => [c.name, c.value || true])
            : Object.entries(item.customizations),
        )
        : {},
      notes: item.notes,
    })),
  };

  // In a real implementation, we would create the order in the database
  // For now, just return a success response
  return c.json({
    success: true,
    data: {
      id: crypto.randomUUID(),
      ...orderData,
      order_status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  }, 201);
});

// Promotion routes
protectedRouter.post("/promotions/apply", async (c) => {
  const data = await c.req.json();

  // In a real implementation, we would apply the promotion to the order
  // For now, just return a success response
  return c.json({
    success: true,
    data: {
      order_id: data.orderId,
      promotion: {
        code: data.promotionCode,
        name: "Summer Discount",
        discount_type: "percentage",
        discount_value: 20,
      },
      original_total: 25.99,
      discount_amount: 5.20,
      new_total: 20.79,
    },
  });
});

// Add endpoint for kitchen staff to mark orders as ready
protectedRouter.post("/kitchen/order-ready", async (c) => {
  const data = await c.req.json();

  if (!data.orderId) {
    return c.json({
      success: false,
      message: "Order ID is required",
    }, 400);
  }

  // In a real implementation, you would:
  // 1. Verify the order exists
  // 2. Check if the user has kitchen staff permissions
  // 3. Update the order status in the database

  return c.json({
    success: true,
    data: {
      id: data.orderId,
      status: "ready",
      readyAt: new Date().toISOString(),
      preparedBy: c.get("user").id,
      estimatedPickupTime: 15, // minutes
      message: "Order has been marked as ready for pickup",
    },
  });
});

// Mount auth router
router.route("/auth", authRouter);

// Mount all protected routes
router.route("", protectedRouter);

export default router;
