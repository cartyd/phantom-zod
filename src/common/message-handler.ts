import { MsgType } from "../schemas/msg-type";
import { localizationManager } from "../localization/manager";
import type { MessageParams, LocaleCode } from "../localization/types";

/**
 * Formats an error message based on the message type, with support for both
 * localized and fallback messages.
 *
 * @param msg - The base error message to format (field name or custom message).
 * @param msgType - The type of message, which determines the formatting.
 * @param messageKey - Optional localization message key. If provided, uses localized messages.
 * @param params - Optional parameters for message interpolation.
 * @param locale - Optional locale code for localization. Defaults to 'en'.
 * @param fallback - Fallback message when no messageKey is provided.
 * @returns The formatted error message as a string.
 *
 * @example
 * // Using localization
 * formatErrorMessage("email", MsgType.FieldName, "string.invalid", undefined, "en");
 * // Returns: "email must be valid" (localized)
 *
 * // Using fallback (backward compatibility)
 * formatErrorMessage("email", MsgType.FieldName, undefined, undefined, undefined, "must be a valid email address");
 * // Returns: "email must be a valid email address"
 *
 * // Direct message
 * formatErrorMessage("Custom error message", MsgType.Message);
 * // Returns: "Custom error message"
 */
export const formatErrorMessage = (
  msg: string,
  msgType: MsgType,
  messageKey?: string,
  params?: MessageParams,
  locale: LocaleCode = 'en',
  fallback?: string
): string => {
  if (msgType === MsgType.Message) {
    return String(msg);
  }

  // Use localization if messageKey is provided
  if (messageKey) {
    const localizedMessage = localizationManager.getMessage(messageKey, params, locale);
    return `${msg} ${localizedMessage}`;
  }

  // Fallback to non-localized behavior for backward compatibility
  if (fallback) {
    return `${msg} ${fallback}`;
  }
  
  return `${msg} ${localizationManager.getMessage('string.invalid', undefined, locale)}`;
};

