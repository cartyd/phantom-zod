import { z } from "zod";

import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
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
   * const { zEnumOptional } = createEnumSchemas(messageHandler);
   * const statusSchema = zEnumOptional(["active", "inactive"], { msg: "Status" });
   * statusSchema.parse("active"); // "active"
   * statusSchema.parse(undefined); // undefined
   * statusSchema.parse("other"); // throws ZodError
   */
  const zEnumOptional = <TEnum extends readonly [string, ...string[]]>(
    values: TEnum,
    options: BaseSchemaOptions = {},
  ) => {
    const { msg = "Value", msgType = MsgType.FieldName } = options;

    return z
      .enum(values as unknown as [string, ...string[]], {
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
   * const { zEnumRequired } = createEnumSchemas(messageHandler);
   * const statusSchema = zEnumRequired(["active", "inactive"], { msg: "Status" });
   * statusSchema.parse("active"); // "active"
   * statusSchema.parse("other"); // throws ZodError
   */
  const zEnumRequired = <TEnum extends readonly [string, ...string[]]>(
    values: TEnum,
    options: BaseSchemaOptions = {},
  ) => {
    const { msg = "Value", msgType = MsgType.FieldName } = options;

    return z.enum(values as unknown as [string, ...string[]], {
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
    zEnumOptional,
    zEnumRequired,
  };
};
