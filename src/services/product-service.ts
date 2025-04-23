import { CreateProduct, Product, UpdateProduct } from "../models/product.ts";
import { create, list, read, remove, update } from "../db/index.ts";
import { NotFoundError } from "../utils/error.ts";

const COLLECTION = "products";

// Create a new product
export async function createProduct(
  productData: CreateProduct,
): Promise<Product> {
  const now = new Date().toISOString();
  const productId = crypto.randomUUID();

  const product: Product = {
    id: productId,
    sku: productData.sku,
    name: productData.name,
    description: productData.description,
    category_id: productData.category_id,
    base_price: productData.base_price,
    image_url: productData.image_url,
    is_active: true,
    created_at: now,
    updated_at: now,
    nutritional_info: productData.nutritional_info,
    allergens: productData.allergens,
    preparation_time: productData.preparation_time,
    tags: productData.tags,
  };

  await create<Product>(COLLECTION, productId, product);

  return product;
}

// Get a product by ID
export async function getProductById(id: string): Promise<Product> {
  const product = await read<Product>(COLLECTION, id);

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
}

// Update a product
export async function updateProduct(
  id: string,
  productData: UpdateProduct,
): Promise<Product> {
  const product = await getProductById(id);

  const updatedProduct: Product = {
    ...product,
    ...productData,
    updated_at: new Date().toISOString(),
  };

  await update<Product>(COLLECTION, id, updatedProduct);

  return updatedProduct;
}

// Delete a product
export async function deleteProduct(id: string): Promise<void> {
  const product = await getProductById(id);

  if (product) {
    await remove(COLLECTION, id);
  }
}

// List products with pagination and filtering
export async function listProducts(options: {
  limit?: number;
  cursor?: string;
  categoryId?: string;
  isActive?: boolean;
  search?: string;
}): Promise<{ items: Product[]; cursor: string | null }> {
  const { limit, cursor } = options;

  // Get all products
  const result = await list<Product>(COLLECTION, { limit, cursor });

  // Apply filters
  let filteredItems = result.items;

  // Filter by category
  if (options.categoryId) {
    filteredItems = filteredItems.filter(
      (product) => product.category_id === options.categoryId,
    );
  }

  // Filter by active status
  if (options.isActive !== undefined) {
    filteredItems = filteredItems.filter(
      (product) => product.is_active === options.isActive,
    );
  }

  // Filter by search term
  if (options.search) {
    const searchTerm = options.search.toLowerCase();
    filteredItems = filteredItems.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        (product.tags &&
          product.tags.some((tag) => tag.toLowerCase().includes(searchTerm))),
    );
  }

  return {
    items: filteredItems,
    cursor: result.cursor,
  };
}
