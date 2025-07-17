import { z } from "zod";

import { trimOrEmpty } from "../utils/string-utils";
import { MsgType } from "./msg-type";

// --- String Schemas ---

/**
 * Optional string schema with trimming and custom error message.
 * Preserves empty strings instead of converting them to undefined.
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
      (val: string | undefined) => val === undefined || typeof val === "string",
      {
        message:
          msgType === MsgType.Message
            ? String(msg)
            : `${msg} must be a string if provided`,
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
      message:
        msgType === MsgType.Message ? String(msg) : `${msg} is required`,
    })
    .transform((val) => val.trim())
    .refine((trimmed: string) => trimmed.length > 0, {
      message: msgType === MsgType.Message ? String(msg) : `${msg} is required`,
    });
