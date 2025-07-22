import {
  US_PHONE_E164_PATTERN,
  US_PHONE_NATIONAL_PATTERN,
  US_PHONE_11_DIGIT_PATTERN,
  NON_DIGITS
} from "../regex-patterns";
import { PhoneFormat } from "../../schemas/phone-schemas";
import { trimOrUndefined } from "./string-utils";

/**
 * Normalizes US phone numbers to E.164 (+1XXXXXXXXXX) or National (XXXXXXXXXX) format.
 * Accepts various input formats and returns the normalized string or null if invalid.
 * @param input - The phone number string to normalize.
 * @param format - The desired phone format (E.164 or National). Defaults to E.164.
 * @returns The normalized phone number or null if invalid.
 */
export function normalizeUSPhone(
  input: string,
  format: PhoneFormat = PhoneFormat.E164,
): string | null {
  const digits = input.replace(NON_DIGITS, "");
  const isE164 = format === PhoneFormat.E164;

  if (US_PHONE_NATIONAL_PATTERN.test(digits)) return isE164 ? `+1${digits}` : digits;
  if (US_PHONE_11_DIGIT_PATTERN.test(digits)) return isE164 ? `+${digits}` : digits.slice(1);
  if (US_PHONE_E164_PATTERN.test(input))
    return isE164 ? input : input.replace(/^\+1/, "");
  return null;
}

/**
 * Trims and normalizes a phone number value.
 * Returns undefined if the value is empty or not provided, otherwise returns the normalized phone number or null if invalid.
 * @param val - The value to process.
 * @param format - The desired phone format (E.164 or National). Defaults to E.164.
 * @returns The normalized phone number, null, or undefined.
 */
export function phoneTransformAndValidate(
  val: unknown,
  format: PhoneFormat = PhoneFormat.E164,
): string | undefined | null {
  const trimmed = trimOrUndefined(val as string);
  if (!trimmed) return undefined;
  return normalizeUSPhone(trimmed, format);
}

/**
 * Validates that a phone number is in E.164 (+1XXXXXXXXXX) or National (XXXXXXXXXX) format, or is undefined/null.
 * @param val - The phone number string to validate.
 * @param format - The expected phone format (E.164 or National). Defaults to E.164.
 * @returns True if valid, undefined, or null; false otherwise.
 */
export function phoneRefine(
  val: string | undefined,
  format: PhoneFormat = PhoneFormat.E164,
): boolean {
  return (
    val === undefined ||
    (format === PhoneFormat.E164
      ? US_PHONE_E164_PATTERN.test(val)
      : US_PHONE_NATIONAL_PATTERN.test(val))
  );
}
