import { MsgType } from "./msg-type";

/**
 * Formats an error message based on the message type and an optional condition.
 *
 * @param msg - The base error message to format.
 * @param msgType - The type of message, which determines the formatting.
 * @param condition - An optional condition to include in the error message when the type is `FieldName`.
 * @returns The formatted error message as a string.
 *
 * @example
 * formatErrorMessage("email", MsgType.FieldName, "a valid email address");
 * // Returns: "email must be a valid email address"
 *
 * formatErrorMessage("username", MsgType.Message);
 * // Returns: "username"
 *
 * formatErrorMessage("password", MsgType.FieldName);
 * // Returns: "password is invalid"
 */
export const formatErrorMessage = (
  msg: string,
  msgType: MsgType,
  fallback?: string
): string => {
  if (msgType === MsgType.Message) return String(msg);
  if (fallback) return `${msg} ${fallback}`;
  return `${msg} is invalid`;
};

