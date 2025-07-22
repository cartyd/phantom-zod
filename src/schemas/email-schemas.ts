import { MsgType } from "./msg-type";
import { z } from "zod";
import { trimOrUndefined } from "../common/utils/string-utils";
import { formatErrorMessage } from "../common/message-handler";
import { EMAIL_PATTERN } from "../common/regex-patterns";

// --- Types ---

export type EmailOptional = z.infer<ReturnType<typeof zEmailOptional>>;
export type EmailRequired = z.infer<ReturnType<typeof zEmailRequired>>;

// --- Email Schemas ---

/**
 * Validates email format.
 * Returns true if the value is undefined or matches a basic email regex.
 * @param val - The email string to validate.
 * @returns True if valid or undefined, false otherwise.
 */
export const isEmail = (val: string | undefined): boolean =>
  val === undefined || EMAIL_PATTERN.test(val);


/**
 * Creates a Zod schema for an optional email address.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for an optional email address.
 * @example
 * const schema = zEmailOptional();
 * schema.parse("user@example.com"); // returns "user@example.com"
 * schema.parse(undefined); // returns undefined
 * schema.parse("invalid-email"); // throws ZodError
 */
export const zEmailOptional = (
  msg: string = "Email Address",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .optional()
    .transform(trimOrUndefined)
    .refine(isEmail, {
        message: formatErrorMessage({ msg, msgType, messageKey: "email.mustBeValidEmail", locale: 'en' }),
    });


/**
 * Creates a Zod string schema for validating required email addresses.
 *
 * The schema ensures that the value is a non-empty, trimmed string and a valid email address.
 * Custom error messages can be provided for both the required and email validation errors.
 *
 * @param msg - The field name or custom message to use in error messages. Defaults to "Email Address".
 * @param msgType - The type of message formatting to use (from `MsgType`). Defaults to `MsgType.FieldName`.
 * @returns A Zod string schema that validates a required, properly formatted email address.
 * @example
 * const schema = zEmailRequired();
 * schema.parse("user@example.com"); // returns "user@example.com"
 * schema.parse(""); // throws ZodError (required)
 * schema.parse("invalid-email"); // throws ZodError (invalid email)
 */
export const zEmailRequired = (
  msg: string = "Email Address",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .trim()
    .nonempty({
      message: formatErrorMessage({ msg, msgType, messageKey: "email.required", locale: 'en' }),
    })
    .email({
        message: formatErrorMessage({ msg, msgType, messageKey: "email.mustBeValidEmail", locale: 'en' }),
    });
