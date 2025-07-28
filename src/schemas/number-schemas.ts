import { z } from "zod";

import { MsgType } from "../common/types/msg-type";
import type { NumberSchemaOptions } from "../common/types/schema-options.types";
import { type ErrorMessageFormatter, createTestMessageHandler } from "../localization/types/message-handler.types";


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
    msgType: MsgType
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
  const addMinMaxConstraints = (
    schema: any, 
    min?: number, 
    max?: number, 
    msg: string = "Value", 
    msgType: MsgType = MsgType.FieldName
  ) => {
    let constrainedSchema = schema;
    
    if (min !== undefined) {
      constrainedSchema = constrainedSchema.refine(
        (val: any) => typeof val !== 'number' || val >= min,
        { message: createErrorMessage("tooSmall", { min }, msg, msgType) }
      );
    }
    
    if (max !== undefined) {
      constrainedSchema = constrainedSchema.refine(
        (val: any) => typeof val !== 'number' || val <= max,
        { message: createErrorMessage("tooBig", { max }, msg, msgType) }
      );
    }
    
    return constrainedSchema;
  };

  // Helper function to extract and provide default options with improved typing
  const extractOptions = (options: NumberSchemaOptions): {
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
    asString: boolean = false
  ) => {
    const { msg, msgType, min, max } = extractOptions(options);
    
    // Create strict number schema with custom validation
    let schema = z.any().transform((val, ctx) => {
      // Reject null explicitly
      if (val === null) {
        ctx.addIssue({
          code: "custom",
          message: createErrorMessage("mustBeNumber", { receivedType: 'object' }, msg, msgType)
        });
        return z.NEVER;
      }
      
      // Handle strings with strict validation
      if (typeof val === 'string') {
        const trimmed = val.trim();
        // Reject empty strings
        if (trimmed === '') {
          ctx.addIssue({
            code: "custom",
            message: createErrorMessage("mustBeNumber", { receivedType: 'string' }, msg, msgType)
          });
          return z.NEVER;
        }
        // Reject invalid formats like "123." or multiple dots
        if (trimmed.endsWith('.') || (trimmed.match(/\./g) || []).length > 1) {
          ctx.addIssue({
            code: "custom",
            message: createErrorMessage("mustBeNumber", { receivedType: 'string' }, msg, msgType)
          });
          return z.NEVER;
        }
        // Convert to number
        const num = Number(trimmed);
        if (isNaN(num)) {
          ctx.addIssue({
            code: "custom",
            message: createErrorMessage("mustBeNumber", { receivedType: 'string' }, msg, msgType)
          });
          return z.NEVER;
        }
        return num;
      }
      
      // Handle numbers directly
      if (typeof val === 'number') {
        return val;
      }
      
      // Reject everything else
      ctx.addIssue({
        code: "custom",
        message: createErrorMessage("mustBeNumber", { receivedType: typeof val }, msg, msgType)
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

  const zNumberOptional = (options: NumberSchemaOptions = {}) => createNumberSchema(options, false);

  const zNumberRequired = (options: NumberSchemaOptions = {}) => createNumberSchema(options, true);

  const zNumberStringOptional = (options: NumberSchemaOptions = {}) => createNumberSchema(options, false, true);

  const zNumberStringRequired = (options: NumberSchemaOptions = {}) => createNumberSchema(options, true, true);

  // Explicit specialized schema implementations - clear and maintainable
  const zIntegerRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce.number({
      message: createErrorMessage("mustBeNumber", { receivedType: 'string' }, msg, msgType)
    }).int({
      message: createErrorMessage("mustBeInteger", { receivedValue: 'decimal' }, msg, msgType)
    });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const zIntegerOptional = (options: NumberSchemaOptions = {}) => {
    return zIntegerRequired(options).optional();
  };

  const zPositiveRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce.number({
      message: createErrorMessage("mustBeNumber", { receivedType: 'string' }, msg, msgType)
    }).positive({
      message: createErrorMessage("mustBePositive", { receivedValue: 'non-positive' }, msg, msgType)
    });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const zPositiveOptional = (options: NumberSchemaOptions = {}) => {
    return zPositiveRequired(options).optional();
  };

  const zNegativeRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce.number({
      message: createErrorMessage("mustBeNumber", { receivedType: 'string' }, msg, msgType)
    }).negative({
      message: createErrorMessage("mustBeNegative", { receivedValue: 'non-negative' }, msg, msgType)
    });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const zNegativeOptional = (options: NumberSchemaOptions = {}) => {
    return zNegativeRequired(options).optional();
  };

  const zNonNegativeRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce.number({
      message: createErrorMessage("mustBeNumber", { receivedType: 'string' }, msg, msgType)
    }).nonnegative({
      message: createErrorMessage("mustBeNonNegative", { receivedValue: 'negative' }, msg, msgType)
    });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const zNonNegativeOptional = (options: NumberSchemaOptions = {}) => {
    return zNonNegativeRequired(options).optional();
  };

  const zNonPositiveRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce.number({
      message: createErrorMessage("mustBeNumber", { receivedType: 'string' }, msg, msgType)
    }).nonpositive({
      message: createErrorMessage("mustBeNonPositive", { receivedValue: 'positive' }, msg, msgType)
    });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const zNonPositiveOptional = (options: NumberSchemaOptions = {}) => {
    return zNonPositiveRequired(options).optional();
  };

  const zFiniteRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce.number({
      message: createErrorMessage("mustBeNumber", { receivedType: 'string' }, msg, msgType)
    }).finite({
      message: createErrorMessage("invalid", { reason: 'must be finite' }, msg, msgType)
    });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const zFiniteOptional = (options: NumberSchemaOptions = {}) => {
    return zFiniteRequired(options).optional();
  };

  const zSafeIntegerRequired = (options: NumberSchemaOptions = {}) => {
    const { msg, msgType, min, max } = extractOptions(options);
    const schema = z.coerce.number({
      message: createErrorMessage("mustBeNumber", { receivedType: 'string' }, msg, msgType)
    }).safe({
      message: createErrorMessage("invalid", { reason: 'must be a safe integer' }, msg, msgType)
    });
    return addMinMaxConstraints(schema, min, max, msg, msgType);
  };

  const zSafeIntegerOptional = (options: NumberSchemaOptions = {}) => {
    return zSafeIntegerRequired(options).optional();
  };

  return {
    zNumberOptional,
    zNumberRequired,
    zNumberStringOptional,
    zNumberStringRequired,
    zIntegerRequired,
    zIntegerOptional,
    zPositiveRequired,
    zPositiveOptional,
    zNegativeRequired,
    zNegativeOptional,
    zNonNegativeRequired,
    zNonNegativeOptional,
    zNonPositiveRequired,
    zNonPositiveOptional,
    zFiniteRequired,
    zFiniteOptional,
    zSafeIntegerRequired,
    zSafeIntegerOptional,
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

// Create schemas with default handler and export them directly - eliminates all repetitive export patterns
const {
  zNumberOptional,
  zNumberRequired,
  zNumberStringOptional,
  zNumberStringRequired,
  zIntegerRequired,
  zIntegerOptional,
  zPositiveRequired,
  zPositiveOptional,
  zNegativeRequired,
  zNegativeOptional,
  zNonNegativeRequired,
  zNonNegativeOptional,
  zNonPositiveRequired,
  zNonPositiveOptional,
  zFiniteRequired,
  zFiniteOptional,
  zSafeIntegerRequired,
  zSafeIntegerOptional,
} = createNumberSchemas(numberMessageHandler);

// Export schemas for direct use - single destructuring and export eliminates all repetitive patterns
export {
  zNumberOptional,
  zNumberRequired,
  zNumberStringOptional,
  zNumberStringRequired,
  zIntegerRequired,
  zIntegerOptional,
  zPositiveRequired,
  zPositiveOptional,
  zNegativeRequired,
  zNegativeOptional,
  zNonNegativeRequired,
  zNonNegativeOptional,
  zNonPositiveRequired,
  zNonPositiveOptional,
  zFiniteRequired,
  zFiniteOptional,
  zSafeIntegerRequired,
  zSafeIntegerOptional
};

// Export the options interface for external use
export type { NumberSchemaOptions };
