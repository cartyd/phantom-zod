import { z } from "zod";
import { MsgType } from "./msg-type";

// --- URL Schemas ---

/**
 * Optional URL schema.
 * Accepts a string that is a valid URL or undefined.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for an optional URL.
 */
export const zUrlOptional = (
  msg = "URL",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .url({
      message:
        msgType === MsgType.Message
          ? String(msg)
          : `${msg} must be a valid URL`,
    })
    .optional();

/**
 * Required URL schema.
 * Accepts a non-empty string that is a valid URL.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a required URL.
 */
export const zUrlRequired = (
  msg = "URL",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .nonempty({
      message: msgType === MsgType.Message ? String(msg) : `${msg} is required`,
    })
    .url({
      message:
        msgType === MsgType.Message
          ? String(msg)
          : `${msg} must be a valid URL`,
    });
