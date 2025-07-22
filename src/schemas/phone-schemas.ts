import { z } from "zod";
import { MsgType } from "./msg-type";
import { trimOrUndefined, trimOrEmpty } from "../utils/string-utils";
import { formatErrorMessage } from "./message-handler";
import {
  US_PHONE_E164_PATTERN,
  US_PHONE_NATIONAL_PATTERN,
  US_PHONE_11_DIGIT_PATTERN,
  NON_DIGITS
} from "../common/regex-patterns";
import { normalizeUSPhone, phoneTransformAndValidate, phoneRefine } from "../utils/phone-utils";

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

/**
 * Optional US phone number schema, normalized to E.164 or 10-digit format.
 * @param msg - The field name or custom message for error output.
 * @param format - The desired phone format (E.164 or National).
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 */
export const zPhoneOptional = (
  msg = "Phone",
  format: PhoneFormat = PhoneFormat.E164,
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .optional()
    .transform((val) => {
      const trimmed = trimOrEmpty(val);
      if (!trimmed) return undefined; // Return undefined if empty
      if (trimmed === "") return undefined;
      const normalized = normalizePhone(trimmed, format);
      // If normalization fails (returns null), keep the original value to trigger validation error
      return normalized === null ? trimmed : normalized;
    })
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        (format === PhoneFormat.E164
          ? US_PHONE_E164_PATTERN.test(val)
          : US_PHONE_NATIONAL_PATTERN.test(val)),
      {
        message: formatErrorMessage(
          msg,
          msgType,
          format === PhoneFormat.E164
            ? "is invalid. Example of valid format: +11234567890"
            : "is invalid. Example of valid format: 1234567890"
        ),
      },
    );

/**
 * Required US phone number schema, normalized to E.164 or 10-digit format.
 * @param msg - The field name or custom message for error output.
 * @param format - The desired phone format (E.164 or National).
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 */
export const zPhoneRequired = (
  msg = "Phone",
  format: PhoneFormat = PhoneFormat.E164,
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .nonempty({
      message: formatErrorMessage(msg, msgType, "is required"),
    })
    .transform((val) => {
      const trimmed = trimOrUndefined(val);
      if (!trimmed) return "";
      const normalized = normalizePhone(trimmed, format);
      // If normalization fails (returns null), keep the original value to trigger validation error
      return normalized === null ? trimmed : normalized;
    })
    .refine(
      (val) =>
        typeof val === "string" &&
        (format === PhoneFormat.E164
          ? US_PHONE_E164_PATTERN.test(val)
          : US_PHONE_NATIONAL_PATTERN.test(val)),
      {
        message: formatErrorMessage(
          msg,
          msgType,
          format === PhoneFormat.E164
            ? "is invalid. Example of valid format: +11234567890"
            : "is invalid. Example of valid format: 1234567890"
        ),
      },
    );
// ...existing code...
