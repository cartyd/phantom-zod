import type { MessageGroupMap } from "../localization/message-params.types";
import type { MsgType } from "../schemas/msg-type";

/**
 * Options for formatting an error message.
 *
 * @property {string} group - The message group (e.g., "string", "number").
 * @property {keyof MessageGroupMap[G]} messageKey - The message key within the group.
 * @property {MessageGroupMap[G][K]} params - The type-safe params for the message key.
 * @property {string} msg - The error message to be formatted.
 * @property {MsgType} msgType - The type of the message, indicating its severity or category.
 */
export type FormatErrorOptions<
  TGroup extends keyof MessageGroupMap = keyof MessageGroupMap,
  TKey extends keyof MessageGroupMap[TGroup] = keyof MessageGroupMap[TGroup]
> = {
  group: TGroup;
  messageKey: TKey;
  params: MessageGroupMap[TGroup][TKey];
  msg: string;
  msgType: MsgType;
};

/**
 * Interface for formatting error messages.
 * Implementations of this interface should provide a method to format error messages
 * based on the provided options.
 */
export interface ErrorMessageFormatter {
  formatErrorMessage<TGroup extends keyof MessageGroupMap, TKey extends keyof MessageGroupMap[TGroup]>(options: FormatErrorOptions<TGroup, TKey>): string;
}
