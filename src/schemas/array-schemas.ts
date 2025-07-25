import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/message-handler.types";
import type { ArraySchemaOptions } from "../common/types/schema-options.types";

// --- Types ---
// Note: These types are simplified since they rely on the factory functions
export type StringArrayOptional = string[] | undefined;
export type StringArrayRequired = string[];

/**
 * Creates a factory function for array schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing array schema creation functions
 */
export const createArraySchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Helper function to add item constraints to an array schema
   */
  function addItemConstraints<TSchema extends z.ZodTypeAny>(
    schema: TSchema,
    msg: string,
    msgType: MsgType,
    minItems?: number,
    maxItems?: number
  ): TSchema {
    let result = schema;
    
    if (minItems !== undefined) {
      result = result.refine((val: unknown) => {
        if (!Array.isArray(val)) return true;
        return val.length >= minItems;
      }, {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustHaveMinItems",
          params: { min: minItems },
          msg,
          msgType,
        }),
      }) as TSchema;
    }
    
    if (maxItems !== undefined) {
      result = result.refine((val: unknown) => {
        if (!Array.isArray(val)) return true;
        return val.length <= maxItems;
      }, {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustHaveMaxItems",
          params: { max: maxItems },
          msg,
          msgType,
        }),
      }) as TSchema;
    }
    
    return result;
  }

  /**
   * Creates a Zod schema for an optional array of strings.
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use for error messages. Defaults to `MsgType.FieldName`.
   * @param options.minItems - Optional minimum number of items constraint for the array.
   * @param options.maxItems - Optional maximum number of items constraint for the array.
   * @returns A Zod schema that validates an optional array of strings.
   *
   * @example
   * const { zStringArrayOptional } = createArraySchemas(messageHandler);
   * const schema = zStringArrayOptional({ msg: "Tags", minItems: 1, maxItems: 10 });
   * schema.parse(['a', 'b']); // ['a', 'b']
   * schema.parse(undefined); // undefined
   * schema.parse([1, 2]); // throws ZodError
   */
  const zStringArrayOptional = (options: ArraySchemaOptions = {}) => {
    const { msg = "Value", msgType = MsgType.FieldName, minItems, maxItems } = options;
    
    let schema = z
      .array(z.string({
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustBeStringArray",
          params: {},
          msg,
          msgType,
        }),
      }))
      .optional();
      
    schema = addItemConstraints(schema, msg, msgType, minItems, maxItems);
    return schema;
  };

  /**
   * Creates a Zod schema for a required array of strings with at least one item.
   *
   * @param options - Configuration options for the schema
   * @param options.msg - The field name or custom message to use in error messages. Defaults to "Value".
   * @param options.msgType - The type of message formatting to use for error messages. Defaults to `MsgType.FieldName`.
   * @param options.minItems - Optional minimum number of items constraint for the array. Defaults to 1.
   * @param options.maxItems - Optional maximum number of items constraint for the array.
   * @returns A Zod schema that validates a required array of strings with at least one item.
   *
   * @example
   * const { zStringArrayRequired } = createArraySchemas(messageHandler);
   * const schema = zStringArrayRequired({ msg: "Categories", maxItems: 20 });
   * schema.parse(['foo']); // ['foo']
   * schema.parse([]); // throws ZodError
   * schema.parse(undefined); // throws ZodError
   * schema.parse([1, 2]); // throws ZodError
   */
  const zStringArrayRequired = (options: ArraySchemaOptions = {}) => {
    const { msg = "Value", msgType = MsgType.FieldName, minItems = 1, maxItems } = options;
    
    let schema = z
      .array(z.string({
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustBeStringArray",
          params: {},
          msg,
          msgType,
        }),
      }))
      .nonempty({
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustNotBeEmpty",
          params: {},
          msg,
          msgType,
        }),
      });
      
    schema = addItemConstraints(schema, msg, msgType, minItems, maxItems);
    return schema;
  };

  return {
    zStringArrayOptional,
    zStringArrayRequired,
  };
};
