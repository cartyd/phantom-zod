import { z } from "zod";

/**
 * Creates an optional version of a schema that accepts the schema's type or undefined.
 * Also handles null values by transforming them to undefined.
 * 
 * This utility eliminates the repetitive pattern of:
 * z.union([actualSchema, z.undefined(), z.null().transform(() => undefined)])
 * 
 * @param schema - The base Zod schema to make optional
 * @returns A union schema that accepts the original schema's type, undefined, or null (transformed to undefined)
 * 
 * @example
 * ```typescript
 * // Instead of:
 * z.union([z.string().email(), z.undefined(), z.null().transform(() => undefined)])
 * 
 * // Use:
 * makeOptional(z.string().email())
 * ```
 */
export function makeOptional<T extends z.ZodTypeAny>(schema: T) {
  return z.union([
    schema,
    z.undefined(),
    z.null().transform(() => undefined)
  ]);
}

/**
 * Creates an optional version of a schema that accepts the schema's type or undefined.
 * This is a simpler version that doesn't handle null values.
 * 
 * @param schema - The base Zod schema to make optional
 * @param errorMessage - Optional custom error message for the union
 * @returns A union schema that accepts the original schema's type or undefined
 * 
 * @example
 * ```typescript
 * // Instead of:
 * z.union([z.string().url(), z.undefined()])
 * 
 * // Use:
 * makeOptionalSimple(z.string().url())
 * 
 * // With custom error message:
 * makeOptionalSimple(z.string().url(), "URL is invalid")
 * ```
 */
export function makeOptionalSimple<T extends z.ZodTypeAny>(schema: T, errorMessage?: string) {
  const unionOptions = errorMessage ? { message: errorMessage } : undefined;
  return z.union([
    schema,
    z.undefined()
  ], unionOptions);
}

/**
 * Creates a schema that accepts the original type, undefined, or null.
 * Unlike makeOptional, this preserves null values instead of transforming them to undefined.
 * 
 * @param schema - The base Zod schema to make nullable and optional
 * @returns A union schema that accepts the original schema's type, undefined, or null
 * 
 * @example
 * ```typescript
 * // Instead of:
 * z.union([z.number(), z.undefined(), z.null()])
 * 
 * // Use:
 * makeNullableOptional(z.number())
 * ```
 */
export function makeNullableOptional<T extends z.ZodTypeAny>(schema: T) {
  return z.union([
    schema,
    z.undefined(),
    z.null()
  ]);
}

/**
 * Creates a utility to remove empty string fields from objects during transformation.
 * This is commonly used in forms where empty strings should be treated as undefined.
 * 
 * @param fieldsToRemove - Array of field names to remove if they are empty strings
 * @returns A transformation function that can be used with .transform()
 * 
 * @example
 * ```typescript
 * const schema = z.object({
 *   name: z.string(),
 *   optional_field: z.string().optional()
 * }).transform(removeEmptyStringFields(['optional_field']));
 * 
 * schema.parse({ name: 'John', optional_field: '' }); 
 * // Result: { name: 'John' } (optional_field removed)
 * ```
 */
export function removeEmptyStringFields<T extends Record<string, any>>(
  fieldsToRemove: (keyof T)[]
) {
  return (val: T): Partial<T> => {
    const result = { ...val } as Partial<T>;
    for (const field of fieldsToRemove) {
      if (result[field] === "") {
        delete result[field];
      }
    }
    return result;
  };
}

/**
 * Creates a schema that adds array length constraints (min/max items) with proper undefined handling.
 * This eliminates the repetitive pattern of checking for undefined in array length validations.
 * 
 * @param schema - The base array schema to add constraints to
 * @param constraints - Object containing min and/or max constraints
 * @param errorMessages - Functions to generate error messages for constraint violations
 * @returns The schema with length constraints applied
 * 
 * @example
 * ```typescript
 * const schema = z.array(z.string()).optional();
 * const constrainedSchema = addArrayConstraints(schema, 
 *   { min: 1, max: 10 },
 *   {
 *     tooSmall: (min) => `Array must have at least ${min} items`,
 *     tooBig: (max) => `Array must have at most ${max} items`
 *   }
 * );
 * ```
 */
export function addArrayConstraints<T extends z.ZodTypeAny>(
  schema: T,
  constraints: { min?: number; max?: number },
  errorMessages: {
    tooSmall?: (min: number) => string;
    tooBig?: (max: number) => string;
  }
) {
  let result = schema;
  
  if (constraints.min !== undefined) {
    result = result.refine(
      (val: any) => {
        if (val === undefined) return true;
        if (!Array.isArray(val)) return true;
        return val.length >= constraints.min!;
      },
      {
        message: errorMessages.tooSmall?.(constraints.min) || `Must have at least ${constraints.min} items`
      }
    );
  }
  
  if (constraints.max !== undefined) {
    result = result.refine(
      (val: any) => {
        if (val === undefined) return true;
        if (!Array.isArray(val)) return true;
        return val.length <= constraints.max!;
      },
      {
        message: errorMessages.tooBig?.(constraints.max) || `Must have at most ${constraints.max} items`
      }
    );
  }
  
  return result;
}

/**
 * Creates a schema that accepts either a number or a string that can be converted to a number.
 * This eliminates the repetitive pattern of handling both number and string inputs.
 * 
 * @param errorMessage - Custom error message for invalid inputs
 * @returns A schema that accepts numbers or numeric strings and outputs numbers
 * 
 * @example
 * ```typescript
 * const schema = makeNumberFromStringOrNumber('Age must be a valid number');
 * schema.parse('25');    // 25 (number)
 * schema.parse(25);     // 25 (number) 
 * schema.parse('abc');  // throws error
 * ```
 */
export function makeNumberFromStringOrNumber(errorMessage: string) {
  return z.union([
    z.number(),
    z.string().transform((val, ctx) => {
      if (val.trim() === '') {
        ctx.addIssue({
          code: "custom",
          message: errorMessage,
        });
        return z.NEVER;
      }
      
      const num = Number(val.trim());
      if (isNaN(num)) {
        ctx.addIssue({
          code: "custom",
          message: errorMessage,
        });
        return z.NEVER;
      }
      return num;
    })
  ]);
}
