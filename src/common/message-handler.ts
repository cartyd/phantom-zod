import { Logger } from "./logger";
import { LocalizationManager, localizationManager as defaultLocalizationManager } from "../localization";
import type { LocaleCode, MessageParams } from "../localization/types";
import { MsgType } from "../schemas/msg-type";

export interface FormatErrorOptions {
  fallback?: string;
  locale?: LocaleCode;
  messageKey?: string;
  msg: string;
  msgType: MsgType;
  params?: MessageParams;
}

const defaultLogger: Logger = {
  warn: console.warn,
  debug: console.debug,
};

let currentLogger: Logger = defaultLogger;

/**
 * Default error message key for fallback
 */
const DEFAULT_ERROR_MESSAGE_KEY = "string.invalid";

/**
 * Global configuration state
 */
let currentLocale: LocaleCode = "en";
let currentLocalizationManager: LocalizationManager = defaultLocalizationManager;

/**
 * Set the global logger instance used by all schemas
 * @param logger - Logger instance to use globally  
 */
export function setLogger(logger: Logger): void {
  currentLogger = logger;
}

/**
 * Set the global localization manager instance used by all schemas
 * @param localizationManager - LocalizationManager instance to use globally
 */
export function setLocalizationManager(localizationManager: LocalizationManager): void {
  currentLocalizationManager = localizationManager;
}

/**
 * Set the global locale used by all schemas
 * @param locale - Locale code to use globally
 */
export function setLocale(locale: LocaleCode): void {
  currentLocale = locale;
}

/**
 * Get the current global locale
 * @returns Current locale code
 */
export function getLocale(): LocaleCode {
  return currentLocale;
}

/**
 * Get the current global logger
 * @returns Current logger instance
 */
export function getLogger(): Logger {
  return currentLogger;
}

/**
 * Get the current global localization manager
 * @returns Current localization manager instance
 */
export function getLocalizationManager(): LocalizationManager {
  return currentLocalizationManager;
}

/**
 * Helper function for consistent message construction
 */
const constructMessage = (msg: string, content?: string): string =>
  content ? `${msg} ${content}` : msg;

/**
 * Safely retrieves a localized message with fallback handling
 */
const safeGetMessage = (
  messageKey: string,
  params?: MessageParams,
  locale?: LocaleCode
): string | null => {
  try {
    const effectiveLocale = locale ?? currentLocale;
    const message = currentLocalizationManager.getMessage(messageKey, params, effectiveLocale);
    // Check if the message is valid (not just the key returned back)
    return message && message !== messageKey ? message : null;
  } catch (error) {
    const effectiveLocale = locale ?? currentLocale;
    currentLogger.warn("Failed to retrieve localized message", {
      messageKey,
      locale: effectiveLocale,
      error: error instanceof Error ? error.message : error,
    });
    return null;
  }
};

/**
 * Determines message content with priority-based fallback handling
 */
const determineMessageContent = (
  messageKey: string | null,
  fallback: string | undefined,
  params: MessageParams | undefined,
  locale: LocaleCode
): string => {
  // Try requested message key first
  if (messageKey) {
    const message = safeGetMessage(messageKey, params, locale);
    if (message) return message;
  }

  // Try provided fallback
  if (fallback) {
    return fallback;
  }

  // Try default error message key
  const defaultMessage = safeGetMessage(DEFAULT_ERROR_MESSAGE_KEY, undefined, locale);
  if (defaultMessage) {
    return defaultMessage;
  }

  // Log warning about missing content and return empty string for graceful degradation
  currentLogger.warn("No valid message content found", {
    messageKey: messageKey || DEFAULT_ERROR_MESSAGE_KEY,
    locale,
    component: "formatErrorMessage",
  });
  return ""; // Return empty string to let constructMessage handle it gracefully
};

/**
 * Formats an error message based on the message type, with support for both
 * localized and fallback messages.
 *
 * This function uses the globally configured logger and localization manager,
 * ensuring consistent behavior across all schemas.
 *
 * @param options - An object containing all formatting options.
 * @returns The formatted error message as a string.
 *
 * @example
 * // Using localization with global settings
 * formatErrorMessage({ msg: "email", msgType: MsgType.FieldName, messageKey: "string.invalid", locale: "en" });
 * // Returns: "email must be valid" (localized)
 *
 * // Using fallback (backward compatibility)
 * formatErrorMessage({ msg: "email", msgType: MsgType.FieldName, fallback: "must be a valid email address" });
 * // Returns: "email must be a valid email address"
 *
 * // Direct message
 * formatErrorMessage({ msg: "Custom error message", msgType: MsgType.Message });
 * // Returns: "Custom error message"
 */
export const formatErrorMessage = (options: FormatErrorOptions): string => {
  const {
    msg,
    msgType,
    messageKey,
    params,
    locale,
    fallback,
  } = options;

  if (msgType === MsgType.Message) {
    return msg;
  }

  // Use provided locale or fall back to global locale
  const effectiveLocale = locale ?? currentLocale;

  const messageContent = determineMessageContent(
    messageKey ?? null,
    fallback,
    params,
    effectiveLocale
  );

  const finalMessage = constructMessage(msg, messageContent);
  
  // Only log debugging information, not the error message itself
  currentLogger.debug?.("Error message formatted", {
    messageKey,
    locale: effectiveLocale,
    params,
    fallback,
    component: "formatErrorMessage",
  });
  
  return finalMessage;
};





