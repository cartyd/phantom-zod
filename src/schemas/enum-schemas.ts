import { z } from "zod";

import { MsgType } from "./msg-type";
import { formatErrorMessage } from "../common/message-handler";
import type { LocaleCode } from "../localization/types";


export type EnumOptional<TValue extends [string, ...string[]]> = z.infer<
  ReturnType<typeof zEnumOptional<TValue>>
>;
export type EnumRequired<TValue extends [string, ...string[]]> = z.infer<
  ReturnType<typeof zEnumRequired<TValue>>
>;

// --- Enum Schemas ---

/**
 * Creates an optional Zod enum schema from a list of string values.
 *
 * @template TEnum - A tuple type representing the allowed string values for the enum.
 * @param values - An array of string values to be used as the enum options.
 * @param msg - An optional custom message to use in validation errors. Defaults to "Value".
 * @param msgType - The type of message formatting to use for error messages. Defaults to `MsgType.FieldName`.
 * @returns A Zod schema that validates an optional value matching one of the provided enum options.
 *
 * @example
 * const statusSchema = zEnumOptional(["active", "inactive"], "Status");
 * statusSchema.parse("active"); // "active"
 * statusSchema.parse(undefined); // undefined
 * statusSchema.parse("other"); // throws ZodError
 */
export const zEnumOptional = <TEnum extends readonly [string, ...string[]]>(
  values: TEnum,
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
  locale: LocaleCode = 'en'
) =>
  z
    .enum(values as unknown as [string, ...string[]], {
      message: formatErrorMessage({
        msg,
        msgType,
        messageKey: "enum.mustBeOneOf",
        params: { values: values.join(", ") },
        locale
      }),
    })
    .optional();

/**
 * Required enum schema.
 * Accepts only values from the provided string literal array.
 * @param values - The allowed string values for the enum.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a required enum value.
 *
 * @example
 * const statusSchema = zEnumRequired(["active", "inactive"], "Status");
 */
export const zEnumRequired = <TEnum extends readonly [string, ...string[]]>(
  values: TEnum,
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
  locale: LocaleCode = 'en'
) =>
  z.enum(values as unknown as [string, ...string[]], {
    message: formatErrorMessage({
      msg,
      msgType,
      messageKey: "enum.mustBeOneOf",
      params: { values: values.join(", ") },
      locale
    }),
  });
