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
  // Helper: check for duplicates and return their values/indices
  function findDuplicates(arr: any[]): { values: any[]; indices: number[] } {
    const seen = new Map<any, number[]>();
    arr.forEach((v, i) => {
      if (!seen.has(v)) seen.set(v, []);
      seen.get(v)!.push(i);
    });
    const values: any[] = [];
    const indices: number[] = [];
    for (const [val, idxs] of seen.entries()) {
      if (idxs.length > 1) {
        values.push(val);
        indices.push(...idxs);
      }
    }
    return { values, indices };
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
    // Start with a custom Zod type to allow for full contract coverage
    const schema = z.custom<any[]>((val) => {
      if (val === undefined) return true;
      if (!Array.isArray(val)) return false;
      return true;
    }, {
      message: messageHandler.formatErrorMessage({
        group: "array",
        messageKey: "mustBeArray",
        params: { receivedType: undefined },
        msg,
        msgType,
      }),
    }).optional().superRefine((val, ctx) => {
      if (val === undefined) return;
      if (!Array.isArray(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "mustBeArray",
            params: { receivedType: typeof val },
            msg,
            msgType,
          }),
        });
        return;
      }
      // Required (empty array is allowed for optional)
      // Type check for string elements
      const receivedTypes: string[] = [];
      const invalidIndices: number[] = [];
      val.forEach((v, i) => {
        if (typeof v !== 'string') {
          receivedTypes.push(typeof v);
          invalidIndices.push(i);
        }
      });
      if (invalidIndices.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "mustBeStringArray",
            params: { receivedTypes, invalidIndices },
            msg,
            msgType,
          }),
        });
      }
      // minItems/tooSmall
      if (minItems !== undefined && val.length < minItems) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "tooSmall",
            params: { min: minItems },
            msg,
            msgType,
          }),
        });
      }
      // maxItems/tooBig
      if (maxItems !== undefined && val.length > maxItems) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "tooBig",
            params: { max: maxItems },
            msg,
            msgType,
          }),
        });
      }
      // duplicateItems
      const { values: duplicateValues, indices } = findDuplicates(val);
      if (duplicateValues.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "duplicateItems",
            params: { duplicateValues, indices },
            msg,
            msgType,
          }),
        });
      }
    });
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
    const schema = z.custom<any[]>((val) => {
      return Array.isArray(val);
    }, {
      message: messageHandler.formatErrorMessage({
        group: "array",
        messageKey: "mustBeArray",
        params: { receivedType: undefined },
        msg,
        msgType,
      }),
    }).superRefine((val, ctx) => {
      if (!Array.isArray(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "mustBeArray",
            params: { receivedType: typeof val },
            msg,
            msgType,
          }),
        });
        return;
      }
      // Required
      if (val.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "mustNotBeEmpty",
            params: {},
            msg,
            msgType,
          }),
        });
      }
      // Type check for string elements
      const receivedTypes: string[] = [];
      const invalidIndices: number[] = [];
      val.forEach((v, i) => {
        if (typeof v !== 'string') {
          receivedTypes.push(typeof v);
          invalidIndices.push(i);
        }
      });
      if (invalidIndices.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "mustBeStringArray",
            params: { receivedTypes, invalidIndices },
            msg,
            msgType,
          }),
        });
      }
      // minItems/tooSmall
      if (minItems !== undefined && val.length < minItems) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "tooSmall",
            params: { min: minItems },
            msg,
            msgType,
          }),
        });
      }
      // maxItems/tooBig
      if (maxItems !== undefined && val.length > maxItems) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "tooBig",
            params: { max: maxItems },
            msg,
            msgType,
          }),
        });
      }
      // duplicateItems
      const { values: duplicateValues, indices } = findDuplicates(val);
      if (duplicateValues.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "duplicateItems",
            params: { duplicateValues, indices },
            msg,
            msgType,
          }),
        });
      }
    });
    return schema;
  };

  return {
    zStringArrayOptional,
    zStringArrayRequired,
  };
};
