import { z } from "zod";

import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { MsgType } from "../common/types/msg-type";
import type { BaseSchemaOptions } from "../common/types/schema-options.types";

// --- Types ---
// Note: These types reference the factory functions, so they need to be created from the factory
type BooleanSchemasFactory = ReturnType<typeof createBooleanSchemas>;
export type BooleanOptional = z.infer<
  ReturnType<BooleanSchemasFactory["zBooleanOptional"]>
>;
export type BooleanRequired = z.infer<
  ReturnType<BooleanSchemasFactory["zBooleanRequired"]>
>;
export type BooleanStringOptional = z.infer<
  ReturnType<BooleanSchemasFactory["zBooleanStringOptional"]>
>;
export type BooleanStringRequired = z.infer<
  ReturnType<BooleanSchemasFactory["zBooleanStringRequired"]>
>;

/**
 * Creates a factory function for boolean schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing boolean schema creation functions
 */
export const createBooleanSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Creates a Zod schema that validates an optional boolean value.
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use, based on `MsgType`. Defaults to `MsgType.FieldName`.
   * @returns A Zod schema that validates an optional boolean value.
   *
   * @example
   * const { zBooleanOptional } = createBooleanSchemas(messageHandler);
   * const schema = zBooleanOptional({ msg: "Is Active" });
   * schema.parse(true);      // true
   * schema.parse(false);     // false
   * schema.parse(undefined); // undefined
   */
  const zBooleanOptional = (options: BaseSchemaOptions = {}) => {
    const { msg = "Value", msgType = MsgType.FieldName } = options;
    return z
      .unknown()
      .refine((val) => val === undefined || typeof val === "boolean", {
        message: messageHandler.formatErrorMessage({
          group: "boolean",
          messageKey: "mustBeBoolean",
          msg,
          msgType,
        }),
      })
      .transform((val) => (val === undefined ? undefined : Boolean(val)));
  };

  /**
   * Creates a Zod schema that validates if the input is a boolean value.
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use, based on `MsgType`. Defaults to `MsgType.FieldName`.
   * @returns A Zod schema that validates a required boolean value.
   *
   * @example
   * const { zBooleanRequired } = createBooleanSchemas(messageHandler);
   * const schema = zBooleanRequired({ msg: "Agreed to Terms" });
   * schema.parse(true);  // true
   * schema.parse(false); // false
   * schema.parse(null);  // throws ZodError
   */
  const zBooleanRequired = (options: BaseSchemaOptions = {}) => {
    const { msg = "Value", msgType = MsgType.FieldName } = options;
    return z
      .unknown()
      .refine((val) => typeof val === "boolean", {
        message: messageHandler.formatErrorMessage({
          group: "boolean",
          messageKey: "mustBeBoolean",
          msg,
          msgType,
        }),
      })
      .transform((val) => Boolean(val));
  };

  /**
   * Creates a Zod schema that validates if the input is a boolean or a string "true"/"false".
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use, based on `MsgType`. Defaults to `MsgType.FieldName`.
   * @returns A Zod schema that validates a boolean or string representation and returns a string.
   *
   * @example
   * const { zBooleanStringRequired } = createBooleanSchemas(messageHandler);
   * const schema = zBooleanStringRequired({ msg: "Feature Flag" });
   * schema.parse(true);     // "true"
   * schema.parse(false);    // "false"
   * schema.parse("true");   // "true"
   * schema.parse("false");  // "false"
   * schema.parse("yes");    // throws ZodError
   */
  const zBooleanStringRequired = (options: BaseSchemaOptions = {}) => {
    const { msg = "Value", msgType = MsgType.FieldName } = options;
    return baseBooleanStringSchema
      .refine(
        (val) =>
          typeof val === "boolean" ||
          (typeof val === "string" &&
            ["true", "false"].includes(val.trim().toLowerCase())),
        {
          message: messageHandler.formatErrorMessage({
            group: "boolean",
            messageKey: "mustBeBooleanString",
            msg,
            msgType,
          }),
        },
      )
      .transform((val) =>
        typeof val === "boolean"
          ? val
            ? "true"
            : "false"
          : val.trim().toLowerCase(),
      );
  };

  /**
   * Creates a Zod schema that validates an optional boolean value represented as a string.
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use, based on `MsgType`. Defaults to `MsgType.FieldName`.
   * @returns A Zod schema that validates an optional boolean string value.
   *
   * @example
   * const { zBooleanStringOptional } = createBooleanSchemas(messageHandler);
   * const schema = zBooleanStringOptional({ msg: "Newsletter Subscription" });
   * schema.parse(true);      // "true"
   * schema.parse("false");   // "false"
   * schema.parse(undefined); // undefined
   */
  const zBooleanStringOptional = (options: BaseSchemaOptions = {}) => {
    return zBooleanStringRequired(options).optional();
  };

  return {
    zBooleanOptional,
    zBooleanRequired,
    zBooleanStringRequired,
    zBooleanStringOptional,
  };
};

const baseBooleanStringSchema = z.union([z.string(), z.boolean()]);
