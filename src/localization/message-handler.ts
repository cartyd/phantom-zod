import { Logger } from "../common/logger.types";
import { LocalizationManager } from "./manager";
import { MessageGroupMap, formatMessage } from './message-params.types';
import type { ErrorMessageFormatter, FormatErrorOptions } from "./message-handler.types";

/**
 * Message handler class that uses dependency injection for Logger and LocalizationManager
 * Implements ErrorMessageFormatter interface for consistent API contract
 */
export class MessageHandler implements ErrorMessageFormatter {
  constructor(
    private readonly logger: Logger,
    private readonly localizationManager: LocalizationManager
  ) {}

  /**
   * Formats an error message using the provided options, ensuring type safety based on the message group and key.
   * Utilizes the unified `formatMessage` function for consistent formatting.
   * Optionally logs debug information about the formatting process.
   *
   * @typeParam TGroup - The key representing the message group in `MessageGroupMap`.
   * @typeParam TKey - The key representing the specific message within the group.
   * @param options - The formatting options, including group, message key, and parameters.
   * @returns The formatted error message as a string.
   *
   * @example
   * // Example usage:
   * const handler = createMessageHandler(logger, localizationManager);
   * const errorMsg = handler.formatErrorMessage({
   *   group: "string",
   *   messageKey: "required",
   *   params: {},
   *   msg: "email",
   *   msgType: "FieldName"
   * });
   * // Returns: "email is required" (localized)
   */
  formatErrorMessage<TGroup extends keyof MessageGroupMap, TKey extends keyof MessageGroupMap[TGroup]>(options: FormatErrorOptions<TGroup, TKey>): string {
    // Directly use the unified formatMessage function for type-safe formatting
    const formatted = formatMessage({
      group: options.group,
      messageKey: options.messageKey,
      params: options.params || {} as MessageGroupMap[TGroup][TKey],
      msg: options.msg,
      msgType: options.msgType,
    });
    
    // Optionally log debug info
    this.logger.debug?.("Error message formatted", {
      group: options.group,
      messageKey: options.messageKey,
      params: options.params,
      component: "formatErrorMessage",
    });
    return formatted;
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
