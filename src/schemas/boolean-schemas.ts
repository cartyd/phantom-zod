/**
 * Type for a required boolean string ("true" or "false").
 */
export type BooleanStringRequired = z.infer<
  ReturnType<typeof zBooleanStringRequired>
>;

/**
 * Type for an optional boolean string ("true" or "false" or undefined).
 */
export type BooleanStringOptional = z.infer<
  ReturnType<typeof zBooleanStringOptional>
>;
import { z } from "zod";

import { MsgType } from "./msg-type";
import { generateErrorMessage, generateConditionMessage } from "./utils";

/**
 * Formats a boolean string error message consistently.
 * @param msg - The field name or custom message for error output
 * @param msgType - Determines if 'msg' is a field name or a custom message.
 * @returns The formatted error message string.
 */
const booleanStringErrorMessage = (msg: string, msgType: MsgType) =>
  generateErrorMessage(msg, msgType, `${msg} must be a boolean value ("true" or "false")`);

/**
 * Creates a boolean string schema that returns "true"/"false" as strings.
 * Accepts boolean values (true/false) or strings ("true"/"false", case-insensitive, with whitespace trimmed).
 * Any other input (including numbers, objects, arrays, or invalid strings) will fail validation.
 *
 * @param msg - The field name or custom message for error output
 * @param isRequired - Whether the field is required
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for boolean string validation
 *
 * @example
 * zBooleanStringRequired("Active").parse("true"); // "true"
 * zBooleanStringRequired("Active").parse(false); // "false"
 * zBooleanStringRequired("Active").parse(" TRUE "); // "true"
 * zBooleanStringRequired("Active").parse(1); // throws validation error
 * zBooleanStringRequired("Active").parse(null); // throws validation error
 */
export const createBooleanStringSchema = (
  msg: string,
  isRequired: boolean,
  msgType: MsgType = MsgType.FieldName,
) => {
  const schema = z.unknown()
    .transform((val) => {
      if (typeof val === "boolean") return val ? "true" : "false";
      if (typeof val === "string") {
        const lower = val.trim().toLowerCase();
        if (lower === "true" || lower === "false") return lower;
      }
      // For invalid input, throw the error message directly
      throw new Error(booleanStringErrorMessage(msg, msgType));
    });
  return isRequired ? schema : schema.optional();
};
export const zBooleanStringOptional = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => createBooleanStringSchema(msg, false, msgType);

// Example usage:
export const zBooleanStringRequired = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => createBooleanStringSchema(msg, true, msgType);

/**
 * Converts input to a boolean string ("true" or "false") if possible.
 * Returns the input for invalid input to allow proper error handling.
 */
const toBooleanString = (val: unknown): string | unknown => {
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "string") {
    const lower = val.trim().toLowerCase();
    if (lower === "true" || lower === "false") return lower;
  }
  return val;
};

/**
 * Schema for required boolean values.
 */
export const zBooleanRequired = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => {
  const errorMessage = generateConditionMessage(msg, msgType, "a boolean value");
  return z.boolean({ message: errorMessage });
};

/**
 * Schema for optional boolean values.
 */
export const zBooleanOptional = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => {
  const errorMessage = generateConditionMessage(msg, msgType, "a boolean value");
  return z.boolean({ message: errorMessage }).optional();
};
