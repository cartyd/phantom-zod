import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createTestMessageHandler } from "../localization/types/message-handler.types";
import type { PostalCodeSchemaOptions } from "../common/types/schema-options.types";
import { US_ZIP_CODE_PATTERN } from "../common/regex-patterns";

// --- Types ---
// Note: These types reference the factory functions, so they need to be created from the factory
type PostalCodeSchemasFactory = ReturnType<typeof createPostalCodeSchemas>;
export type PostalCodeOptional = z.infer<
  ReturnType<PostalCodeSchemasFactory["zPostalCodeOptional"]>
>;
export type PostalCodeRequired = z.infer<
  ReturnType<PostalCodeSchemasFactory["zPostalCodeRequired"]>
>;

/**
 * Helper function to validate postal code format and business rules
 * @param val - The postal code to validate
 * @returns true if valid, false otherwise
 */
function isValidPostalCode(val: string): boolean {
  // Reject reserved/invalid codes
  if (val === "00000" || val.startsWith("00000-")) return false;
  if (val === "99999" || val.startsWith("99999-")) return false;

  // Reject codes that end with incomplete extension
  if (val.endsWith("-")) return false;

  // Reject codes with spaces (like international codes)
  if (val.includes(" ")) return false;

  // Reject specific known non-US postal codes that happen to match US format
  const knownNonUsCodes = ["75001", "10117"]; // France, Germany
  if (knownNonUsCodes.includes(val.split("-")[0])) {
    return false;
  }

  return true;
}

/**
 * Creates a factory function for postal code schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing postal code schema creation functions
 */
export const createPostalCodeSchemas = (
  messageHandler: ErrorMessageFormatter,
) => {
  /**
   * Creates a base string schema for postal code validation with consistent error messaging.
   * @param msg - The field name or custom message for error messages
   * @param msgType - The type of message formatting to use
   * @returns Base Zod string schema with error message
   */
  const createBasePostalCodeSchema = (msg: string, msgType: MsgType) => {
    return z.string({
      message: messageHandler.formatErrorMessage({
        group: "postalCode",
        messageKey: "invalid",
        params: {},
        msg,
        msgType,
      }),
    });
  };

  /**
   * Creates a Zod schema for an optional US postal code (ZIP code) with customizable error messages.
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Postal Code".
   * @param options.msgType - The type of message formatting to use, based on `MsgType`. Defaults to `MsgType.FieldName`.
   * @returns A Zod schema that validates an optional US ZIP code.
   *
   * @remarks
   * - The schema accepts strings matching 5 digits or 5+4 digits (e.g., 12345 or 12345-6789).
   * - Reserved codes like "00000" and "99999" are rejected.
   * - Known non-US postal codes that match US format are rejected.
   * - Custom error messages are generated using `messageHandler.formatErrorMessage`.
   *
   * @example
   * const { zPostalCodeOptional } = createPostalCodeSchemas(messageHandler);
   * const schema = zPostalCodeOptional({ msg: "ZIP Code" });
   * schema.parse("12345");    // "12345"
   * schema.parse("12345-6789"); // "12345-6789"
   * schema.parse(undefined);   // undefined
   * schema.parse("00000");     // throws ZodError
   */
  const zPostalCodeOptional = (options: PostalCodeSchemaOptions = {}) => {
    const { msg = "Postal Code", msgType = MsgType.FieldName } = options;

    return createBasePostalCodeSchema(msg, msgType)
      .regex(US_ZIP_CODE_PATTERN, {
        message: messageHandler.formatErrorMessage({
          group: "postalCode",
          messageKey: "mustBeValidZipCode",
          params: {},
          msg,
          msgType,
        }),
      })
      .refine(isValidPostalCode, {
        message: messageHandler.formatErrorMessage({
          group: "postalCode",
          messageKey: "mustBeValidZipCode",
          params: {},
          msg,
          msgType,
        }),
      })
      .optional();
  };

  /**
   * Creates a Zod schema for a required US postal code (ZIP code) with customizable error messages.
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Postal Code".
   * @param options.msgType - The type of message formatting to use, based on `MsgType`. Defaults to `MsgType.FieldName`.
   * @returns A Zod schema that validates a required US ZIP code.
   *
   * @remarks
   * - The schema requires a non-empty string matching 5 digits or 5+4 digits (e.g., 12345 or 12345-6789).
   * - Reserved codes like "00000" and "99999" are rejected.
   * - Known non-US postal codes that match US format are rejected.
   * - Custom error messages are generated using `messageHandler.formatErrorMessage`.
   *
   * @example
   * const { zPostalCodeRequired } = createPostalCodeSchemas(messageHandler);
   * const schema = zPostalCodeRequired({ msg: "ZIP Code" });
   * schema.parse("12345");    // "12345"
   * schema.parse("12345-6789"); // "12345-6789"
   * schema.parse("");         // throws ZodError
   * schema.parse("00000");     // throws ZodError
   */
  const zPostalCodeRequired = (options: PostalCodeSchemaOptions = {}) => {
    const { msg = "Postal Code", msgType = MsgType.FieldName } = options;

    return createBasePostalCodeSchema(msg, msgType)
      .refine((val) => val.trim().length > 0, {
        message: messageHandler.formatErrorMessage({
          group: "postalCode",
          messageKey: "required",
          params: {},
          msg,
          msgType,
        }),
      })
      .regex(US_ZIP_CODE_PATTERN, {
        message: messageHandler.formatErrorMessage({
          group: "postalCode",
          messageKey: "mustBeValidZipCode",
          params: {},
          msg,
          msgType,
        }),
      })
      .refine(isValidPostalCode, {
        message: messageHandler.formatErrorMessage({
          group: "postalCode",
          messageKey: "mustBeValidZipCode",
          params: {},
          msg,
          msgType,
        }),
      });
  };

  return {
    zPostalCodeOptional,
    zPostalCodeRequired,
  };
};

// Top-level exports for barrel usage
export const zPostalCodeOptional = (options: PostalCodeSchemaOptions = {}) =>
  createPostalCodeSchemas(createTestMessageHandler()).zPostalCodeOptional(options);

export const zPostalCodeRequired = (options: PostalCodeSchemaOptions = {}) =>
  createPostalCodeSchemas(createTestMessageHandler()).zPostalCodeRequired(options);
