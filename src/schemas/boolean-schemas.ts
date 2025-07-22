import { z } from "zod";

import { formatErrorMessage } from "../common/message-handler";
import { MsgType } from "./msg-type";
import type { LocaleCode } from "../localization/types";

// --- Types ---
export type BooleanOptional = z.infer<ReturnType<typeof zBooleanOptional>>;

export type BooleanRequired = z.infer<ReturnType<typeof zBooleanRequired>>;

export type BooleanStringOptional = z.infer<
ReturnType<typeof zBooleanStringOptional>
>;

export type BooleanStringRequired = z.infer<
  ReturnType<typeof zBooleanStringRequired>
>;

/**
 * Creates a Zod schema that validates an optional boolean value.
 *
 * The schema accepts `undefined` or a boolean value. If the value is not a boolean or `undefined`,
 * it returns a formatted error message. If the value is `undefined`, it remains `undefined` after transformation;
 * otherwise, it is coerced to a boolean.
 *
 * @param msg - The label or field name to use in the error message. Defaults to "Value".
 * @param msgType - The type of message formatting to use, based on the `MsgType` enum. Defaults to `MsgType.FieldName`.
 * @returns A Zod schema that validates and transforms an optional boolean value.
 *
 * @example
 * const schema = zBooleanOptional("Active", MsgType.FieldName);
 * schema.parse(true); // true
 * schema.parse(undefined); // undefined
 * schema.parse(false); // false
 * schema.parse("yes"); // throws ZodError
 */
export const zBooleanOptional = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
  locale: LocaleCode = 'en'
) => {
  return z.unknown()
    .refine(
      val => val === undefined || typeof val === "boolean",
      { message: formatErrorMessage({ msg, msgType, messageKey: "boolean.mustBeBoolean", locale }) }
    )
    .transform(val => val === undefined ? undefined : Boolean(val));
};

/**
 * Creates a Zod schema that validates if the input is a boolean value.
 * 
 * @param msg - The field name or custom message to include in the error message (default: "Value").
 * @param msgType - The type of message formatting to use, based on the `MsgType` enum (default: `MsgType.FieldName`).
 * @returns A Zod schema that refines the input to ensure it is a boolean and transforms the value to a boolean.
 * 
 * @remarks
 * - If the input is not a boolean, the schema will fail validation and return a formatted error message.
 * - The transformation step ensures the output is always a boolean value.
 * 
 * @example
 * const schema = zBooleanRequired("Active", MsgType.FieldName);
 * schema.parse(true); // true
 * schema.parse(false); // false
 * schema.parse("yes"); // throws ZodError
 */
export const zBooleanRequired = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
  locale: LocaleCode = 'en'
) => {
  return z.unknown()
    .refine(
      val => typeof val === "boolean",
      { message: formatErrorMessage({ msg, msgType, messageKey: "boolean.mustBeBoolean", locale }) }
    )
    .transform(val => Boolean(val));
};

/**
 * Creates a Zod schema that validates if the input is a boolean or a string "true"/"false".
 * 
 * @param msg - The field name or custom message to include in the error message (default: "Value").
 * @param msgType - The type of message formatting to use, based on the `MsgType` enum (default: `MsgType.FieldName`).
 * @returns A Zod schema that refines the input to ensure it is a boolean or a string "true"/"false" and transforms the value to a string "true" or "false".
 * 
 * @example
 * const schema = zBooleanStringRequired("Active", MsgType.FieldName);
 * schema.parse(true); // "true"
 * schema.parse(false); // "false"
 * schema.parse("true"); // "true"
 * schema.parse("FALSE"); // "false"
 * schema.parse("yes"); // throws ZodError
 */
export const zBooleanStringRequired = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
  locale: LocaleCode = 'en'
) => {
  return baseBooleanStringSchema
    .refine(
      val =>
        (typeof val === "boolean") ||
        (typeof val === "string" && ["true", "false"].includes(val.trim().toLowerCase())),
      { message: formatErrorMessage({ msg, msgType, messageKey: "boolean.mustBeBooleanString", locale }) }
    )
    .transform(val =>
      typeof val === "boolean"
        ? val ? "true" : "false"
        : val.trim().toLowerCase()
    );
};

/**
 * Creates a Zod schema that validates an optional boolean value represented as a string.
 * 
 * @param msg - The label or message to use for validation errors (default: "Value").
 * @param msgType - The type of message formatting to use (defaults to MsgType.FieldName).
 * @returns A Zod schema that accepts a string representing a boolean ("true" or "false") or undefined.
 *
 * @see zBooleanStringRequired for the required version of this schema.
 *
 * @example
 * const schema = zBooleanStringOptional("Active", MsgType.FieldName);
 * schema.parse("true"); // "true"
 * schema.parse("FALSE"); // "false"
 * schema.parse(undefined); // undefined
 * schema.parse("yes"); // throws ZodError
 */
export const zBooleanStringOptional = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
  locale: LocaleCode = 'en'
) => {
  return zBooleanStringRequired(msg, msgType, locale).optional();
};

const baseBooleanStringSchema = z.union([z.string(), z.boolean()]);
