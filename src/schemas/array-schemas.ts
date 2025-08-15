import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createTestMessageHandler } from "../localization/types/message-handler.types";
import { zStringOptional, zStringRequired } from "./string-schemas";

// Enhanced array schema options
export interface GenericArraySchemaOptions {
  msg?: string;
  msgType?: MsgType;
  minItems?: number;
  maxItems?: number;
  allowDuplicates?: boolean;
}

// Type definitions
export type GenericArrayOptional<T> = T[] | undefined;
export type GenericArrayRequired<T> = T[];

/**
 * Creates a factory function for generic array schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing generic array schema creation functions
 */
export const createArraySchemas = (messageHandler: ErrorMessageFormatter) => {
  // Helper: check for duplicates and return their values/indices
  function findDuplicates<T>(arr: T[]): { values: T[]; indices: number[] } {
    const seen = new Map<T, number[]>();
    arr.forEach((v, i) => {
      if (!seen.has(v)) seen.set(v, []);
      seen.get(v)!.push(i);
    });
    const values: T[] = [];
    const indices: number[] = [];
    for (const [val, idxs] of seen.entries()) {
      if (idxs.length > 1) {
        values.push(val);
        indices.push(...idxs);
      }
    }
    return { values, indices };
  }

  /**
   * Creates a Zod schema for an optional array of any type.
   * 
   * @param elementSchema - The Zod schema for validating individual array elements
   * @param options - Configuration options for the array schema
   * @returns A Zod schema that validates an optional array of the specified type
   * 
   * @example
   * const { zArrayOptional } = createArraySchemas(messageHandler);
   * 
   * // String array
   * const stringArraySchema = zArrayOptional(z.string(), { msg: "Tags" });
   * 
   * // Number array  
   * const numberArraySchema = zArrayOptional(z.number(), { msg: "Scores" });
   * 
   * // Object array
   * const userArraySchema = zArrayOptional(
   *   z.object({ id: z.string(), name: z.string() }), 
   *   { msg: "Users", maxItems: 10 }
   * );
   */
  const zArrayOptional = <T>(
    elementSchema: z.ZodType<T>,
    options: GenericArraySchemaOptions = {}
  ) => {
    const {
      msg = "Value",
      msgType = MsgType.FieldName,
      minItems,
      maxItems,
      allowDuplicates = false, // Default to false for backwards compatibility
    } = options;

    // Start with custom validation to provide consistent error messages
    let schema = z
      .custom<any[]>(
        (val) => {
          if (val === undefined) return true;
          if (!Array.isArray(val)) return false;
          return true;
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "mustBeArray",
            params: { receivedType: undefined },
            msg,
            msgType,
          }),
        },
      )
      .optional();

    // Type check for elements using the provided schema
    schema = schema.refine(
      (val) => {
        if (val === undefined) return true;
        if (!Array.isArray(val)) return false;
        // Validate each element against the provided schema
        for (let i = 0; i < val.length; i++) {
          const result = elementSchema.safeParse(val[i]);
          if (!result.success) {
            return false;
          }
        }
        return true;
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustBeStringArray", // This will need to be more generic
          params: { receivedTypes: [], invalidIndices: [] },
          msg,
          msgType,
        }),
      },
    );

    // Apply minItems constraint
    if (minItems !== undefined) {
      schema = schema.refine(
        (val) => {
          if (val === undefined) return true;
          return val.length >= minItems;
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "tooSmall",
            params: { min: minItems },
            msg,
            msgType,
          }),
        }
      );
    }

    // Apply maxItems constraint
    if (maxItems !== undefined) {
      schema = schema.refine(
        (val) => {
          if (val === undefined) return true;
          return val.length <= maxItems;
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "tooBig",
            params: { max: maxItems },
            msg,
            msgType,
          }),
        }
      );
    }

    // Apply duplicate check if not allowed
    if (!allowDuplicates) {
      schema = schema.refine(
        (val) => {
          if (val === undefined) return true;
          const { values: duplicateValues } = findDuplicates(val);
          return duplicateValues.length === 0;
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "duplicateItems",
            params: { duplicateValues: [], indices: [] },
            msg,
            msgType,
          }),
        }
      );
    }

    return schema;
  };

  /**
   * Creates a Zod schema for a required array of any type with at least one item.
   * 
   * @param elementSchema - The Zod schema for validating individual array elements
   * @param options - Configuration options for the array schema
   * @returns A Zod schema that validates a required array of the specified type
   * 
   * @example
   * const { zArrayRequired } = createArraySchemas(messageHandler);
   * 
   * // Required string array
   * const categoriesSchema = zArrayRequired(z.string(), { 
   *   msg: "Categories", 
   *   maxItems: 5 
   * });
   * 
   * // Required object array with custom validation
   * const usersSchema = zArrayRequired(
   *   z.object({ 
   *     id: z.string().uuid(), 
   *     email: z.string().email() 
   *   }), 
   *   { msg: "Users", minItems: 1, allowDuplicates: false }
   * );
   */
  const zArrayRequired = <T>(
    elementSchema: z.ZodType<T>,
    options: GenericArraySchemaOptions = {}
  ) => {
    const {
      msg = "Value",
      msgType = MsgType.FieldName,
      minItems = 1,
      maxItems,
      allowDuplicates = false, // Default to false for backwards compatibility
    } = options;

    // Start with custom validation to provide consistent error messages
    let schema = z.custom<any[]>(
      (val) => {
        return Array.isArray(val);
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustBeArray",
          params: { receivedType: undefined },
          msg,
          msgType,
        }),
      },
    );

    // Ensure non-empty array
    schema = schema.refine(
      (val) => {
        if (!Array.isArray(val)) return false;
        return val.length > 0;
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustNotBeEmpty",
          params: {},
          msg,
          msgType,
        }),
      }
    );

    // Type check for elements using the provided schema
    schema = schema.refine(
      (val) => {
        if (!Array.isArray(val)) return false;
        // Validate each element against the provided schema
        for (let i = 0; i < val.length; i++) {
          const result = elementSchema.safeParse(val[i]);
          if (!result.success) {
            return false;
          }
        }
        return true;
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustBeStringArray", // This will need to be more generic
          params: { receivedTypes: [], invalidIndices: [] },
          msg,
          msgType,
        }),
      },
    );

    // Apply minItems constraint
    if (minItems !== undefined && minItems > 1) {
      schema = schema.refine(
        (val) => val.length >= minItems,
        {
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "tooSmall",
            params: { min: minItems },
            msg,
            msgType,
          }),
        }
      );
    }

    // Apply maxItems constraint
    if (maxItems !== undefined) {
      schema = schema.refine(
        (val) => val.length <= maxItems,
        {
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "tooBig",
            params: { max: maxItems },
            msg,
            msgType,
          }),
        }
      );
    }

    // Apply duplicate check if not allowed
    if (!allowDuplicates) {
      schema = schema.refine(
        (val) => {
          const { values: duplicateValues } = findDuplicates(val);
          return duplicateValues.length === 0;
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "duplicateItems",
            params: { duplicateValues: [], indices: [] },
            msg,
            msgType,
          }),
        }
      );
    }

    return schema;
  };


  const zNumberArrayOptional = (options: GenericArraySchemaOptions = {}) =>
    zArrayOptional(z.number(), options);

  const zNumberArrayRequired = (options: GenericArraySchemaOptions = {}) =>
    zArrayRequired(z.number(), options);

  const zBooleanArrayOptional = (options: GenericArraySchemaOptions = {}) =>
    zArrayOptional(z.boolean(), options);

  const zBooleanArrayRequired = (options: GenericArraySchemaOptions = {}) =>
    zArrayRequired(z.boolean(), options);

  const zUuidArrayOptional = (options: GenericArraySchemaOptions = {}) =>
    zArrayOptional(z.string().uuid(), options);

  const zUuidArrayRequired = (options: GenericArraySchemaOptions = {}) =>
    zArrayRequired(z.string().uuid(), options);

  // String array convenience functions using pz string schemas
  const zStringArrayOptional = (options: GenericArraySchemaOptions = {}) =>
    zArrayOptional(zStringOptional(), options);

  const zStringArrayRequired = (options: GenericArraySchemaOptions = {}) =>
    zArrayRequired(zStringRequired(), options);

  return {
    // Generic array functions
    zArrayOptional,
    zArrayRequired,
    
    // String array convenience functions
    zStringArrayOptional,
    zStringArrayRequired,
    
    // Common type convenience functions
    zNumberArrayOptional,
    zNumberArrayRequired,
    zBooleanArrayOptional,
    zBooleanArrayRequired,
    zUuidArrayOptional,
    zUuidArrayRequired,
  };
};

// Top-level exports with default message handler for convenience
const defaultArraySchemas = createArraySchemas(createTestMessageHandler());

export const {
  zArrayOptional,
  zArrayRequired,
  zStringArrayOptional,
  zStringArrayRequired,
  zNumberArrayOptional, 
  zNumberArrayRequired,
  zBooleanArrayOptional,
  zBooleanArrayRequired,
  zUuidArrayOptional,
  zUuidArrayRequired,
} = defaultArraySchemas;

// createArraySchemas is already exported above

// Usage examples:

/*
// Generic usage
const tagsSchema = zArrayRequired(z.string(), { 
  msg: "Tags", 
  minItems: 1, 
  maxItems: 10,
  allowDuplicates: false 
});

const scoresSchema = zArrayOptional(z.number().min(0).max(100), {
  msg: "Test Scores",
  maxItems: 20
});

const usersSchema = zArrayRequired(
  z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    email: z.string().email()
  }),
  { msg: "Users", minItems: 1 }
);

// Convenience functions (backwards compatible)
const simpleTagsSchema = zStringArrayRequired({ msg: "Categories" });
const numbersSchema = zNumberArrayOptional({ msg: "Values" });

// Complex nested arrays
const matrixSchema = zArrayRequired(
  zArrayRequired(z.number(), { minItems: 3, maxItems: 3 }),
  { msg: "Matrix", minItems: 3, maxItems: 3 }
);

// Mixed type arrays using union
const mixedSchema = zArrayOptional(
  z.union([z.string(), z.number()]),
  { msg: "Mixed Values" }
);
*/
