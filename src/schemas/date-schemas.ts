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
  const createErrorMessage = (messageKey: DateMessageKey, options: DateSchemaOptions = {}) => {
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
  const zDateOptional = (options: DateSchemaOptions = {}) => {
    const { min, max } = options;
    let baseSchema = z.union([
      z.date({
        message: createErrorMessage("mustBeValidDate", options)
      }),
      z.string().date({
        message: createErrorMessage("mustBeValidDate", options)
      }).transform(val => new Date(val + "T00:00:00Z"))
    ]);

    if (min || max) {
      baseSchema = baseSchema.refine(
        (date) => {
          if (min && date < min) return false;
          if (max && date > max) return false;
          return true;
        },
        { message: createErrorMessage("invalid", options) }
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
  const zDateRequired = (options: DateSchemaOptions = {}) => {
    const { min, max } = options;
    let schema = z.union([
      z.date({
        message: createErrorMessage("mustBeValidDate", options)
      }),
      z.string().date({
        message: createErrorMessage("mustBeValidDate", options)
      }).transform(val => new Date(val + "T00:00:00Z"))
    ]);

    if (min || max) {
      schema = schema.refine(
        (date) => {
          if (min && date < min) return false;
          if (max && date > max) return false;
          return true;
        },
        { message: createErrorMessage("invalid", options) }
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
  const zDateTimeStringOptional = (options: DateSchemaOptions = {}) => {
    return makeOptionalSimple(
      z.union([
        z.string().datetime({
          message: createErrorMessage("mustBeValidDateTime", options)
        }),
        z.string().date({
          message: createErrorMessage("mustBeValidDate", options)
        }),
        z.date({
          message: createErrorMessage("mustBeValidDate", options)
        }).transform(val => val.toISOString())
      ])
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
  const zDateTimeStringRequired = (options: DateSchemaOptions = {}) => {
    return z.union([
      z.string().datetime({
        message: createErrorMessage("mustBeValidDateTime", options)
      }),
      z.string().date({
        message: createErrorMessage("mustBeValidDate", options)
      }),
      z.date({
        message: createErrorMessage("mustBeValidDate", options)
      }).transform(val => val.toISOString())
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
          message: createErrorMessage("mustBeValidDate", options)
        }),
        z.date({
          message: createErrorMessage("mustBeValidDate", options)
        }).transform(val => val.toISOString().split('T')[0])
      ])
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
        message: createErrorMessage("mustBeValidDate", options)
      }),
      z.date({
        message: createErrorMessage("mustBeValidDate", options)
      }).transform(val => val.toISOString().split('T')[0])
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
    return z.string().time({
      message: createErrorMessage("invalidFormat", options)
    }).optional();
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
      message: createErrorMessage("invalidFormat", options)
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
          message: createErrorMessage("mustBeValidDate", options)
        }),
        z.string().datetime({
          message: createErrorMessage("mustBeValidDateTime", options)
        }).transform(val => new Date(val)),
        z.string().date({
          message: createErrorMessage("mustBeValidDate", options)
        }).transform(val => new Date(val + "T00:00:00Z"))
      ])
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
        message: createErrorMessage("mustBeValidDate", options)
      }),
      z.string().datetime({
        message: createErrorMessage("mustBeValidDateTime", options)
      }).transform(val => new Date(val)),
      z.string().date({
        message: createErrorMessage("mustBeValidDate", options)
      }).transform(val => new Date(val + "T00:00:00Z"))
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
      time: "10:30:00"
    };
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
    zTimeStringOptional,
    zTimeStringRequired,
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
const {
  zDateOptional: baseZDateOptional,
  zDateRequired: baseZDateRequired,
  zDateStringOptional: baseZDateStringOptional,
  zDateStringRequired: baseZDateStringRequired,
  zDateTimeOptional: baseZDateTimeOptional,
  zDateTimeRequired: baseZDateTimeRequired,
  zDateTimeStringOptional: baseZDateTimeStringOptional,
  zDateTimeStringRequired: baseZDateTimeStringRequired,
  zTimeStringOptional: baseZTimeStringOptional,
  zTimeStringRequired: baseZTimeStringRequired,
  getDateExamples: baseGetDateExamples,
} = createDateSchemas(dateMessageHandler);

// Export schemas for direct use

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
export const zDateOptional = baseZDateOptional;

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
export const zDateRequired = baseZDateRequired;

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
export const zDateStringOptional = baseZDateStringOptional;

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
export const zDateStringRequired = baseZDateStringRequired;

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
export const zDateTimeOptional = baseZDateTimeOptional;

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
export const zDateTimeRequired = baseZDateTimeRequired;

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
export const zDateTimeStringOptional = baseZDateTimeStringOptional;

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
export const zDateTimeStringRequired = baseZDateTimeStringRequired;

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
export const zTimeStringOptional = baseZTimeStringOptional;

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
export const zTimeStringRequired = baseZTimeStringRequired;

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
export const getDateExamples = baseGetDateExamples;

// Export the options interface for external use
export type { DateSchemaOptions };

// --- Types ---
type DateSchemasFactory = ReturnType<typeof createDateSchemas>;
export type DateValue = z.infer<ReturnType<DateSchemasFactory['zDateRequired']>>;
export type DateString = z.infer<ReturnType<DateSchemasFactory['zDateStringRequired']>>;
export type DateTimeValue = z.infer<ReturnType<DateSchemasFactory['zDateTimeRequired']>>;
export type DateTimeString = z.infer<ReturnType<DateSchemasFactory['zDateTimeStringRequired']>>;
export type TimeString = z.infer<ReturnType<DateSchemasFactory['zTimeStringRequired']>>;

