import { Hono } from "hono";
import {
  completePaymentHandler,
  createPaymentHandler,
  getPaymentHandler,
  getPaymentsByOrderIdHandler,
  listUserPaymentsHandler,
  paymentWebhookHandler,
  processPaymentHandler,
  refundPaymentHandler,
} from "../controllers/payment-controller.ts";
import { authenticate, authorize } from "../middlewares/auth.ts";

// Create router
const router = new Hono();

// Webhook endpoint - no authentication required
router.post("/webhook", paymentWebhookHandler);

// Protected routes for all authenticated users
router.use("*", authenticate);

// Routes accessible to authenticated users
router.post("/", createPaymentHandler);
router.get("/:id", getPaymentHandler);
router.get("/order/:orderId", getPaymentsByOrderIdHandler);
router.get("/user", listUserPaymentsHandler);

// Admin-only routes
router.put(
  "/:id/complete",
  authenticate,
  authorize(["admin"]),
  completePaymentHandler,
);
router.post(
  "/:id/refund",
  authenticate,
  authorize(["admin"]),
  refundPaymentHandler,
);

// New route for processing payment
router.post("/process", processPaymentHandler);

export default router;
