import { z } from "npm:zod";

// Define operating hours schema
const OperatingHoursSchema = z.object({
  monday: z.object({
    open: z.string(),
    close: z.string(),
    is_closed: z.boolean().default(false),
  }),
  tuesday: z.object({
    open: z.string(),
    close: z.string(),
    is_closed: z.boolean().default(false),
  }),
  wednesday: z.object({
    open: z.string(),
    close: z.string(),
    is_closed: z.boolean().default(false),
  }),
  thursday: z.object({
    open: z.string(),
    close: z.string(),
    is_closed: z.boolean().default(false),
  }),
  friday: z.object({
    open: z.string(),
    close: z.string(),
    is_closed: z.boolean().default(false),
  }),
  saturday: z.object({
    open: z.string(),
    close: z.string(),
    is_closed: z.boolean().default(false),
  }),
  sunday: z.object({
    open: z.string(),
    close: z.string(),
    is_closed: z.boolean().default(false),
  }),
});

// Define the Store schema
export const StoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
  phone: z.string(),
  email: z.string().email(),
  latitude: z.number(),
  longitude: z.number(),
  operating_hours: OperatingHoursSchema,
  is_active: z.boolean().default(true),
  has_delivery: z.boolean().default(false),
  delivery_radius: z.number().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  features: z.array(z.string()).optional(),
});

// Define the CreateStore schema
export const CreateStoreSchema = StoreSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  is_active: true,
});

// Define the UpdateStore schema
export const UpdateStoreSchema = StoreSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Define the Store type
export type Store = z.infer<typeof StoreSchema>;
export type CreateStore = z.infer<typeof CreateStoreSchema>;
export type UpdateStore = z.infer<typeof UpdateStoreSchema>;
