import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/message-handler.types";
import { INTEGER_PATTERN, FLOAT_PATTERN } from "../common/regex-patterns";
import type { NumberSchemaOptions } from "../common/types/schema-options.types";
/**
 * Enum to specify if the output should be a string or a number.
 */
export enum NumberFieldOutput {
  AsNumber = "number",
  AsString = "string",
}
/**
 * Enum to specify if a field is required or optional.
 */
export enum NumberFieldRequirement {
  Required = "required",
  Optional = "optional",
}
/**
 * Enum to specify if the schema should constrain by integer or float.
 */
export enum NumberFieldType {
  Integer = "integer",
  Float = "float",
}

// --- Types ---
// Note: These types are simplified since they rely on the factory functions
export type NumberOptional = number | undefined;
export type NumberRequired = number;
export type NumberStringOptional = string | undefined;
export type NumberStringRequired = string;

/**
 * Creates a factory function for number schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing number schema creation functions
 */
export const createNumberSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Creates a Zod schema for validating numbers (or numeric strings) with optional constraints.
   */
  function makeNumberSchema({
    msg = "Value",
    msgType = MsgType.FieldName,
    type = NumberFieldType.Integer,
    requirement = NumberFieldRequirement.Optional,
    output = NumberFieldOutput.AsNumber,
    min,
    max,
  }: {
    msg?: string;
    msgType?: MsgType;
    type?: NumberFieldType;
    requirement?: NumberFieldRequirement;
    output?: NumberFieldOutput;
    min?: number;
    max?: number;
  }) {
    const regex = type === NumberFieldType.Float ? FLOAT_PATTERN : INTEGER_PATTERN;

    let base: z.ZodTypeAny;
    if (requirement === NumberFieldRequirement.Optional) {
      base = z.union([z.number(), z.string().regex(regex)]).optional();
    } else {
      base = z.union([z.number(), z.string().regex(regex)]);
    }

    let schema = base.transform((val) => {
      if (val === undefined || val === "") return undefined;
      const num = typeof val === "number" ? val : Number(val);
      return output === NumberFieldOutput.AsString ? String(num) : num;
    });

    schema = schema.refine(
      (val) => {
        if (val === undefined) return true;
        const num = Number(val);
        if (isNaN(num)) return false;
        if (type === NumberFieldType.Integer && !Number.isInteger(num))
          return false;
        if (typeof min === "number" && num < min) return false;
        if (typeof max === "number" && num > max) return false;
        return true;
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "number",
          messageKey: "invalid",
          params: {
            type: type === NumberFieldType.Integer ? "integer" : "number",
            ...(typeof min === "number" && { min }),
            ...(typeof max === "number" && { max })
          },
          msg,
          msgType,
        }),
      },
    );

    return schema;
  }

  /**
   * Creates a Zod schema for an optional number field.
   * 
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use for error messages. Defaults to `MsgType.FieldName`.
   * @param options.type - The type of number validation (integer or float). Defaults to `NumberFieldType.Integer`.
   * @param options.min - Optional minimum value constraint.
   * @param options.max - Optional maximum value constraint.
   * @returns A Zod schema that validates an optional number.
   *
   * @example
   * const { zNumberOptional } = createNumberSchemas(messageHandler);
   * const schema = zNumberOptional({ msg: "Age", type: NumberFieldType.Integer, min: 0, max: 150 });
   * schema.parse(25); // 25
   * schema.parse(undefined); // undefined
   * schema.parse("30"); // 30
   */
  const zNumberOptional = (options: NumberSchemaOptions = {}) => {
    const { msg = "Value", msgType = MsgType.FieldName, type = NumberFieldType.Integer, min, max } = options;
    return makeNumberSchema({
      msg,
      msgType,
      type,
      requirement: NumberFieldRequirement.Optional,
      output: NumberFieldOutput.AsNumber,
      min,
      max,
    });
  };

  /**
   * Creates a Zod schema for a required number field.
   * 
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use for error messages. Defaults to `MsgType.FieldName`.
   * @param options.type - The type of number validation (integer or float). Defaults to `NumberFieldType.Integer`.
   * @param options.min - Optional minimum value constraint.
   * @param options.max - Optional maximum value constraint.
   * @returns A Zod schema that validates a required number.
   *
   * @example
   * const { zNumberRequired } = createNumberSchemas(messageHandler);
   * const schema = zNumberRequired({ msg: "Price", type: NumberFieldType.Float, min: 0.01 });
   * schema.parse(9.99); // 9.99
   * schema.parse("5.50"); // 5.5
   */
  const zNumberRequired = (options: NumberSchemaOptions = {}) => {
    const { msg = "Value", msgType = MsgType.FieldName, type = NumberFieldType.Integer, min, max } = options;
    return makeNumberSchema({
      msg,
      msgType,
      type,
      requirement: NumberFieldRequirement.Required,
      output: NumberFieldOutput.AsNumber,
      min,
      max,
    });
  };

  /**
   * Creates a Zod schema for an optional number field that outputs as string.
   * 
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use for error messages. Defaults to `MsgType.FieldName`.
   * @param options.type - The type of number validation (integer or float). Defaults to `NumberFieldType.Integer`.
   * @param options.min - Optional minimum value constraint.
   * @param options.max - Optional maximum value constraint.
   * @returns A Zod schema that validates an optional number and returns it as a string.
   *
   * @example
   * const { zNumberStringOptional } = createNumberSchemas(messageHandler);
   * const schema = zNumberStringOptional({ msg: "ID", type: NumberFieldType.Integer });
   * schema.parse(123); // "123"
   * schema.parse(undefined); // undefined
   */
  const zNumberStringOptional = (options: NumberSchemaOptions = {}) => {
    const { msg = "Value", msgType = MsgType.FieldName, type = NumberFieldType.Integer, min, max } = options;
    return makeNumberSchema({
      msg,
      msgType,
      type,
      requirement: NumberFieldRequirement.Optional,
      output: NumberFieldOutput.AsString,
      min,
      max,
    });
  };

  /**
   * Creates a Zod schema for a required number field that outputs as string.
   * 
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use for error messages. Defaults to `MsgType.FieldName`.
   * @param options.type - The type of number validation (integer or float). Defaults to `NumberFieldType.Integer`.
   * @param options.min - Optional minimum value constraint.
   * @param options.max - Optional maximum value constraint.
   * @returns A Zod schema that validates a required number and returns it as a string.
   *
   * @example
   * const { zNumberStringRequired } = createNumberSchemas(messageHandler);
   * const schema = zNumberStringRequired({ msg: "Amount", type: NumberFieldType.Float, min: 0 });
   * schema.parse(99.99); // "99.99"
   * schema.parse("50"); // "50"
   */
  const zNumberStringRequired = (options: NumberSchemaOptions = {}) => {
    const { msg = "Value", msgType = MsgType.FieldName, type = NumberFieldType.Integer, min, max } = options;
    return makeNumberSchema({
      msg,
      msgType,
      type,
      requirement: NumberFieldRequirement.Required,
      output: NumberFieldOutput.AsString,
      min,
      max,
    });
  };

  return {
    zNumberOptional,
    zNumberRequired,
    zNumberStringOptional,
    zNumberStringRequired,
  };
};
