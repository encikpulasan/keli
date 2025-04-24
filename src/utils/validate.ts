import { Context } from "hono";
import { z } from "npm:zod";

/**
 * Validate request body against a Zod schema
 * @param c Hono context
 * @param schema Zod schema
 * @returns Validated data
 */
export async function validate<T extends z.ZodTypeAny>(
  c: Context,
  schema: T,
): Promise<z.infer<T>> {
  const data = await c.req.json();
  return schema.parse(data);
}
