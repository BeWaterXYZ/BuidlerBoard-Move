import { z } from "zod";

export function createUnionSchema<T extends readonly [string, ...string[]]>(
  values: T
): z.ZodEnum<[string, ...string[]]> {
  return z.enum(values as unknown as [string, ...string[]]);
} 