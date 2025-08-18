import { z } from "zod";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { MsgType } from "../common/types/msg-type";
import type { BaseSchemaOptions } from "../common/types/schema-options.types";
import type { DateMessageParams } from "../localization/types/message-params.types";
import { createTestMessageHandler } from "../localization/types/message-handler.types";
import { makeOptionalSimple } from "../common/utils/zod-utils";

type DateMessageKey = keyof DateMessageParams;

/**
 * Options for date schema validation
 */
interface DateSchemaOptions extends BaseSchemaOptions {
  /** Optional minimum date constraint */
  min?: Date;
  /** Optional maximum date constraint */
  max?: Date;
}

/**
 * Creates a factory function for date schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing date schema creation functions
 */
export const createDateSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Helper function to create error message
   */
  const createErrorMessage = (
    messageKey: DateMessageKey,
    options: DateSchemaOptions = {},
  ) => {
    const { msg = "Date", msgType = MsgType.FieldName } = options;
    return messageHandler.formatErrorMessage({
      group: "date" as const,
      msg,
      msgType,
      messageKey,
      params: {},
    });
  };

  /**
   * Creates an optional Date schema that accepts both Date objects and date strings
   *
   * @param options - Configuration options for date validation
   * @returns Zod schema that accepts valid Date instances, date strings, or undefined
   *
   * @example
   * ```typescript
   * const schema = zDateOptional();
   * schema.parse(new Date());     // ✓ Valid (returns Date)
   * schema.parse("2023-01-01");   // ✓ Valid (returns Date)
   * schema.parse(undefined);      // ✓ Valid (returns undefined)
   * ```
   */
  const zDateOptional = (options: DateSchemaOptions = {}): z.ZodTypeAny => {
    const { min, max } = options;
    let baseSchema = z.union([
      z.date({
        message: createErrorMessage("mustBeValidDate", options),
      }),
      z
        .string()
        .date({
          message: createErrorMessage("mustBeValidDate", options),
        })
        .transform((val) => new Date(val + "T00:00:00Z")),
    ]);

    if (min || max) {
      baseSchema = baseSchema.refine(
        (date) => {
          if (min && date < min) return false;
          if (max && date > max) return false;
          return true;
        },
        { message: createErrorMessage("invalid", options) },
      );
    }

    return makeOptionalSimple(baseSchema);
  };

  /**
   * Creates a required Date schema that accepts both Date objects and date strings
   *
   * @param options - Configuration options for date validation
   * @returns Zod schema that accepts valid Date instances or date strings
   *
   * @example
   * ```typescript
   * const schema = zDateRequired();
   * schema.parse(new Date());     // ✓ Valid (returns Date)
   * schema.parse("2023-01-01");   // ✓ Valid (returns Date)
   * schema.parse(undefined);      // ✗ Throws error
   * ```
   */
  const zDateRequired = (options: DateSchemaOptions = {}): z.ZodTypeAny => {
    const { min, max } = options;
    let schema = z.union([
      z.date({
        message: createErrorMessage("mustBeValidDate", options),
      }),
      z
        .string()
        .date({
          message: createErrorMessage("mustBeValidDate", options),
        })
        .transform((val) => new Date(val + "T00:00:00Z")),
    ]);

    if (min || max) {
      schema = schema.refine(
        (date) => {
          if (min && date < min) return false;
          if (max && date > max) return false;
          return true;
        },
        { message: createErrorMessage("invalid", options) },
      );
    }

    return schema;
  };

  /**
   * Creates an optional ISO date string schema that accepts strings and Date objects
   *
   * Accepts ISO 8601 date strings like "2023-01-01" or "2023-01-01T10:30:00Z" and Date objects
   *
   * @param options - Configuration options for datetime validation
   * @returns Zod schema that accepts valid ISO date strings, Date objects, or undefined
   *
   * @example
   * ```typescript
   * const schema = zDateTimeStringOptional();
   * schema.parse("2023-01-01T10:30:00Z");  // ✓ Valid (returns string)
   * schema.parse("2023-01-01");            // ✓ Valid (returns string)
   * schema.parse(new Date());              // ✓ Valid (returns string)
   * schema.parse(undefined);               // ✓ Valid (returns undefined)
   * schema.parse("invalid-date");          // ✗ Throws error
   * ```
   */
  const zDateTimeStringOptional = (options: DateSchemaOptions = {}): z.ZodTypeAny => {
    return makeOptionalSimple(
      z.union([
        z.string().datetime({
          message: createErrorMessage("mustBeValidDateTime", options),
        }),
        z.string().date({
          message: createErrorMessage("mustBeValidDate", options),
        }),
        z
          .date({
            message: createErrorMessage("mustBeValidDate", options),
          })
          .transform((val) => val.toISOString()),
      ]),
    );
  };

  /**
   * Creates a required ISO date string schema that accepts strings and Date objects
   *
   * Accepts ISO 8601 date strings like "2023-01-01" or "2023-01-01T10:30:00Z" and Date objects
   *
   * @param options - Configuration options for datetime validation
   * @returns Zod schema that accepts valid ISO date strings or Date objects
   *
   * @example
   * ```typescript
   * const schema = zDateTimeStringRequired();
   * schema.parse("2023-01-01T10:30:00Z");  // ✓ Valid (returns string)
   * schema.parse("2023-01-01");            // ✓ Valid (returns string)
   * schema.parse(new Date());              // ✓ Valid (returns string)
   * schema.parse(undefined);               // ✗ Throws error
   * schema.parse("invalid-date");          // ✗ Throws error
   * ```
   */
  const zDateTimeStringRequired = (options: DateSchemaOptions = {}): z.ZodTypeAny => {
    return z.union([
      z.string().datetime({
        message: createErrorMessage("mustBeValidDateTime", options),
      }),
      z.string().date({
        message: createErrorMessage("mustBeValidDate", options),
      }),
      z
        .date({
          message: createErrorMessage("mustBeValidDate", options),
        })
        .transform((val) => val.toISOString()),
    ]);
  };

  /**
   * Creates an optional ISO date string schema that accepts both strings and Date objects
   *
   * @param options - Configuration options for date validation
   * @returns Zod schema that accepts valid ISO date strings, Date objects, or undefined
   *
   * @example
   * ```typescript
   * const schema = zDateStringOptional();
   * schema.parse("2023-01-01");            // ✓ Valid (returns string)
   * schema.parse(new Date("2023-01-01"));  // ✓ Valid (returns string)
   * schema.parse(undefined);               // ✓ Valid (returns undefined)
   * schema.parse("invalid-date");          // ✗ Throws error
   * ```
   */
  const zDateStringOptional = (options: DateSchemaOptions = {}) => {
    return makeOptionalSimple(
      z.union([
        z.string().date({
          message: createErrorMessage("mustBeValidDate", options),
        }),
        z
          .date({
            message: createErrorMessage("mustBeValidDate", options),
          })
          .transform((val) => val.toISOString().split("T")[0]),
      ]),
    );
  };

  /**
   * Creates a required ISO date string schema that accepts both strings and Date objects
   *
   * @param options - Configuration options for date validation
   * @returns Zod schema that accepts valid ISO date strings or Date objects
   *
   * @example
   * ```typescript
   * const schema = zDateStringRequired();
   * schema.parse("2023-01-01");            // ✓ Valid (returns string)
   * schema.parse(new Date("2023-01-01"));  // ✓ Valid (returns string)
   * schema.parse(undefined);               // ✗ Throws error
   * schema.parse("invalid-date");          // ✗ Throws error
   * ```
   */
  const zDateStringRequired = (options: DateSchemaOptions = {}) => {
    return z.union([
      z.string().date({
        message: createErrorMessage("mustBeValidDate", options),
      }),
      z
        .date({
          message: createErrorMessage("mustBeValidDate", options),
        })
        .transform((val) => val.toISOString().split("T")[0]),
    ]);
  };

  /**
   * Creates an optional ISO time string schema using Zod's built-in time validation
   *
   * @param options - Configuration options for time validation
   * @returns Zod schema that accepts valid ISO time strings or undefined
   *
   * @example
   * ```typescript
   * const schema = zTimeStringOptional();
   * schema.parse("10:30:00");     // ✓ Valid
   * schema.parse("10:30:00.123"); // ✓ Valid
   * schema.parse(undefined);      // ✓ Valid
   * schema.parse("invalid-time"); // ✗ Throws error
   * ```
   */
  const zTimeStringOptional = (options: DateSchemaOptions = {}) => {
    return z
      .string()
      .time({
        message: createErrorMessage("invalidFormat", options),
      })
      .optional();
  };

  /**
   * Creates a required ISO time string schema using Zod's built-in time validation
   *
   * @param options - Configuration options for time validation
   * @returns Zod schema that accepts only valid ISO time strings
   *
   * @example
   * ```typescript
   * const schema = zTimeStringRequired();
   * schema.parse("10:30:00");     // ✓ Valid
   * schema.parse("10:30:00.123"); // ✓ Valid
   * schema.parse(undefined);      // ✗ Throws error
   * schema.parse("invalid-time"); // ✗ Throws error
   * ```
   */
  const zTimeStringRequired = (options: DateSchemaOptions = {}) => {
    return z.string().time({
      message: createErrorMessage("invalidFormat", options),
    });
  };

  /**
   * Creates an optional datetime schema that accepts strings and Date objects
   *
   * @param options - Configuration options for datetime validation
   * @returns Zod schema that accepts ISO datetime strings, Date objects, and returns Date objects or undefined
   *
   * @example
   * ```typescript
   * const schema = zDateTimeOptional();
   * schema.parse("2023-01-01T10:30:00Z");  // ✓ Returns Date object
   * schema.parse("2023-01-01");            // ✓ Returns Date object
   * schema.parse(new Date());              // ✓ Returns Date object
   * schema.parse(undefined);               // ✓ Returns undefined
   * schema.parse("invalid-date");          // ✗ Throws error
   * ```
   */
  const zDateTimeOptional = (options: DateSchemaOptions = {}) => {
    return makeOptionalSimple(
      z.union([
        z.date({
          message: createErrorMessage("mustBeValidDate", options),
        }),
        z
          .string()
          .datetime({
            message: createErrorMessage("mustBeValidDateTime", options),
          })
          .transform((val) => new Date(val)),
        z
          .string()
          .date({
            message: createErrorMessage("mustBeValidDate", options),
          })
          .transform((val) => new Date(val + "T00:00:00Z")),
      ]),
    );
  };

  /**
   * Creates a required datetime schema that accepts strings and Date objects
   *
   * @param options - Configuration options for datetime validation
   * @returns Zod schema that accepts ISO datetime strings, Date objects, and returns Date objects
   *
   * @example
   * ```typescript
   * const schema = zDateTimeRequired();
   * schema.parse("2023-01-01T10:30:00Z");  // ✓ Returns Date object
   * schema.parse("2023-01-01");            // ✓ Returns Date object
   * schema.parse(new Date());              // ✓ Returns Date object
   * schema.parse(undefined);               // ✗ Throws error
   * schema.parse("invalid-date");          // ✗ Throws error
   * ```
   */
  const zDateTimeRequired = (options: DateSchemaOptions = {}) => {
    return z.union([
      z.date({
        message: createErrorMessage("mustBeValidDate", options),
      }),
      z
        .string()
        .datetime({
          message: createErrorMessage("mustBeValidDateTime", options),
        })
        .transform((val) => new Date(val)),
      z
        .string()
        .date({
          message: createErrorMessage("mustBeValidDate", options),
        })
        .transform((val) => new Date(val + "T00:00:00Z")),
    ]);
  };

  /**
   * Returns example date and time formats for user guidance
   *
   * @returns Object containing example formats for each supported type
   *
   * @example
   * ```typescript
   * const examples = getDateExamples();
   * console.log(examples.date);     // "2023-01-01"
   * console.log(examples.dateTime); // "2023-01-01T10:30:00Z"
   * console.log(examples.time);     // "10:30:00"
   * ```
   */
  const getDateExamples = () => {
    return {
      date: "2023-01-01",
      dateTime: "2023-01-01T10:30:00Z",
      time: "10:30:00",
    };
  };

  return {
    DateOptional: zDateOptional,
    DateRequired: zDateRequired,
    DateStringOptional: zDateStringOptional,
    DateStringRequired: zDateStringRequired,
    DateTimeOptional: zDateTimeOptional,
    DateTimeRequired: zDateTimeRequired,
    DateTimeStringOptional: zDateTimeStringOptional,
    DateTimeStringRequired: zDateTimeStringRequired,
    TimeStringOptional: zTimeStringOptional,
    TimeStringRequired: zTimeStringRequired,
    getDateExamples,
  };
};

// Create a test message handler for date validation
const dateMessageHandler = createTestMessageHandler((options) => {
  if (options.msgType === MsgType.Message) {
    return options.msg;
  }

  // Date-specific error messages
  switch (options.messageKey) {
    case "required":
      return `${options.msg} is required`;
    case "invalid":
      return `${options.msg} is invalid`;
    case "mustBeValidDate":
      return `${options.msg} must be a valid date`;
    case "mustBeValidDateTime":
      return `${options.msg} must be a valid datetime`;
    case "invalidFormat":
      return `${options.msg} has invalid format`;
    case "invalidDateString":
      return `${options.msg} has invalid date string`;
    default:
      return `${options.msg} is invalid`;
  }
});

// Create schemas with default handler
const defaultDateSchemas = createDateSchemas(dateMessageHandler);

// Helper functions with overloads to support both string and options object
function createDateOptionalOverload(
  msg: string,
): ReturnType<typeof defaultDateSchemas.DateOptional>;
function createDateOptionalOverload(
  options?: DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateOptional>;
function createDateOptionalOverload(
  msgOrOptions?: string | DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultDateSchemas.DateOptional({ msg: msgOrOptions });
  }
  return defaultDateSchemas.DateOptional(msgOrOptions);
}

function createDateRequiredOverload(
  msg: string,
): ReturnType<typeof defaultDateSchemas.DateRequired>;
function createDateRequiredOverload(
  options?: DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateRequired>;
function createDateRequiredOverload(
  msgOrOptions?: string | DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultDateSchemas.DateRequired({ msg: msgOrOptions });
  }
  return defaultDateSchemas.DateRequired(msgOrOptions);
}

function createDateStringOptionalOverload(
  msg: string,
): ReturnType<typeof defaultDateSchemas.DateStringOptional>;
function createDateStringOptionalOverload(
  options?: DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateStringOptional>;
function createDateStringOptionalOverload(
  msgOrOptions?: string | DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateStringOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultDateSchemas.DateStringOptional({ msg: msgOrOptions });
  }
  return defaultDateSchemas.DateStringOptional(msgOrOptions);
}

function createDateStringRequiredOverload(
  msg: string,
): ReturnType<typeof defaultDateSchemas.DateStringRequired>;
function createDateStringRequiredOverload(
  options?: DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateStringRequired>;
function createDateStringRequiredOverload(
  msgOrOptions?: string | DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateStringRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultDateSchemas.DateStringRequired({ msg: msgOrOptions });
  }
  return defaultDateSchemas.DateStringRequired(msgOrOptions);
}

function createDateTimeOptionalOverload(
  msg: string,
): ReturnType<typeof defaultDateSchemas.DateTimeOptional>;
function createDateTimeOptionalOverload(
  options?: DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateTimeOptional>;
function createDateTimeOptionalOverload(
  msgOrOptions?: string | DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateTimeOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultDateSchemas.DateTimeOptional({ msg: msgOrOptions });
  }
  return defaultDateSchemas.DateTimeOptional(msgOrOptions);
}

function createDateTimeRequiredOverload(
  msg: string,
): ReturnType<typeof defaultDateSchemas.DateTimeRequired>;
function createDateTimeRequiredOverload(
  options?: DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateTimeRequired>;
function createDateTimeRequiredOverload(
  msgOrOptions?: string | DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateTimeRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultDateSchemas.DateTimeRequired({ msg: msgOrOptions });
  }
  return defaultDateSchemas.DateTimeRequired(msgOrOptions);
}

function createDateTimeStringOptionalOverload(
  msg: string,
): ReturnType<typeof defaultDateSchemas.DateTimeStringOptional>;
function createDateTimeStringOptionalOverload(
  options?: DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateTimeStringOptional>;
function createDateTimeStringOptionalOverload(
  msgOrOptions?: string | DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateTimeStringOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultDateSchemas.DateTimeStringOptional({ msg: msgOrOptions });
  }
  return defaultDateSchemas.DateTimeStringOptional(msgOrOptions);
}

function createDateTimeStringRequiredOverload(
  msg: string,
): ReturnType<typeof defaultDateSchemas.DateTimeStringRequired>;
function createDateTimeStringRequiredOverload(
  options?: DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateTimeStringRequired>;
function createDateTimeStringRequiredOverload(
  msgOrOptions?: string | DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.DateTimeStringRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultDateSchemas.DateTimeStringRequired({ msg: msgOrOptions });
  }
  return defaultDateSchemas.DateTimeStringRequired(msgOrOptions);
}

function createTimeStringOptionalOverload(
  msg: string,
): ReturnType<typeof defaultDateSchemas.TimeStringOptional>;
function createTimeStringOptionalOverload(
  options?: DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.TimeStringOptional>;
function createTimeStringOptionalOverload(
  msgOrOptions?: string | DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.TimeStringOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultDateSchemas.TimeStringOptional({ msg: msgOrOptions });
  }
  return defaultDateSchemas.TimeStringOptional(msgOrOptions);
}

function createTimeStringRequiredOverload(
  msg: string,
): ReturnType<typeof defaultDateSchemas.TimeStringRequired>;
function createTimeStringRequiredOverload(
  options?: DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.TimeStringRequired>;
function createTimeStringRequiredOverload(
  msgOrOptions?: string | DateSchemaOptions,
): ReturnType<typeof defaultDateSchemas.TimeStringRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultDateSchemas.TimeStringRequired({ msg: msgOrOptions });
  }
  return defaultDateSchemas.TimeStringRequired(msgOrOptions);
}

// Export schemas with string parameter overloads
export const DateOptional = createDateOptionalOverload;
export const DateRequired = createDateRequiredOverload;
export const DateStringOptional = createDateStringOptionalOverload;
export const DateStringRequired = createDateStringRequiredOverload;
export const DateTimeOptional = createDateTimeOptionalOverload;
export const DateTimeRequired = createDateTimeRequiredOverload;
export const DateTimeStringOptional = createDateTimeStringOptionalOverload;
export const DateTimeStringRequired = createDateTimeStringRequiredOverload;
export const TimeStringOptional = createTimeStringOptionalOverload;
export const TimeStringRequired = createTimeStringRequiredOverload;

/**
 * Returns example date and time formats for user guidance
 *
 * @returns Object containing example formats for each supported type
 *
 * @example
 * ```typescript
 * const examples = getDateExamples();
 * console.log(examples.date);     // "2023-01-01"
 * console.log(examples.dateTime); // "2023-01-01T10:30:00Z"
 * console.log(examples.time);     // "10:30:00"
 * ```
 */
export const getDateExamples = defaultDateSchemas.getDateExamples;

// Export the options interface for external use
export type { DateSchemaOptions };

// --- Types ---
type DateSchemasFactory = ReturnType<typeof createDateSchemas>;
export type DateValue = z.infer<ReturnType<DateSchemasFactory["DateRequired"]>>;
export type DateString = z.infer<
  ReturnType<DateSchemasFactory["DateStringRequired"]>
>;
export type DateTimeValue = z.infer<
  ReturnType<DateSchemasFactory["DateTimeRequired"]>
>;
export type DateTimeString = z.infer<
  ReturnType<DateSchemasFactory["DateTimeStringRequired"]>
>;
export type TimeString = z.infer<
  ReturnType<DateSchemasFactory["TimeStringRequired"]>
>;
