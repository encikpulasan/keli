import { z } from "npm:zod";

// Define the API Key schema
export const ApiKeySchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(32).max(64),
  name: z.string().min(1).max(100),
  client_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_used_at: z.string().datetime().optional(),
  is_active: z.boolean().default(true),
  rate_limit: z.number().int().min(1).default(1000),
  permissions: z.array(z.string()).default([]),
  allowed_origins: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

// Define the Create API Key schema
export const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  client_id: z.string().uuid(),
  is_active: z.boolean().default(true).optional(),
  rate_limit: z.number().int().min(1).default(1000).optional(),
  permissions: z.array(z.string()).default([]).optional(),
  allowed_origins: z.array(z.string()).default([]).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Define the Update API Key schema
export const UpdateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
  rate_limit: z.number().int().min(1).optional(),
  permissions: z.array(z.string()).optional(),
  allowed_origins: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Define the API Key types
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type CreateApiKey = z.infer<typeof CreateApiKeySchema>;
export type UpdateApiKey = z.infer<typeof UpdateApiKeySchema>;
