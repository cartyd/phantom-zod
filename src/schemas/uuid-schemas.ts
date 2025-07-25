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
    z
      .string()
      .optional()
      .refine((val) => val === undefined || val === "" || UUID_PATTERN.test(val), {
          message: messageHandler.formatErrorMessage({ group: "uuid", msg, msgType, messageKey: "mustBeValidUuid"}),
      });

  /**
   * Required UUID schema.
   * Accepts a non-empty string that matches any UUID version (1-5).
   */
  const zUuidRequired = (
    msg = "ID",
    msgType: MsgType = MsgType.FieldName,
  ) => 
    z
      .string()
      .nonempty({
        message: messageHandler.formatErrorMessage({ group: "uuid", msg, msgType, messageKey: "required"}),
      })
      .refine((val) => UUID_PATTERN.test(val), {
          message: messageHandler.formatErrorMessage({ group: "uuid", msg, msgType, messageKey: "mustBeValidUuid"}),
      });

  /**
   * Optional UUIDv4 schema.
   * Accepts a string that matches UUID version 4 or undefined/empty.
   */
  const zUuidV4Optional = (
    msg = "ID",
    msgType: MsgType = MsgType.FieldName,
  ) => 
    z
      .string()
      .optional()
      .refine(
        (val) => val === undefined || val === "" || UUID_V4_PATTERN.test(val),
        {
          message: messageHandler.formatErrorMessage({ group: "uuid", msg, msgType, messageKey: "mustBeValidUuidV4"}),
        },
      );

  /**
   * Required UUIDv4 schema.
   * Accepts a non-empty string that matches UUID version 4.
   */
  const zUuidV4Required = (
    msg = "ID",
    msgType: MsgType = MsgType.FieldName,
  ) => 
    z
      .string()
      .nonempty({
          message: messageHandler.formatErrorMessage({ group: "uuid", msg, msgType, messageKey: "required"}),
      })
      .refine((val) => UUID_V4_PATTERN.test(val), {
        message: messageHandler.formatErrorMessage({ group: "uuid", msg, msgType, messageKey: "mustBeValidUuidV4"}),
      });

  return {
    zUuidOptional,
    zUuidRequired,
    zUuidV4Optional,
    zUuidV4Required,
  };
};

