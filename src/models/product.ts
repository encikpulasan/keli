import { z } from "npm:zod";

// Define the Product schema
export const ProductSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  description: z.string(),
  category_id: z.string().uuid(),
  base_price: z.number().positive(),
  image_url: z.string().url(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  nutritional_info: z.record(z.unknown()).optional(),
  allergens: z.array(z.string()).optional(),
  preparation_time: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

// Define the CreateProduct schema
export const CreateProductSchema = ProductSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  is_active: true,
});

// Define the UpdateProduct schema
export const UpdateProductSchema = ProductSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Define the Product type
export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
