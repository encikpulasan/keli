import { z } from "npm:zod";

// Define the User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  phone_number: z.string().optional(),
  password_hash: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  date_of_birth: z.string().optional(),
  account_status: z.enum(["active", "inactive", "suspended"]).default("active"),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_login: z.string().datetime().optional(),
  referral_code: z.string().optional(),
  preferences: z.record(z.unknown()).optional(),
  role: z.enum(["user", "admin", "staff"]).default("user"),
});

// Define the CreateUser schema (used for validation when creating a user)
export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirm_password: z.string().min(8),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string().optional(),
  date_of_birth: z.string().optional(),
  referral_code: z.string().optional(),
  preferences: z.record(z.unknown()).optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

// Define the UpdateUser schema (used for validation when updating a user)
export const UpdateUserSchema = UserSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
  password_hash: true,
});

// Define the LoginSchema
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Define the User type (extracted from the schema)
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type Login = z.infer<typeof LoginSchema>;
