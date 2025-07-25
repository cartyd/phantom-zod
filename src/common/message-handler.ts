import { Logger } from "./logger";
import { LocalizationManager } from "../localization";
import type { MessageParams, MessageKeyPath } from "../localization/types";
import { MsgType } from "../schemas/msg-type";

export interface FormatErrorOptions {
  messageKey?: MessageKeyPath;
  msg: string;
  msgType: MsgType;
  params?: MessageParams;
}

/**
 * Interface for message handling implementations
 * Provides a contract for formatting error messages with localization support
 */
export interface ErrorMessageFormatter {
  /**
   * Formats an error message based on the message type with localization support.
   * 
   * The locale is determined by the LocalizationManager's current locale setting.
   * 
   * @param options - An object containing all formatting options
   * @returns The formatted error message as a string
   * 
   * @example
   * messageHandler.formatErrorMessage({ 
   *   msg: "email", 
   *   msgType: MsgType.FieldName, 
   *   messageKey: "string.invalid" 
   * });
   * // Returns: "email must be valid" (localized)
   */
  formatErrorMessage(options: FormatErrorOptions): string;
}

/**
 * Default error message key for fallback
 */
const DEFAULT_ERROR_MESSAGE_KEY: MessageKeyPath = "string.invalid";

/**
 * Message handler class that uses dependency injection for Logger and LocalizationManager
 * Implements IMessageHandler interface for consistent API contract
 */
export class MessageHandler implements ErrorMessageFormatter {
  constructor(
    private readonly logger: Logger,
    private readonly localizationManager: LocalizationManager
  ) {}

  /**
   * Helper function for consistent message concatenation
   */
  private concatenateMessage(msg: string, content?: string): string {
    return content ? `${msg} ${content}` : msg;
  }

  /**
   * Safely retrieves a localized message with fallback handling
   */
  private safeGetMessage(
    messageKey: MessageKeyPath,
    params?: MessageParams
  ): string {
    try {
      const message = this.localizationManager.getMessage(messageKey, params);
      // Check if the message is valid (not just the key returned back)
      return message && message !== messageKey ? message : "";
    } catch (error) {
      this.logger.warn?.("Failed to retrieve localized message", {
        messageKey,
        error: error instanceof Error ? error.message : error,
      });
      return "";
    }
  }

  /**
   * Determines message content with localization fallback handling
   */
  private determineMessageContent(
    messageKey: MessageKeyPath | null,
    params: MessageParams | undefined
  ): string {
    // Try requested message key first
    if (messageKey) {
      const message = this.safeGetMessage(messageKey, params);
      if (message) return message;
    }

    // Try default error message key
    const defaultMessage = this.safeGetMessage(DEFAULT_ERROR_MESSAGE_KEY);
    if (defaultMessage) {
      return defaultMessage;
    }

    // Log warning about missing content and return empty string for graceful degradation
    this.logger.warn?.("No valid message content found", {
      messageKey: messageKey || DEFAULT_ERROR_MESSAGE_KEY,
      component: "formatErrorMessage",
    });
    return ""; // Return empty string to let concatenateMessage handle it gracefully
  }

  /**
   * Formats an error message based on the message type, with localization support.
   *
   * The locale is determined by the LocalizationManager's current locale setting.
   *
   * @param options - An object containing all formatting options.
   * @returns The formatted error message as a string.
   *
   * @example
   * // Using localization
   * messageHandler.formatErrorMessage({ msg: "email", msgType: MsgType.FieldName, messageKey: "string.invalid" });
   * // Returns: "email must be valid" (localized)
   *
   * // Direct message
   * messageHandler.formatErrorMessage({ msg: "Custom error message", msgType: MsgType.Message });
   * // Returns: "Custom error message"
   */
  formatErrorMessage(options: FormatErrorOptions): string {
    const {
      msg,
      msgType,
      messageKey,
      params,
    } = options;

    if (msgType === MsgType.Message) {
      return msg;
    }

    const messageContent = this.determineMessageContent(
      messageKey ?? null,
      params
    );

    const finalMessage = this.concatenateMessage(msg, messageContent);
    
    // Only log debugging information, not the error message itself
    this.logger.debug?.("Error message formatted", {
      messageKey,
      params,
      component: "formatErrorMessage",
    });
    
    return finalMessage;
  }
}

/**
 * Create a new MessageHandler instance with custom dependencies
 * @param logger - Logger instance to use
 * @param localizationManager - LocalizationManager instance to use
 * @returns New MessageHandler instance implementing IMessageHandler interface
 */
export function createMessageHandler(logger: Logger, localizationManager: LocalizationManager): ErrorMessageFormatter {
  return new MessageHandler(logger, localizationManager);
}
