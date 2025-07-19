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



// Use formatErrorMessage for all error formatting

/**
 * Schema for optional boolean values.
 */
export const zBooleanOptional = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => {
  return z.unknown()
    .refine(
      val => val === undefined || typeof val === "boolean",
      { message: formatErrorMessage(msg, msgType, "must be a boolean value") }
    )
    .transform(val => val === undefined ? undefined : Boolean(val));
}


/**
 * Schema for required boolean values.
 */
export const zBooleanRequired = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => {
  return z.unknown()
    .refine(
      val => typeof val === "boolean",
      { message: formatErrorMessage(msg, msgType, "must be a boolean value") }
    )
    .transform(val => Boolean(val));
};

const baseBooleanStringSchema = z.union([z.string(), z.boolean()]);

export const zBooleanStringRequired = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => {
  return baseBooleanStringSchema
    .refine(
      val =>
        (typeof val === "boolean") ||
        (typeof val === "string" && ["true", "false"].includes(val.trim().toLowerCase())),
      { message: formatErrorMessage(msg, msgType, "must be a boolean value (\"true\" or \"false\")") }
    )
    .transform(val =>
      typeof val === "boolean"
        ? val ? "true" : "false"
        : val.trim().toLowerCase()
    );
}

export const zBooleanStringOptional = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => {
  return zBooleanStringRequired(msg, msgType).optional();
}
