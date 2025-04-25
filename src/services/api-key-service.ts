import { ApiKey, CreateApiKey, UpdateApiKey } from "../models/api-key.ts";
import { kv } from "../db/index.ts";
import config from "../config/index.ts";
import { NotFoundError } from "../utils/error.ts";

// Constants for KV store
const API_KEY_PREFIX = "api_key:";
const API_KEY_BY_NAME_PREFIX = "api_key_by_name:";
const API_KEY_BY_CLIENT_PREFIX = "api_key_by_client:";
const API_KEY_VALUE_PREFIX = "api_key_value:";

// Generate a random API key
export function generateApiKey(): string {
  const bytes = new Uint8Array(32); // 256 bits
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Create a new API key
export async function createApiKey(data: CreateApiKey): Promise<ApiKey> {
  // Generate a new API key
  const keyValue = generateApiKey();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const apiKey: ApiKey = {
    id,
    key: keyValue,
    name: data.name,
    client_id: data.client_id,
    created_at: now,
    updated_at: now,
    is_active: data.is_active ?? true,
    rate_limit: data.rate_limit ?? 1000,
    permissions: data.permissions ?? [],
    allowed_origins: data.allowed_origins ?? [],
    metadata: data.metadata,
  };

  // Save to KV store
  const tx = kv.atomic();
  tx.set([API_KEY_PREFIX, id], apiKey);
  tx.set([API_KEY_BY_NAME_PREFIX, data.name], id);
  tx.set([API_KEY_BY_CLIENT_PREFIX, data.client_id, id], id);
  tx.set([API_KEY_VALUE_PREFIX, keyValue], id);
  await tx.commit();

  return apiKey;
}

// Get API key by ID
export async function getApiKeyById(id: string): Promise<ApiKey | null> {
  const result = await kv.get<ApiKey>([API_KEY_PREFIX, id]);
  return result.value;
}

// Get API key by key value
export async function getApiKeyByKeyValue(
  keyValue: string,
): Promise<ApiKey | null> {
  const idResult = await kv.get<string>([API_KEY_VALUE_PREFIX, keyValue]);

  if (!idResult.value) {
    return null;
  }

  const result = await kv.get<ApiKey>([API_KEY_PREFIX, idResult.value]);
  return result.value;
}

// Update API key
export async function updateApiKey(
  id: string,
  data: UpdateApiKey,
): Promise<ApiKey> {
  const existingApiKey = await getApiKeyById(id);

  if (!existingApiKey) {
    throw new NotFoundError(`API key with ID ${id} not found`);
  }

  const updatedApiKey: ApiKey = {
    ...existingApiKey,
    name: data.name ?? existingApiKey.name,
    is_active: data.is_active ?? existingApiKey.is_active,
    rate_limit: data.rate_limit ?? existingApiKey.rate_limit,
    permissions: data.permissions ?? existingApiKey.permissions,
    allowed_origins: data.allowed_origins ?? existingApiKey.allowed_origins,
    metadata: data.metadata ?? existingApiKey.metadata,
    updated_at: new Date().toISOString(),
  };

  // If name has changed, update the name index
  const tx = kv.atomic();
  tx.set([API_KEY_PREFIX, id], updatedApiKey);

  if (data.name && data.name !== existingApiKey.name) {
    tx.delete([API_KEY_BY_NAME_PREFIX, existingApiKey.name]);
    tx.set([API_KEY_BY_NAME_PREFIX, data.name], id);
  }

  await tx.commit();

  return updatedApiKey;
}

// Delete API key
export async function deleteApiKey(id: string): Promise<boolean> {
  const apiKey = await getApiKeyById(id);

  if (!apiKey) {
    throw new NotFoundError(`API key with ID ${id} not found`);
  }

  const tx = kv.atomic();
  tx.delete([API_KEY_PREFIX, id]);
  tx.delete([API_KEY_BY_NAME_PREFIX, apiKey.name]);
  tx.delete([API_KEY_BY_CLIENT_PREFIX, apiKey.client_id, id]);
  tx.delete([API_KEY_VALUE_PREFIX, apiKey.key]);
  await tx.commit();

  return true;
}

// List API keys
export async function listApiKeys(clientId?: string): Promise<ApiKey[]> {
  if (clientId) {
    // List all keys for a specific client
    const entries = kv.list<string>({
      prefix: [API_KEY_BY_CLIENT_PREFIX, clientId],
    });
    const keys: ApiKey[] = [];

    for await (const entry of entries) {
      const apiKey = await getApiKeyById(entry.value);
      if (apiKey) {
        keys.push(apiKey);
      }
    }

    return keys;
  } else {
    // List all keys
    const entries = kv.list<ApiKey>({ prefix: [API_KEY_PREFIX] });
    const keys: ApiKey[] = [];

    for await (const entry of entries) {
      keys.push(entry.value);
    }

    return keys;
  }
}

// Update last used timestamp
export async function updateApiKeyUsage(id: string): Promise<void> {
  const apiKey = await getApiKeyById(id);

  if (!apiKey) {
    return;
  }

  apiKey.last_used_at = new Date().toISOString();
  await kv.set([API_KEY_PREFIX, id], apiKey);
}

// Initialize default API key from environment variables
export async function initializeDefaultApiKey(): Promise<void> {
  // Check if default key exists
  const defaultKey = config.apiKey.defaultKey;
  const defaultKeyName = "Default API Key";

  if (!defaultKey) {
    console.warn("No default API key defined in environment variables");
    return;
  }

  // Check if a key with this value already exists
  const existingKey = await getApiKeyByKeyValue(defaultKey);

  if (existingKey) {
    console.log("Default API key already exists");
    return;
  }

  // Create default key
  const defaultApiKey: CreateApiKey = {
    name: defaultKeyName,
    client_id: crypto.randomUUID(), // Generate a UUID for the default client
    is_active: true,
    rate_limit: 10000, // Higher rate limit for default key
    permissions: ["*"], // All permissions
    allowed_origins: ["*"], // All origins
    metadata: {
      isDefault: true,
      source: "environment",
    },
  };

  // Create default API key but override the randomly generated key with env value
  const apiKey = await createApiKey(defaultApiKey);

  // Update the key value to match the environment variable
  apiKey.key = defaultKey;

  // Save with the predefined key value
  const tx = kv.atomic();
  tx.set([API_KEY_PREFIX, apiKey.id], apiKey);
  tx.set([API_KEY_VALUE_PREFIX, defaultKey], apiKey.id);
  await tx.commit();

  console.log(`Default API key initialized: ${defaultKey}`);
}
