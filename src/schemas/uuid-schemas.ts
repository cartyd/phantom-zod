import { z } from "zod";
import { MsgType } from "./msg-type";

// --- UUID Schemas ---
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Optional UUID schema.
 * Accepts a string that matches any UUID version (1-5) or undefined/empty.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for an optional UUID.
 */
export const zUuidOptional = (
  msg = "ID",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .optional()
    .refine((val) => val === undefined || val === "" || UUID_REGEX.test(val), {
      message:
        msgType === MsgType.Message
          ? String(msg)
          : `${msg} must be a valid UUID`,
    });

/**
 * Required UUID schema.
 * Accepts a non-empty string that matches any UUID version (1-5).
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a required UUID.
 */
export const zUuidRequired = (
  msg = "ID",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .nonempty({
      message: msgType === MsgType.Message ? String(msg) : `${msg} is required`,
    })
    .refine((val) => UUID_REGEX.test(val), {
      message:
        msgType === MsgType.Message
          ? String(msg)
          : `${msg} must be a valid UUID`,
    });

/**
 * Optional UUIDv4 schema.
 * Accepts a string that matches UUID version 4 or undefined/empty.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for an optional UUIDv4.
 */
export const zUuidV4Optional = (
  msg = "ID",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || val === "" || UUID_V4_REGEX.test(val),
      {
        message:
          msgType === MsgType.Message
            ? String(msg)
            : `${msg} must be a valid UUIDv4`,
      },
    );

/**
 * Required UUIDv4 schema.
 * Accepts a non-empty string that matches UUID version 4.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a required UUIDv4.
 */
export const zUuidV4Required = (
  msg = "ID",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .nonempty({
      message: msgType === MsgType.Message ? String(msg) : `${msg} is required`,
    })
    .refine((val) => UUID_V4_REGEX.test(val), {
      message:
        msgType === MsgType.Message
          ? String(msg)
          : `${msg} must be a valid UUIDv4`,
    });
