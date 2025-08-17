import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import type { BaseSchemaOptions } from "../common/types/schema-options.types";
import type { UuidMessageParams } from "../localization/types/message-params.types";
import { makeOptionalSimple } from "../common/utils/zod-utils";

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
  const createErrorMessage = (
    messageKey: UuidMessageKey,
    options: BaseSchemaOptions = {},
  ) => {
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
  const createRequiredUuid = (
    version?: UuidVersion,
    messageKey: UuidMessageKey = "mustBeValidUuid",
  ) => {
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
   * Helper function to create required nanoid schema
   *
   * Nanoids are URL-safe, unique string ID generators. They are:
   * - 21 characters long by default
   * - Use a URL-safe alphabet: A-Za-z0-9_-
   * - More compact than UUIDs while maintaining uniqueness
   */
  const createRequiredNanoid = (
    messageKey: UuidMessageKey = "mustBeValidNanoid",
  ) => {
    return (options: BaseSchemaOptions = {}) => {
      return z.nanoid({
        message: createErrorMessage(messageKey, options),
      });
    };
  };

  /**
   * Helper function to create optional UUID schema
   */
  const createOptionalUuid = (
    version?: UuidVersion,
    messageKey: UuidMessageKey = "mustBeValidUuid",
  ) => {
    return (options: BaseSchemaOptions = {}) => {
      const validator = version ? z.uuid({ version }) : z.uuid();
      return makeOptionalSimple(
        z
          .string()
          .refine((val) => val === "" || validator.safeParse(val).success, {
            message: createErrorMessage(messageKey, options),
          }),
      );
    };
  };

  /**
   * Helper function to create optional nanoid schema
   *
   * Creates a schema that accepts valid nanoids or undefined.
   * Nanoids are 21-character URL-safe unique identifiers.
   */
  const createOptionalNanoid = (
    messageKey: UuidMessageKey = "mustBeValidNanoid",
  ) => {
    return (options: BaseSchemaOptions = {}) => {
      const validator = z.nanoid();
      return makeOptionalSimple(
        z
          .string()
          .refine((val) => val === "" || validator.safeParse(val).success, {
            message: createErrorMessage(messageKey, options),
          }),
      );
    };
  };

  // Generate schemas using helpers
  const UuidOptional = createOptionalUuid();
  const UuidRequired = createRequiredUuid();
  const UuidV4Optional = createOptionalUuid("v4", "mustBeValidUuidV4");
  const UuidV4Required = createRequiredUuid("v4", "mustBeValidUuidV4");
  const UuidV6Optional = createOptionalUuid("v6", "mustBeValidUuidV6");
  const UuidV6Required = createRequiredUuid("v6", "mustBeValidUuidV6");
  const UuidV7Optional = createOptionalUuid("v7", "mustBeValidUuidV7");
  const UuidV7Required = createRequiredUuid("v7", "mustBeValidUuidV7");

  // Nanoid schemas
  const NanoidOptional = createOptionalNanoid();
  const NanoidRequired = createRequiredNanoid();

  /**
   * Validates UUID format and returns a formatted error message using invalidFormat.
   * This utility function demonstrates usage of the invalidFormat message key.
   */
  const getUuidFormatErrorMessage = (options: BaseSchemaOptions = {}) => {
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
  const UuidWithFormatError = (options: BaseSchemaOptions = {}) => {
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
    UuidOptional,
    UuidRequired,
    UuidV4Optional,
    UuidV4Required,
    UuidV6Optional,
    UuidV6Required,
    UuidV7Optional,
    UuidV7Required,
    NanoidOptional,
    NanoidRequired,
    getUuidFormatErrorMessage,
    UuidWithFormatError,
  };
};

// Create a test message handler for UUID validation
import { createTestMessageHandler } from "../localization/types/message-handler.types";

const uuidMessageHandler = createTestMessageHandler((options) => {
  if (options.msgType === MsgType.Message) {
    return options.msg;
  }

  // UUID-specific error messages
  switch (options.messageKey) {
    case "required":
      return `${options.msg} is required`;
    case "mustBeValidUuid":
      return `${options.msg} must be a valid UUID`;
    case "mustBeValidUuidV4":
      return `${options.msg} must be a valid UUIDv4`;
    case "mustBeValidUuidV6":
      return `${options.msg} must be a valid UUIDv6`;
    case "mustBeValidUuidV7":
      return `${options.msg} must be a valid UUIDv7`;
    case "mustBeValidNanoid":
      return `${options.msg} must be a valid nanoid`;
    case "invalidFormat":
      return `${options.msg} has invalid format: expected ${options.params?.expectedFormat || "valid format"}`;
    default:
      return `${options.msg} is invalid`;
  }
});

// Top-level exports using the exact same pattern as string-schemas.ts
const uuidSchemas = createUuidSchemas(uuidMessageHandler);

// Helper functions with overloads to support both string and options object
function createUuidOptionalOverload(
  msg: string,
): ReturnType<typeof uuidSchemas.UuidOptional>;
function createUuidOptionalOverload(
  options?: BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidOptional>;
function createUuidOptionalOverload(
  msgOrOptions?: string | BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidOptional> {
  if (typeof msgOrOptions === "string") {
    return uuidSchemas.UuidOptional({ msg: msgOrOptions });
  }
  return uuidSchemas.UuidOptional(msgOrOptions);
}

function createUuidRequiredOverload(
  msg: string,
): ReturnType<typeof uuidSchemas.UuidRequired>;
function createUuidRequiredOverload(
  options?: BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidRequired>;
function createUuidRequiredOverload(
  msgOrOptions?: string | BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidRequired> {
  if (typeof msgOrOptions === "string") {
    return uuidSchemas.UuidRequired({ msg: msgOrOptions });
  }
  return uuidSchemas.UuidRequired(msgOrOptions);
}

function createUuidV4OptionalOverload(
  msg: string,
): ReturnType<typeof uuidSchemas.UuidV4Optional>;
function createUuidV4OptionalOverload(
  options?: BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidV4Optional>;
function createUuidV4OptionalOverload(
  msgOrOptions?: string | BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidV4Optional> {
  if (typeof msgOrOptions === "string") {
    return uuidSchemas.UuidV4Optional({ msg: msgOrOptions });
  }
  return uuidSchemas.UuidV4Optional(msgOrOptions);
}

function createUuidV4RequiredOverload(
  msg: string,
): ReturnType<typeof uuidSchemas.UuidV4Required>;
function createUuidV4RequiredOverload(
  options?: BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidV4Required>;
function createUuidV4RequiredOverload(
  msgOrOptions?: string | BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidV4Required> {
  if (typeof msgOrOptions === "string") {
    return uuidSchemas.UuidV4Required({ msg: msgOrOptions });
  }
  return uuidSchemas.UuidV4Required(msgOrOptions);
}

function createUuidV6OptionalOverload(
  msg: string,
): ReturnType<typeof uuidSchemas.UuidV6Optional>;
function createUuidV6OptionalOverload(
  options?: BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidV6Optional>;
function createUuidV6OptionalOverload(
  msgOrOptions?: string | BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidV6Optional> {
  if (typeof msgOrOptions === "string") {
    return uuidSchemas.UuidV6Optional({ msg: msgOrOptions });
  }
  return uuidSchemas.UuidV6Optional(msgOrOptions);
}

function createUuidV6RequiredOverload(
  msg: string,
): ReturnType<typeof uuidSchemas.UuidV6Required>;
function createUuidV6RequiredOverload(
  options?: BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidV6Required>;
function createUuidV6RequiredOverload(
  msgOrOptions?: string | BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidV6Required> {
  if (typeof msgOrOptions === "string") {
    return uuidSchemas.UuidV6Required({ msg: msgOrOptions });
  }
  return uuidSchemas.UuidV6Required(msgOrOptions);
}

function createUuidV7OptionalOverload(
  msg: string,
): ReturnType<typeof uuidSchemas.UuidV7Optional>;
function createUuidV7OptionalOverload(
  options?: BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidV7Optional>;
function createUuidV7OptionalOverload(
  msgOrOptions?: string | BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidV7Optional> {
  if (typeof msgOrOptions === "string") {
    return uuidSchemas.UuidV7Optional({ msg: msgOrOptions });
  }
  return uuidSchemas.UuidV7Optional(msgOrOptions);
}

function createUuidV7RequiredOverload(
  msg: string,
): ReturnType<typeof uuidSchemas.UuidV7Required>;
function createUuidV7RequiredOverload(
  options?: BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidV7Required>;
function createUuidV7RequiredOverload(
  msgOrOptions?: string | BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.UuidV7Required> {
  if (typeof msgOrOptions === "string") {
    return uuidSchemas.UuidV7Required({ msg: msgOrOptions });
  }
  return uuidSchemas.UuidV7Required(msgOrOptions);
}

function createNanoidOptionalOverload(
  msg: string,
): ReturnType<typeof uuidSchemas.NanoidOptional>;
function createNanoidOptionalOverload(
  options?: BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.NanoidOptional>;
function createNanoidOptionalOverload(
  msgOrOptions?: string | BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.NanoidOptional> {
  if (typeof msgOrOptions === "string") {
    return uuidSchemas.NanoidOptional({ msg: msgOrOptions });
  }
  return uuidSchemas.NanoidOptional(msgOrOptions);
}

function createNanoidRequiredOverload(
  msg: string,
): ReturnType<typeof uuidSchemas.NanoidRequired>;
function createNanoidRequiredOverload(
  options?: BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.NanoidRequired>;
function createNanoidRequiredOverload(
  msgOrOptions?: string | BaseSchemaOptions,
): ReturnType<typeof uuidSchemas.NanoidRequired> {
  if (typeof msgOrOptions === "string") {
    return uuidSchemas.NanoidRequired({ msg: msgOrOptions });
  }
  return uuidSchemas.NanoidRequired(msgOrOptions);
}

export const UuidOptional = createUuidOptionalOverload;
export const UuidRequired = createUuidRequiredOverload;
export const UuidV4Optional = createUuidV4OptionalOverload;
export const UuidV4Required = createUuidV4RequiredOverload;
export const UuidV6Optional = createUuidV6OptionalOverload;
export const UuidV6Required = createUuidV6RequiredOverload;
export const UuidV7Optional = createUuidV7OptionalOverload;
export const UuidV7Required = createUuidV7RequiredOverload;
export const NanoidOptional = createNanoidOptionalOverload;
export const NanoidRequired = createNanoidRequiredOverload;

// Re-export utility functions
export const getUuidFormatErrorMessage = uuidSchemas.getUuidFormatErrorMessage;
export const UuidWithFormatError = uuidSchemas.UuidWithFormatError;
