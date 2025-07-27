import { z } from "zod";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { MsgType } from "../common/types/msg-type";

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

/**
 * Creates a factory function for date schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing date schema creation functions
 */
export const createDateSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Helper for consistent error message formatting
   */

  // Contract-compliant error message helpers
  const createRequiredError = (msg: string, msgType: MsgType) =>
    messageHandler.formatErrorMessage({
      group: "date",
      messageKey: "required",
      msg,
      msgType,
      params: {},
    });

  const createInvalidFormatError = (msg: string, msgType: MsgType, format: DateFormat) =>
    messageHandler.formatErrorMessage({
      group: "date",
      messageKey: "invalidFormat",
      msg,
      msgType,
      params: { format: getExampleFormat(format) },
    });

  const createInvalidDateStringError = (msg: string, msgType: MsgType) =>
    messageHandler.formatErrorMessage({
      group: "date",
      messageKey: "invalidDateString",
      msg,
      msgType,
      params: {},
    });


  /**
   * Creates a base date/datetime schema with consistent error handling.
   */
  const createDateSchema = (
    msg: string,
    requirement: FieldRequirement,
    format: DateFormat,
    returnType: ReturnType,
    msgType: MsgType = MsgType.FieldName,
    customFormat?: RegExp | ((str: string) => boolean),
    customParse?: (str: string) => Date | null,
  ) => {
    // Error messages for each contract key
    const requiredError = createRequiredError(msg, msgType);
    const invalidFormatError = createInvalidFormatError(msg, msgType, format);
    const invalidDateStringError = createInvalidDateStringError(msg, msgType);

    // Special case: custom validation function with ReturnType.String and no customParse
    const isCustomValidationFunction = format === DateFormat.Custom && typeof customFormat === 'function' && !customParse;
    if (isCustomValidationFunction) {
      const baseSchema = requirement === FieldRequirement.Required
        ? z.string().refine((val) => val !== undefined && val !== null && val.trim() !== '', { message: requiredError })
        : z.string().optional().refine((val) => val === undefined || val === null || val.trim() !== '', { message: requiredError });
      return baseSchema.refine((val) => {
        if (val === undefined || val === null) return requirement === FieldRequirement.Optional;
        return (customFormat as (str: string) => boolean)(val);
      }, { message: invalidFormatError });
    }

    if (requirement === FieldRequirement.Required) {
      const requiredSchema = z
        .union([z.string(), z.date()])
        .transform((val) => dateBaseTransform(val, format))
        // Reject undefined/null
        .refine(
          (val) => val !== undefined && val !== null,
          { message: requiredError },
        )
        // Reject empty strings (after trimming)
        .refine(
          (val) => {
            if (typeof val === "string" && val.trim() === "") return false;
            return true;
          },
          { message: requiredError },
        )
        // Reject invalid format
        .refine(
          (val) => isValidDateString(val, format, customFormat, customParse),
          { message: invalidFormatError },
        )
        // Reject if parseDate fails (invalid date string)
        .refine(
          (val) => {
            if (typeof val === "string" && isValidDateString(val, format, customFormat, customParse)) {
              return parseDate(val, format, customParse) !== null;
            }
            return true;
          },
          { message: invalidDateStringError },
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
      // Reject empty strings (after trimming)
      .refine(
        (val) => {
          if (val === undefined || val === null) return true;
          if (typeof val === "string" && val.trim() === "") return false;
          return true;
        },
        { message: requiredError },
      )
      // Reject invalid format
      .refine(
        (val) =>
          val === undefined ||
          val === null ||
          isValidDateString(val, format, customFormat, customParse),
        { message: invalidFormatError },
      )
      // Reject if parseDate fails (invalid date string)
      .refine(
        (val) => {
          if (val === undefined || val === null) return true;
          if (typeof val === "string" && isValidDateString(val, format, customFormat, customParse)) {
            return parseDate(val, format, customParse) !== null;
          }
          return true;
        },
        { message: invalidDateStringError },
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
   * Creates an optional date schema (YYYY-MM-DD format).
   * Returns a Date object if valid, undefined if not provided.
   */
  const zDateOptional = (
    msg = "Date",
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

  /**
   * Creates a required date schema (YYYY-MM-DD format).
   * Returns a Date object if valid.
   */
  const zDateRequired = (
    msg = "Date",
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

  /**
   * Creates an optional date schema that returns a string (YYYY-MM-DD format).
   * Returns a string if valid, undefined if not provided.
   */
  const zDateStringOptional = (
    msg = "Date",
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
   * Creates a required date string schema (YYYY-MM-DD format).
   * Returns a string if valid.
   */
  const zDateStringRequired = (
    msg = "Date",
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
   */
  const zDateTimeOptional = (
    msg = "DateTime",
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
   * Creates a required datetime schema (YYYY-MM-DDTHH:mm:ssZ format).
   * Returns a Date object if valid.
   */
  const zDateTimeRequired = (
    msg = "DateTime",
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
   */
  const zDateTimeStringOptional = (
    msg = "DateTime",
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

  /**
   * Creates a required datetime string schema (YYYY-MM-DDTHH:mm:ssZ format).
   * Returns a string if valid.
   */
  const zDateTimeStringRequired = (
    msg = "DateTime",
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

  /**
   * Advanced date schema function for cases requiring full control over all parameters.
   * Most users should use the convenient functions above instead.
   */
  const zDateSchema = (
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
   * Convenience wrapper for custom date formats.
   */
  const zDateCustom = (
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

  return {
    zDateOptional,
    zDateRequired,
    zDateStringOptional,
    zDateStringRequired,
    zDateTimeOptional,
    zDateTimeRequired,
    zDateTimeStringOptional,
    zDateTimeStringRequired,
    zDateSchema,
    zDateCustom,
  };
};
