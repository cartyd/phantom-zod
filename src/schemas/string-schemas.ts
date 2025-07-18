import { z } from "zod";

import { trimOrEmpty, trimOrUndefined } from "../utils/string-utils";
import { MsgType } from "./msg-type";
import { generateErrorMessage, generateRequiredMessage } from "./utils";

// --- String Schemas ---

/**
 * Optional string schema with trimming and custom error message.
 * Trims whitespace and converts undefined to empty string.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
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
        message: generateErrorMessage(msg, msgType, `${msg} must be a string if provided`),
      },
    );

/**
 * Required string schema with trimming and custom error message.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 */
export const zStringRequired = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string({
      message: generateRequiredMessage(msg, msgType),
    })
    .transform((val) => val.trim())
    .refine((trimmed: string) => trimmed.length > 0, {
      message: generateRequiredMessage(msg, msgType),
    });
