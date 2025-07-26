import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/message-handler.types";
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
    msg = "ID",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.string().optional().superRefine((val, ctx) => {
      if (val === undefined || val === "") return;
      if (typeof val !== "string") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "uuid",
            msg,
            msgType,
            messageKey: "invalid",
            params: { receivedValue: val, reason: "Not a string" },
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
            messageKey: "mustBeValidUuid",
            params: { receivedValue: val },
          }),
        });
      }
    });

  /**
   * Required UUID schema.
   * Accepts a non-empty string that matches any UUID version (1-5).
   */
  const zUuidRequired = (
    msg = "ID",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.string()
      .nonempty({
        message: messageHandler.formatErrorMessage({ group: "uuid", msg, msgType, messageKey: "required"}),
      })
      .superRefine((val, ctx) => {
        if (typeof val !== "string") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: messageHandler.formatErrorMessage({
              group: "uuid",
              msg,
              msgType,
              messageKey: "invalid",
              params: { receivedValue: val, reason: "Not a string" },
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
              messageKey: "mustBeValidUuid",
              params: { receivedValue: val },
            }),
          });
        }
      });

  /**
   * Optional UUIDv4 schema.
   * Accepts a string that matches UUID version 4 or undefined/empty.
   */
  const zUuidV4Optional = (
    msg = "ID",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.string().optional().superRefine((val, ctx) => {
      if (val === undefined || val === "") return;
      if (typeof val !== "string") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "uuid",
            msg,
            msgType,
            messageKey: "invalid",
            params: { receivedValue: val, reason: "Not a string" },
          }),
        });
        return;
      }
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

  /**
   * Required UUIDv4 schema.
   * Accepts a non-empty string that matches UUID version 4.
   */
  const zUuidV4Required = (
    msg = "ID",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.string()
      .nonempty({
        message: messageHandler.formatErrorMessage({ group: "uuid", msg, msgType, messageKey: "required"}),
      })
      .superRefine((val, ctx) => {
        if (typeof val !== "string") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: messageHandler.formatErrorMessage({
              group: "uuid",
              msg,
              msgType,
              messageKey: "invalid",
              params: { receivedValue: val, reason: "Not a string" },
            }),
          });
          return;
        }
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

  return {
    zUuidOptional,
    zUuidRequired,
    zUuidV4Optional,
    zUuidV4Required,
  };
};

