import { z } from "zod";
import { MsgType } from "./msg-type";
import { formatErrorMessage } from "../common/message-handler";
import { UUID_PATTERN, UUID_V4_PATTERN } from "../common/regex-patterns";
import type { LocaleCode } from "../localization/types";

// --- UUID Schemas ---

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
  locale: LocaleCode = 'en'
) => 
  z
    .string()
    .optional()
    .refine((val) => val === undefined || val === "" || UUID_PATTERN.test(val), {
        message: formatErrorMessage({ msg, msgType, messageKey: "uuid.mustBeValidUuid", locale }),
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
  locale: LocaleCode = 'en'
) => 
  z
    .string()
    .nonempty({
      message: formatErrorMessage({ msg, msgType, messageKey: "uuid.required", locale }),
    })
    .refine((val) => UUID_PATTERN.test(val), {
        message: formatErrorMessage({ msg, msgType, messageKey: "uuid.mustBeValidUuid", locale }),
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
  locale: LocaleCode = 'en'
) => 
  z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || val === "" || UUID_V4_PATTERN.test(val),
      {
        message: formatErrorMessage({ msg, msgType, messageKey: "uuid.mustBeValidUuidV4", locale }),
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
  locale: LocaleCode = 'en'
) => 
  z
    .string()
    .nonempty({
        message: formatErrorMessage({ msg, msgType, messageKey: "uuid.required", locale }),
    })
    .refine((val) => UUID_V4_PATTERN.test(val), {
      message: formatErrorMessage({ msg, msgType, messageKey: "uuid.mustBeValidUuidV4", locale }),
    });
