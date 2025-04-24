import { Hono } from "npm:hono";
import { authenticate } from "../middlewares/auth.ts";

// Create a router
const router = new Hono();

// Protect all routes
router.use("*", authenticate);

// Simple POST endpoint for order creation tests
router.post("/", async (c) => {
  try {
    const data = await c.req.json();
    const user = c.get("user");

    // Create a mock order response
    return c.json({
      success: true,
      data: {
        id: crypto.randomUUID(),
        user_id: user?.id || crypto.randomUUID(),
        store_id: data.storeId || "store123",
        order_status: "pending",
        order_type: data.orderType || "pickup",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subtotal: 10.99,
        tax: 0.88,
        total: 11.87,
        payment_method: data.paymentMethod || "credit_card",
        payment_status: "pending",
        special_instructions: data.specialInstructions || "",
        items: data.items?.map((item: any) => ({
          id: crypto.randomUUID(),
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: 5.49,
          subtotal: 5.49 * item.quantity,
        })) || [],
      },
    }, 201);
  } catch (error) {
    console.error("Test order creation error:", error);
    return c.json({
      success: false,
      error: error instanceof Error
        ? error.message
        : "Failed to create test order",
    }, 500);
  }
});

export default router;
