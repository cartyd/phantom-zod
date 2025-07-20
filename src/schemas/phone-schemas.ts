import { z } from "zod";
import { MsgType } from "./msg-type";
import { trimOrUndefined, trimOrEmpty } from "../utils/string-utils";
import { formatErrorMessage } from "./message-handler";

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
          ? /^\+1\d{10}$/.test(val)
          : /^\d{10}$/.test(val)),
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
          ? /^\+1\d{10}$/.test(val)
          : /^\d{10}$/.test(val)),
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
 * Normalizes US phone numbers to E.164 (+1XXXXXXXXXX) or National (XXXXXXXXXX) format.
 * Accepts various input formats and returns the normalized string or null if invalid.
 * @param input - The phone number string to normalize.
 * @param format - The desired phone format (E.164 or National). Defaults to E.164.
 * @returns The normalized phone number or null if invalid.
 */
export const normalizeUSPhone = (
  input: string,
  format: PhoneFormat = PhoneFormat.E164,
): string | null => {
  const digits = input.replace(/\D/g, "");
  const isE164 = format === PhoneFormat.E164;

  if (/^\d{10}$/.test(digits)) return isE164 ? `+1${digits}` : digits;
  if (/^1\d{10}$/.test(digits)) return isE164 ? `+${digits}` : digits.slice(1);
  if (/^\+1\d{10}$/.test(input))
    return isE164 ? input : input.replace(/^\+1/, "");
  return null;
};
/**
 * Trims and normalizes a phone number value.
 * Returns undefined if the value is empty or not provided, otherwise returns the normalized phone number or null if invalid.
 * @param val - The value to process.
 * @param format - The desired phone format (E.164 or National). Defaults to E.164.
 * @returns The normalized phone number, null, or undefined.
 */
export const phoneTransformAndValidate = (
  val: unknown,
  format: PhoneFormat = PhoneFormat.E164,
): string | undefined | null => {
  const trimmed = trimOrUndefined(val as string);
  if (!trimmed) return undefined;
  return normalizeUSPhone(trimmed, format);
};
/**
 * Validates that a phone number is in E.164 (+1XXXXXXXXXX) or National (XXXXXXXXXX) format, or is undefined/null.
 * @param val - The phone number string to validate.
 * @param format - The expected phone format (E.164 or National). Defaults to E.164.
 * @returns True if valid, undefined, or null; false otherwise.
 */
export const phoneRefine = (
  val: string | undefined,
  format: PhoneFormat = PhoneFormat.E164,
): boolean =>
  val === undefined ||
  (format === PhoneFormat.E164
    ? /^\+1\d{10}$/.test(val)
    : /^\d{10}$/.test(val));
