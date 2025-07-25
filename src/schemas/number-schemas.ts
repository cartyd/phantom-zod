import { z } from "zod";
import { MsgType } from "./msg-type";
import type { ErrorMessageFormatter } from "../common/message-handler";
import { INTEGER_PATTERN, FLOAT_PATTERN } from "../common/regex-patterns";
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
          msg,
          msgType,
          messageKey: "number.invalid",
          params: {
            type: type === NumberFieldType.Integer ? "integer" : "number",
            ...(typeof min === "number" && { min: String(min) }),
            ...(typeof max === "number" && { max: String(max) })
          },
        }),
      },
    );

    return schema;
  }

  /**
   * Zod schema for an optional number field.
   */
  const zNumberOptional = (
    msg = "Value",
    type: NumberFieldType = NumberFieldType.Integer,
    min?: number,
    max?: number,
    msgType: MsgType = MsgType.FieldName,
  ) =>
    makeNumberSchema({
      msg,
      msgType,
      type,
      requirement: NumberFieldRequirement.Optional,
      output: NumberFieldOutput.AsNumber,
      min,
      max,
    });

  /**
   * Zod schema for a required number field.
   */
  const zNumberRequired = (
    msg = "Value",
    type: NumberFieldType = NumberFieldType.Integer,
    min?: number,
    max?: number,
    msgType: MsgType = MsgType.FieldName,
  ) =>
    makeNumberSchema({
      msg,
      msgType,
      type,
      requirement: NumberFieldRequirement.Required,
      output: NumberFieldOutput.AsNumber,
      min,
      max,
    });

  /**
   * Zod schema for an optional number field, output as string.
   */
  const zNumberStringOptional = (
    msg = "Value",
    type: NumberFieldType = NumberFieldType.Integer,
    min?: number,
    max?: number,
    msgType: MsgType = MsgType.FieldName,
  ) =>
    makeNumberSchema({
      msg,
      msgType,
      type,
      requirement: NumberFieldRequirement.Optional,
      output: NumberFieldOutput.AsString,
      min,
      max,
    });

  /**
   * Zod schema for a required number field, output as string.
   */
  const zNumberStringRequired = (
    msg = "Value",
    type: NumberFieldType = NumberFieldType.Integer,
    min?: number,
    max?: number,
    msgType: MsgType = MsgType.FieldName,
  ) =>
    makeNumberSchema({
      msg,
      msgType,
      type,
      requirement: NumberFieldRequirement.Required,
      output: NumberFieldOutput.AsString,
      min,
      max,
    });

  return {
    makeNumberSchema,
    zNumberOptional,
    zNumberRequired,
    zNumberStringOptional,
    zNumberStringRequired,
  };
};

/**
 * Individual schema creation functions that accept messageHandler as first parameter
 */

export const zNumberOptional = (
  messageHandler: ErrorMessageFormatter,
  msg = "Value",
  type: NumberFieldType = NumberFieldType.Integer,
  min?: number,
  max?: number,
  msgType: MsgType = MsgType.FieldName,
) => {
  return createNumberSchemas(messageHandler).zNumberOptional(msg, type, min, max, msgType);
};

export const zNumberRequired = (
  messageHandler: ErrorMessageFormatter,
  msg = "Value",
  type: NumberFieldType = NumberFieldType.Integer,
  min?: number,
  max?: number,
  msgType: MsgType = MsgType.FieldName,
) => {
  return createNumberSchemas(messageHandler).zNumberRequired(msg, type, min, max, msgType);
};

export const zNumberStringOptional = (
  messageHandler: ErrorMessageFormatter,
  msg = "Value",
  type: NumberFieldType = NumberFieldType.Integer,
  min?: number,
  max?: number,
  msgType: MsgType = MsgType.FieldName,
) => {
  return createNumberSchemas(messageHandler).zNumberStringOptional(msg, type, min, max, msgType);
};

export const zNumberStringRequired = (
  messageHandler: ErrorMessageFormatter,
  msg = "Value",
  type: NumberFieldType = NumberFieldType.Integer,
  min?: number,
  max?: number,
  msgType: MsgType = MsgType.FieldName,
) => {
  return createNumberSchemas(messageHandler).zNumberStringRequired(msg, type, min, max, msgType);
};
