import { MsgType } from "./msg-type";
import { z } from "zod";
import { trimOrUndefined } from "../common/utils/string-utils";
import type { IMessageHandler } from "../common/message-handler";
import { EMAIL_PATTERN } from "../common/regex-patterns";

/**
 * Validates email format.
 * Returns true if the value is undefined or matches a basic email regex.
 * @param val - The email string to validate.
 * @returns True if valid or undefined, false otherwise.
 */
export const isEmail = (val: string | undefined): boolean =>
  val === undefined || EMAIL_PATTERN.test(val);

/**
 * Creates a factory function for email schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing email schema creation functions
 */
export const createEmailSchemas = (messageHandler: IMessageHandler) => {
  /**
   * Creates a Zod schema for an optional email address.
   * @param msg - The field name or custom message for error output.
   * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
   * @returns Zod schema for an optional email address.
   */
  const zEmailOptional = (
    msg: string = "Email Address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .string()
      .optional()
      .transform(trimOrUndefined)
      .refine(isEmail, {
          message: messageHandler.formatErrorMessage({ msg, msgType, messageKey: "email.mustBeValidEmail"}),
      });

  /**
   * Creates a Zod string schema for validating required email addresses.
   * @param msg - The field name or custom message to use in error messages. Defaults to "Email Address".
   * @param msgType - The type of message formatting to use (from `MsgType`). Defaults to `MsgType.FieldName`.
   * @returns A Zod string schema that validates a required, properly formatted email address.
   */
  const zEmailRequired = (
    msg: string = "Email Address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .string()
      .trim()
      .nonempty({
        message: messageHandler.formatErrorMessage({ msg, msgType, messageKey: "email.required"}),
      })
      .email({
          message: messageHandler.formatErrorMessage({ msg, msgType, messageKey: "email.mustBeValidEmail"}),
      });

  return {
    zEmailOptional,
    zEmailRequired,
  };
};

/**
 * Individual schema creation functions that accept messageHandler as first parameter
 */

/**
 * Creates a Zod schema for an optional email address.
 * @param messageHandler - The message handler to use for error messages
 * @param msg - The field name or custom message for error output
 * @param msgType - Determines if 'msg' is a field name or a custom message
 */
export const zEmailOptional = (
  messageHandler: IMessageHandler,
  msg: string = "Email Address",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createEmailSchemas(messageHandler).zEmailOptional(msg, msgType);
};

/**
 * Creates a Zod string schema for validating required email addresses.
 * @param messageHandler - The message handler to use for error messages
 * @param msg - The field name or custom message to use in error messages
 * @param msgType - The type of message formatting to use
 */
export const zEmailRequired = (
  messageHandler: IMessageHandler,
  msg: string = "Email Address",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createEmailSchemas(messageHandler).zEmailRequired(msg, msgType);
};

// --- Types ---
export type EmailOptional = z.infer<ReturnType<typeof zEmailOptional>>;
export type EmailRequired = z.infer<ReturnType<typeof zEmailRequired>>;
