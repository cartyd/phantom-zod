import { MsgType } from "../schemas/msg-type";
import type { MessageParams, LocaleCode } from "../localization/types";
import { localizationManager as defaultLocalizationManager, LocalizationManager } from '../localization';

const DEFAULT_ERROR_MESSAGE_KEY = 'string.invalid';

/**
 * Logger interface for dependency injection
 */
export interface Logger {
  warn(message: string, meta?: any): void;
  debug?(message: string, meta?: any): void;
}

/**
 * Default logger implementation using console
 */
const defaultLogger: Logger = {
  warn: console.warn,
  debug: console.debug,
};

/**
 * Helper function for consistent message construction
 */
const constructMessage = (msg: string, content?: string): string => 
  content ? `${msg} ${content}` : msg;

/**
 * Safely retrieves a localized message with fallback handling
 */
const safeGetMessage = (
  localizationManager: LocalizationManager,
  messageKey: string,
  logger: Logger,
  params?: MessageParams,
  locale?: LocaleCode
): string | null => {
  try {
    const message = localizationManager.getMessage(messageKey, params, locale);
    // Check if the message is valid (not just the key returned back)
    return message && message !== messageKey ? message : null;
  } catch (error) {
    logger.warn('Failed to retrieve localized message', {
      messageKey,
      locale,
      error: error instanceof Error ? error.message : error,
    });
    return null;
  }
};

/**
 * Determines message content with priority-based fallback handling
 */
const determineMessageContent = (
  localizationManager: LocalizationManager,
  messageKey: string | null,
  fallback: string | undefined,
  params: MessageParams | undefined,
  locale: LocaleCode,
  logger: Logger
): string => {
  // Try requested message key first
  if (messageKey) {
    const message = safeGetMessage(localizationManager, messageKey, logger, params, locale);
    if (message) return message;
  }

  // Try provided fallback
  if (fallback) {
    return fallback;
  }

  // Try default error message key
  const defaultMessage = safeGetMessage(localizationManager, DEFAULT_ERROR_MESSAGE_KEY, logger, undefined, locale);
  if (defaultMessage) {
    return defaultMessage;
  }

  // Log warning about missing content and return empty string for graceful degradation
  logger.warn('No valid message content found', {
    messageKey: messageKey || DEFAULT_ERROR_MESSAGE_KEY,
    locale,
    component: 'formatErrorMessage',
  });
  
  return ''; // Return empty string to let constructMessage handle it gracefully
};

export interface FormatErrorOptions {
  msg: string;
  msgType: MsgType;
  messageKey?: string;
  params?: MessageParams;
  locale?: LocaleCode;
  fallback?: string;
  localizationManager?: LocalizationManager;
  logger?: Logger;
}

/**
 * Formats an error message based on the message type, with support for both
 * localized and fallback messages.
 *
 * @param options - An object containing all formatting options.
 * @returns The formatted error message as a string.
 *
 * @example
 * // Using localization
 * formatErrorMessage({ msg: "email", msgType: MsgType.FieldName, messageKey: "string.invalid", locale: "en" });
 * // Returns: "email must be valid" (localized)
 *
 * // Using fallback (backward compatibility)
 * formatErrorMessage({ msg: "email", msgType: MsgType.FieldName, fallback: "must be a valid email address" });
 * // Returns: "email must be a valid email address"
 *
 * // Using custom logger
 * const customLogger = { warn: (msg, meta) => console.error('ERROR:', msg, meta) };
 * formatErrorMessage({ msg: "username", msgType: MsgType.FieldName, messageKey: "invalid.key", logger: customLogger });
 * // Logs errors to customLogger instead of console
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
    locale = 'en',
    fallback,
    localizationManager = defaultLocalizationManager,
    logger = defaultLogger,
  } = options;

  if (msgType === MsgType.Message) {
    return msg;
  }

  const messageContent = determineMessageContent(
    localizationManager,
    messageKey ?? null,
    fallback,
    params,
    locale,
    logger
  );

  return constructMessage(msg, messageContent);
};

