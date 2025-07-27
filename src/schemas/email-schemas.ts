import { MsgType } from "../common/types/msg-type";
import { z } from "zod";
import { trimOrUndefined } from "../common/utils/string-utils";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
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
 * Checks if the email has a valid format (basic regex).
 */
const isValidFormat = (val: string | undefined): boolean =>
  val === undefined || EMAIL_PATTERN.test(val);

/**
 * Checks if the email domain is valid (simple example: must contain a dot).
 */
const isValidDomain = (val: string | undefined): boolean => {
  if (!val) return true;
  const parts = val.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return domain.includes(".");
};

/**
 * Creates a factory function for email schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing email schema creation functions
 */
export const createEmailSchemas = (messageHandler: ErrorMessageFormatter) => {
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
      // Format check
      .refine(isValidFormat, {
        message: messageHandler.formatErrorMessage({
          group: "email",
          msg,
          msgType,
          messageKey: "invalidFormat",
          params: { expectedFormat: "user@example.com" },
        }),
      })
      // Domain check
      .refine(isValidDomain, {
        message: messageHandler.formatErrorMessage({
          group: "email",
          msg,
          msgType,
          messageKey: "domainInvalid",
          params: { domain: "missing or invalid" },
        }),
      })
      // Must be valid email (final catch-all)
      .refine(isEmail, {
        message: messageHandler.formatErrorMessage({
          group: "email",
          msg,
          msgType,
          messageKey: "mustBeValidEmail",
          params: {},
        }),
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
        message: messageHandler.formatErrorMessage({
          group: "email",
          msg,
          msgType,
          messageKey: "required",
          params: {},
        }),
      })
      // Format check
      .refine(isValidFormat, {
        message: messageHandler.formatErrorMessage({
          group: "email",
          msg,
          msgType,
          messageKey: "invalidFormat",
          params: { expectedFormat: "user@example.com" },
        }),
      })
      // Domain check
      .refine(isValidDomain, {
        message: messageHandler.formatErrorMessage({
          group: "email",
          msg,
          msgType,
          messageKey: "domainInvalid",
          params: { domain: "missing or invalid" },
        }),
      })
      // Must be valid email (final catch-all)
      .refine(isEmail, {
        message: messageHandler.formatErrorMessage({
          group: "email",
          msg,
          msgType,
          messageKey: "mustBeValidEmail",
          params: {},
        }),
      });

  return {
    zEmailOptional,
    zEmailRequired,
  };
};

// --- Types ---
// Note: These types reference the factory functions, so they need to be created from the factory
type EmailSchemasFactory = ReturnType<typeof createEmailSchemas>;
export type EmailOptional = z.infer<ReturnType<EmailSchemasFactory['zEmailOptional']>>;
export type EmailRequired = z.infer<ReturnType<EmailSchemasFactory['zEmailRequired']>>;
