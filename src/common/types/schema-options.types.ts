import type { MsgType } from "./msg-type";

/**
 * Base interface for all schema options.
 * Provides common properties that all schema creation functions should support.
 */
export interface BaseSchemaOptions {
  /** The field name or custom message to use in error messages. Defaults to "Value". */
  msg?: string;
  /** The type of message formatting to use, based on MsgType. Defaults to MsgType.FieldName. */
  msgType?: MsgType;
}

/**
 * Options for string schema creation functions.
 */
export interface StringSchemaOptions extends BaseSchemaOptions {
  /** Optional minimum length constraint for the string. */
  minLength?: number;
  /** Optional maximum length constraint for the string. */
  maxLength?: number;
}

/**
 * Options for email schema creation functions.
 */
export interface EmailSchemaOptions extends BaseSchemaOptions {
  // Email schemas only need the base options
}

/**
 * Options for number schema creation functions.
 */
export interface NumberSchemaOptions extends BaseSchemaOptions {
  /** The type of number validation (integer or float). */
  type?: import("../../schemas/number-schemas").NumberFieldType;
  /** Optional minimum value constraint. */
  min?: number;
  /** Optional maximum value constraint. */
  max?: number;
  /** Whether the field is required or optional. */
  requirement?: import("../../schemas/number-schemas").NumberFieldRequirement;
  /** Whether to output as number or string. */
  output?: import("../../schemas/number-schemas").NumberFieldOutput;
}

/**
 * Options for date schema creation functions.
 */
export interface DateSchemaOptions extends BaseSchemaOptions {
  /** The expected date format. */
  format?: import("../../schemas/date-schemas").DateFormat;
  /** Whether the field is required or optional. */
  requirement?: import("../../schemas/date-schemas").FieldRequirement;
  /** Whether to return Date object or string. */
  returnType?: import("../../schemas/date-schemas").ReturnType;
  /** Custom format validation (regex or function). */
  customFormat?: RegExp | ((str: string) => boolean);
  /** Custom date parsing function. */
  customParse?: (str: string) => Date | null;
}

/**
 * Options for money schema creation functions.
 */
export interface MoneySchemaOptions extends BaseSchemaOptions {
  /** Maximum number of decimal places allowed. */
  maxDecimals?: number;
}

/**
 * Options for array schema creation functions.
 */
export interface ArraySchemaOptions extends BaseSchemaOptions {
  /** Optional minimum number of items constraint for the array. */
  minItems?: number;
  /** Optional maximum number of items constraint for the array. */
  maxItems?: number;
}

/**
 * Options for phone schema creation functions.
 */
export interface PhoneSchemaOptions extends BaseSchemaOptions {
  /** The desired phone format (E.164 or National). */
  format?: import("../../schemas/phone-schemas").PhoneFormat;
}

/**
 * Options for postal code schema creation functions.
 */
export interface PostalCodeSchemaOptions extends BaseSchemaOptions {
  // Postal code schemas only need the base options
}

/**
 * Options for currency code schema creation functions.
 */
export interface CurrencySchemaOptions extends BaseSchemaOptions {
  // Currency schemas only need the base options
}
