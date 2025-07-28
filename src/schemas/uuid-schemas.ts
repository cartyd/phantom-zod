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
   * Helper function to create required nanoid schema
   * 
   * Nanoids are URL-safe, unique string ID generators. They are:
   * - 21 characters long by default
   * - Use a URL-safe alphabet: A-Za-z0-9_-
   * - More compact than UUIDs while maintaining uniqueness
   */
  const createRequiredNanoid = (messageKey: UuidMessageKey = "mustBeValidNanoid") => {
    return (options: BaseSchemaOptions = {}) => {
      return z.nanoid({
        message: createErrorMessage(messageKey, options),
      });
    };
  };

  /**
   * Helper function to create optional UUID schema
   */
  const createOptionalUuid = (version?: UuidVersion, messageKey: UuidMessageKey = "mustBeValidUuid") => {
    return (options: BaseSchemaOptions = {}) => {
      const validator = version ? z.uuid({ version }) : z.uuid();
      return makeOptionalSimple(
        z.string().refine(
          (val) => val === "" || validator.safeParse(val).success,
          { message: createErrorMessage(messageKey, options) }
        )
      );
    };
  };

  /**
   * Helper function to create optional nanoid schema
   * 
   * Creates a schema that accepts valid nanoids or undefined.
   * Nanoids are 21-character URL-safe unique identifiers.
   */
  const createOptionalNanoid = (messageKey: UuidMessageKey = "mustBeValidNanoid") => {
    return (options: BaseSchemaOptions = {}) => {
      const validator = z.nanoid();
      return makeOptionalSimple(
        z.string().refine(
          (val) => val === "" || validator.safeParse(val).success,
          { message: createErrorMessage(messageKey, options) }
        )
      );
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
  
  // Nanoid schemas
  const zNanoidOptional = createOptionalNanoid();
  const zNanoidRequired = createRequiredNanoid();

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
    zNanoidOptional,
    zNanoidRequired,
    getUuidFormatErrorMessage,
    zUuidWithFormatError,
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
      return `${options.msg} must be a valid UUID v4`;
    case "mustBeValidUuidV6":
      return `${options.msg} must be a valid UUID v6`;
    case "mustBeValidUuidV7":
      return `${options.msg} must be a valid UUID v7`;
    case "mustBeValidNanoid":
      return `${options.msg} must be a valid nanoid`;
    case "invalidFormat":
      return `${options.msg} has invalid format: expected ${options.params?.expectedFormat || "valid format"}`;
    default:
      return `${options.msg} is invalid`;
  }
});

// Create schemas with default handler
const {
  zUuidOptional: baseZUuidOptional,
  zUuidRequired: baseZUuidRequired,
  zUuidV4Optional: baseZUuidV4Optional,
  zUuidV4Required: baseZUuidV4Required,
  zUuidV6Optional: baseZUuidV6Optional,
  zUuidV6Required: baseZUuidV6Required,
  zUuidV7Optional: baseZUuidV7Optional,
  zUuidV7Required: baseZUuidV7Required,
  zNanoidOptional: baseZNanoidOptional,
  zNanoidRequired: baseZNanoidRequired,
  getUuidFormatErrorMessage: baseGetUuidFormatErrorMessage,
  zUuidWithFormatError: baseZUuidWithFormatError,
} = createUuidSchemas(uuidMessageHandler);

// Export schemas for direct use

/**
 * Creates an optional UUID schema that accepts valid UUIDs or undefined
 * 
 * Accepts UUIDs of any version (v1-v8). For specific version validation,
 * use the version-specific schemas like zUuidV4Optional.
 * 
 * @param options - Configuration options for UUID validation
 * @returns Zod schema that accepts valid UUIDs or undefined
 * 
 * @example
 * ```typescript
 * const schema = zUuidOptional();
 * schema.parse('123e4567-e89b-12d3-a456-426614174000'); // ✓ Valid
 * schema.parse(undefined);                             // ✓ Valid
 * schema.parse('invalid-uuid');                        // ✗ Throws error
 * ```
 */
export const zUuidOptional = baseZUuidOptional;

/**
 * Creates a required UUID schema that accepts only valid UUIDs
 * 
 * Accepts UUIDs of any version (v1-v8). For specific version validation,
 * use the version-specific schemas like zUuidV4Required.
 * 
 * @param options - Configuration options for UUID validation
 * @returns Zod schema that accepts only valid UUIDs
 * 
 * @example
 * ```typescript
 * const schema = zUuidRequired();
 * schema.parse('123e4567-e89b-12d3-a456-426614174000'); // ✓ Valid
 * schema.parse(undefined);                             // ✗ Throws error
 * schema.parse('invalid-uuid');                        // ✗ Throws error
 * ```
 */
export const zUuidRequired = baseZUuidRequired;

/**
 * Creates an optional nanoid schema that accepts valid nanoids or undefined
 * 
 * Nanoids are URL-safe unique string ID generators that are:
 * - 21 characters long by default
 * - Use URL-safe alphabet: A-Za-z0-9_-
 * - More compact than UUIDs while maintaining collision resistance
 * - Generated using a cryptographically strong random API
 * 
 * @param options - Configuration options for nanoid validation
 * @returns Zod schema that accepts valid nanoids or undefined
 * 
 * @example
 * ```typescript
 * const schema = zNanoidOptional();
 * schema.parse('V1StGXR8_Z5jdHi6B-myT');  // ✓ Valid (21 chars)
 * schema.parse(undefined);               // ✓ Valid
 * schema.parse('too-short');             // ✗ Throws error
 * schema.parse('invalid@characters!');   // ✗ Throws error
 * 
 * // With custom error message
 * const customSchema = zNanoidOptional({ msg: 'Task ID' });
 * ```
 */
export const zNanoidOptional = baseZNanoidOptional;

/**
 * Creates a required nanoid schema that accepts only valid nanoids
 * 
 * Nanoids are URL-safe unique string ID generators that are:
 * - 21 characters long by default
 * - Use URL-safe alphabet: A-Za-z0-9_-
 * - More compact than UUIDs while maintaining collision resistance
 * - Generated using a cryptographically strong random API
 * 
 * @param options - Configuration options for nanoid validation
 * @returns Zod schema that accepts only valid nanoids
 * 
 * @example
 * ```typescript
 * const schema = zNanoidRequired();
 * schema.parse('V1StGXR8_Z5jdHi6B-myT');  // ✓ Valid (21 chars)
 * schema.parse(undefined);               // ✗ Throws error
 * schema.parse('too-short');             // ✗ Throws error
 * 
 * // For API endpoints requiring nanoid IDs
 * const apiSchema = z.object({
 *   id: zNanoidRequired({ msg: 'Resource ID' }),
 *   name: z.string()
 * });
 * ```
 */
export const zNanoidRequired = baseZNanoidRequired;

// Re-export UUID version-specific schemas
export const zUuidV4Optional = baseZUuidV4Optional;
export const zUuidV4Required = baseZUuidV4Required;
export const zUuidV6Optional = baseZUuidV6Optional;
export const zUuidV6Required = baseZUuidV6Required;
export const zUuidV7Optional = baseZUuidV7Optional;
export const zUuidV7Required = baseZUuidV7Required;

// Re-export utility functions
export const getUuidFormatErrorMessage = baseGetUuidFormatErrorMessage;
export const zUuidWithFormatError = baseZUuidWithFormatError;

