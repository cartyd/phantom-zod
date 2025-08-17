import type { MessageGroupMap } from "./message-params.types";
import { MsgType } from "../../common/types/msg-type";

/**
 * Options for formatting an error message, parameterized by message group and key.
 *
 * @typeParam TGroup - The key of the message group in `MessageGroupMap`. Defaults to all keys of `MessageGroupMap`.
 * @typeParam TKey - The key of the message within the specified group in `MessageGroupMap[TGroup]`. Defaults to all keys of `MessageGroupMap[TGroup]`.
 *
 * If the parameters for the message (`MessageGroupMap[TGroup][TKey]`) are an empty object, `params` is optional.
 * Otherwise, `params` is required and must match the shape defined in `MessageGroupMap[TGroup][TKey]`.
 *
 * @property group - The message group key.
 * @property messageKey - The message key within the group.
 * @property msg - The formatted message string.
 * @property msgType - The type of the message.
 * @property params - The parameters for the message, if required by the message definition.
 */
export type FormatErrorOptions<
  TGroup extends keyof MessageGroupMap = keyof MessageGroupMap,
  TKey extends keyof MessageGroupMap[TGroup] = keyof MessageGroupMap[TGroup],
> = {} extends MessageGroupMap[TGroup][TKey]
  ? // If the parameters are an empty object, make `params` optional
    {
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
  formatErrorMessage<
    TGroup extends keyof MessageGroupMap,
    TKey extends keyof MessageGroupMap[TGroup],
  >(
    options: FormatErrorOptions<TGroup, TKey>,
  ): string;
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
 * Creates a mock error message handler for testing purposes.
 *
 * This function returns an object implementing the `ErrorMessageFormatter` interface,
 * with a `formatErrorMessage` method that generates error messages based on the provided
 * options. By default, it uses a simple mock implementation that formats messages for
 * various validation error types, but a custom mock function can be provided to override
 * the default behavior.
 *
 * @param customMock - An optional custom mock function that receives simplified error options
 *   and returns a formatted error message string. If not provided, a default mock implementation
 *   is used.
 * @returns An object with a `formatErrorMessage` method for formatting error messages in tests.
 *
 * @example
 * ```typescript
 * const handler = createTestMessageHandler();
 * const message = handler.formatErrorMessage({
 *   group: "user",
 *   messageKey: "required",
 *   msg: "Email",
 *   msgType: MsgType.Message,
 *   params: {}
 * });
 * // message === "Email is required"
 * ```
 */
export function createTestMessageHandler(
  customMock?: (options: SimpleFormatErrorOptions) => string,
): ErrorMessageFormatter {
  const defaultMock = (options: SimpleFormatErrorOptions) => {
    if (options.msgType === MsgType.Message) {
      return options.msg;
    }

    // Simple mock implementation for field name formatting
    switch (options.messageKey) {
      case "required":
        return `${options.msg} is required`;
      case "mustBeString":
        return `${options.msg} must be a string`;
      case "tooShort":
        return `${options.msg} is too short (minimum: ${options.params?.min} characters)`;
      case "tooLong":
        return `${options.msg} is too long (maximum: ${options.params?.max} characters)`;
      case "invalidUSState":
        return `${options.msg} must be a valid 2-letter US state code`;
      case "mustBeValidEmail":
        return `${options.msg} must be a valid email address`;
      case "mustBeBoolean":
        return `${options.msg} must be a boolean value`;
      case "mustBeBooleanString":
        return `${options.msg} must be a boolean value ("true" or "false")`;
      case "invalidFormat":
        return `${options.msg} has invalid format (expected: ${options.params?.format})`;
      case "mustBeValidZipCode":
        return `${options.msg} is invalid`;
      case "mustBeNumber":
        return `${options.msg} must be a number`;
      case "mustBePositive":
        return `${options.msg} must be positive`;
      case "tooBig":
        return `${options.msg} is too large (maximum: ${options.params?.maxSize})`;
      case "invalidFileType":
        return `${options.msg} must be one of: ${options.params?.type || options.params?.allowedTypes}`;
      case "invalidFileName":
        return `${options.msg} has invalid characters`;
      case "mustBeValidFile":
        return `${options.msg} must be a valid file`;
      case "fileRequired":
        return `${options.msg} is required`;
      case "mustHaveMinItems":
        return `${options.msg} must have at least ${options.params?.min} items`;
      case "mustHaveMaxItems":
        return `${options.msg} must have at most ${options.params?.max} items`;
      case "duplicateItems":
        return `${options.msg} must not contain duplicate items`;
      case "invalid":
        return `${options.msg} is invalid`;
      case "mustBeValidUuid":
        return `${options.msg} must be a valid UUID`;
      case "mustBeValidUuidV4":
        return `${options.msg} must be a valid UUIDv4`;
      case "mustBeValidUuidV6":
        return `${options.msg} must be a valid UUIDv6`;
      case "mustBeValidUuidV7":
        return `${options.msg} must be a valid UUIDv7`;
      // Phone-specific error messages
      case "mustBeValidPhone":
        return `${options.msg} must be a valid phone number`;
      case "invalidE164Format":
        return `${options.msg} must be in E.164 format (+1XXXXXXXXXX)`;
      case "invalidNationalFormat":
        return `${options.msg} must be in national format (XXXXXXXXXX)`;
      // Enum-specific error messages
      case "mustBeOneOf":
        const validOptions = (options.params as any)?.options || [];
        return `${options.msg} must be one of: ${validOptions.join(", ")}`;
      // User-specific error messages
      case "passwordTooShort":
        return `${options.msg} password is too short (minimum: ${options.params?.min} characters)`;
      case "passwordMissingUppercase":
        return `${options.msg} password must contain at least one uppercase letter`;
      case "passwordMissingLowercase":
        return `${options.msg} password must contain at least one lowercase letter`;
      case "passwordMissingNumbers":
        return `${options.msg} password must contain at least one number`;
      case "passwordMissingSpecialChars":
        return `${options.msg} password must contain at least one special character`;
      case "passwordsDoNotMatch":
        return `${options.msg} passwords do not match`;
      case "passwordMustBeDifferent":
        return `${options.msg} new password must be different from current password`;
      case "usernameInvalid":
        return `${options.msg} has invalid username format`;
      case "invalidUnderscorePosition":
        return `${options.msg} cannot start or end with underscore`;
      case "invalidHyphenPosition":
        return `${options.msg} cannot start or end with hyphen`;
      case "termsNotAccepted":
        return `${options.msg} terms and conditions must be accepted`;
      case "mustBeValidUserObject":
        return `${options.msg} must be a valid user object`;
      case "cannotBeEmpty":
        return `${options.msg} cannot be empty`;
      // Network-specific error messages
      case "mustBeValidIPv4":
        return `${options.msg} must be a valid IPv4 address`;
      case "mustBeValidIPv6":
        return `${options.msg} must be a valid IPv6 address`;
      case "mustBeValidMacAddress":
        return `${options.msg} must be a valid MAC address`;
      // Additional user-specific error messages
      case "passwordWeak":
        return `${options.msg} password is weak (score: ${options.params?.score || 0})`;
      case "emailAlreadyExists":
        return `${options.msg} email address is already in use`;
      case "usernameAlreadyExists":
        return `${options.msg} username is already taken`;
      case "invalidRole":
        return `${options.msg} has invalid role: ${options.params?.role || "unknown"}`;
      case "invalidAccountType":
        return `${options.msg} has invalid account type: ${options.params?.type || "unknown"}`;
      default:
        return `${options.msg} is invalid`;
    }
  };

  const mockFn = customMock || defaultMock;

  return {
    formatErrorMessage: <
      TGroup extends keyof MessageGroupMap,
      TKey extends keyof MessageGroupMap[TGroup],
    >(
      options: FormatErrorOptions<TGroup, TKey>,
    ): string => {
      // Cast to simpler type for the mock implementation
      return mockFn({
        group: options.group as string,
        messageKey: options.messageKey as string,
        msg: options.msg,
        msgType: options.msgType,
        params: options.params as Record<string, any>,
      });
    },
  };
}
