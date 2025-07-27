import { Logger } from "../common/types/logger.types";
import { LocalizationManager } from "./manager";
import { MessageGroupMap, formatMessage } from './types/message-params.types';
import type { ErrorMessageFormatter, FormatErrorOptions } from "./types/message-handler.types";


/**
 * Handles the formatting of error messages with localization and logging support.
 * 
 * The `MessageHandler` class implements the `ErrorMessageFormatter` interface and provides
 * a type-safe method for formatting error messages based on message groups and keys.
 * It leverages a localization manager to retrieve localized messages and a logger to
 * optionally log debug information about the formatting process.
 * 
 * @remarks
 * This class is intended to be used wherever consistent, localized error message formatting
 * is required, such as in form validation or API error responses.
 * 
 * @example
 * ```typescript
 * const handler = new MessageHandler(logger, localizationManager);
 * const errorMsg = handler.formatErrorMessage({
 *   group: "string",
 *   messageKey: "required",
 *   params: {},
 *   msg: "email",
 *   msgType: "FieldName"
 * });
 * // Returns: "email is required" (localized)
 * ```
 * 
 * @public
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
 * Creates a new instance of `MessageHandler` to handle error message formatting with localization support.
 *
 * @param logger - An instance of `Logger` used for logging messages.
 * @param localizationManager - An instance of `LocalizationManager` to provide localized messages.
 * @returns An `ErrorMessageFormatter` that formats error messages using the provided logger and localization manager.
 */
export function createMessageHandler(logger: Logger, localizationManager: LocalizationManager): ErrorMessageFormatter {
  return new MessageHandler(logger, localizationManager);
}
