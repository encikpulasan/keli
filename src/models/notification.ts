import { z } from "npm:zod";

// Notification types
export type NotificationType =
  | "order_status"
  | "payment_status"
  | "loyalty_points"
  | "promotion"
  | "account"
  | "system";

// Notification channels
export type NotificationChannel =
  | "push"
  | "email"
  | "sms"
  | "in_app";

// Notification model
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  is_read: boolean;
  created_at: string;
  read_at?: string;
  data?: Record<string, unknown>; // Additional data for rich notifications
  image_url?: string; // Optional image for rich notifications
  action_url?: string; // Optional deep link action
}

// Notification preference model
export interface NotificationPreference {
  id: string;
  user_id: string;
  type: NotificationType;
  channels: NotificationChannel[];
  enabled: boolean;
  updated_at: string;
}

// Create notification schema
export const CreateNotificationSchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum([
    "order_status",
    "payment_status",
    "loyalty_points",
    "promotion",
    "account",
    "system",
  ]),
  title: z.string(),
  message: z.string(),
  channels: z.array(z.enum(["push", "email", "sms", "in_app"])),
  data: z.record(z.unknown()).optional(),
  image_url: z.string().url().optional(),
  action_url: z.string().optional(),
});

export type CreateNotification = z.infer<typeof CreateNotificationSchema>;

// Update preference schema
export const UpdatePreferenceSchema = z.object({
  type: z.enum([
    "order_status",
    "payment_status",
    "loyalty_points",
    "promotion",
    "account",
    "system",
  ]),
  channels: z.array(z.enum(["push", "email", "sms", "in_app"])),
  enabled: z.boolean(),
});

export type UpdatePreference = z.infer<typeof UpdatePreferenceSchema>;
