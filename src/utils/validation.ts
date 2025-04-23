import { z } from "npm:zod";
import { ValidationError } from "./error.ts";

// Format Zod validation errors into a more usable format
export function formatZodError(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.errors) {
    const path = issue.path.join(".");
    const field = path || "general";

    if (!errors[field]) {
      errors[field] = [];
    }

    errors[field].push(issue.message);
  }

  return errors;
}

// Validate data against a schema and throw a ValidationError if invalid
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = formatZodError(error);
      throw new ValidationError("Validation failed", formattedErrors);
    }
    throw error;
  }
}

// Safe validation that returns a result object instead of throwing
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: boolean; data?: T; errors?: Record<string, string[]> } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: formatZodError(error) };
    }
    throw error;
  }
}
