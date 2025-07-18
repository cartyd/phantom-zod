/**
 * Optional enum schema.
 * Accepts only values from the provided string literal array or undefined.
 * @param values - The allowed string values for the enum.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for an optional enum value.
 *
 * @example
 * const statusSchema = zEnumOptional(["active", "inactive"], "Status");
 */
import { z } from "zod";

import { MsgType } from "./msg-type";

/**
 * Type for an optional enum value.
 */
export type EnumOptional<TValue extends [string, ...string[]]> = z.infer<
  ReturnType<typeof zEnumOptional<TValue>>
>;

// --- Types ---

/**
 * Type for a required enum value.
 */
export type EnumRequired<TValue extends [string, ...string[]]> = z.infer<
  ReturnType<typeof zEnumRequired<TValue>>
>;

export const zEnumOptional = <TEnum extends readonly [string, ...string[]]>(
  values: TEnum,
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .enum(values as unknown as [string, ...string[]], {
      message:
        msgType === MsgType.Message
          ? String(msg)
          : `${msg} must be one of: ${values.join(", ")}`,
    })
    .optional();

// --- Enum Schemas ---

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
) =>
  z.enum(values as unknown as [string, ...string[]], {
    message:
      msgType === MsgType.Message
        ? String(msg)
        : `${msg} must be one of: ${values.join(", ")}`,
  });
