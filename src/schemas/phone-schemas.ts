import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import { trimOrUndefined, trimOrEmpty } from "../common/utils/string-utils";
import type { ErrorMessageFormatter } from "../localization/message-handler.types";
import type { PhoneSchemaOptions } from "../common/types/schema-options.types";
import {
  US_PHONE_E164_PATTERN,
  US_PHONE_NATIONAL_PATTERN} from "../common/regex-patterns";

import { normalizeUSPhone } from "../common/utils/phone-utils";

/**
 * Enum for supported phone number formats.
 */
export enum PhoneFormat {
  E164 = "e164",
  National = "national",
}

/**
 * Helper to normalize phone numbers to E.164 or 10-digit format.
 * @param val - The input phone number string
 * @param format - The desired phone format (E.164 or National)
 * @returns Normalized phone number or null if invalid
 */
function normalizePhone(val: string, format: PhoneFormat): string | null {
  return normalizeUSPhone(val, format);
}

// --- Types ---
// Note: These types reference the factory functions, so they need to be created from the factory
type PhoneSchemasFactory = ReturnType<typeof createPhoneSchemas>;
export type PhoneOptional = z.infer<ReturnType<PhoneSchemasFactory['zPhoneOptional']>>;
export type PhoneRequired = z.infer<ReturnType<PhoneSchemasFactory['zPhoneRequired']>>;

/**
 * Creates a factory function for phone schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing phone schema creation functions
 */
export const createPhoneSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Creates a base string schema for phone validation with consistent error messaging.
   * @param msg - The field name or custom message for error messages
   * @param msgType - The type of message formatting to use
   * @returns Base Zod string schema with error message
   */
  const createBasePhoneSchema = (msg: string, msgType: MsgType) => {
    return z.string({
      message: messageHandler.formatErrorMessage({
        group: "string",
        messageKey: "mustBeString",
        msg,
        msgType,
      }),
    });
  };

  /**
   * Creates a Zod schema for an optional phone number with customizable format and error messages.
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Phone".
   * @param options.msgType - The type of message formatting to use, based on `MsgType`. Defaults to `MsgType.FieldName`.
   * @param options.format - The desired phone format (E.164 or National). Defaults to `PhoneFormat.E164`.
   * @returns A Zod schema that validates an optional phone number and normalizes it to the specified format.
   *
   * @remarks
   * - The schema will transform undefined or empty values to undefined.
   * - Phone numbers are normalized using `normalizePhone` function.
   * - Custom error messages are generated using `messageHandler.formatErrorMessage`.
   *
   * @example
   * const { zPhoneOptional } = createPhoneSchemas(messageHandler);
   * const schema = zPhoneOptional({ msg: "Contact Phone", format: PhoneFormat.E164 });
   * schema.parse("123-456-7890"); // "+11234567890"
   * schema.parse(undefined);       // undefined
   * schema.parse("");              // undefined
   */
  const zPhoneOptional = (options: PhoneSchemaOptions = {}) => {
    const { msg = "Phone", msgType = MsgType.FieldName, format = PhoneFormat.E164 } = options;

    const supportedFormats = ["+11234567890", "1234567890"];
    const exampleParams = { e164: "+11234567890", national: "1234567890" };

    return createBasePhoneSchema(msg, msgType)
      .optional()
      .transform((val) => {
        const trimmed = trimOrEmpty(val);
        if (!trimmed) return undefined; // Return undefined if empty
        if (trimmed === "") return undefined;
        const normalized = normalizePhone(trimmed, format);
        // If normalization fails (returns null), keep the original value to trigger validation error
        return normalized === null ? trimmed : normalized;
      })
      // Must be valid phone (catch-all, e.g. not just format)
      .refine(
        (val) => val === undefined || val === "" || (typeof val === "string" && (US_PHONE_E164_PATTERN.test(val) || US_PHONE_NATIONAL_PATTERN.test(val))),
        {
          message: messageHandler.formatErrorMessage({
            group: "phone",
            messageKey: "mustBeValidPhone",
            params: { supportedFormats, ...exampleParams },
            msg,
            msgType,
          }),
        },
      )
      // Format-specific error
      .refine(
        (val) => val === undefined || val === "" || (format === PhoneFormat.E164
          ? US_PHONE_E164_PATTERN.test(val)
          : US_PHONE_NATIONAL_PATTERN.test(val)),
        {
          message: messageHandler.formatErrorMessage({
            group: "phone",
            messageKey: format === PhoneFormat.E164 ? "invalidE164Format" : "invalidNationalFormat",
            params: format === PhoneFormat.E164 ? { receivedFormat: "not-e164", ...exampleParams } : { country: "US", expectedFormat: "1234567890", ...exampleParams },
            msg,
            msgType,
          }),
        },
      )
      // Generic invalid
      .refine(
        (val) => val === undefined || val === "" || (typeof val === "string" && (US_PHONE_E164_PATTERN.test(val) || US_PHONE_NATIONAL_PATTERN.test(val))),
        {
          message: messageHandler.formatErrorMessage({
            group: "phone",
            messageKey: "invalid",
            params: {},
            msg,
            msgType,
          }),
        },
      )
      // Invalid format (not matching any known pattern)
      .refine(
        (val) => val === undefined || val === "" || (typeof val === "string" && (US_PHONE_E164_PATTERN.test(val) || US_PHONE_NATIONAL_PATTERN.test(val))),
        {
          message: messageHandler.formatErrorMessage({
            group: "phone",
            messageKey: "invalidFormat",
            params: { receivedFormat: "unknown", supportedFormats, ...exampleParams },
            msg,
            msgType,
          }),
        },
      );
  };

  /**
   * Creates a Zod schema for a required phone number with customizable format and error messages.
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Phone".
   * @param options.msgType - The type of message formatting to use, based on `MsgType`. Defaults to `MsgType.FieldName`.
   * @param options.format - The desired phone format (E.164 or National). Defaults to `PhoneFormat.E164`.
   * @returns A Zod schema that validates a required phone number and normalizes it to the specified format.
   *
   * @remarks
   * - The schema requires a non-empty phone number after trimming.
   * - Phone numbers are normalized using `normalizePhone` function.
   * - Custom error messages are generated using `messageHandler.formatErrorMessage`.
   *
   * @example
   * const { zPhoneRequired } = createPhoneSchemas(messageHandler);
   * const schema = zPhoneRequired({ msg: "Contact Phone", format: PhoneFormat.National });
   * schema.parse("123-456-7890"); // "1234567890"
   * schema.parse("");              // throws ZodError
   */
  const zPhoneRequired = (options: PhoneSchemaOptions = {}) => {
    const { msg = "Phone", msgType = MsgType.FieldName, format = PhoneFormat.E164 } = options;

    const supportedFormats = ["+11234567890", "1234567890"];
    const exampleParams = { e164: "+11234567890", national: "1234567890" };

    return createBasePhoneSchema(msg, msgType)
      .refine((val) => {
        const trimmed = trimOrEmpty(val);
        return trimmed.length > 0;
      }, {
        message: messageHandler.formatErrorMessage({
          group: "phone",
          messageKey: "required",
          msg,
          msgType,
        }),
      })
      .transform((val) => {
        const trimmed = trimOrUndefined(val);
        if (!trimmed) return "";
        const normalized = normalizePhone(trimmed, format);
        // If normalization fails (returns null), keep the original value to trigger validation error
        return normalized === null ? trimmed : normalized;
      })
      // Must be valid phone (catch-all, e.g. not just format)
      .refine(
        (val) => typeof val === "string" && (US_PHONE_E164_PATTERN.test(val) || US_PHONE_NATIONAL_PATTERN.test(val)),
        {
          message: messageHandler.formatErrorMessage({
            group: "phone",
            messageKey: "mustBeValidPhone",
            params: { supportedFormats, ...exampleParams },
            msg,
            msgType,
          }),
        },
      )
      // Format-specific error
      .refine(
        (val) => typeof val === "string" && (format === PhoneFormat.E164
          ? US_PHONE_E164_PATTERN.test(val)
          : US_PHONE_NATIONAL_PATTERN.test(val)),
        {
          message: messageHandler.formatErrorMessage({
            group: "phone",
            messageKey: format === PhoneFormat.E164 ? "invalidE164Format" : "invalidNationalFormat",
            params: format === PhoneFormat.E164 ? { receivedFormat: "not-e164", ...exampleParams } : { country: "US", expectedFormat: "1234567890", ...exampleParams },
            msg,
            msgType,
          }),
        },
      )
      // Generic invalid
      .refine(
        (val) => typeof val === "string" && (US_PHONE_E164_PATTERN.test(val) || US_PHONE_NATIONAL_PATTERN.test(val)),
        {
          message: messageHandler.formatErrorMessage({
            group: "phone",
            messageKey: "invalid",
            params: {},
            msg,
            msgType,
          }),
        },
      )
      // Invalid format (not matching any known pattern)
      .refine(
        (val) => typeof val === "string" && (US_PHONE_E164_PATTERN.test(val) || US_PHONE_NATIONAL_PATTERN.test(val)),
        {
          message: messageHandler.formatErrorMessage({
            group: "phone",
            messageKey: "invalidFormat",
            params: { receivedFormat: "unknown", supportedFormats, ...exampleParams },
            msg,
            msgType,
          }),
        },
      );
  };

  return {
    zPhoneOptional,
    zPhoneRequired,
  };
};

