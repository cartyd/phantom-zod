import { z } from "zod";

import { MsgType } from "../common/types/msg-type";
import type { NumberSchemaOptions } from "../common/types/schema-options.types";
import {
  type ErrorMessageFormatter,
  createTestMessageHandler,
} from "../localization/types/message-handler.types";

/**
 * Creates a factory function for number schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing number schema creation functions
 */
export const createNumberSchemas = (messageHandler: ErrorMessageFormatter) => {
  // Helper function to create error messages - eliminates redundant code with improved typing
  const createErrorMessage = (
    messageKey: keyof import("../localization/types/message-params.types").NumberMessageParams,
    params: Record<string, unknown>,
    msg: string,
    msgType: MsgType,
  ): string => {
    return messageHandler.formatErrorMessage({
      group: "number",
      messageKey,
      params,
      msg,
      msgType,
    });
  };

  // Helper function to add min/max constraints using refine
  const addMinMaxConstraints = <TSchema extends z.ZodTypeAny>(
    schema: TSchema,
    min?: number,
    max?: number,
    msg: string = "Value",
    msgType: MsgType = MsgType.FieldName,
  ): TSchema => {
    let constrainedSchema = schema;

    if (min !== undefined) {
      constrainedSchema = constrainedSchema.refine(
        (val: any) => typeof val !== "number" || val >= min,
        { message: createErrorMessage("tooSmall", { min }, msg, msgType) },
      );
    }

    if (max !== undefined) {
      constrainedSchema = constrainedSchema.refine(
        (val: any) => typeof val !== "number" || val <= max,
        { message: createErrorMessage("tooBig", { max }, msg, msgType) },
      );
    }

    return constrainedSchema as TSchema;
  };

  // Helper function to extract and provide default options with improved typing
  const extractOptions = (
    options: NumberSchemaOptions,
  ): {
    msg: string;
    msgType: MsgType;
    min?: number;
    max?: number;
  } => {
    const { msg = "Value", msgType = MsgType.FieldName, min, max } = options;
    return { msg, msgType, min, max };
  };

  // Modern approach with strict validation
  const createNumberSchema = (
    options: NumberSchemaOptions,
    isRequired: boolean,
    asString: boolean = false,
  ): z.ZodTypeAny => {
    const { msg, msgType, min, max } = extractOptions(options);

    // Create strict number schema with custom validation
    let schema = z.any().transform((val, ctx) => {
      // Reject null explicitly
      if (val === null) {
        ctx.addIssue({
          code: "custom",
          message: createErrorMessage(
            "mustBeNumber",
            { receivedType: "object" },
            msg,
            msgType,
          ),
        });
        return z.NEVER;
      }

      // Handle strings with strict validation
      if (typeof val === "string") {
        const trimmed = val.trim();
        // Reject empty strings
        if (trimmed === "") {
          ctx.addIssue({
            code: "custom",
            message: createErrorMessage(
              "mustBeNumber",
              { receivedType: "string" },
              msg,
              msgType,
            ),
          });
          return z.NEVER;
        }
        // Reject invalid formats like "123." or multiple dots
        if (trimmed.endsWith(".") || (trimmed.match(/\./g) || []).length > 1) {
          ctx.addIssue({
            code: "custom",
            message: createErrorMessage(
              "mustBeNumber",
              { receivedType: "string" },
              msg,
              msgType,
            ),
          });
          return z.NEVER;
        }
        // Convert to number
        const num = Number(trimmed);
        if (isNaN(num)) {
          ctx.addIssue({
            code: "custom",
            message: createErrorMessage(
              "mustBeNumber",
              { receivedType: "string" },
              msg,
              msgType,
            ),
          });
          return z.NEVER;
        }
        return num;
      }

      // Handle numbers directly
      if (typeof val === "number") {
        return val;
      }

      // Reject everything else
      ctx.addIssue({
        code: "custom",
        message: createErrorMessage(
          "mustBeNumber",
          { receivedType: typeof val },
          msg,
          msgType,
        ),
      });
      return z.NEVER;
    });

    // Add min/max constraints
    schema = addMinMaxConstraints(schema, min, max, msg, msgType);

    // Handle string transformation if needed
    if (asString) {
      const stringSchema = schema.transform((val) => String(val));
      return isRequired ? stringSchema : stringSchema.optional();
    }

    return isRequired ? schema : schema.optional();
  };

  // Enhanced NumberRequired with native Zod chaining support
  const NumberRequired = (options: NumberSchemaOptions = {}) => {
    // Always use strict validation for consistent behavior
    return createNumberSchema(options, true);
  };

  // Enhanced NumberOptional with partial chaining support
  const NumberOptional = (options: NumberSchemaOptions = {}) => {
    // Always use strict validation for consistent behavior
    return createNumberSchema(options, false);
  };

  const NumberStringOptional = (options: NumberSchemaOptions = {}) =>
    createNumberSchema(options, false, true);

  const NumberStringRequired = (options: NumberSchemaOptions = {}) =>
    createNumberSchema(options, true, true);

  // Explicit specialized schema implementations - clear and maintainable
  const IntegerRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce
      .number({
        message: createErrorMessage(
          "mustBeNumber",
          { receivedType: "string" },
          msg,
          msgType,
        ),
      })
      .int({
        message: createErrorMessage(
          "mustBeInteger",
          { receivedValue: "decimal" },
          msg,
          msgType,
        ),
      });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const IntegerOptional = (options: NumberSchemaOptions = {}) => {
    return IntegerRequired(options).optional();
  };

  const PositiveRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce
      .number({
        message: createErrorMessage(
          "mustBeNumber",
          { receivedType: "string" },
          msg,
          msgType,
        ),
      })
      .positive({
        message: createErrorMessage(
          "mustBePositive",
          { receivedValue: "non-positive" },
          msg,
          msgType,
        ),
      });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const PositiveOptional = (options: NumberSchemaOptions = {}) => {
    return PositiveRequired(options).optional();
  };

  const NegativeRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce
      .number({
        message: createErrorMessage(
          "mustBeNumber",
          { receivedType: "string" },
          msg,
          msgType,
        ),
      })
      .negative({
        message: createErrorMessage(
          "mustBeNegative",
          { receivedValue: "non-negative" },
          msg,
          msgType,
        ),
      });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const NegativeOptional = (options: NumberSchemaOptions = {}) => {
    return NegativeRequired(options).optional();
  };

  const NonNegativeRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce
      .number({
        message: createErrorMessage(
          "mustBeNumber",
          { receivedType: "string" },
          msg,
          msgType,
        ),
      })
      .nonnegative({
        message: createErrorMessage(
          "mustBeNonNegative",
          { receivedValue: "negative" },
          msg,
          msgType,
        ),
      });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const NonNegativeOptional = (options: NumberSchemaOptions = {}) => {
    return NonNegativeRequired(options).optional();
  };

  const NonPositiveRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce
      .number({
        message: createErrorMessage(
          "mustBeNumber",
          { receivedType: "string" },
          msg,
          msgType,
        ),
      })
      .nonpositive({
        message: createErrorMessage(
          "mustBeNonPositive",
          { receivedValue: "positive" },
          msg,
          msgType,
        ),
      });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const NonPositiveOptional = (options: NumberSchemaOptions = {}) => {
    return NonPositiveRequired(options).optional();
  };

  const FiniteRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce
      .number({
        message: createErrorMessage(
          "mustBeNumber",
          { receivedType: "string" },
          msg,
          msgType,
        ),
      })
      .finite({
        message: createErrorMessage(
          "invalid",
          { reason: "must be finite" },
          msg,
          msgType,
        ),
      });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const FiniteOptional = (options: NumberSchemaOptions = {}) => {
    return FiniteRequired(options).optional();
  };

  const SafeIntegerRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce
      .number({
        message: createErrorMessage(
          "mustBeNumber",
          { receivedType: "string" },
          msg,
          msgType,
        ),
      })
      .safe({
        message: createErrorMessage(
          "invalid",
          { reason: "must be a safe integer" },
          msg,
          msgType,
        ),
      });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const SafeIntegerOptional = (options: NumberSchemaOptions = {}) => {
    return SafeIntegerRequired(options).optional();
  };

  return {
    NumberOptional,
    NumberRequired,
    NumberStringOptional,
    NumberStringRequired,
    IntegerRequired,
    IntegerOptional,
    PositiveRequired,
    PositiveOptional,
    NegativeRequired,
    NegativeOptional,
    NonNegativeRequired,
    NonNegativeOptional,
    NonPositiveRequired,
    NonPositiveOptional,
    FiniteRequired,
    FiniteOptional,
    SafeIntegerRequired,
    SafeIntegerOptional,
  };
};

// Create a test message handler for number validation
const numberMessageHandler = createTestMessageHandler((options) => {
  if (options.msgType === MsgType.Message) {
    return options.msg;
  }

  // Number-specific error messages
  switch (options.messageKey) {
    case "required":
      return `${options.msg} is required`;
    case "invalid":
      return `${options.msg} is invalid`;
    case "mustBeNumber":
      return `${options.msg} must be a number`;
    case "mustBeInteger":
      return `${options.msg} must be an integer`;
    case "mustBeFloat":
      return `${options.msg} must be a float`;
    case "mustBePositive":
      return `${options.msg} must be positive`;
    case "mustBeNegative":
      return `${options.msg} must be negative`;
    case "mustBeNonNegative":
      return `${options.msg} must be non-negative`;
    case "mustBeNonPositive":
      return `${options.msg} must be non-positive`;
    case "tooSmall":
      return `${options.msg} must be at least ${(options.params as any)?.min}`;
    case "tooBig":
      return `${options.msg} must be at most ${(options.params as any)?.max}`;
    case "outOfRange":
      return `${options.msg} must be between ${(options.params as any)?.min} and ${(options.params as any)?.max}`;
    case "invalidDecimalPlaces":
      return `${options.msg} must have at most ${(options.params as any)?.max} decimal places`;
    default:
      return `${options.msg} is invalid`;
  }
});

// Create schemas with default handler
const defaultNumberSchemas = createNumberSchemas(numberMessageHandler);

// Helper functions with overloads to support both string and options object
function createIntegerRequiredOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.IntegerRequired>;
function createIntegerRequiredOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.IntegerRequired>;
function createIntegerRequiredOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.IntegerRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.IntegerRequired({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.IntegerRequired(msgOrOptions);
}

function createIntegerOptionalOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.IntegerOptional>;
function createIntegerOptionalOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.IntegerOptional>;
function createIntegerOptionalOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.IntegerOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.IntegerOptional({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.IntegerOptional(msgOrOptions);
}

function createPositiveRequiredOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.PositiveRequired>;
function createPositiveRequiredOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.PositiveRequired>;
function createPositiveRequiredOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.PositiveRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.PositiveRequired({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.PositiveRequired(msgOrOptions);
}

function createPositiveOptionalOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.PositiveOptional>;
function createPositiveOptionalOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.PositiveOptional>;
function createPositiveOptionalOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.PositiveOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.PositiveOptional({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.PositiveOptional(msgOrOptions);
}

function createNegativeRequiredOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.NegativeRequired>;
function createNegativeRequiredOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.NegativeRequired>;
function createNegativeRequiredOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.NegativeRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.NegativeRequired({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.NegativeRequired(msgOrOptions);
}

function createNegativeOptionalOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.NegativeOptional>;
function createNegativeOptionalOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.NegativeOptional>;
function createNegativeOptionalOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.NegativeOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.NegativeOptional({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.NegativeOptional(msgOrOptions);
}

function createNonNegativeRequiredOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.NonNegativeRequired>;
function createNonNegativeRequiredOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.NonNegativeRequired>;
function createNonNegativeRequiredOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.NonNegativeRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.NonNegativeRequired({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.NonNegativeRequired(msgOrOptions);
}

function createNonNegativeOptionalOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.NonNegativeOptional>;
function createNonNegativeOptionalOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.NonNegativeOptional>;
function createNonNegativeOptionalOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.NonNegativeOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.NonNegativeOptional({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.NonNegativeOptional(msgOrOptions);
}

function createNonPositiveRequiredOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.NonPositiveRequired>;
function createNonPositiveRequiredOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.NonPositiveRequired>;
function createNonPositiveRequiredOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.NonPositiveRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.NonPositiveRequired({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.NonPositiveRequired(msgOrOptions);
}

function createNonPositiveOptionalOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.NonPositiveOptional>;
function createNonPositiveOptionalOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.NonPositiveOptional>;
function createNonPositiveOptionalOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.NonPositiveOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.NonPositiveOptional({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.NonPositiveOptional(msgOrOptions);
}

function createFiniteRequiredOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.FiniteRequired>;
function createFiniteRequiredOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.FiniteRequired>;
function createFiniteRequiredOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.FiniteRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.FiniteRequired({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.FiniteRequired(msgOrOptions);
}

function createFiniteOptionalOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.FiniteOptional>;
function createFiniteOptionalOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.FiniteOptional>;
function createFiniteOptionalOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.FiniteOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.FiniteOptional({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.FiniteOptional(msgOrOptions);
}

function createSafeIntegerRequiredOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.SafeIntegerRequired>;
function createSafeIntegerRequiredOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.SafeIntegerRequired>;
function createSafeIntegerRequiredOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.SafeIntegerRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.SafeIntegerRequired({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.SafeIntegerRequired(msgOrOptions);
}

function createSafeIntegerOptionalOverload(
  msg: string,
): ReturnType<typeof defaultNumberSchemas.SafeIntegerOptional>;
function createSafeIntegerOptionalOverload(
  options?: NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.SafeIntegerOptional>;
function createSafeIntegerOptionalOverload(
  msgOrOptions?: string | NumberSchemaOptions,
): ReturnType<typeof defaultNumberSchemas.SafeIntegerOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultNumberSchemas.SafeIntegerOptional({ msg: msgOrOptions });
  }
  return defaultNumberSchemas.SafeIntegerOptional(msgOrOptions);
}

// Export schemas with string parameter overloads
export const NumberOptional = defaultNumberSchemas.NumberOptional;
export const NumberRequired = defaultNumberSchemas.NumberRequired;
export const NumberStringOptional = defaultNumberSchemas.NumberStringOptional;
export const NumberStringRequired = defaultNumberSchemas.NumberStringRequired;
export const IntegerRequired = createIntegerRequiredOverload;
export const IntegerOptional = createIntegerOptionalOverload;
export const PositiveRequired = createPositiveRequiredOverload;
export const PositiveOptional = createPositiveOptionalOverload;
export const NegativeRequired = createNegativeRequiredOverload;
export const NegativeOptional = createNegativeOptionalOverload;
export const NonNegativeRequired = createNonNegativeRequiredOverload;
export const NonNegativeOptional = createNonNegativeOptionalOverload;
export const NonPositiveRequired = createNonPositiveRequiredOverload;
export const NonPositiveOptional = createNonPositiveOptionalOverload;
export const FiniteRequired = createFiniteRequiredOverload;
export const FiniteOptional = createFiniteOptionalOverload;
export const SafeIntegerRequired = createSafeIntegerRequiredOverload;
export const SafeIntegerOptional = createSafeIntegerOptionalOverload;

// Export the options interface for external use
export type { NumberSchemaOptions };
