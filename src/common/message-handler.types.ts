import type { MessageParams } from "../localization/message.types";
import type { MessageKeyPath } from "../localization/message-key-path.types";
import type { MsgType } from "../schemas/msg-type";

/**
 * Options for formatting an error message.
 *
 * @property {MessageKeyPath} [messageKey] - Optional key path for the message, used for localization or message lookup.
 * @property {string} msg - The error message to be formatted.
 * @property {MsgType} msgType - The type of the message, indicating its severity or category.
 * @property {MessageParams} [params] - Optional parameters to be used for message interpolation or formatting.
 */
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
/**
 * Interface for formatting error messages.
 *
 * Implementations of this interface should provide a method to format error messages
 * based on the provided options.
 *
 * @remarks
 * This is typically used to standardize error message formatting across an application.
 *
 * @method formatErrorMessage
 * @param options - The options used to format the error message.
 * @returns The formatted error message as a string.
 */
export interface ErrorMessageFormatter {
  formatErrorMessage(options: FormatErrorOptions): string;
}
