import { CreateStore, Store, UpdateStore } from "../models/store.ts";
import { create, list, read, remove, update } from "../db/index.ts";
import { NotFoundError } from "../utils/error.ts";

const COLLECTION = "stores";

// Create a new store
export async function createStore(storeData: CreateStore): Promise<Store> {
  const now = new Date().toISOString();
  const storeId = crypto.randomUUID();

  const store: Store = {
    id: storeId,
    name: storeData.name,
    address: storeData.address,
    city: storeData.city,
    state: storeData.state,
    postal_code: storeData.postal_code,
    country: storeData.country,
    phone: storeData.phone,
    email: storeData.email,
    latitude: storeData.latitude,
    longitude: storeData.longitude,
    operating_hours: storeData.operating_hours,
    is_active: true,
    has_delivery: storeData.has_delivery || false,
    delivery_radius: storeData.delivery_radius,
    created_at: now,
    updated_at: now,
    features: storeData.features || [],
  };

  await create<Store>(COLLECTION, storeId, store);

  return store;
}

// Get a store by ID
export async function getStoreById(id: string): Promise<Store> {
  const store = await read<Store>(COLLECTION, id);

  if (!store) {
    throw new NotFoundError("Store not found");
  }

  return store;
}

// Update a store
export async function updateStore(
  id: string,
  storeData: UpdateStore,
): Promise<Store> {
  const store = await getStoreById(id);

  const updatedStore: Store = {
    ...store,
    ...storeData,
    updated_at: new Date().toISOString(),
  };

  await update<Store>(COLLECTION, id, updatedStore);

  return updatedStore;
}

// Delete a store
export async function deleteStore(id: string): Promise<void> {
  const store = await getStoreById(id);

  if (store) {
    await remove(COLLECTION, id);
  }
}

// List stores with pagination and filtering
export async function listStores(options: {
  limit?: number;
  cursor?: string;
  city?: string;
  isActive?: boolean;
  hasDelivery?: boolean;
  search?: string;
}): Promise<{ items: Store[]; cursor: string | null }> {
  const { limit, cursor } = options;

  // Get all stores
  const result = await list<Store>(COLLECTION, { limit, cursor });

  // Apply filters
  let filteredItems = result.items;

  // Filter by city
  if (options.city) {
    filteredItems = filteredItems.filter(
      (store) => store.city.toLowerCase() === options.city?.toLowerCase(),
    );
  }

  // Filter by active status
  if (options.isActive !== undefined) {
    filteredItems = filteredItems.filter(
      (store) => store.is_active === options.isActive,
    );
  }

  // Filter by delivery
  if (options.hasDelivery !== undefined) {
    filteredItems = filteredItems.filter(
      (store) => store.has_delivery === options.hasDelivery,
    );
  }

  // Filter by search term
  if (options.search) {
    const searchTerm = options.search.toLowerCase();
    filteredItems = filteredItems.filter(
      (store) =>
        store.name.toLowerCase().includes(searchTerm) ||
        store.address.toLowerCase().includes(searchTerm) ||
        store.city.toLowerCase().includes(searchTerm),
    );
  }

  return {
    items: filteredItems,
    cursor: result.cursor,
  };
}

// Find nearby stores
export async function findNearbyStores(
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
): Promise<Store[]> {
  // Get all stores
  const { items: stores } = await listStores({
    isActive: true,
    // Fetch all active stores
    limit: 100,
  });

  // Calculate distance for each store and filter by radius
  return stores.filter((store) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      store.latitude,
      store.longitude,
    );

    return distance <= radiusKm;
  });
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
