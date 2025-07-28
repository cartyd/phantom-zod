import { z } from "zod";

import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { trimOrEmpty } from "../common/utils/string-utils";
import { MsgType } from "../common/types/msg-type";
import type { StringSchemaOptions } from "../common/types/schema-options.types";

// --- Types ---
// Note: These types reference the factory functions, so they need to be created from the factory
type StringSchemasFactory = ReturnType<typeof createStringSchemas>;
export type StringOptional = z.infer<
  ReturnType<StringSchemasFactory["zStringOptional"]>
>;
export type StringRequired = z.infer<
  ReturnType<StringSchemasFactory["zStringRequired"]>
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
   * Creates a base string schema with consistent error messaging.
   * @param msg - The field name or custom message for error messages
   * @param msgType - The type of message formatting to use
   * @returns Base Zod string schema with error message
   */
  const createBaseStringSchema = (msg: string, msgType: MsgType) => {
    // Custom refinement to provide receivedType for mustBeString
    return z.custom((val) => typeof val === "string", {
      message: messageHandler.formatErrorMessage({
        group: "string",
        messageKey: "mustBeString",
        params: { receivedType: undefined }, // fallback, see below
        msg,
        msgType,
      }),
    }) as z.ZodType<string, any, any>;
  };

  /**
   * Creates a Zod schema for an optional trimmed string with customizable error messages and length constraints.
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use, based on `MsgType`. Defaults to `MsgType.FieldName`.
   * @param options.minLength - Optional minimum length constraint for the string. If provided, validation will fail if the string is shorter.
   * @param options.maxLength - Optional maximum length constraint for the string. If provided, validation will fail if the string is longer.
   * @returns A Zod schema that validates an optional string, trims it, and applies length constraints if specified.
   *
   * @remarks
   * - The schema will transform undefined or empty values to an empty string.
   * - Custom error messages are generated using `messageHandler.formatErrorMessage`.
   * - Length constraints are only applied if the respective parameters are provided.
   *
   * @example
   * const { zStringOptional } = createStringSchemas(messageHandler);
   * const schema = zStringOptional({ msg: "Display Name", minLength: 2, maxLength: 10 });
   * schema.parse("  John  "); // "John"
   * schema.parse(undefined);  // ""
   * schema.parse("");         // ""
   * schema.parse("A");        // throws ZodError (too short)
   * schema.parse("This name is too long"); // throws ZodError (too long)
   */
  const zStringOptional = (options: StringSchemaOptions = {}) => {
    const {
      msg = "Value",
      msgType = MsgType.FieldName,
      minLength,
      maxLength,
    } = options;

    let schema = createBaseStringSchema(msg, msgType)
      .optional()
      .transform(trimOrEmpty);

    schema = addLengthConstraints(
      schema,
      messageHandler,
      msg,
      msgType,
      minLength,
      maxLength,
    );
    return schema;
  };

  /**
   * Creates a Zod string schema that:
   * - Trims whitespace from the input string.
   * - Requires the string to be non-empty after trimming.
   * - Provides customizable error messages using the provided options.
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The base message or field name to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use, based on the `MsgType` enum. Defaults to `MsgType.FieldName`.
   * @param options.minLength - Minimum length constraint (defaults to 1)
   * @param options.maxLength - Optional maximum length constraint
   * @returns A Zod string schema with trimming and required validation.
   *
   * @example
   * const { zStringRequired } = createStringSchemas(messageHandler);
   * const schema = zStringRequired({ msg: "Username", minLength: 3 });
   * schema.parse("  alice  "); // "alice"
   * schema.parse("");          // throws ZodError
   * schema.parse("   ");       // throws ZodError
   */
  const zStringRequired = (options: StringSchemaOptions = {}) => {
    const {
      msg = "Value",
      msgType = MsgType.FieldName,
      minLength = 1,
      maxLength,
    } = options;
    let schema = createBaseStringSchema(msg, msgType)
      .transform(trimOrEmpty)
      // 'required' error if empty after trim
      .refine((trimmed: string) => trimmed.length > 0, {
        message: messageHandler.formatErrorMessage({
          group: "string",
          messageKey: "required",
          params: {},
          msg,
          msgType,
        }),
      })
      // 'cannotBeEmpty' error if value is empty string (before trim, using .refine for Zod v4+)
      .refine((val) => val !== "", {
        message: messageHandler.formatErrorMessage({
          group: "string",
          messageKey: "cannotBeEmpty",
          params: {},
          msg,
          msgType,
        }),
        path: [],
      });

    schema = addLengthConstraints(
      schema,
      messageHandler,
      msg,
      msgType,
      minLength,
      maxLength,
    );
    return schema;
  };

  return {
    zStringOptional,
    zStringRequired,
  };
};
