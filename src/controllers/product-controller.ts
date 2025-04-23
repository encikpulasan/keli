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

// Create a new product
export async function createProductHandler(c: Context) {
  const data = await c.req.json();

  // Validate product data
  const productData = validate(CreateProductSchema, data);

  // Create product
  const result = await createProduct(productData);

  // Return success response
  return createdResponse(c, result);
}

// Get a product by ID
export async function getProductHandler(c: Context) {
  const id = c.req.param("id");

  // Get product
  const product = await getProductById(id);

  // Return success response
  return successResponse(c, product);
}

// Update a product
export async function updateProductHandler(c: Context) {
  const id = c.req.param("id");
  const data = await c.req.json();

  // Validate product data
  const productData = validate(UpdateProductSchema, data);

  // Update product
  const result = await updateProduct(id, productData);

  // Return success response
  return successResponse(c, result);
}

// Delete a product
export async function deleteProductHandler(c: Context) {
  const id = c.req.param("id");

  // Delete product
  await deleteProduct(id);

  // Return no content response
  return noContentResponse(c);
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
