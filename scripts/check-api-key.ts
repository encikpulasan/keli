/**
 * Script to check if the API key exists in the database
 * and create it if it doesn't exist
 */

import { kv } from "../src/db/index.ts";

// Constants from api-key-service.ts
const API_KEY_PREFIX = "api_key:";
const API_KEY_BY_NAME_PREFIX = "api_key_by_name:";
const API_KEY_BY_CLIENT_PREFIX = "api_key_by_client:";
const API_KEY_VALUE_PREFIX = "api_key_value:";

// API key to check
const apiKey = Deno.env.get("API_KEY") ||
  "keliapi-default-development-key-2023";
const defaultKeyName = "Default API Key";

console.log(`Checking for API key in database: ${apiKey}`);

// Check if the API key exists
const idResult = await kv.get<string>([API_KEY_VALUE_PREFIX, apiKey]);
if (!idResult.value) {
  console.log("❌ API key not found in database");
  console.log("Creating API key...");

  // Create the API key
  const id = crypto.randomUUID();
  const clientId = crypto.randomUUID();
  const now = new Date().toISOString();

  const apiKeyEntity = {
    id,
    key: apiKey,
    name: defaultKeyName,
    client_id: clientId,
    created_at: now,
    updated_at: now,
    is_active: true,
    rate_limit: 10000,
    permissions: ["*"],
    allowed_origins: ["*"],
    metadata: {
      isDefault: true,
      source: "environment",
    },
  };

  // Save to KV store
  const tx = kv.atomic();
  tx.set([API_KEY_PREFIX, id], apiKeyEntity);
  tx.set([API_KEY_BY_NAME_PREFIX, defaultKeyName], id);
  tx.set([API_KEY_BY_CLIENT_PREFIX, clientId, id], id);
  tx.set([API_KEY_VALUE_PREFIX, apiKey], id);
  const result = await tx.commit();

  if (result.ok) {
    console.log("✅ API key created successfully");
  } else {
    console.log("❌ Failed to create API key:", result);
  }
} else {
  console.log(`✅ API key found with ID: ${idResult.value}`);

  // Get the full API key details
  const apiKeyResult = await kv.get([API_KEY_PREFIX, idResult.value]);
  if (!apiKeyResult.value) {
    console.log("❌ API key details not found");
  } else {
    console.log("✅ API key details:");
    console.log(JSON.stringify(apiKeyResult.value, null, 2));
  }
}

// List all API keys in the database for debugging
console.log("\nListing all API keys in the database:");
const entries = kv.list({ prefix: [API_KEY_PREFIX] });
let count = 0;
for await (const entry of entries) {
  console.log(
    `Key ${++count}:`,
    entry.key,
    "Value:",
    JSON.stringify(entry.value),
  );
}
if (count === 0) {
  console.log("No API keys found in the database");
}

// List all API key values in the database
console.log("\nListing all API key values in the database:");
const valueEntries = kv.list({ prefix: [API_KEY_VALUE_PREFIX] });
count = 0;
for await (const entry of valueEntries) {
  console.log(`Value ${++count}:`, entry.key, "ID:", entry.value);
}
if (count === 0) {
  console.log("No API key values found in the database");
}
