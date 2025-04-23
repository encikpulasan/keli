import { Context } from "hono";
import {
  createDefaultNotificationPreferences,
  createNotification,
  getUserNotificationPreferences,
  getUserNotifications,
  markNotificationAsRead,
  updateNotificationPreference,
} from "../services/notification-service.ts";
import {
  CreateNotificationSchema,
  UpdatePreferenceSchema,
} from "../models/notification.ts";
import { validate } from "../utils/validation.ts";
import {
  createdResponse,
  paginatedResponse,
  successResponse,
} from "../utils/response.ts";
import { ForbiddenError, NotFoundError } from "../utils/error.ts";

// Get user notifications
export async function getUserNotificationsHandler(c: Context) {
  const authenticatedUser = c.get("user");
  const userId = c.req.query("user_id") || authenticatedUser.id;

  // Non-admins can only view their own notifications
  if (authenticatedUser.role !== "admin" && userId !== authenticatedUser.id) {
    throw new ForbiddenError("You can only view your own notifications");
  }

  // Get query parameters
  const limit = c.req.query("limit")
    ? parseInt(c.req.query("limit") || "10")
    : 10;
  const cursor = c.req.query("cursor");
  const unreadOnly = c.req.query("unread") === "true";
  const type = c.req.query("type") as any;

  // Get notifications
  const result = await getUserNotifications(userId, {
    limit,
    cursor,
    unreadOnly,
    type,
  });

  // Return paginated response
  return paginatedResponse(c, result.items, {
    cursor: result.cursor,
    limit,
    hasMore: !!result.cursor,
  });
}

// Mark notification as read
export async function markNotificationAsReadHandler(c: Context) {
  const id = c.req.param("id");
  const authenticatedUser = c.get("user");

  // Get notification
  const notification = await markNotificationAsRead(id);

  // Ensure user can only mark their own notifications
  if (
    authenticatedUser.role !== "admin" &&
    notification.user_id !== authenticatedUser.id
  ) {
    throw new ForbiddenError(
      "You can only mark your own notifications as read",
    );
  }

  // Return success response
  return successResponse(c, notification);
}

// Create a notification (admin only)
export async function createNotificationHandler(c: Context) {
  const data = await c.req.json();

  // Validate notification data
  const notificationData = validate(CreateNotificationSchema, data);

  // Create notification
  const result = await createNotification(notificationData);

  // Return success response
  return createdResponse(c, result);
}

// Get user notification preferences
export async function getNotificationPreferencesHandler(c: Context) {
  const authenticatedUser = c.get("user");
  const userId = c.req.query("user_id") || authenticatedUser.id;

  // Non-admins can only view their own preferences
  if (authenticatedUser.role !== "admin" && userId !== authenticatedUser.id) {
    throw new ForbiddenError(
      "You can only view your own notification preferences",
    );
  }

  // Get preferences
  const preferences = await getUserNotificationPreferences(userId);

  // If no preferences exist, create defaults
  if (preferences.length === 0) {
    const defaultPreferences = await createDefaultNotificationPreferences(
      userId,
    );
    return successResponse(c, defaultPreferences);
  }

  // Return success response
  return successResponse(c, preferences);
}

// Update notification preference
export async function updateNotificationPreferenceHandler(c: Context) {
  const data = await c.req.json();
  const authenticatedUser = c.get("user");
  const userId = c.req.query("user_id") || authenticatedUser.id;

  // Non-admins can only update their own preferences
  if (authenticatedUser.role !== "admin" && userId !== authenticatedUser.id) {
    throw new ForbiddenError(
      "You can only update your own notification preferences",
    );
  }

  // Validate preference data
  const preferenceData = validate(UpdatePreferenceSchema, data);

  // Update preference
  const result = await updateNotificationPreference(userId, preferenceData);

  // Return success response
  return successResponse(c, result);
}
