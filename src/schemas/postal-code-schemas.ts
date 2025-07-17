import { z } from "zod";
import { MsgType } from "./msg-type";

// --- Postal Code Schemas ---

/**
 * Optional US postal code (ZIP code) schema.
 * Accepts a string matching 5 digits or 5+4 digits (e.g., 12345 or 12345-6789), or undefined.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for an optional US ZIP code.
 */
export const zPostalCodeOptional = (
  msg = "Postal Code",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, {
      message:
        msgType === MsgType.Message
          ? String(msg)
          : `${msg} must be a valid US ZIP code`,
    })
    .refine((val) => val !== "00000" && !val.startsWith("00000-"), {
      message:
        msgType === MsgType.Message
          ? String(msg)
          : `${msg} must be a valid US ZIP code`,
    })
    .optional();

/**
 * Required US postal code (ZIP code) schema.
 * Accepts a non-empty string matching 5 digits or 5+4 digits (e.g., 12345 or 12345-6789).
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a required US ZIP code.
 */
export const zPostalCodeRequired = (
  msg = "Postal Code",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .nonempty({
      message: msgType === MsgType.Message ? String(msg) : `${msg} is required`,
    })
    .regex(/^\d{5}(-\d{4})?$/, {
      message:
        msgType === MsgType.Message
          ? String(msg)
          : `${msg} must be a valid US ZIP code`,
    })
    .refine((val) => val !== "00000" && !val.startsWith("00000-"), {
      message:
        msgType === MsgType.Message
          ? String(msg)
          : `${msg} must be a valid US ZIP code`,
    });
