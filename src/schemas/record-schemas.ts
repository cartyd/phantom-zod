import { z } from "zod";

import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createTestMessageHandler } from "../localization/types/message-handler.types";
import { MsgType } from "../common/types/msg-type";
import type { BaseSchemaOptions } from "../common/types/schema-options.types";

// --- Record Schema Options ---

/**
 * Options for record schema creation functions.
 */
export interface RecordSchemaOptions extends BaseSchemaOptions {
  /** Optional minimum number of entries constraint for the record. */
  minEntries?: number;
  /** Optional maximum number of entries constraint for the record. */
  maxEntries?: number;
  /** Optional regex pattern for validating record keys. */
  keyPattern?: RegExp;
  /** Optional array of allowed keys. If provided, only these keys are allowed. */
  allowedKeys?: string[];
  /** Optional array of required keys that must be present in the record. */
  requiredKeys?: string[];
}

// --- Types ---
// Note: These types reference the factory functions, so they need to be created from the factory
type RecordSchemasFactory = ReturnType<typeof createRecordSchemas>;
export type RecordOptional<TValue = unknown> = z.infer<
  ReturnType<RecordSchemasFactory["RecordOptional"]>
>;
export type RecordRequired<TValue = unknown> = z.infer<
  ReturnType<RecordSchemasFactory["RecordRequired"]>
>;

/**
 * Creates a factory function for record schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing record schema creation functions
 */
export const createRecordSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Helper function to validate record keys against allowed keys
   */
  const validateAllowedKeys = (
    record: Record<string, unknown>,
    allowedKeys: string[],
  ): { valid: boolean; invalidKeys: string[] } => {
    const invalidKeys: string[] = [];
    for (const key of Object.keys(record)) {
      if (!allowedKeys.includes(key)) {
        invalidKeys.push(key);
      }
    }
    return { valid: invalidKeys.length === 0, invalidKeys };
  };

  /**
   * Helper function to validate record keys against a pattern
   */
  const validateKeyPattern = (
    record: Record<string, unknown>,
    pattern: RegExp,
  ): { valid: boolean; invalidKeys: string[] } => {
    const invalidKeys: string[] = [];
    for (const key of Object.keys(record)) {
      if (!pattern.test(key)) {
        invalidKeys.push(key);
      }
    }
    return { valid: invalidKeys.length === 0, invalidKeys };
  };

  /**
   * Helper function to check for required keys
   */
  const validateRequiredKeys = (
    record: Record<string, unknown>,
    requiredKeys: string[],
  ): { valid: boolean; missingKeys: string[] } => {
    const missingKeys = requiredKeys.filter(
      (key) => !(key in record) || record[key] === undefined,
    );
    return { valid: missingKeys.length === 0, missingKeys };
  };

  /**
   * Creates a base record schema with consistent error messaging and validation.
   * @param valueSchema - The Zod schema for validating record values
   * @param msg - The field name or custom message for error messages
   * @param msgType - The type of message formatting to use
   * @returns Base Zod record schema with error message
   */
  const createBaseRecordSchema = <TValue>(
    valueSchema: z.ZodType<TValue>,
    msg: string,
    msgType: MsgType,
  ) => {
    return z.custom<Record<string, TValue>>(
      (val) => {
        if (val === null || val === undefined) return false;
        if (typeof val !== "object" || Array.isArray(val)) return false;

        // Validate each value against the provided schema
        for (const [_key, value] of Object.entries(val)) {
          const result = valueSchema.safeParse(value);
          if (!result.success) {
            return false;
          }
        }
        return true;
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "record",
          messageKey: "mustBeRecord",
          params: { receivedType: undefined },
          msg,
          msgType,
        }),
      },
    );
  };

  /**
   * Adds validation constraints to a record schema.
   */
  const addRecordConstraints = <TSchema extends z.ZodTypeAny>(
    schema: TSchema,
    messageHandler: ErrorMessageFormatter,
    msg: string,
    msgType: MsgType,
    options: {
      minEntries?: number;
      maxEntries?: number;
      keyPattern?: RegExp;
      allowedKeys?: string[];
      requiredKeys?: string[];
    },
  ): TSchema => {
    let result = schema;

    // Apply allowedKeys constraint (most restrictive, so check first)
    if (options.allowedKeys !== undefined && options.allowedKeys.length > 0) {
      result = result.refine(
        (val: unknown) => {
          if (!val || typeof val !== "object" || Array.isArray(val))
            return true;
          const { valid } = validateAllowedKeys(
            val as Record<string, unknown>,
            options.allowedKeys!,
          );
          return valid;
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "record",
            messageKey: "invalidKeys",
            params: { allowedKeys: options.allowedKeys, invalidKeys: [] },
            msg,
            msgType,
          }),
        },
      ) as TSchema;
    }

    // Apply key pattern validation (only if allowedKeys is not provided)
    if (options.keyPattern !== undefined && !options.allowedKeys) {
      result = result.refine(
        (val: unknown) => {
          if (!val || typeof val !== "object" || Array.isArray(val))
            return true;
          const { valid } = validateKeyPattern(
            val as Record<string, unknown>,
            options.keyPattern!,
          );
          return valid;
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "record",
            messageKey: "invalidKeyPattern",
            params: {
              pattern: options.keyPattern!.toString(),
              invalidKeys: [],
            },
            msg,
            msgType,
          }),
        },
      ) as TSchema;
    }

    // Apply required keys validation
    if (options.requiredKeys !== undefined && options.requiredKeys.length > 0) {
      result = result.refine(
        (val: unknown) => {
          if (!val || typeof val !== "object" || Array.isArray(val))
            return true;
          const { valid } = validateRequiredKeys(
            val as Record<string, unknown>,
            options.requiredKeys!,
          );
          return valid;
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "record",
            messageKey: "missingRequiredKeys",
            params: { requiredKeys: options.requiredKeys, missingKeys: [] },
            msg,
            msgType,
          }),
        },
      ) as TSchema;
    }

    // Apply minEntries constraint
    if (options.minEntries !== undefined) {
      result = result.refine(
        (val: unknown) => {
          if (!val || typeof val !== "object" || Array.isArray(val))
            return true;
          return Object.keys(val).length >= options.minEntries!;
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "record",
            messageKey: "tooFewEntries",
            params: { min: options.minEntries },
            msg,
            msgType,
          }),
        },
      ) as TSchema;
    }

    // Apply maxEntries constraint
    if (options.maxEntries !== undefined) {
      result = result.refine(
        (val: unknown) => {
          if (!val || typeof val !== "object" || Array.isArray(val))
            return true;
          return Object.keys(val).length <= options.maxEntries!;
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "record",
            messageKey: "tooManyEntries",
            params: { max: options.maxEntries },
            msg,
            msgType,
          }),
        },
      ) as TSchema;
    }

    return result;
  };

  /**
   * Creates a Zod schema for an optional record (key-value mapping) with customizable error messages and constraints.
   *
   * @param valueSchema - The Zod schema for validating individual record values
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use, based on `MsgType`. Defaults to `MsgType.FieldName`.
   * @param options.minEntries - Optional minimum number of entries constraint for the record.
   * @param options.maxEntries - Optional maximum number of entries constraint for the record.
   * @param options.keyPattern - Optional regex pattern for validating record keys.
   * @param options.allowedKeys - Optional array of allowed keys. If provided, only these keys are allowed.
   * @param options.requiredKeys - Optional array of required keys that must be present in the record.
   * @returns A Zod schema that validates an optional record with the specified value type and constraints.
   *
   * @remarks
   * - The schema will accept undefined or null values.
   * - Custom error messages are generated using `messageHandler.formatErrorMessage`.
   * - Constraints are only applied if the respective parameters are provided.
   * - If both `allowedKeys` and `keyPattern` are provided, `allowedKeys` takes precedence.
   *
   * @example
   * const { RecordOptional } = createRecordSchemas(messageHandler);
   *
   * // Basic usage with pz schemas (consistent with README patterns)
   * const userSettings = RecordOptional(pz.StringOptional(), { msg: "User Settings" });
   * userSettings.parse({ theme: "dark", lang: "en" }); // { theme: "dark", lang: "en" }
   * userSettings.parse(undefined); // undefined
   *
   * // With specific allowed keys (like literal union types)
   * const courseInfoSchema = z.object({
   *   professor: pz.StringRequired("Professor"),
   *   cfu: pz.NumberRequired("CFU")
   * });
   * const coursesOptional = RecordOptional(courseInfoSchema, {
   *   msg: "Courses",
   *   allowedKeys: ["Computer Science", "Mathematics", "Literature"]
   * });
   *
   * // With constraints
   * const metadata = RecordOptional(pz.StringOptional(), {
   *   msg: "Metadata",
   *   minEntries: 1,
   *   maxEntries: 10,
   *   keyPattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/
   * });
   */
  const RecordOptional = <TValue>(
    valueSchema: z.ZodType<TValue>,
    options: RecordSchemaOptions = {},
  ) => {
    const {
      msg = "Value",
      msgType = MsgType.FieldName,
      minEntries,
      maxEntries,
      keyPattern,
      allowedKeys,
      requiredKeys,
    } = options;

    let schema = createBaseRecordSchema(valueSchema, msg, msgType).optional();

    schema = addRecordConstraints(schema, messageHandler, msg, msgType, {
      minEntries,
      maxEntries,
      keyPattern,
      allowedKeys,
      requiredKeys,
    });

    return schema;
  };

  /**
   * Creates a Zod schema for a required record (key-value mapping) with customizable error messages and constraints.
   *
   * @param valueSchema - The Zod schema for validating individual record values
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use, based on `MsgType`. Defaults to `MsgType.FieldName`.
   * @param options.minEntries - Optional minimum number of entries constraint for the record. Defaults to 1.
   * @param options.maxEntries - Optional maximum number of entries constraint for the record.
   * @param options.keyPattern - Optional regex pattern for validating record keys.
   * @param options.allowedKeys - Optional array of allowed keys. If provided, only these keys are allowed.
   * @param options.requiredKeys - Optional array of required keys that must be present in the record.
   * @returns A Zod schema that validates a required record with the specified value type and constraints.
   *
   * @remarks
   * - The schema requires a non-null, non-undefined object value.
   * - Custom error messages are generated using `messageHandler.formatErrorMessage`.
   * - By default, requires at least 1 entry unless minEntries is explicitly set to 0.
   * - If both `allowedKeys` and `keyPattern` are provided, `allowedKeys` takes precedence.
   *
   * @example
   * const { RecordRequired } = createRecordSchemas(messageHandler);
   *
   * // Basic usage with pz schemas (consistent with README patterns)
   * const appConfig = RecordRequired(pz.StringRequired(), "Application Config");
   * appConfig.parse({ apiUrl: "https://api.example.com", timeout: "30" }); // Valid
   *
   * // Your use case: Courses with specific allowed keys
   * const courseInfoSchema = z.object({
   *   professor: pz.StringRequired("Professor"),
   *   cfu: pz.NumberRequired("CFU")
   * });
   *
   * const coursesSchema = RecordRequired(courseInfoSchema, {
   *   msg: "Courses",
   *   allowedKeys: ["Computer Science", "Mathematics", "Literature"],
   *   requiredKeys: ["Computer Science", "Mathematics", "Literature"]
   * });
   *
   * coursesSchema.parse({
   *   "Computer Science": { professor: "Mary Jane", cfu: 12 },
   *   "Mathematics": { professor: "John Doe", cfu: 12 },
   *   "Literature": { professor: "Frank Purple", cfu: 12 }
   * }); // ✅ Valid
   *
   * // With boolean values
   * const featureFlags = RecordRequired(pz.BooleanRequired(), "Feature Flags");
   * featureFlags.parse({ darkMode: true, notifications: false }); // Valid
   *
   * // With constraints and required keys
   * const serverConfig = RecordRequired(pz.StringRequired(), {
   *   msg: "Server Configuration",
   *   minEntries: 1,
   *   requiredKeys: ["host", "port"]
   * });
   * serverConfig.parse({ host: "localhost", port: "3000" }); // Valid
   * serverConfig.parse({}); // throws ZodError (too few entries)
   * serverConfig.parse({ host: "localhost" }); // throws ZodError (missing required key 'port')
   */
  const RecordRequired = <TValue>(
    valueSchema: z.ZodType<TValue>,
    options: RecordSchemaOptions = {},
  ) => {
    const {
      msg = "Value",
      msgType = MsgType.FieldName,
      minEntries = 1,
      maxEntries,
      keyPattern,
      allowedKeys,
      requiredKeys,
    } = options;

    let schema = createBaseRecordSchema(valueSchema, msg, msgType)
      // Add a required check
      .refine((val) => val !== null && val !== undefined, {
        message: messageHandler.formatErrorMessage({
          group: "record",
          messageKey: "required",
          params: {},
          msg,
          msgType,
        }),
      });

    schema = addRecordConstraints(schema, messageHandler, msg, msgType, {
      minEntries,
      maxEntries,
      keyPattern,
      allowedKeys,
      requiredKeys,
    });

    return schema;
  };

  return {
    RecordOptional,
    RecordRequired,
  };
};

// --- String Parameter Overloads ---

/**
 * Factory function to create record schemas with string parameter overloads.
 * This enables the simplified API: RecordRequired(valueSchema, "Field Name")
 */
export const createRecordSchemasWithOverloads = (
  messageHandler: ErrorMessageFormatter,
) => {
  const {
    RecordOptional: baseRecordOptional,
    RecordRequired: baseRecordRequired,
  } = createRecordSchemas(messageHandler);

  // RecordOptional with overloads
  // eslint-disable-next-line @typescript-eslint/naming-convention
  function RecordOptional<TValue>(
    valueSchema: z.ZodType<TValue>,
  ): ReturnType<typeof baseRecordOptional>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  function RecordOptional<TValue>(
    valueSchema: z.ZodType<TValue>,
    msg: string,
  ): ReturnType<typeof baseRecordOptional>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  function RecordOptional<TValue>(
    valueSchema: z.ZodType<TValue>,
    options: RecordSchemaOptions,
  ): ReturnType<typeof baseRecordOptional>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  function RecordOptional<TValue>(
    valueSchema: z.ZodType<TValue>,
    msgOrOptions?: string | RecordSchemaOptions,
  ) {
    if (typeof msgOrOptions === "string") {
      return baseRecordOptional(valueSchema, { msg: msgOrOptions });
    }
    return baseRecordOptional(valueSchema, msgOrOptions);
  }

  // RecordRequired with overloads
  // eslint-disable-next-line @typescript-eslint/naming-convention
  function RecordRequired<TValue>(
    valueSchema: z.ZodType<TValue>,
  ): ReturnType<typeof baseRecordRequired>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  function RecordRequired<TValue>(
    valueSchema: z.ZodType<TValue>,
    msg: string,
  ): ReturnType<typeof baseRecordRequired>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  function RecordRequired<TValue>(
    valueSchema: z.ZodType<TValue>,
    options: RecordSchemaOptions,
  ): ReturnType<typeof baseRecordRequired>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  function RecordRequired<TValue>(
    valueSchema: z.ZodType<TValue>,
    msgOrOptions?: string | RecordSchemaOptions,
  ) {
    if (typeof msgOrOptions === "string") {
      return baseRecordRequired(valueSchema, { msg: msgOrOptions });
    }
    return baseRecordRequired(valueSchema, msgOrOptions);
  }

  return {
    RecordOptional,
    RecordRequired,
  };
};

// --- Testing Support ---

/**
 * Creates record schemas for testing purposes with a mock message handler.
 * This is used internally for testing and should not be used in production code.
 */
export const createTestRecordSchemas = () => {
  const testMessageHandler = createTestMessageHandler();
  return createRecordSchemasWithOverloads(testMessageHandler);
};

// Top-level exports for barrel usage
const testMessageHandler = createTestMessageHandler();
const recordSchemas = createRecordSchemasWithOverloads(testMessageHandler);

// Helper function with overloads to support both string and options object
function createRecordOptionalOverload<TValue>(
  valueSchema: z.ZodType<TValue>,
): ReturnType<typeof recordSchemas.RecordOptional>;
function createRecordOptionalOverload<TValue>(
  valueSchema: z.ZodType<TValue>,
  msg: string,
): ReturnType<typeof recordSchemas.RecordOptional>;
function createRecordOptionalOverload<TValue>(
  valueSchema: z.ZodType<TValue>,
  options: RecordSchemaOptions,
): ReturnType<typeof recordSchemas.RecordOptional>;
function createRecordOptionalOverload<TValue>(
  valueSchema: z.ZodType<TValue>,
  msgOrOptions?: string | RecordSchemaOptions,
): ReturnType<typeof recordSchemas.RecordOptional> {
  if (typeof msgOrOptions === "string") {
    return recordSchemas.RecordOptional(valueSchema, { msg: msgOrOptions });
  }
  return recordSchemas.RecordOptional(valueSchema, msgOrOptions || {});
}

function createRecordRequiredOverload<TValue>(
  valueSchema: z.ZodType<TValue>,
): ReturnType<typeof recordSchemas.RecordRequired>;
function createRecordRequiredOverload<TValue>(
  valueSchema: z.ZodType<TValue>,
  msg: string,
): ReturnType<typeof recordSchemas.RecordRequired>;
function createRecordRequiredOverload<TValue>(
  valueSchema: z.ZodType<TValue>,
  options: RecordSchemaOptions,
): ReturnType<typeof recordSchemas.RecordRequired>;
function createRecordRequiredOverload<TValue>(
  valueSchema: z.ZodType<TValue>,
  msgOrOptions?: string | RecordSchemaOptions,
): ReturnType<typeof recordSchemas.RecordRequired> {
  if (typeof msgOrOptions === "string") {
    return recordSchemas.RecordRequired(valueSchema, { msg: msgOrOptions });
  }
  return recordSchemas.RecordRequired(valueSchema, msgOrOptions || {});
}

export const RecordOptional = createRecordOptionalOverload;
export const RecordRequired = createRecordRequiredOverload;
