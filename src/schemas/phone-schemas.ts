import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import { trimOrUndefined, trimOrEmpty } from "../common/utils/string-utils";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createTestMessageHandler } from "../localization/types/message-handler.types";
import type { PhoneSchemaOptions } from "../common/types/schema-options.types";
import {
  US_PHONE_E164_PATTERN,
  US_PHONE_NATIONAL_PATTERN,
} from "../common/regex-patterns";

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
export type PhoneOptional = z.infer<
  ReturnType<PhoneSchemasFactory["PhoneOptional"]>
>;
export type PhoneRequired = z.infer<
  ReturnType<PhoneSchemasFactory["PhoneRequired"]>
>;

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
  const createBasePhoneSchema = (
    msg: string,
    msgType: MsgType,
  ): z.ZodTypeAny => {
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
   * const { PhoneOptional } = createPhoneSchemas(messageHandler);
   * const schema = PhoneOptional({ msg: "Contact Phone", format: PhoneFormat.E164 });
   * schema.parse("123-456-7890"); // "+11234567890"
   * schema.parse(undefined);       // undefined
   * schema.parse("");              // undefined
   */
  const PhoneOptional = (options: PhoneSchemaOptions = {}): z.ZodTypeAny => {
    const {
      msg = "Phone",
      msgType = MsgType.FieldName,
      format = PhoneFormat.E164,
    } = options;

    const supportedFormats = ["+11234567890", "1234567890"];
    const exampleParams = { e164: "+11234567890", national: "1234567890" };

    return (
      createBasePhoneSchema(msg, msgType)
        .optional()
        .transform((val) => {
          const trimmed = trimOrEmpty(val as string);
          if (!trimmed) return undefined; // Return undefined if empty
          if (trimmed === "") return undefined;
          const normalized = normalizePhone(trimmed, format);
          // If normalization fails (returns null), keep the original value to trigger validation error
          return normalized === null ? trimmed : normalized;
        })
        // Must be valid phone format
        .refine(
          (val) =>
            val === undefined ||
            val === "" ||
            (typeof val === "string" &&
              (US_PHONE_E164_PATTERN.test(val) ||
                US_PHONE_NATIONAL_PATTERN.test(val))),
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
   * const { PhoneRequired } = createPhoneSchemas(messageHandler);
   * const schema = PhoneRequired({ msg: "Contact Phone", format: PhoneFormat.National });
   * schema.parse("123-456-7890"); // "1234567890"
   * schema.parse("");              // throws ZodError
   */
  const PhoneRequired = (options: PhoneSchemaOptions = {}): z.ZodTypeAny => {
    const {
      msg = "Phone",
      msgType = MsgType.FieldName,
      format = PhoneFormat.E164,
    } = options;

    const supportedFormats = ["+11234567890", "1234567890"];
    const exampleParams = { e164: "+11234567890", national: "1234567890" };

    return (
      createBasePhoneSchema(msg, msgType)
        .refine(
          (val) => {
            const trimmed = trimOrEmpty(val as string);
            return trimmed.length > 0;
          },
          {
            message: messageHandler.formatErrorMessage({
              group: "phone",
              messageKey: "required",
              msg,
              msgType,
            }),
          },
        )
        .transform((val) => {
          const trimmed = trimOrUndefined(val as string);
          if (!trimmed) return "";
          const normalized = normalizePhone(trimmed, format);
          // If normalization fails (returns null), keep the original value to trigger validation error
          return normalized === null ? trimmed : normalized;
        })
        // Must be valid phone format
        .refine(
          (val) =>
            typeof val === "string" &&
            (US_PHONE_E164_PATTERN.test(val) ||
              US_PHONE_NATIONAL_PATTERN.test(val)),
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
    );
  };

  return {
    PhoneOptional,
    PhoneRequired,
  };
};

// Top-level exports using test message handler
const testMessageHandler = createTestMessageHandler();
const phoneSchemas = createPhoneSchemas(testMessageHandler);

// Type aliases for clean overload signatures
type PhoneOptionalSchema = ReturnType<typeof phoneSchemas.PhoneOptional>;
type PhoneRequiredSchema = ReturnType<typeof phoneSchemas.PhoneRequired>;

// Clean overload implementations
function phoneOptionalOverload(msg: string): PhoneOptionalSchema;
function phoneOptionalOverload(
  options?: PhoneSchemaOptions,
): PhoneOptionalSchema;
function phoneOptionalOverload(
  msgOrOptions?: string | PhoneSchemaOptions,
): PhoneOptionalSchema {
  if (typeof msgOrOptions === "string") {
    return phoneSchemas.PhoneOptional({ msg: msgOrOptions });
  }
  return phoneSchemas.PhoneOptional(msgOrOptions);
}

function phoneRequiredOverload(msg: string): PhoneRequiredSchema;
function phoneRequiredOverload(
  options?: PhoneSchemaOptions,
): PhoneRequiredSchema;
function phoneRequiredOverload(
  msgOrOptions?: string | PhoneSchemaOptions,
): PhoneRequiredSchema {
  if (typeof msgOrOptions === "string") {
    return phoneSchemas.PhoneRequired({ msg: msgOrOptions });
  }
  return phoneSchemas.PhoneRequired(msgOrOptions);
}

export const PhoneOptional = phoneOptionalOverload;
export const PhoneRequired = phoneRequiredOverload;
