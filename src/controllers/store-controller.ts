import { Context } from "hono";
import { z } from "npm:zod";
import {
  createStore,
  deleteStore,
  findNearbyStores,
  getStoreById,
  listStores,
  updateStore,
} from "../services/store-service.ts";
import { CreateStoreSchema, UpdateStoreSchema } from "../models/store.ts";
import { validate } from "../utils/validation.ts";
import {
  createdResponse,
  errorResponse,
  noContentResponse,
  paginatedResponse,
  successResponse,
} from "../utils/response.ts";
import { BadRequestError } from "../utils/error.ts";

// Create a new store
export async function createStoreHandler(c: Context) {
  const data = await c.req.json();

  // Validate store data
  const storeData = validate(CreateStoreSchema, data);

  // Create store
  const result = await createStore(storeData);

  // Return success response
  return createdResponse(c, result);
}

// Get a store by ID
export async function getStoreHandler(c: Context) {
  const id = c.req.param("id");

  // Get store
  const store = await getStoreById(id);

  // Return success response
  return successResponse(c, store);
}

// Update a store
export async function updateStoreHandler(c: Context) {
  const id = c.req.param("id");
  const data = await c.req.json();

  // Validate store data
  const storeData = validate(UpdateStoreSchema, data);

  // Update store
  const result = await updateStore(id, storeData);

  // Return success response
  return successResponse(c, result);
}

// Delete a store
export async function deleteStoreHandler(c: Context) {
  const id = c.req.param("id");

  // Delete store
  await deleteStore(id);

  // Return no content response
  return noContentResponse(c);
}

// List stores with pagination and filtering
export async function listStoresHandler(c: Context) {
  // Get query parameters
  const limit = c.req.query("limit")
    ? parseInt(c.req.query("limit") || "10")
    : 10;
  const cursor = c.req.query("cursor");
  const city = c.req.query("city");
  const isActive = c.req.query("is_active")
    ? c.req.query("is_active") === "true"
    : undefined;
  const hasDelivery = c.req.query("has_delivery")
    ? c.req.query("has_delivery") === "true"
    : undefined;
  const search = c.req.query("search");

  // List stores
  const result = await listStores({
    limit,
    cursor,
    city,
    isActive,
    hasDelivery,
    search,
  });

  // Return paginated response
  return paginatedResponse(c, result.items, {
    cursor: result.cursor,
    limit,
    hasMore: !!result.cursor,
  });
}

// Find nearby stores
export async function findNearbyStoresHandler(c: Context) {
  // Get query parameters
  const latString = c.req.query("latitude");
  const lngString = c.req.query("longitude");
  const radiusString = c.req.query("radius");

  if (!latString || !lngString) {
    throw new BadRequestError("Latitude and longitude are required");
  }

  // Parse parameters
  const latitude = parseFloat(latString);
  const longitude = parseFloat(lngString);
  const radius = radiusString ? parseFloat(radiusString) : 10; // Default 10km

  // Validate coordinates
  if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
    throw new BadRequestError("Invalid coordinates or radius");
  }

  // Find nearby stores
  const stores = await findNearbyStores(latitude, longitude, radius);

  // Return success response
  return successResponse(c, {
    stores,
    count: stores.length,
    searchRadius: radius,
  });
}
