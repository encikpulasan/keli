import { Context } from "hono";
import { z } from "npm:zod";
import {
  createApiKey,
  deleteApiKey,
  getApiKeyById,
  listApiKeys,
  updateApiKey,
} from "../services/api-key-service.ts";
import { CreateApiKeySchema, UpdateApiKeySchema } from "../models/api-key.ts";
import { validate } from "../utils/validation.ts";
import {
  createdResponse,
  noContentResponse,
  paginatedResponse,
  successResponse,
} from "../utils/response.ts";
import { ForbiddenError, NotFoundError } from "../utils/error.ts";

// Create a new API key
export async function createApiKeyHandler(c: Context) {
  const data = await c.req.json();
  const authenticatedUser = c.get("user");

  // Only admins can create API keys
  if (authenticatedUser.role !== "admin") {
    throw new ForbiddenError("Only admins can create API keys");
  }

  // Validate API key data
  const apiKeyData = validate(CreateApiKeySchema, data);

  // Create API key
  const result = await createApiKey(apiKeyData);

  // Return success response
  return createdResponse(c, result);
}

// Get an API key by ID
export async function getApiKeyHandler(c: Context) {
  const id = c.req.param("id");
  const authenticatedUser = c.get("user");

  // Only admins can view API keys
  if (authenticatedUser.role !== "admin") {
    throw new ForbiddenError("Only admins can view API keys");
  }

  // Get API key
  const apiKey = await getApiKeyById(id);

  if (!apiKey) {
    throw new NotFoundError(`API key with ID ${id} not found`);
  }

  // Return success response
  return successResponse(c, apiKey);
}

// Update an API key
export async function updateApiKeyHandler(c: Context) {
  const id = c.req.param("id");
  const data = await c.req.json();
  const authenticatedUser = c.get("user");

  // Only admins can update API keys
  if (authenticatedUser.role !== "admin") {
    throw new ForbiddenError("Only admins can update API keys");
  }

  // Validate API key data
  const apiKeyData = validate(UpdateApiKeySchema, data);

  // Update API key
  const result = await updateApiKey(id, apiKeyData);

  // Return success response
  return successResponse(c, result);
}

// Delete an API key
export async function deleteApiKeyHandler(c: Context) {
  const id = c.req.param("id");
  const authenticatedUser = c.get("user");

  // Only admins can delete API keys
  if (authenticatedUser.role !== "admin") {
    throw new ForbiddenError("Only admins can delete API keys");
  }

  // Delete API key
  await deleteApiKey(id);

  // Return no content response
  return noContentResponse(c);
}

// List API keys with optional client ID filtering
export async function listApiKeysHandler(c: Context) {
  const authenticatedUser = c.get("user");

  // Only admins can list API keys
  if (authenticatedUser.role !== "admin") {
    throw new ForbiddenError("Only admins can list API keys");
  }

  // Get query parameters
  const clientId = c.req.query("client_id");

  // List API keys
  const result = await listApiKeys(clientId);

  // Return success response
  return successResponse(c, result);
}
