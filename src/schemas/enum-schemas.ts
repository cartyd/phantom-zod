import { z } from "zod";

import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createTestMessageHandler } from "../localization/types/message-handler.types";
import { MsgType } from "../common/types/msg-type";
import type { BaseSchemaOptions } from "../common/types/schema-options.types";

// --- Types ---
// Note: These types are simplified since they rely on the factory functions
export type EnumOptional<TEnum extends readonly [string, ...string[]]> =
  | TEnum[number]
  | undefined;
export type EnumRequired<TEnum extends readonly [string, ...string[]]> =
  TEnum[number];

/**
 * Creates a factory function for enum schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing enum schema creation functions
 */
export const createEnumSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Creates an optional Zod enum schema from a list of string values.
   *
   * @template TEnum - A tuple type representing the allowed string values for the enum.
   * @param values - An array of string values to be used as the enum options.
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use for error messages. Defaults to `MsgType.FieldName`.
   * @returns A Zod schema that validates an optional value matching one of the provided enum options.
   *
   * @example
   * const { EnumOptional } = createEnumSchemas(messageHandler);
   * const statusSchema = EnumOptional(["active", "inactive"], { msg: "Status" });
   * statusSchema.parse("active"); // "active"
   * statusSchema.parse(undefined); // undefined
   * statusSchema.parse("other"); // throws ZodError
   */
  const EnumOptional = <TEnum extends readonly [string, ...string[]]>(
    values: TEnum,
    options: BaseSchemaOptions = {},
  ) => {
    const { msg = "Value", msgType = MsgType.FieldName } = options;

    return z
      .enum(values, {
        message: messageHandler.formatErrorMessage({
          group: "enum",
          messageKey: "mustBeOneOf",
          params: { options: [...values] },
          msg,
          msgType,
        }),
      })
      .optional();
  };

  /**
   * Creates a required Zod enum schema from a list of string values.
   * Accepts only values from the provided string literal array.
   *
   * @template TEnum - A tuple type representing the allowed string values for the enum.
   * @param values - The allowed string values for the enum.
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use for error messages. Defaults to `MsgType.FieldName`.
   * @returns Zod schema for a required enum value.
   *
   * @example
   * const { EnumRequired } = createEnumSchemas(messageHandler);
   * const statusSchema = EnumRequired(["active", "inactive"], { msg: "Status" });
   * statusSchema.parse("active"); // "active"
   * statusSchema.parse("other"); // throws ZodError
   */
  const EnumRequired = <TEnum extends readonly [string, ...string[]]>(
    values: TEnum,
    options: BaseSchemaOptions = {},
  ) => {
    const { msg = "Value", msgType = MsgType.FieldName } = options;

    return z.enum(values, {
      message: messageHandler.formatErrorMessage({
        group: "enum",
        messageKey: "mustBeOneOf",
        params: { options: [...values] },
        msg,
        msgType,
      }),
    });
  };

  return {
    EnumOptional,
    EnumRequired,
  };
};

// Top-level exports for barrel usage
const testMessageHandler = createTestMessageHandler();
const enumSchemas = createEnumSchemas(testMessageHandler);

// Type aliases for clean overload signatures
type EnumOptionalSchema<TEnum extends readonly [string, ...string[]]> =
  ReturnType<typeof enumSchemas.EnumOptional<TEnum>>;
type EnumRequiredSchema<TEnum extends readonly [string, ...string[]]> =
  ReturnType<typeof enumSchemas.EnumRequired<TEnum>>;

// Clean overload implementations
function enumOptionalOverload<TEnum extends readonly [string, ...string[]]>(
  values: TEnum,
  msg: string,
): EnumOptionalSchema<TEnum>;
function enumOptionalOverload<TEnum extends readonly [string, ...string[]]>(
  values: TEnum,
  options?: BaseSchemaOptions,
): EnumOptionalSchema<TEnum>;
function enumOptionalOverload<TEnum extends readonly [string, ...string[]]>(
  values: TEnum,
  msgOrOptions?: string | BaseSchemaOptions,
): EnumOptionalSchema<TEnum> {
  if (typeof msgOrOptions === "string") {
    return enumSchemas.EnumOptional(values, { msg: msgOrOptions });
  }
  return enumSchemas.EnumOptional(values, msgOrOptions);
}

function enumRequiredOverload<TEnum extends readonly [string, ...string[]]>(
  values: TEnum,
  msg: string,
): EnumRequiredSchema<TEnum>;
function enumRequiredOverload<TEnum extends readonly [string, ...string[]]>(
  values: TEnum,
  options?: BaseSchemaOptions,
): EnumRequiredSchema<TEnum>;
function enumRequiredOverload<TEnum extends readonly [string, ...string[]]>(
  values: TEnum,
  msgOrOptions?: string | BaseSchemaOptions,
): EnumRequiredSchema<TEnum> {
  if (typeof msgOrOptions === "string") {
    return enumSchemas.EnumRequired(values, { msg: msgOrOptions });
  }
  return enumSchemas.EnumRequired(values, msgOrOptions);
}

export const EnumOptional = enumOptionalOverload;
export const EnumRequired = enumRequiredOverload;
