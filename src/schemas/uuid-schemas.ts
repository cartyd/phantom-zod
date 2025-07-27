import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import type { BaseSchemaOptions } from "../common/types/schema-options.types";
import { UUID_PATTERN, UUID_V4_PATTERN } from "../common/regex-patterns";


/**
 * Creates a factory function for UUID schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing UUID schema creation functions
 */
export const createUuidSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Optional UUID schema.
   * Accepts a string that matches any UUID version (1-5) or undefined/empty.
   */
  const zUuidOptional = (
    options: BaseSchemaOptions = {}
  ) => {
    const { msg = "ID", msgType = MsgType.FieldName } = options;
    return z.union([
      z.string().superRefine((val, ctx) => {
        if (val === "") return; // Allow empty strings
        if (!UUID_PATTERN.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: messageHandler.formatErrorMessage({
              group: "uuid",
              msg,
              msgType,
              messageKey: "mustBeValidUuid",
              params: { receivedValue: val },
            }),
          });
        }
      }),
      z.undefined()
    ]);
  };

  /**
   * Required UUID schema.
   * Accepts a non-empty string that matches any UUID version (1-5).
   */
  const zUuidRequired = (
    options: BaseSchemaOptions = {}
  ) => {
    const { msg = "ID", msgType = MsgType.FieldName } = options;
    return z.string({
      message: messageHandler.formatErrorMessage({ 
        group: "uuid", 
        msg, 
        msgType, 
        messageKey: "required",
        params: {}
      }),
    })
    .min(1, {
      message: messageHandler.formatErrorMessage({ 
        group: "uuid", 
        msg, 
        msgType, 
        messageKey: "required",
        params: {}
      }),
    })
    .superRefine((val, ctx) => {
      if (!UUID_PATTERN.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "uuid",
            msg,
            msgType,
            messageKey: "mustBeValidUuid",
            params: { receivedValue: val },
          }),
        });
      }
    });
  };

  /**
   * Optional UUIDv4 schema.
   * Accepts a string that matches UUID version 4 or undefined/empty.
   */
  const zUuidV4Optional = (
    options: BaseSchemaOptions = {}
  ) => {
    const { msg = "ID", msgType = MsgType.FieldName } = options;
    return z.union([
      z.string().superRefine((val, ctx) => {
        if (val === "") return; // Allow empty strings
        if (!UUID_V4_PATTERN.test(val)) {
          if (UUID_PATTERN.test(val)) {
            const version = val.split('-')[2]?.charAt(0);
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: messageHandler.formatErrorMessage({
                group: "uuid",
                msg,
                msgType,
                messageKey: "mustBeValidUuidV4",
                params: { receivedVersion: version },
              }),
            });
          } else {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: messageHandler.formatErrorMessage({
                group: "uuid",
                msg,
                msgType,
                messageKey: "mustBeValidUuidV4",
                params: { receivedVersion: undefined },
              }),
            });
          }
        }
      }),
      z.undefined()
    ]);
  };

  /**
   * Required UUIDv4 schema.
   * Accepts a non-empty string that matches UUID version 4.
   */
  const zUuidV4Required = (
    options: BaseSchemaOptions = {}
  ) => {
    const { msg = "ID", msgType = MsgType.FieldName } = options;
    return z.string({
      message: messageHandler.formatErrorMessage({ 
        group: "uuid", 
        msg, 
        msgType, 
        messageKey: "required",
        params: {}
      }),
    })
    .min(1, {
      message: messageHandler.formatErrorMessage({ 
        group: "uuid", 
        msg, 
        msgType, 
        messageKey: "required",
        params: {}
      }),
    })
    .superRefine((val, ctx) => {
      if (!UUID_V4_PATTERN.test(val)) {
        if (UUID_PATTERN.test(val)) {
          const version = val.split('-')[2]?.charAt(0);
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: messageHandler.formatErrorMessage({
              group: "uuid",
              msg,
              msgType,
              messageKey: "mustBeValidUuidV4",
              params: { receivedVersion: version },
            }),
          });
        } else {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: messageHandler.formatErrorMessage({
              group: "uuid",
              msg,
              msgType,
              messageKey: "mustBeValidUuidV4",
              params: { receivedVersion: undefined },
            }),
          });
        }
      }
    });
  };

  /**
   * Validates UUID format and returns a formatted error message using invalidFormat.
   * This utility function demonstrates usage of the invalidFormat message key.
   */
  const getUuidFormatErrorMessage = (
    options: BaseSchemaOptions = {}
  ) => {
    const { msg = "ID", msgType = MsgType.FieldName } = options;
    return messageHandler.formatErrorMessage({
      group: "uuid",
      msg,
      msgType,
      messageKey: "invalidFormat",
      params: { expectedFormat: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
    });
  };

  /**
   * Creates a strict UUID validator that uses invalidFormat message for format errors.
   */
  const zUuidWithFormatError = (
    options: BaseSchemaOptions = {}
  ) => {
    const { msg = "ID", msgType = MsgType.FieldName } = options;
    return z.string().superRefine((val, ctx) => {
      if (!val || val.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "uuid",
            msg,
            msgType,
            messageKey: "required",
            params: {},
          }),
        });
        return;
      }
      
      if (!UUID_PATTERN.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "uuid",
            msg,
            msgType,
            messageKey: "invalidFormat",
            params: { expectedFormat: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
          }),
        });
      }
    });
  };

  return {
    zUuidOptional,
    zUuidRequired,
    zUuidV4Optional,
    zUuidV4Required,
    getUuidFormatErrorMessage,
    zUuidWithFormatError,
  };
};

