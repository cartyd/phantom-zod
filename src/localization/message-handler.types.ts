import type { MessageGroupMap } from "./message-params.types";
import { MsgType } from "../common/types/msg-type";

/**
 * Options for formatting an error message.
 *
 * @property {string} group - The message group (e.g., "string", "number").
 * @property {keyof MessageGroupMap[G]} messageKey - The message key within the group.
 * @property {MessageGroupMap[G][K]} params - The type-safe params for the message key.
 * @property {string} msg - The error message to be formatted.
 * @property {MsgType} msgType - The type of the message, indicating its severity or category.
 */
export type FormatErrorOptions<
  TGroup extends keyof MessageGroupMap = keyof MessageGroupMap,
  TKey extends keyof MessageGroupMap[TGroup] = keyof MessageGroupMap[TGroup]
> = {} extends MessageGroupMap[TGroup][TKey]
  ? {
      group: TGroup;
      messageKey: TKey;
      msg: string;
      msgType: MsgType;
      params?: MessageGroupMap[TGroup][TKey];
    }
  : {
      group: TGroup;
      messageKey: TKey;
      msg: string;
      msgType: MsgType;
      params: MessageGroupMap[TGroup][TKey];
    };

/**
 * Interface for formatting error messages.
 * Uses original generic approach for full compile-time type safety.
 */
export interface ErrorMessageFormatter {
  formatErrorMessage<TGroup extends keyof MessageGroupMap, TKey extends keyof MessageGroupMap[TGroup]>(options: FormatErrorOptions<TGroup, TKey>): string;
}

/**
 * Simplified options type for testing purposes
 */
export interface SimpleFormatErrorOptions {
  group: string;
  messageKey: string;
  msg: string;
  msgType: MsgType;
  params?: Record<string, any>;
}

/**
 * Test utility to create type-safe mocks while preserving the original generic interface.
 * This provides the "best of both worlds" - type safety in production, easy testing.
 */
export function createTestMessageHandler(
  customMock?: (options: SimpleFormatErrorOptions) => string
): ErrorMessageFormatter {
  const defaultMock = (options: SimpleFormatErrorOptions) => {
    if (options.msgType === MsgType.Message) {
      return options.msg;
    }
    
    // Simple mock implementation for field name formatting
    switch (options.messageKey) {
      case 'required':
        return `${options.msg} is required`;
      case 'mustBeString':
        return `${options.msg} must be a string`;
      case 'tooShort':
        return `${options.msg} is too short (minimum: ${options.params?.min} characters)`;
      case 'tooLong':
        return `${options.msg} is too long (maximum: ${options.params?.max} characters)`;
      case 'invalidUSState':
        return `${options.msg} must be a valid 2-letter US state code`;
      case 'mustBeValidEmail':
        return `${options.msg} must be a valid email address`;
      case 'mustBeBoolean':
        return `${options.msg} must be a boolean value`;
      case 'mustBeBooleanString':
        return `${options.msg} must be a boolean value ("true" or "false")`;
      case 'invalidFormat':
        return `${options.msg} has invalid format (expected: ${options.params?.format})`;
      case 'mustBeValidZipCode':
        return `${options.msg} is invalid`;
      case 'mustBeNumber':
        return `${options.msg} must be a number`;
      case 'mustBePositive':
        return `${options.msg} must be positive`;
      case 'tooBig':
        return `${options.msg} is too large (maximum: ${options.params?.maxSize})`;
      case 'invalidFileType':
        return `${options.msg} must be one of: ${options.params?.type || options.params?.allowedTypes}`;
      case 'invalidFileName':
        return `${options.msg} has invalid characters`;
      case 'mustBeValidFile':
        return `${options.msg} must be a valid file`;
      case 'fileRequired':
        return `${options.msg} is required`;
      case 'mustHaveMinItems':
        return `${options.msg} must have at least ${options.params?.min} items`;
      case 'mustHaveMaxItems':
        return `${options.msg} must have at most ${options.params?.max} items`;
      case 'duplicateItems':
        return `${options.msg} must not contain duplicate items`;
      case 'invalid':
        return `${options.msg} is invalid`;
      case 'mustBeValidUuid':
        return `${options.msg} must be a valid UUID`;
      case 'mustBeValidUuidV4':
        return `${options.msg} must be a valid UUIDv4`;
      // User-specific error messages
      case 'passwordTooShort':
        return `${options.msg} password is too short (minimum: ${options.params?.min} characters)`;
      case 'passwordMissingUppercase':
        return `${options.msg} password must contain at least one uppercase letter`;
      case 'passwordMissingLowercase':
        return `${options.msg} password must contain at least one lowercase letter`;
      case 'passwordMissingNumbers':
        return `${options.msg} password must contain at least one number`;
      case 'passwordMissingSpecialChars':
        return `${options.msg} password must contain at least one special character`;
      case 'passwordsDoNotMatch':
        return `${options.msg} passwords do not match`;
      case 'passwordMustBeDifferent':
        return `${options.msg} new password must be different from current password`;
      case 'usernameInvalid':
        return `${options.msg} has invalid username format`;
      case 'invalidUnderscorePosition':
        return `${options.msg} cannot start or end with underscore`;
      case 'invalidHyphenPosition':
        return `${options.msg} cannot start or end with hyphen`;
      case 'termsNotAccepted':
        return `${options.msg} terms and conditions must be accepted`;
      case 'mustBeValidUserObject':
        return `${options.msg} must be a valid user object`;
      case 'cannotBeEmpty':
        return `${options.msg} cannot be empty`;
      default:
        return `${options.msg} is invalid`;
    }
  };
  
  const mockFn = customMock || defaultMock;
  
  return {
    formatErrorMessage: <TGroup extends keyof MessageGroupMap, TKey extends keyof MessageGroupMap[TGroup]>(
      options: FormatErrorOptions<TGroup, TKey>
    ): string => {
      // Cast to simpler type for the mock implementation
      return mockFn({
        group: options.group as string,
        messageKey: options.messageKey as string,
        msg: options.msg,
        msgType: options.msgType,
        params: options.params as Record<string, any>
      });
    }
  };
}
