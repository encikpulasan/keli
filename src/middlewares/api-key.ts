import { Context, Next } from "hono";
import {
  getApiKeyByKeyValue,
  updateApiKeyUsage,
} from "../services/api-key-service.ts";
import config from "../config/index.ts";
import { UnauthorizedError } from "../utils/error.ts";

// API Key middleware
export async function validateApiKey(c: Context, next: Next) {
  try {
    // Skip API key validation if not required
    if (!config.apiKey.requireApiKey) {
      console.log("API key validation skipped - not required");
      await next();
      return;
    }

    // Get API key from header
    const apiKey = c.req.header(config.apiKey.headerName);
    console.log(`API Key header: ${apiKey ? apiKey : "not provided"}`);

    // If API key is not provided, check if we have a default key
    if (!apiKey) {
      // If there's a default key from environment, allow request
      if (config.apiKey.defaultKey) {
        // Add a flag to the context to indicate that the default key was used
        c.set("usedDefaultApiKey", true);
        console.log(
          `Using default API key: ${
            config.apiKey.defaultKey.substring(0, 5)
          }...`,
        );
        await next();
        return;
      }

      console.log("API key required but not provided");
      throw new UnauthorizedError("API key is required");
    }

    // Validate API key
    console.log(`Validating API key: ${apiKey.substring(0, 5)}...`);
    const apiKeyEntity = await getApiKeyByKeyValue(apiKey);

    if (!apiKeyEntity) {
      console.log("API key not found in database");
      // If it matches the default API key, allow the request
      if (apiKey === config.apiKey.defaultKey) {
        console.log("API key matches default key, allowing request");
        c.set("usedDefaultApiKey", true);
        await next();
        return;
      }

      console.log("Invalid API key");
      throw new UnauthorizedError("Invalid API key");
    }

    console.log(`API key found in database (ID: ${apiKeyEntity.id})`);
    if (!apiKeyEntity.is_active) {
      console.log("API key is inactive");
      throw new UnauthorizedError("API key is inactive");
    }

    // Check origin if allowed origins are specified
    if (
      apiKeyEntity.allowed_origins && apiKeyEntity.allowed_origins.length > 0 &&
      !apiKeyEntity.allowed_origins.includes("*")
    ) {
      const origin = c.req.header("Origin");
      console.log(`Origin check: ${origin}`);
      if (origin && !apiKeyEntity.allowed_origins.includes(origin)) {
        console.log("API key not authorized for this origin");
        throw new UnauthorizedError("API key not authorized for this origin");
      }
    }

    // Store API key info in context
    c.set("apiKey", apiKeyEntity);
    c.set("clientId", apiKeyEntity.client_id);

    // Update last used timestamp if tracking is enabled
    if (config.apiKey.trackUsage) {
      // Don't await this to avoid slowing down requests
      updateApiKeyUsage(apiKeyEntity.id).catch((err) => {
        console.error("Failed to update API key usage:", err);
      });
    }

    console.log("API key validation successful");
    await next();
  } catch (error) {
    console.error("Error in API key validation:", error);
    throw error;
  }
}

// Return client usage information
export function apiKeyInfo() {
  return async (c: Context, next: Next) => {
    await next();

    // Add client ID header to the response if available
    const clientId = c.get("clientId");
    if (clientId) {
      c.header("X-Client-ID", clientId);
    }

    const usedDefaultApiKey = c.get("usedDefaultApiKey");
    if (usedDefaultApiKey) {
      c.header("X-Used-Default-Key", "true");
    }
  };
}
