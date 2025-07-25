import { z } from "zod";

import { trimOrEmpty } from "../common/utils/string-utils";
import { MsgType } from "./msg-type";
import type { ErrorMessageFormatter } from "../common/message-handler.types";
import type { StringMessageParams } from "../localization/message-params.types";


/**
 * Creates a factory function for string schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing string schema creation functions
 */
export const createStringSchemas = (messageHandler: ErrorMessageFormatter) => {

  /**
   * Creates a Zod schema for an optional trimmed string with customizable error messages and length constraints.
   *
   * @param msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param msgType - The type of message formatting to use, based on `MsgType`. Defaults to `MsgType.FieldName`.
   * @param minLength - Optional minimum length constraint for the string. If provided, validation will fail if the string is shorter.
   * @param maxLength - Optional maximum length constraint for the string. If provided, validation will fail if the string is longer.
   * @returns A Zod schema that validates an optional string, trims it, and applies length constraints if specified.
   *
   * @remarks
   * - The schema will transform undefined or empty values to an empty string.
   * - Custom error messages are generated using `messageHandler.formatErrorMessage`.
   * - Length constraints are only applied if the respective parameters are provided.
   *
   * @example
   * const { zStringOptional } = createStringSchemas(messageHandler);
   * const schema = zStringOptional("Display Name", MsgType.FieldName, 2, 10);
   * schema.parse("  John  "); // "John"
   * schema.parse(undefined);  // ""
   * schema.parse("");         // ""
   * schema.parse("A");        // throws ZodError (too short)
   * schema.parse("This name is too long"); // throws ZodError (too long)
   */
  const zStringOptional = (
    msg = "Value",
    msgType: MsgType = MsgType.FieldName,
    minLength?: number,
    maxLength?: number
  ) => {
    let schema = z
      .string({
        message: messageHandler.formatErrorMessage({
          msg,
          msgType,
          messageKey: "string.mustBeString",
          params: {} as StringMessageParams["mustBeString"],
        }),
      })
      .optional()
      .transform(trimOrEmpty)
      .refine(
        (val: string) => typeof val === "string",
        {
          message: messageHandler.formatErrorMessage({
            msg,
            msgType,
            messageKey: "string.invalid",
            // 'invalid' does not require params in StringMessageParams
            params: {},
          }),
        },
      );

    // Add length constraints if provided
    if (minLength !== undefined) {
      schema = schema.refine(
        (val: string) => !val || val.length >= minLength,
        {
          message: messageHandler.formatErrorMessage({
            msg,
            msgType,
            messageKey: "string.tooShort",
            params: { min: minLength } as StringMessageParams["tooShort"],
          }),
        },
      );
    }

    if (maxLength !== undefined) {
      schema = schema.refine(
        (val: string) => !val || val.length <= maxLength,
        {
          message: messageHandler.formatErrorMessage({
            msg,
            msgType,
            messageKey: "string.tooLong",
            params: { max: maxLength } as StringMessageParams["tooLong"],
          }),
        },
      );
    }

    return schema;
  };

  /**
   * Creates a Zod string schema that:
   * - Trims whitespace from the input string.
   * - Requires the string to be non-empty after trimming.
   * - Provides customizable error messages using the provided `msg` and `msgType`.
   *
   * @param msg - The base message or field name to use in error messages. Defaults to "Value".
   * @param msgType - The type of message formatting to use, based on the `MsgType` enum. Defaults to `MsgType.FieldName`.
   * @param minLength - Minimum length constraint (defaults to 1)
   * @param maxLength - Optional maximum length constraint
   * @returns A Zod string schema with trimming and required validation.
   *
   * @example
   * const { zStringRequired } = createStringSchemas(messageHandler);
   * const schema = zStringRequired("Username");
   * schema.parse("  alice  "); // "alice"
   * schema.parse("");          // throws ZodError
   * schema.parse("   ");       // throws ZodError
   */
  const zStringRequired = (
    msg = "Value",
    msgType: MsgType = MsgType.FieldName,
    minLength = 1,
    maxLength?: number
  ) => {
    let schema = z
      .string({
        message: messageHandler.formatErrorMessage({
          msg,
          msgType,
          messageKey: "string.mustBeString",
          params: {} as StringMessageParams["mustBeString"],
        }),
      })
      .transform((val) => val.trim())
      .refine(
        (trimmed: string) => trimmed.length > 0,
        {
          message: messageHandler.formatErrorMessage({
            msg,
            msgType,
            messageKey: "string.required",
            params: {} as StringMessageParams["required"],
          }),
        },
      );

    // Add minimum length validation if greater than 1
    if (minLength > 1) {
      schema = schema.refine(
        (val: string) => val.length >= minLength,
        {
          message: messageHandler.formatErrorMessage({
            msg,
            msgType,
            messageKey: "string.tooShort",
            params: { min: minLength } as StringMessageParams["tooShort"],
          }),
        },
      );
    }

    // Add maximum length validation if provided
    if (maxLength !== undefined) {
      schema = schema.refine(
        (val: string) => val.length <= maxLength,
        {
          message: messageHandler.formatErrorMessage({
            msg,
            msgType,
            messageKey: "string.tooLong",
            params: { max: maxLength } as StringMessageParams["tooLong"],
          }),
        },
      );
    }

    return schema;
  };

  return {
    zStringOptional,
    zStringRequired,
  };
};

/**
 * Individual schema creation functions that accept messageHandler as first parameter
 */

/**
 * Creates a Zod schema for an optional string value with custom error messaging.
 * @param messageHandler - The message handler to use for error messages
 * @param msg - The base error message to display if validation fails
 * @param msgType - The type of message formatting to use
 * @param minLength - Optional minimum length constraint
 * @param maxLength - Optional maximum length constraint
 */
export const zStringOptional = (
  messageHandler: ErrorMessageFormatter,
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
  minLength?: number,
  maxLength?: number
) => {
  return createStringSchemas(messageHandler).zStringOptional(msg, msgType, minLength, maxLength);
};

/**
 * Creates a Zod string schema with trimming and required validation.
 * @param messageHandler - The message handler to use for error messages
 * @param msg - The base message or field name to use in error messages
 * @param msgType - The type of message formatting to use
 * @param minLength - Minimum length constraint (defaults to 1)
 * @param maxLength - Optional maximum length constraint
 */
export const zStringRequired = (
  messageHandler: ErrorMessageFormatter,
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
  minLength = 1,
  maxLength?: number
) => {
  return createStringSchemas(messageHandler).zStringRequired(msg, msgType, minLength, maxLength);
};
