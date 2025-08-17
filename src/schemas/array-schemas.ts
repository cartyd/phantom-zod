import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createTestMessageHandler } from "../localization/types/message-handler.types";
import { StringOptional, StringRequired } from "./string-schemas";

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
  const ArrayOptional = <T>(
    elementSchema: z.ZodType<T>,
    options: GenericArraySchemaOptions = {},
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
        },
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
        },
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
        },
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
  const ArrayRequired = <T>(
    elementSchema: z.ZodType<T>,
    options: GenericArraySchemaOptions = {},
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
      },
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
      schema = schema.refine((val) => val.length >= minItems, {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "tooSmall",
          params: { min: minItems },
          msg,
          msgType,
        }),
      });
    }

    // Apply maxItems constraint
    if (maxItems !== undefined) {
      schema = schema.refine((val) => val.length <= maxItems, {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "tooBig",
          params: { max: maxItems },
          msg,
          msgType,
        }),
      });
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
        },
      );
    }

    return schema;
  };

  const NumberArrayOptional = (options: GenericArraySchemaOptions = {}) =>
    ArrayOptional(z.number(), options);

  const NumberArrayRequired = (options: GenericArraySchemaOptions = {}) =>
    ArrayRequired(z.number(), options);

  const BooleanArrayOptional = (options: GenericArraySchemaOptions = {}) =>
    ArrayOptional(z.boolean(), options);

  const BooleanArrayRequired = (options: GenericArraySchemaOptions = {}) =>
    ArrayRequired(z.boolean(), options);

  const UuidArrayOptional = (options: GenericArraySchemaOptions = {}) =>
    ArrayOptional(z.string().uuid(), options);

  const UuidArrayRequired = (options: GenericArraySchemaOptions = {}) =>
    ArrayRequired(z.string().uuid(), options);

  // String array convenience functions using pz string schemas
  const StringArrayOptional = (options: GenericArraySchemaOptions = {}) =>
    ArrayOptional(StringOptional(), options);

  const StringArrayRequired = (options: GenericArraySchemaOptions = {}) =>
    ArrayRequired(StringRequired(), options);

  return {
    // Generic array functions
    ArrayOptional,
    ArrayRequired,

    // String array convenience functions
    StringArrayOptional,
    StringArrayRequired,

    // Common type convenience functions
    NumberArrayOptional,
    NumberArrayRequired,
    BooleanArrayOptional,
    BooleanArrayRequired,
    UuidArrayOptional,
    UuidArrayRequired,
  };
};

// Top-level exports with default message handler for convenience
const defaultArraySchemas = createArraySchemas(createTestMessageHandler());

// Helper functions with overloads to support both string and options object
function createStringArrayOptionalOverload(
  msg: string,
): ReturnType<typeof defaultArraySchemas.StringArrayOptional>;
function createStringArrayOptionalOverload(
  options?: GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.StringArrayOptional>;
function createStringArrayOptionalOverload(
  msgOrOptions?: string | GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.StringArrayOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultArraySchemas.StringArrayOptional({ msg: msgOrOptions });
  }
  return defaultArraySchemas.StringArrayOptional(msgOrOptions);
}

function createStringArrayRequiredOverload(
  msg: string,
): ReturnType<typeof defaultArraySchemas.StringArrayRequired>;
function createStringArrayRequiredOverload(
  options?: GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.StringArrayRequired>;
function createStringArrayRequiredOverload(
  msgOrOptions?: string | GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.StringArrayRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultArraySchemas.StringArrayRequired({ msg: msgOrOptions });
  }
  return defaultArraySchemas.StringArrayRequired(msgOrOptions);
}

function createNumberArrayOptionalOverload(
  msg: string,
): ReturnType<typeof defaultArraySchemas.NumberArrayOptional>;
function createNumberArrayOptionalOverload(
  options?: GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.NumberArrayOptional>;
function createNumberArrayOptionalOverload(
  msgOrOptions?: string | GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.NumberArrayOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultArraySchemas.NumberArrayOptional({ msg: msgOrOptions });
  }
  return defaultArraySchemas.NumberArrayOptional(msgOrOptions);
}

function createNumberArrayRequiredOverload(
  msg: string,
): ReturnType<typeof defaultArraySchemas.NumberArrayRequired>;
function createNumberArrayRequiredOverload(
  options?: GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.NumberArrayRequired>;
function createNumberArrayRequiredOverload(
  msgOrOptions?: string | GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.NumberArrayRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultArraySchemas.NumberArrayRequired({ msg: msgOrOptions });
  }
  return defaultArraySchemas.NumberArrayRequired(msgOrOptions);
}

function createBooleanArrayOptionalOverload(
  msg: string,
): ReturnType<typeof defaultArraySchemas.BooleanArrayOptional>;
function createBooleanArrayOptionalOverload(
  options?: GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.BooleanArrayOptional>;
function createBooleanArrayOptionalOverload(
  msgOrOptions?: string | GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.BooleanArrayOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultArraySchemas.BooleanArrayOptional({ msg: msgOrOptions });
  }
  return defaultArraySchemas.BooleanArrayOptional(msgOrOptions);
}

function createBooleanArrayRequiredOverload(
  msg: string,
): ReturnType<typeof defaultArraySchemas.BooleanArrayRequired>;
function createBooleanArrayRequiredOverload(
  options?: GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.BooleanArrayRequired>;
function createBooleanArrayRequiredOverload(
  msgOrOptions?: string | GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.BooleanArrayRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultArraySchemas.BooleanArrayRequired({ msg: msgOrOptions });
  }
  return defaultArraySchemas.BooleanArrayRequired(msgOrOptions);
}

function createUuidArrayOptionalOverload(
  msg: string,
): ReturnType<typeof defaultArraySchemas.UuidArrayOptional>;
function createUuidArrayOptionalOverload(
  options?: GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.UuidArrayOptional>;
function createUuidArrayOptionalOverload(
  msgOrOptions?: string | GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.UuidArrayOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultArraySchemas.UuidArrayOptional({ msg: msgOrOptions });
  }
  return defaultArraySchemas.UuidArrayOptional(msgOrOptions);
}

function createUuidArrayRequiredOverload(
  msg: string,
): ReturnType<typeof defaultArraySchemas.UuidArrayRequired>;
function createUuidArrayRequiredOverload(
  options?: GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.UuidArrayRequired>;
function createUuidArrayRequiredOverload(
  msgOrOptions?: string | GenericArraySchemaOptions,
): ReturnType<typeof defaultArraySchemas.UuidArrayRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultArraySchemas.UuidArrayRequired({ msg: msgOrOptions });
  }
  return defaultArraySchemas.UuidArrayRequired(msgOrOptions);
}

// Export original generic functions without overloads (they don't take simple string parameters)
export const ArrayOptional = defaultArraySchemas.ArrayOptional;
export const ArrayRequired = defaultArraySchemas.ArrayRequired;

// Export convenience functions with string parameter overloads
export const StringArrayOptional = createStringArrayOptionalOverload;
export const StringArrayRequired = createStringArrayRequiredOverload;
export const NumberArrayOptional = createNumberArrayOptionalOverload;
export const NumberArrayRequired = createNumberArrayRequiredOverload;
export const BooleanArrayOptional = createBooleanArrayOptionalOverload;
export const BooleanArrayRequired = createBooleanArrayRequiredOverload;
export const UuidArrayOptional = createUuidArrayOptionalOverload;
export const UuidArrayRequired = createUuidArrayRequiredOverload;

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
