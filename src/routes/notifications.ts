import { Hono } from "hono";
import {
  createNotificationHandler,
  getNotificationPreferencesHandler,
  getUserNotificationsHandler,
  markNotificationAsReadHandler,
  updateNotificationPreferenceHandler,
} from "../controllers/notification-controller.ts";
import { authenticate, authorize } from "../middlewares/auth.ts";

// Create router
const router = new Hono();

// All routes require authentication
router.use("*", authenticate);

// Routes accessible to authenticated users
router.get("/", getUserNotificationsHandler);
router.put("/:id/read", markNotificationAsReadHandler);
router.get("/preferences", getNotificationPreferencesHandler);
router.put("/preferences", updateNotificationPreferenceHandler);

// Admin-only routes
router.post("/", authorize(["admin"]), createNotificationHandler);

export default router;
