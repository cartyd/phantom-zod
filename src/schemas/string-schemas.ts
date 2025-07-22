import { z } from "zod";

import { trimOrEmpty } from "../common/utils/string-utils";
import { MsgType } from "./msg-type";
import { formatErrorMessage } from "./message-handler";

// --- String Schemas ---

/**
 * Creates a Zod schema for an optional string value with custom error messaging.
 *
 * - Trims the input string or returns an empty string if undefined.
 * - Refines the value to ensure it is a string.
 * - Allows customization of the error message and its type.
 *
 * @param msg - The base error message to display if validation fails. Defaults to "Value".
 * @param msgType - The type of message formatting to use (from `MsgType`). Defaults to `MsgType.FieldName`.
 * @returns A Zod schema for an optional, trimmed string with custom error handling.
 *
 * @example
 * const schema = zStringOptional("Username");
 * schema.parse("  alice  "); // "alice"
 * schema.parse(undefined);   // ""
 * schema.parse("");          // ""
 */
export const zStringOptional = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .optional()
    .transform(trimOrEmpty)
    .refine(
      (val: string) => typeof val === "string",
      {
        message: formatErrorMessage(msg, msgType),
      },
    );

/**
 * Required string schema with trimming and custom error message.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 */
/**
 * Creates a Zod string schema that:
 * - Trims whitespace from the input string.
 * - Requires the string to be non-empty after trimming.
 * - Provides customizable error messages using the provided `msg` and `msgType`.
 *
 * @param msg - The base message or field name to use in error messages. Defaults to "Value".
 * @param msgType - The type of message formatting to use, based on the `MsgType` enum. Defaults to `MsgType.FieldName`.
 * @returns A Zod string schema with trimming and required validation.
 *
 * @example
 * const schema = zStringRequired("Username");
 * schema.parse("  alice  "); // "alice"
 * schema.parse("");          // throws ZodError
 * schema.parse("   ");       // throws ZodError
 */
export const zStringRequired = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string({
      message: formatErrorMessage(msg, msgType),
    })
    .transform((val) => val.trim())
    .refine((trimmed: string) => trimmed.length > 0, {
      message: formatErrorMessage(msg, msgType, "is required"),
    });
