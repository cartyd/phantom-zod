/**
 * Unified error message formatter for schema validation.
 * @param msg - The field name or custom message.
 * @param msgType - The type of message formatting to use.
 * @param options - Object with optional 'condition' or 'fallback' string.
 * @returns Formatted error message string.
 */
export const formatErrorMessage = (
  msg: string,
  msgType: MsgType,
  options: { condition?: string; fallback?: string }
): string => {
  if (msgType === MsgType.Message) return String(msg);
  if (options.condition) return `${msg} must be ${options.condition}`;
  if (options.fallback) return options.fallback;
  return `${msg} is invalid`;
};
import { MsgType } from "./msg-type";

