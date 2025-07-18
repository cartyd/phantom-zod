import { MsgType } from "../schemas/msg-type";

/**
 * Creates an error message for common validation cases.
 * @param msg - The field name or custom message
 * @param msgType - Whether msg is a field name or custom message
 * @param errorType - The type of error (e.g., "required", "invalid")
 * @returns Formatted error message
 */
export const createErrorMessage = (
  msg: string,
  msgType: MsgType,
  errorType: string,
): string => {
  if (msgType === MsgType.Message) {
    return String(msg);
  }
  return `${msg} is ${errorType}`;
};

/**
 * Gets an error message, either using custom message or generating a default one.
 * @param msg - The field name or custom message
 * @param msgType - Whether msg is a field name or custom message
 * @param defaultMessage - The default message to use for field names
 * @returns Formatted error message
 */
export const getErrorMessage = (
  msg: string,
  msgType: MsgType,
  defaultMessage: string,
): string => {
  if (msgType === MsgType.Message) {
    return String(msg);
  }
  return defaultMessage;
};
