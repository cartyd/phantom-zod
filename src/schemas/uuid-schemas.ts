import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import type { BaseSchemaOptions } from "../common/types/schema-options.types";
import type { UuidMessageParams } from "../localization/types/message-params.types";

type UuidVersion = "v4" | "v6" | "v7";
type UuidMessageKey = keyof UuidMessageParams;

/**
 * Creates a factory function for UUID schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing UUID schema creation functions
 */
export const createUuidSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Helper function to create error message
   */
  const createErrorMessage = (messageKey: UuidMessageKey, options: BaseSchemaOptions = {}) => {
    const { msg = "ID", msgType = MsgType.FieldName } = options;
    return messageHandler.formatErrorMessage({
      group: "uuid" as const,
      msg,
      msgType,
      messageKey,
      params: {},
    });
  };

  /**
   * Helper function to create required UUID schema
   */
  const createRequiredUuid = (version?: UuidVersion, messageKey: UuidMessageKey = "mustBeValidUuid") => {
    return (options: BaseSchemaOptions = {}) => {
      const zodOptions: any = {
        message: createErrorMessage(messageKey, options),
      };
      if (version) {
        zodOptions.version = version;
      }
      return z.uuid(zodOptions);
    };
  };

  /**
   * Helper function to create optional UUID schema
   */
  const createOptionalUuid = (version?: UuidVersion, messageKey: UuidMessageKey = "mustBeValidUuid") => {
    return (options: BaseSchemaOptions = {}) => {
      const validator = version ? z.uuid({ version }) : z.uuid();
      return z.union([
        z.string().refine(
          (val) => val === "" || validator.safeParse(val).success,
          { message: createErrorMessage(messageKey, options) }
        ),
        z.undefined()
      ]);
    };
  };

  // Generate schemas using helpers
  const zUuidOptional = createOptionalUuid();
  const zUuidRequired = createRequiredUuid();
  const zUuidV4Optional = createOptionalUuid("v4", "mustBeValidUuidV4");
  const zUuidV4Required = createRequiredUuid("v4", "mustBeValidUuidV4");
  const zUuidV6Optional = createOptionalUuid("v6", "mustBeValidUuidV6");
  const zUuidV6Required = createRequiredUuid("v6", "mustBeValidUuidV6");
  const zUuidV7Optional = createOptionalUuid("v7", "mustBeValidUuidV7");
  const zUuidV7Required = createRequiredUuid("v7", "mustBeValidUuidV7");

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
    return z.uuid({
      message: messageHandler.formatErrorMessage({
        group: "uuid",
        msg,
        msgType,
        messageKey: "invalidFormat",
        params: { expectedFormat: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
      }),
    });
  };

  return {
    zUuidOptional,
    zUuidRequired,
    zUuidV4Optional,
    zUuidV4Required,
    zUuidV6Optional,
    zUuidV6Required,
    zUuidV7Optional,
    zUuidV7Required,
    getUuidFormatErrorMessage,
    zUuidWithFormatError,
  };
};

