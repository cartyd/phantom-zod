import { MsgType } from "./msg-type";
import { z } from "zod";
import { trimOrUndefined } from "../utils/string-utils";
import { formatErrorMessage } from "./message-handler";

// --- Types ---

/**
 * Type for an optional email (string or undefined).
 */
export type EmailOptional = z.infer<ReturnType<typeof zEmailOptional>>;

/**
 * Type for a required email (string).
 */
export type EmailRequired = z.infer<ReturnType<typeof zEmailRequired>>;

// --- Email Schemas ---

/**
 * Validates email format.
 * Returns true if the value is undefined or matches a basic email regex.
 * @param val - The email string to validate.
 * @returns True if valid or undefined, false otherwise.
 */
export const isEmail = (val: string | undefined): boolean =>
  val === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

/**
 * Optional email schema with format validation.
 * Accepts a string or undefined. Trims the value and validates email format if present.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for an optional email address.
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
      message: formatErrorMessage(msg, msgType, "must be a valid email address"),
    });

/**
 * Required email schema with format validation.
 * Accepts a non-empty string, trims the value, and validates email format.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a required email address.
 */
export const zEmailRequired = (
  msg: string = "Email Address",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .trim()
    .nonempty({
      message: formatErrorMessage(msg, msgType, "is required"),
    })
    .email({
      message: formatErrorMessage(msg, msgType, "must be a valid email address"),
    });
