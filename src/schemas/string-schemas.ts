import { z } from "zod";

import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createTestMessageHandler } from "../localization/types/message-handler.types";
import { MsgType } from "../common/types/msg-type";
import type { StringSchemaOptions } from "../common/types/schema-options.types";

// --- Types ---
// Note: These types reference the factory functions, so they need to be created from the factory
type StringSchemasFactory = ReturnType<typeof createStringSchemas>;
export type StringOptional = z.infer<
  ReturnType<StringSchemasFactory["StringOptional"]>
>;
export type StringRequired = z.infer<
  ReturnType<StringSchemasFactory["StringRequired"]>
>;

/**
 * Adds minimum and/or maximum length constraints to a Zod schema for strings.
 *
 * This function refines the provided schema by enforcing the specified `minLength` and/or `maxLength`
 * constraints. If a constraint is violated, a formatted error message is generated using the provided
 * `messageHandler`. If the value is not a string or is falsy, the constraint is not enforced.
 *
 * @template TSchema - A Zod schema type.
 * @param schema - The Zod schema to which length constraints will be added.
 * @param messageHandler - An error message formatter used to generate error messages.
 * @param msg - A custom message to include in the error.
 * @param msgType - The type of message (used for formatting).
 * @param minLength - The minimum allowed string length (optional).
 * @param maxLength - The maximum allowed string length (optional).
 * @returns The refined schema with length constraints applied.
 */
function addLengthConstraints<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  messageHandler: ErrorMessageFormatter,
  msg: string,
  msgType: MsgType,
  minLength?: number,
  maxLength?: number,
): TSchema {
  let result = schema;
  if (minLength !== undefined) {
    result = result.refine(
      (val: unknown) => {
        if (!val || typeof val !== "string") return true;
        return val.length >= minLength;
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "string",
          messageKey: "tooShort",
          params: { min: minLength },
          msg,
          msgType,
        }),
      },
    ) as TSchema;
  }
  if (maxLength !== undefined) {
    result = result.refine(
      (val: unknown) => {
        if (!val || typeof val !== "string") return true;
        return val.length <= maxLength;
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "string",
          messageKey: "tooLong",
          params: { max: maxLength },
          msg,
          msgType,
        }),
      },
    ) as TSchema;
  }
  return result;
}

/**
 * Creates a factory function for string schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing string schema creation functions
 */
export const createStringSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Helper function to create error messages for different validation types
   * @param messageKey - The type of validation error
   * @param params - Additional parameters for the error message
   * @param msg - The field name or custom message
   * @param msgType - The message formatting type
   * @returns Formatted error message
   */
  const createErrorMessage = (
    messageKey: keyof import("../localization/types/message-params.types").StringMessageParams,
    params: Record<string, unknown>,
    msg: string,
    msgType: MsgType,
  ): string => {
    return messageHandler.formatErrorMessage({
      group: "string",
      messageKey,
      params,
      msg,
      msgType,
    });
  };

  /**
   * Creates a Zod schema for an optional trimmed string with native Zod chaining support.
   *
   * This schema supports both legacy options-based configuration and modern chainable methods.
   * When using chaining, undefined values will be handled by .default() or remain undefined.
   * For backward compatibility, when no chaining is used, undefined is preserved as undefined.
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use, based on `MsgType`. Defaults to `MsgType.FieldName`.
   * @param options.minLength - Optional minimum length constraint for the string. If provided, validation will fail if the string is shorter.
   * @param options.maxLength - Optional maximum length constraint for the string. If provided, validation will fail if the string is longer.
   * @returns A Zod schema that validates an optional string, trims it, and applies length constraints if specified.
   *
   * @remarks
   * - The schema will transform undefined to undefined, and trim whitespace from strings.
   * - Empty strings remain as empty strings, whitespace-only strings become empty strings.
   * - Custom error messages are generated using `messageHandler.formatErrorMessage`.
   * - Length constraints are only applied if the respective parameters are provided.
   *
   * @example
   * const { StringOptional } = createStringSchemas(messageHandler);
   * const schema = StringOptional({ msg: "Display Name", minLength: 2, maxLength: 10 });
   * schema.parse("  John  "); // "John"
   * schema.parse(undefined);  // undefined
   * schema.parse("");         // ""
   * schema.parse("   ");      // ""
   * schema.parse("A");        // throws ZodError (too short)
   * schema.parse("This name is too long"); // throws ZodError (too long)
   *
   * // Modern chainable approach (use .default() to handle undefined)
   * const schema2 = StringOptional({ msg: "Display Name" }).min(2).max(10).default("");
   *
   * // Mixed approach with custom default
   * const schema3 = StringOptional({ msg: "Display Name" }).min(2).max(10).default("John");
   */
  const StringOptional = (options: StringSchemaOptions = {}) => {
    const {
      msg = "Value",
      msgType = MsgType.FieldName,
      minLength,
      maxLength,
    } = options;

    // Check if legacy constraints are provided
    const hasLegacyConstraints =
      minLength !== undefined || maxLength !== undefined;

    if (hasLegacyConstraints) {
      // Legacy path: use transform and refine (breaks chaining but maintains compatibility)
      let schema = z
        .string({
          message:
            msgType === MsgType.Message ? msg : `${msg} must be a string`,
        })
        .trim()
        .optional()
        .transform((val: string | undefined) => {
          // FIX: Preserve undefined instead of converting to empty string
          if (val === undefined) return undefined;
          return val; // String is already trimmed
        });

      // Apply legacy constraints
      schema = addLengthConstraints(
        schema,
        messageHandler,
        msg,
        msgType,
        minLength,
        maxLength,
      );

      return schema;
    } else {
      // Modern chainable path: return optional string that supports chaining
      // Important: For chaining support, undefined values stay undefined
      // Use .default("") if you want empty string behavior
      const schema = z
        .string({
          message:
            msgType === MsgType.Message ? msg : `${msg} must be a string`,
        })
        .trim()
        .optional(); // Remove .default("") to preserve undefined

      return schema;
    }
  };

  /**
   * Creates a Zod string schema with native chaining support that requires non-empty content.
   *
   * This schema supports both legacy options-based configuration and modern chainable methods.
   * It automatically trims whitespace and validates that the result is non-empty.
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The base message or field name to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use, based on the `MsgType` enum. Defaults to `MsgType.FieldName`.
   * @param options.minLength - Minimum length constraint (defaults to 1)
   * @param options.maxLength - Optional maximum length constraint
   * @returns A Zod schema that supports native chaining (.min(), .max(), .default(), etc.)
   *
   * @example
   * // Legacy options approach
   * const schema1 = StringRequired({ msg: "Username", minLength: 3, maxLength: 20 });
   *
   * // Modern chainable approach
   * const schema2 = StringRequired({ msg: "Username" }).min(3).max(20);
   *
   * // Mixed approach with default
   * const schema3 = StringRequired({ msg: "Username" }).min(3).max(20).default("user");
   */
  const StringRequired = (options: StringSchemaOptions = {}) => {
    const {
      msg = "Value",
      msgType = MsgType.FieldName,
      minLength,
      maxLength,
    } = options;

    // Check if legacy constraints are provided
    const hasLegacyConstraints =
      minLength !== undefined || maxLength !== undefined;

    if (hasLegacyConstraints) {
      // Legacy path with custom error messages
      let schema = z
        .string({
          message:
            msgType === MsgType.Message ? msg : `${msg} must be a string`,
        })
        .trim()
        .min(1, {
          message: createErrorMessage("required", {}, msg, msgType),
        });

      // Apply legacy constraints
      schema = addLengthConstraints(
        schema,
        messageHandler,
        msg,
        msgType,
        minLength,
        maxLength,
      );

      return schema;
    } else {
      // Modern path with custom required error message
      const schema = z
        .string({
          message:
            msgType === MsgType.Message ? msg : `${msg} must be a string`,
        })
        .trim()
        .min(1, {
          message: createErrorMessage("required", {}, msg, msgType),
        });

      return schema;
    }
  };

  return {
    StringOptional,
    StringRequired,
  };
};

// Top-level exports for barrel usage
const testMessageHandler = createTestMessageHandler();
const stringSchemas = createStringSchemas(testMessageHandler);

// Helper function with overloads to support both string and options object
function createStringOptionalOverload(
  msg: string,
): ReturnType<typeof stringSchemas.StringOptional>;
function createStringOptionalOverload(
  options?: StringSchemaOptions,
): ReturnType<typeof stringSchemas.StringOptional>;
function createStringOptionalOverload(
  msgOrOptions?: string | StringSchemaOptions,
): ReturnType<typeof stringSchemas.StringOptional> {
  if (typeof msgOrOptions === "string") {
    return stringSchemas.StringOptional({ msg: msgOrOptions });
  }
  return stringSchemas.StringOptional(msgOrOptions);
}

function createStringRequiredOverload(
  msg: string,
): ReturnType<typeof stringSchemas.StringRequired>;
function createStringRequiredOverload(
  options?: StringSchemaOptions,
): ReturnType<typeof stringSchemas.StringRequired>;
function createStringRequiredOverload(
  msgOrOptions?: string | StringSchemaOptions,
): ReturnType<typeof stringSchemas.StringRequired> {
  if (typeof msgOrOptions === "string") {
    return stringSchemas.StringRequired({ msg: msgOrOptions });
  }
  return stringSchemas.StringRequired(msgOrOptions);
}

export const StringOptional = createStringOptionalOverload;
export const StringRequired = createStringRequiredOverload;
