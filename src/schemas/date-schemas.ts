import { z } from "zod";

import { formatErrorMessage } from "../common/message-handler";
import { MsgType } from "./msg-type";


export enum DateFormat {
  DateOnly = "DATE_ONLY", // YYYY-MM-DD
  DateTime = "DATE_TIME", // YYYY-MM-DDTHH:mm:ssZ
  Custom = "CUSTOM", // Custom format, see advanced usage
}
export enum FieldRequirement {
  Required = "REQUIRED",
  Optional = "OPTIONAL",
}
export enum ReturnType {
  DateObject = "DATE_OBJECT",
  String = "STRING",
}


export type DateOptional = z.infer<NonNullable<typeof dateOptionalSchema>>;
export type DateRequired = z.infer<NonNullable<typeof dateRequiredSchema>>;

export type DateStringOptional = z.infer<
  NonNullable<typeof dateStringOptionalSchema>
>;
export type DateStringRequired = z.infer<
  NonNullable<typeof dateStringRequiredSchema>
>;

export type DateTimeOptional = z.infer<
  NonNullable<typeof dateTimeOptionalSchema>
>;
export type DateTimeRequired = z.infer<
  NonNullable<typeof dateTimeRequiredSchema>
>;

export type DateTimeStringOptional = z.infer<
  NonNullable<typeof dateTimeStringOptionalSchema>
>;
export type DateTimeStringRequired = z.infer<
  NonNullable<typeof dateTimeStringRequiredSchema>
>;

/**
 * Converts a Date object to the appropriate string format
 * @param date - The Date object to convert
 * @param format - The desired format
 * @returns Formatted date string
 */
const formatDateToString = (date: Date, format: DateFormat): string => {
  return format === DateFormat.DateOnly
    ? date.toISOString().split("T")[0]
    : date.toISOString();
};

// Helper for base transformation
const dateBaseTransform = (val: string | Date, format: DateFormat) => {
  if (val instanceof Date) {
    return formatDateToString(val, format);
  }
  return val.trim();
};

/**
 * Gets the example format string for error messages
 * @param format - The date format
 * @returns Example format string
 */
const getExampleFormat = (format: DateFormat): string => {
  return format === DateFormat.DateOnly ? "YYYY-MM-DD" : "YYYY-MM-DDTHH:mm:ssZ";
};

/**
 * Creates a base date/datetime schema with consistent error handling.
 * @param fieldName - Field name for error messages
 * @param requirement - Whether the field is required or optional
 * @param format - The expected date format
 * @param returnType - Whether to return string or Date object
 * @returns Zod schema for date/datetime validation
 */
// Helper for consistent error message formatting
const dateErrorMessage = (msg: string, msgType: MsgType, format: DateFormat) =>
  formatErrorMessage({
    msg,
    msgType,
    messageKey: "date.invalidFormat",
    params: { format: getExampleFormat(format) }
  });

/**
 * Shared date parsing utility that handles both date and datetime formats.
 * @param value - The string value to parse
 * @param format - The expected date format
 * @returns Parsed Date object or null if invalid
 */
const parseDate = (
  value: string,
  format: DateFormat,
  customParse?: (str: string) => Date | null,
): Date | null => {
  if (format === DateFormat.Custom && customParse) {
    return customParse(value);
  }
  const dateString =
    format === DateFormat.DateOnly ? `${value}T00:00:00Z` : value;
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Validates if a string represents a valid date/datetime.
 * @param value - The string to validate
 * @param format - The expected date format
 * @returns true if valid, false otherwise
 */
const isValidDateString = (
  value: string,
  format: DateFormat,
  customFormat?: RegExp | ((str: string) => boolean),
  customParse?: (str: string) => Date | null,
): boolean => {
  if (format === DateFormat.Custom) {
    if (customFormat instanceof RegExp) {
      if (!customFormat.test(value)) return false;
    } else if (typeof customFormat === "function") {
      if (!customFormat(value)) return false;
    } else {
      return false;
    }
    return customParse ? parseDate(value, format, customParse) !== null : true;
  }
  return parseDate(value, format) !== null;
};
const createDateSchema = (
  msg: string,
  requirement: FieldRequirement,
  format: DateFormat,
  returnType: ReturnType,
  msgType: MsgType = MsgType.FieldName,
  customFormat?: RegExp | ((str: string) => boolean),
  customParse?: (str: string) => Date | null,
  
) => {
  const errorMessage = dateErrorMessage(msg, msgType, format);

  if (requirement === FieldRequirement.Required) {
    const requiredSchema = z
      .union([z.string(), z.date()])
      .transform((val) => dateBaseTransform(val, format))
      // Reject empty strings (after trimming)
      .refine(
        (val) => {
          if (typeof val === "string" && val.trim() === "") return false;
          return true;
        },
        {
          message: errorMessage,
        },
      )
      .refine(
        (val) => isValidDateString(val, format, customFormat, customParse),
        {
          message: errorMessage,
        },
      );

    return returnType === ReturnType.String
      ? requiredSchema
      : requiredSchema.transform((val) => parseDate(val, format, customParse)!);
  }

  // Optional schema
  const optionalSchema = z
    .union([z.string(), z.date()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null) return undefined;
      return dateBaseTransform(val, format);
    })
    .refine(
      (val) =>
        val === undefined ||
        val === null ||
        isValidDateString(val, format, customFormat, customParse),
      {
        message: errorMessage,
      },
    );

  return returnType === ReturnType.String
    ? optionalSchema
    : optionalSchema.transform((val) =>
        val === undefined || val === null
          ? undefined
          : parseDate(val, format, customParse)!,
      );
};

/**
 * Convenience wrapper for custom date formats.
 *
 * @param msg - The field name or custom message for error output
 * @param requirement - Whether the field is required or optional
 * @param returnType - Whether to return a Date object or string
 * @param customFormat - A regex (RegExp) or validation function (string => boolean) to validate the date string
 * @param customParse - (Optional) A function (string => Date|null) to parse the date string to a Date object
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for custom date validation
 *
 * @example
 * // US date MM/DD/YYYY as Date object
 * const schema = zDateCustom("US Date", FieldRequirement.Required, ReturnType.DateObject, /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/,
 * (str) => {
 * const [m, d, y] = str.split("/");
 * const dt = new Date(`${y}-${m}-${d}`);
 * return isNaN(dt.getTime()) ? null : dt;
 * }
 * );
 * schema.parse("12/31/2025"); // Returns Date object
 *
 * // Custom ISO string as string
 * const isoSchema = zDateCustom("ISO", FieldRequirement.Optional, ReturnType.String, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
 * isoSchema.parse("2025-07-15T12:00:00Z"); // Returns string
 */
// --- Types ---
// All schema instance and type exports are grouped at the end of the file, after all function and schema factory declarations.
export const zDateCustom = (
  msg: string,
  requirement: FieldRequirement,
  returnType: ReturnType,
  customFormat: RegExp | ((str: string) => boolean),
  customParse?: (str: string) => Date | null,
  msgType: MsgType = MsgType.FieldName,
) => {
  return createDateSchema(
    msg,
    requirement,
    DateFormat.Custom,
    returnType,
    msgType,
    customFormat,
    customParse,
  );
};

// --- Schema Instances ---

// =============================================================================
// CONVENIENT FUNCTIONS - Easy to use, low cognitive load
// =============================================================================

/**
 * Creates an optional date schema (YYYY-MM-DD format).
 * Returns a Date object if valid, undefined if not provided.
 *
 * @param msg - The field name or custom message for error output
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for optional date validation returning Date object
 *
 * @example
 * const schema = zDateOptional("Birth Date");
 * schema.parse("2023-10-01"); // Returns Date object
 * schema.parse(undefined); // Returns undefined
 */
export const zDateOptional = (
  msg: string = "Date",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createDateSchema(
    msg,
    FieldRequirement.Optional,
    DateFormat.DateOnly,
    ReturnType.DateObject,
    msgType,
  );
};
export const zDateRequired = (
  msg: string = "Date",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createDateSchema(
    msg,
    FieldRequirement.Required,
    DateFormat.DateOnly,
    ReturnType.DateObject,
    msgType,
  );
};

// =============================================================================
// ADVANCED FUNCTION - For cases requiring full control
// =============================================================================

/**
 * Advanced date schema function for cases requiring full control over all parameters.
 * Most users should use the convenient functions above instead.
 *
 * @param msg - The field name or custom message for error output
 * @param requirement - Whether the field is required or optional
 * @param format - The expected date format (DATE_ONLY, DATE_TIME, or CUSTOM)
 * @param returnType - Whether to return a Date object or string
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param customFormat - (Optional) For DateFormat.Custom, a regex (RegExp) or validation function (string => boolean) to validate the date string.
 * @param customParse - (Optional) For DateFormat.Custom, a function (string => Date|null) to parse the date string to a Date object.
 * @returns Zod schema for date/datetime validation
 *
 * @example
 * // Advanced usage - most code should use zDateOptional, zDateRequired, etc. instead
 * zDateSchema("Custom Field", FieldRequirement.REQUIRED, DateFormat.DATE_TIME, ReturnType.STRING)
 *
 * // Custom format (e.g., MM/DD/YYYY)
 * zDateSchema("US Date", FieldRequirement.REQUIRED, DateFormat.Custom, ReturnType.DateObject, MsgType.FieldName, /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/,
 *   (str) => {
 *     const [m, d, y] = str.split("/");
 *     const dt = new Date(`${y}-${m}-${d}`);
 *     return isNaN(dt.getTime()) ? null : dt;
 *   }
 * )
 */
export const zDateSchema = (
  msg: string,
  requirement: FieldRequirement,
  format: DateFormat,
  returnType: ReturnType,
  msgType: MsgType = MsgType.FieldName,
  customFormat?: RegExp | ((str: string) => boolean),
  customParse?: (str: string) => Date | null,
) => {
  return createDateSchema(
    msg,
    requirement,
    format,
    returnType,
    msgType,
    customFormat,
    customParse,
  );
};

/**
 * Creates an optional date schema that returns a string (YYYY-MM-DD format).
 * Returns a string if valid, undefined if not provided.
 *
 * @param msg - The field name or custom message for error output
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for optional date validation returning string
 *
 * @example
 * const schema = zDateStringOptional("Birth Date");
 * schema.parse("2023-10-01"); // Returns "2023-10-01"
 * schema.parse(undefined); // Returns undefined
 */
export const zDateStringOptional = (
  msg: string = "Date",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createDateSchema(
    msg,
    FieldRequirement.Optional,
    DateFormat.DateOnly,
    ReturnType.String,
    msgType,
  );
};
/**
 * Creates a required date string schema with customizable error message and message type.
 *
 * @param msg - The error message to display if validation fails. Defaults to "Date".
 * @param msgType - The type of message to use for validation errors. Defaults to `MsgType.FieldName`.
 * @returns A schema for validating required date strings in the format `DateOnly`.
 *
 * @example
 * const schema = zDateStringRequired("Start Date");
 * schema.parse("2023-10-01"); // Returns "2023-10-01"
 * schema.parse(""); // Throws validation error
 */
export const zDateStringRequired = (
  msg: string = "Date",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createDateSchema(
    msg,
    FieldRequirement.Required,
    DateFormat.DateOnly,
    ReturnType.String,
    msgType,
  );
};

/**
 * Creates an optional datetime schema (YYYY-MM-DDTHH:mm:ssZ format).
 * Returns a Date object if valid, undefined if not provided.
 *
 * @param msg - The field name or custom message for error output
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for optional datetime validation returning Date object
 *
 * @example
 * const schema = zDateTimeOptional("Created At");
 * schema.parse("2023-10-01T14:30:00Z"); // Returns Date object
 * schema.parse(undefined); // Returns undefined
 */
export const zDateTimeOptional = (
  msg: string = "DateTime",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createDateSchema(
    msg,
    FieldRequirement.Optional,
    DateFormat.DateTime,
    ReturnType.DateObject,
    msgType,
  );
};

/**
 * Creates a required date-time schema using the specified message and message type.
 *
 * @param msg - The error or field message to use. Defaults to "DateTime".
 * @param msgType - The type of message to display (e.g., field name or error type). Defaults to `MsgType.FieldName`.
 * @returns A schema for a required date-time field.
 *
 * @example
 * const schema = zDateTimeRequired("Event Time");
 * schema.parse("2023-10-01T14:30:00Z"); // Returns Date object
 * schema.parse(""); // Throws validation error
 */
export const zDateTimeRequired = (
  msg: string = "DateTime",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createDateSchema(
    msg,
    FieldRequirement.Required,
    DateFormat.DateTime,
    ReturnType.DateObject,
    msgType,
  );
};

/**
 * Creates an optional datetime schema that returns a string (YYYY-MM-DDTHH:mm:ssZ format).
 * Returns a string if valid, undefined if not provided.
 *
 * @param msg - The field name or custom message for error output
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for optional datetime validation returning string
 *
 * @example
 * const schema = zDateTimeStringOptional("Created At");
 * schema.parse("2023-10-01T14:30:00Z"); // Returns "2023-10-01T14:30:00Z"
 * schema.parse(undefined); // Returns undefined
 */
export const zDateTimeStringOptional = (
  msg: string = "DateTime",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createDateSchema(
    msg,
    FieldRequirement.Optional,
    DateFormat.DateTime,
    ReturnType.String,
    msgType,
  );
};
export const zDateTimeStringRequired = (
  msg: string = "DateTime",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createDateSchema(
    msg,
    FieldRequirement.Required,
    DateFormat.DateTime,
    ReturnType.String,
    msgType,
  );
};

// =============================================================================
// CONCRETE SCHEMA INSTANCES - For type inference
// =============================================================================

// Concrete schema instances for type inference
export const dateOptionalSchema = zDateOptional();
export const dateRequiredSchema = zDateRequired();
export const dateStringOptionalSchema = zDateStringOptional();
export const dateStringRequiredSchema = zDateStringRequired();
export const dateTimeOptionalSchema = zDateTimeOptional();
export const dateTimeRequiredSchema = zDateTimeRequired();
export const dateTimeStringOptionalSchema = zDateTimeStringOptional();
export const dateTimeStringRequiredSchema = zDateTimeStringRequired();
