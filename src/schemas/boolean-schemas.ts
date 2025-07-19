import { z } from "zod";
import { formatErrorMessage } from "./message-handler";
import { MsgType } from "./msg-type";

/**
 * Type for an optional boolean string ("true" or "false" or undefined).
 */
export type BooleanStringOptional = z.infer<
  ReturnType<typeof zBooleanStringOptional>
>;
export type BooleanStringRequired = z.infer<
  ReturnType<typeof zBooleanStringRequired>
>;

/**
 * Formats a boolean string error message consistently.
 * @param msg - The field name or custom message for error output
 * @param msgType - Determines if 'msg' is a field name or a custom message.
 * @returns The formatted error message string.
 */
const booleanStringErrorMessage = (msg: string, msgType: MsgType) =>
  formatErrorMessage(msg, msgType, { condition: 'a boolean value ("true" or "false")' });

/**
 * Schema for optional boolean values.
 */
export const zBooleanOptional = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => {
  const errorMessage = formatErrorMessage(msg, msgType, { condition: "a boolean value" });
  return z.boolean({ message: errorMessage }).optional();
};

/**
 * Schema for required boolean values.
 */
export const zBooleanRequired = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => {
  const errorMessage = formatErrorMessage(msg, msgType, { condition: "a boolean value" });
  return z.boolean({ message: errorMessage });
};
export const zBooleanStringRequired = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) =>
  baseBooleanStringSchema
    .refine(
      val =>
        (typeof val === "boolean") ||
        (typeof val === "string" && ["true", "false"].includes(val.trim().toLowerCase())),
      { message: booleanStringErrorMessage(msg, msgType) }
    )
    .transform(val =>
      typeof val === "boolean"
        ? val ? "true" : "false"
        : val.trim().toLowerCase()
    );
export const zBooleanStringOptional = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => zBooleanStringRequired(msg, msgType).optional();

const baseBooleanStringSchema = z.union([z.string(), z.boolean()]);
