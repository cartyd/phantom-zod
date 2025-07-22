import { z } from "zod";
import { MsgType } from "./msg-type";
import { formatErrorMessage } from "../common/message-handler";
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
 * Creates a Zod schema for validating numbers (or numeric strings) with optional constraints.
 *
 * @param params - Configuration options for the schema.
 * @param params.msg - The field name or custom message for error output (default: "Value").
 * @param params.msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param params.type - Whether to constrain to integer or float (default: integer).
 * @param params.requirement - Whether the field is required or optional.
 * @param params.output - Whether to coerce the output to a string or number.
 * @param params.min - The minimum allowed value (if provided).
 * @param params.max - The maximum allowed value (if provided).
 * @returns A Zod schema that validates numbers or numeric strings, applies min/max constraints if specified,
 *          and optionally transforms the value to a string.
 *
 * @example
 * const schema = makeNumberSchema({ type: NumberFieldType.Float, requirement: NumberFieldRequirement.Required, min: 10, max: 100 });
 * schema.parse(42.5); // 42.5
 * schema.parse("50.1"); // 50.1
 * schema.parse("abc"); // Throws validation error
 */
export function makeNumberSchema({
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
      message: formatErrorMessage({
        msg,
        msgType,
        messageKey: "number.invalid",
        params: {
          type: type === NumberFieldType.Integer ? "integer" : "number",
          ...(typeof min === "number" && { min: String(min) }),
          ...(typeof max === "number" && { max: String(max) })
        },
        locale: 'en'
      }),
    },
  );

  return schema;
}

/**
 * Zod schema for an optional number field.
 * @param msg - The field name or custom message for error output.
 * @param type - NumberFieldType (Integer or Float, default Integer)
 * @param min - Minimum allowed value (optional)
 * @param max - Maximum allowed value (optional)
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 */
export const zNumberOptional = (
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
 * @param msg - The field name or custom message for error output.
 * @param type - NumberFieldType (Integer or Float, default Integer)
 * @param min - Minimum allowed value (optional)
 * @param max - Maximum allowed value (optional)
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 */
export const zNumberRequired = (
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
 * @param msg - The field name or custom message for error output.
 * @param type - NumberFieldType (Integer or Float, default Integer)
 * @param min - Minimum allowed value (optional)
 * @param max - Maximum allowed value (optional)
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 */
export const zNumberStringOptional = (
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
 * @param msg - The field name or custom message for error output.
 * @param type - NumberFieldType (Integer or Float, default Integer)
 * @param min - Minimum allowed value (optional)
 * @param max - Maximum allowed value (optional)
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 */
export const zNumberStringRequired = (
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
