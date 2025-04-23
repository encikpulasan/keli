// Initialize DenoKV
export const kv = await Deno.openKv(Deno.env.get("KV_PATH"));

// Helper function to create collection keys
export function createKey(collection: string, id: string): string[] {
  return [collection, id];
}

// Basic CRUD operations
export async function create<T>(
  collection: string,
  id: string,
  data: T,
): Promise<T> {
  const key = createKey(collection, id);
  await kv.set(key, data);
  return data;
}

export async function read<T>(
  collection: string,
  id: string,
): Promise<T | null> {
  const key = createKey(collection, id);
  const result = await kv.get<T>(key);
  return result.value;
}

export async function update<T>(
  collection: string,
  id: string,
  data: T,
): Promise<T> {
  const key = createKey(collection, id);
  await kv.set(key, data);
  return data;
}

export async function remove(collection: string, id: string): Promise<void> {
  const key = createKey(collection, id);
  await kv.delete(key);
}

// List items in a collection with pagination
export async function list<T>(
  collection: string,
  options?: { limit?: number; cursor?: string },
): Promise<{ items: T[]; cursor: string | null }> {
  const limit = options?.limit || 10;
  const cursor = options?.cursor ? JSON.parse(atob(options.cursor)) : undefined;

  const iter = kv.list<T>({ prefix: [collection] }, { limit, cursor });
  const items: T[] = [];

  for await (const entry of iter) {
    items.push(entry.value as T);
  }

  const nextCursor = iter.cursor ? btoa(JSON.stringify(iter.cursor)) : null;

  return {
    items,
    cursor: nextCursor,
  };
}

// Atomic operations
export async function atomic<T>(
  collection: string,
  id: string,
  updateFn: (current: T | null) => T,
): Promise<T> {
  const key = createKey(collection, id);
  let success = false;
  let value: T | null = null;

  while (!success) {
    const result = await kv.get<T>(key);
    value = updateFn(result.value);

    const op = kv.atomic();
    if (result.versionstamp) {
      op.check({ key, versionstamp: result.versionstamp });
    }
    op.set(key, value);

    const res = await op.commit();
    success = res.ok;
  }

  return value as T;
}
