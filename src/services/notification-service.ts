import { create, list, read, update } from "../db/index.ts";
import {
  CreateNotification,
  Notification,
  NotificationChannel,
  NotificationPreference,
  NotificationType,
  UpdatePreference,
} from "../models/notification.ts";
import { BadRequestError, NotFoundError } from "../utils/error.ts";
import { getUserById } from "./user-service.ts";

const COLLECTION = "notifications";
const PREFERENCE_COLLECTION = "notification_preferences";

// Create a notification
export async function createNotification(
  data: CreateNotification,
): Promise<Notification> {
  // Verify user exists
  await getUserById(data.user_id);

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  // Check user preferences for this notification type
  const preferences = await getUserNotificationPreferences(data.user_id);
  const typePreference = preferences.find((pref) => pref.type === data.type);

  // If user has disabled this notification type, log but don't send
  if (typePreference && !typePreference.enabled) {
    console.log(
      `Notification of type ${data.type} is disabled for user ${data.user_id}`,
    );
    // Still create the notification record but mark it as read
    const notification: Notification = {
      id,
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      channels: [], // Empty channels since user opted out
      is_read: true, // Mark as read since user opted out
      created_at: now,
      read_at: now, // Mark as already read
      data: data.data,
      image_url: data.image_url,
      action_url: data.action_url,
    };

    await create<Notification>(COLLECTION, id, notification);
    return notification;
  }

  // Apply channel preferences if preference exists
  let channels = data.channels;
  if (typePreference) {
    channels = data.channels.filter((channel) =>
      typePreference.channels.includes(channel)
    );
  }

  const notification: Notification = {
    id,
    user_id: data.user_id,
    type: data.type,
    title: data.title,
    message: data.message,
    channels,
    is_read: false,
    created_at: now,
    data: data.data,
    image_url: data.image_url,
    action_url: data.action_url,
  };

  await create<Notification>(COLLECTION, id, notification);

  // In a real implementation, we would send notifications through the selected channels here
  // For demonstration purposes, we'll just log the notification
  console.log(
    `Sending notification to user ${data.user_id} via channels: ${
      channels.join(", ")
    }`,
  );

  return notification;
}

// Get notification by ID
export async function getNotificationById(
  id: string,
): Promise<Notification | null> {
  return await read<Notification>(COLLECTION, id);
}

// Mark notification as read
export async function markNotificationAsRead(
  id: string,
): Promise<Notification> {
  const notification = await getNotificationById(id);

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  // Already read
  if (notification.is_read) {
    return notification;
  }

  const updatedNotification: Notification = {
    ...notification,
    is_read: true,
    read_at: new Date().toISOString(),
  };

  await update<Notification>(COLLECTION, id, updatedNotification);

  return updatedNotification;
}

// Get user notifications
export async function getUserNotifications(
  userId: string,
  options: {
    limit?: number;
    cursor?: string;
    unreadOnly?: boolean;
    type?: NotificationType;
  } = {},
): Promise<{ items: Notification[]; cursor: string | null }> {
  const { limit, cursor, unreadOnly, type } = options;

  const result = await list<Notification>(COLLECTION, { limit, cursor });

  // Filter notifications
  let filteredNotifications = result.items.filter(
    (notification) => notification.user_id === userId,
  );

  // Filter by unread
  if (unreadOnly) {
    filteredNotifications = filteredNotifications.filter(
      (notification) => !notification.is_read,
    );
  }

  // Filter by type
  if (type) {
    filteredNotifications = filteredNotifications.filter(
      (notification) => notification.type === type,
    );
  }

  // Sort by created_at in descending order (newest first)
  filteredNotifications.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return {
    items: filteredNotifications,
    cursor: result.cursor,
  };
}

// Get user notification preferences
export async function getUserNotificationPreferences(
  userId: string,
): Promise<NotificationPreference[]> {
  const result = await list<NotificationPreference>(PREFERENCE_COLLECTION);

  return result.items.filter((preference) => preference.user_id === userId);
}

// Create default notification preferences for a user
export async function createDefaultNotificationPreferences(
  userId: string,
): Promise<NotificationPreference[]> {
  // Verify user exists
  await getUserById(userId);

  const now = new Date().toISOString();
  const defaultTypes: NotificationType[] = [
    "order_status",
    "payment_status",
    "loyalty_points",
    "promotion",
    "account",
    "system",
  ];

  const preferences: NotificationPreference[] = [];

  // Create a preference for each notification type
  for (const type of defaultTypes) {
    const id = crypto.randomUUID();

    const preference: NotificationPreference = {
      id,
      user_id: userId,
      type,
      channels: ["push", "email", "in_app"], // Default channels (no SMS by default)
      enabled: true,
      updated_at: now,
    };

    await create<NotificationPreference>(PREFERENCE_COLLECTION, id, preference);
    preferences.push(preference);
  }

  return preferences;
}

// Update notification preference
export async function updateNotificationPreference(
  userId: string,
  data: UpdatePreference,
): Promise<NotificationPreference> {
  // Get existing preference
  const preferences = await getUserNotificationPreferences(userId);
  const existingPreference = preferences.find((pref) =>
    pref.type === data.type
  );

  if (!existingPreference) {
    // Create new preference if it doesn't exist
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const preference: NotificationPreference = {
      id,
      user_id: userId,
      type: data.type,
      channels: data.channels,
      enabled: data.enabled,
      updated_at: now,
    };

    await create<NotificationPreference>(PREFERENCE_COLLECTION, id, preference);
    return preference;
  }

  // Update existing preference
  const updatedPreference: NotificationPreference = {
    ...existingPreference,
    channels: data.channels,
    enabled: data.enabled,
    updated_at: new Date().toISOString(),
  };

  await update<NotificationPreference>(
    PREFERENCE_COLLECTION,
    existingPreference.id,
    updatedPreference,
  );

  return updatedPreference;
}
