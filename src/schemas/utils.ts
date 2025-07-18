import { MsgType } from "./msg-type";

/**
 * Generates a formatted error message based on message type.
 * @param msg - The base message or field name.
 * @param msgType - The type of message formatting to use.
 * @param fallback - The default error message if `msgType` is not `Message`.
 * @returns Formatted error message string.
 */
export const generateErrorMessage = (msg: string, msgType: MsgType, fallback: string): string => {
  return msgType === MsgType.Message ? String(msg) : fallback;
};

/**
 * Generates a "required" error message.
 * @param msg - The field name or custom message.
 * @param msgType - The type of message formatting to use.
 * @returns Formatted required error message.
 */
export const generateRequiredMessage = (msg: string, msgType: MsgType): string => {
  return generateErrorMessage(msg, msgType, `${msg} is required`);
};

/**
 * Generates a "must be valid" error message.
 * @param msg - The field name or custom message.
 * @param msgType - The type of message formatting to use.
 * @param type - The expected type (e.g., "email", "URL", "string").
 * @returns Formatted validation error message.
 */
export const generateValidationMessage = (msg: string, msgType: MsgType, type: string): string => {
  return generateErrorMessage(msg, msgType, `${msg} must be a valid ${type}`);
};

/**
 * Generates a "must be" error message.
 * @param msg - The field name or custom message.
 * @param msgType - The type of message formatting to use.
 * @param condition - The condition that must be met (e.g., "at least 8 characters long").
 * @returns Formatted condition error message.
 */
export const generateConditionMessage = (msg: string, msgType: MsgType, condition: string): string => {
  return generateErrorMessage(msg, msgType, `${msg} must be ${condition}`);
};
