import { Context } from "hono";
import { z } from "npm:zod";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "../services/product-service.ts";
import { CreateProductSchema, UpdateProductSchema } from "../models/product.ts";
import { validate } from "../utils/validation.ts";
import {
  createdResponse,
  noContentResponse,
  paginatedResponse,
  successResponse,
} from "../utils/response.ts";
import { NotFoundError } from "../utils/error.ts";

// In-memory products storage for development
const products = new Map();

// Product schema
const ProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  category: z.string(),
  image: z.string().url(),
  allergens: z.array(z.string()).optional(),
  available: z.boolean().default(true),
});

// Create a new product
export async function createProductHandler(c: Context) {
  const data = await c.req.json();
  const validatedData = validate(ProductSchema, data);

  const productId = crypto.randomUUID();
  const now = new Date().toISOString();

  const product = {
    id: productId,
    ...validatedData,
    created_at: now,
    updated_at: now,
  };

  // Save product to our in-memory storage
  products.set(productId, product);

  return createdResponse(c, product);
}

// Get a product by ID
export async function getProductHandler(c: Context) {
  const productId = c.req.param("id");
  const product = products.get(productId);

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return successResponse(c, product);
}

// Update a product
export async function updateProductHandler(c: Context) {
  const productId = c.req.param("id");
  const data = await c.req.json();

  if (!products.has(productId)) {
    throw new NotFoundError("Product not found");
  }

  const existingProduct = products.get(productId);
  const validatedData = validate(ProductSchema.partial(), data);

  const updatedProduct = {
    ...existingProduct,
    ...validatedData,
    updated_at: new Date().toISOString(),
  };

  products.set(productId, updatedProduct);

  return successResponse(c, updatedProduct);
}

// Delete a product
export async function deleteProductHandler(c: Context) {
  const productId = c.req.param("id");

  if (!products.has(productId)) {
    throw new NotFoundError("Product not found");
  }

  products.delete(productId);

  return new Response(null, { status: 204 });
}

// List products with pagination and filtering
export async function listProductsHandler(c: Context) {
  // Get query parameters
  const limit = c.req.query("limit")
    ? parseInt(c.req.query("limit") || "10")
    : 10;
  const cursor = c.req.query("cursor");
  const categoryId = c.req.query("category_id");
  const isActive = c.req.query("is_active")
    ? c.req.query("is_active") === "true"
    : undefined;
  const search = c.req.query("search");

  // List products
  const result = await listProducts({
    limit,
    cursor,
    categoryId,
    isActive,
    search,
  });

  // Return paginated response
  return paginatedResponse(c, result.items, {
    cursor: result.cursor,
    limit,
    hasMore: !!result.cursor,
  });
}
