import { MsgType } from "../common/types/msg-type";
import { z } from "zod";
import { trimOrUndefined } from "../common/utils/string-utils";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createTestMessageHandler } from "../localization/types/message-handler.types";
import type { BaseSchemaOptions } from "../common/types/schema-options.types";
import type { EmailMessageParams } from "../localization/types/message-params.types";

type EmailMessageKey = keyof EmailMessageParams;

/**
 * Options for email schema validation
 *
 * @example
 * ```typescript
 * // Basic usage
 * const schema = EmailRequired();
 *
 * // Custom email pattern
 * const customSchema = EmailRequired({ pattern: /^[a-z]+@company\.com$/ });
 *
 * // Custom error messages
 * const customMessageSchema = EmailRequired({
 *   msg: 'User Email',
 *   pattern: z.regexes.unicodeEmail
 * });
 * ```
 */
interface EmailSchemaOptions extends BaseSchemaOptions {
  /**
   * Custom regex pattern for email validation
   * @example /^[a-z]+@company\.com$/ - Only lowercase letters at company.com
   * @example z.regexes.html5Email - Browser HTML5 email validation
   * @example z.regexes.rfc5322Email - RFC 5322 compliant email validation
   * @example z.regexes.unicodeEmail - Unicode-friendly email validation
   */
  pattern?: RegExp;
}

/**
 * Validates email format using Zod's built-in email validation.
 * @param val - The email string to validate.
 * @param pattern - Optional custom regex pattern for validation.
 * @returns True if valid email format, false otherwise.
 */
export const isEmail = (val: string | undefined, pattern?: RegExp): boolean => {
  if (val === undefined) return true;

  try {
    const emailSchema = pattern ? z.email({ pattern }) : z.email();
    emailSchema.parse(val);
    return true;
  } catch {
    return false;
  }
};

/**
 * Creates a factory function for email schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing email schema creation functions
 */
export const createEmailSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Helper function to create error message
   */
  const createErrorMessage = (
    messageKey: EmailMessageKey,
    options: EmailSchemaOptions = {},
    params: any = {},
  ) => {
    const { msg = "Email Address", msgType = MsgType.FieldName } = options;
    return messageHandler.formatErrorMessage({
      group: "email" as const,
      msg,
      msgType,
      messageKey,
      params,
    });
  };
  /**
   * Creates a Zod schema for an optional email address using Zod's built-in email validation
   *
   * @param options - Configuration options for email validation
   * @param options.pattern - Custom RegExp for email validation (uses Zod's default if not provided)
   * @param options.msg - Custom field name or error message for validation errors
   * @param options.msgType - Whether msg is a field name or complete message
   * @returns Zod schema for an optional email address
   *
   * @example
   * ```typescript
   * // Basic optional email
   * const schema = EmailOptional();
   *
   * // Optional email with custom pattern
   * const companySchema = EmailOptional({
   *   pattern: /^[a-z]+@company\.com$/
   * });
   *
   * // Optional email with custom error message
   * const customSchema = EmailOptional({
   *   msg: 'User Email',
   *   pattern: z.regexes.unicodeEmail
   * });
   * ```
   */
  const EmailOptional = (options: EmailSchemaOptions = {}) => {
    const { pattern } = options;

    const emailConfig: any = {
      message: createErrorMessage("mustBeValidEmail", options),
    };

    if (pattern) {
      emailConfig.pattern = pattern;
    }

    return z
      .string()
      .optional()
      .transform(trimOrUndefined)
      .pipe(z.union([z.email(emailConfig), z.undefined()]));
  };

  /**
   * Creates a Zod schema for required email addresses using Zod's built-in email validation
   *
   * @param options - Configuration options for email validation
   * @param options.pattern - Custom RegExp for email validation (uses Zod's default if not provided)
   * @param options.msg - Custom field name or error message for validation errors
   * @param options.msgType - Whether msg is a field name or complete message
   * @returns Zod schema that accepts only valid email addresses
   *
   * @example
   * ```typescript
   * // Basic required email
   * const schema = EmailRequired();
   *
   * // Required email with custom pattern
   * const companySchema = EmailRequired({
   *   pattern: /^[a-z]+@company\.com$/
   * });
   *
   * // Required email with custom error message
   * const customSchema = EmailRequired({
   *   msg: 'User Email',
   *   pattern: z.regexes.html5Email
   * });
   * ```
   */
  const EmailRequired = (options: EmailSchemaOptions = {}) => {
    const { pattern } = options;

    const emailConfig: any = {
      message: createErrorMessage("mustBeValidEmail", options),
    };

    if (pattern) {
      emailConfig.pattern = pattern;
    }

    return z.string().trim().pipe(z.email(emailConfig));
  };

  return {
    EmailOptional,
    EmailRequired,
  };
};

// Create schemas with default handler
const testMessageHandler = createTestMessageHandler();
const emailSchemas = createEmailSchemas(testMessageHandler);

// Export schemas with updated API

// Helper functions with overloads to support both string and options object
function createEmailOptionalOverload(
  msg: string,
): ReturnType<typeof emailSchemas.EmailOptional>;
function createEmailOptionalOverload(
  options?: EmailSchemaOptions,
): ReturnType<typeof emailSchemas.EmailOptional>;
function createEmailOptionalOverload(
  msgOrOptions?: string | EmailSchemaOptions,
): ReturnType<typeof emailSchemas.EmailOptional> {
  if (typeof msgOrOptions === "string") {
    return emailSchemas.EmailOptional({ msg: msgOrOptions });
  }
  return emailSchemas.EmailOptional(msgOrOptions);
}

function createEmailRequiredOverload(
  msg: string,
): ReturnType<typeof emailSchemas.EmailRequired>;
function createEmailRequiredOverload(
  options?: EmailSchemaOptions,
): ReturnType<typeof emailSchemas.EmailRequired>;
function createEmailRequiredOverload(
  msgOrOptions?: string | EmailSchemaOptions,
): ReturnType<typeof emailSchemas.EmailRequired> {
  if (typeof msgOrOptions === "string") {
    return emailSchemas.EmailRequired({ msg: msgOrOptions });
  }
  return emailSchemas.EmailRequired(msgOrOptions);
}

/**
 * Creates an optional email schema that accepts valid email addresses or undefined
 *
 * Uses Zod's built-in email validation which is more robust and standards-compliant
 * than custom regex patterns. Supports custom email patterns through options.
 *
 * @param options - Configuration options for email validation
 * @returns Zod schema that accepts valid email addresses or undefined
 *
 * @example
 * ```typescript
 * const schema = EmailOptional();
 * schema.parse('user@example.com'); // ✓ Valid
 * schema.parse('invalid-email');    // ✗ Throws error
 * schema.parse(undefined);          // ✓ Valid
 *
 * // With custom pattern for company emails
 * const companySchema = EmailOptional({
 *   pattern: /^[a-z.]+@company\.com$/
 * });
 *
 * // New string parameter syntax
 * const simpleSchema = EmailOptional('User Email');
 * ```
 */
export const EmailOptional = createEmailOptionalOverload;

/**
 * Creates a required email schema that accepts only valid email addresses
 *
 * Uses Zod's built-in email validation which is more robust and standards-compliant
 * than custom regex patterns. Supports custom email patterns through options.
 *
 * @param options - Configuration options for email validation
 * @returns Zod schema that accepts only valid email addresses
 *
 * @example
 * ```typescript
 * const schema = EmailRequired();
 * schema.parse('user@example.com'); // ✓ Valid
 * schema.parse('invalid-email');    // ✗ Throws error
 * schema.parse(undefined);          // ✗ Throws error
 *
 * // With HTML5 browser validation pattern
 * const html5Schema = EmailRequired({
 *   pattern: z.regexes.html5Email
 * });
 *
 * // With unicode support for international emails
 * const unicodeSchema = EmailRequired({
 *   pattern: z.regexes.unicodeEmail
 * });
 *
 * // New string parameter syntax
 * const simpleSchema = EmailRequired('Contact Email');
 * ```
 */
export const EmailRequired = createEmailRequiredOverload;

// Export the options interface for external use
export type { EmailSchemaOptions };

// Convenience functions for common email validation patterns

/**
 * Creates a required email schema using HTML5 browser validation pattern
 *
 * This uses the same pattern that browsers use to validate input[type=email] fields,
 * making it ideal for web forms that need to match client-side validation.
 *
 * @param options - Configuration options (pattern is pre-set to HTML5)
 * @param options.msg - Custom field name or error message
 * @param options.msgType - Whether msg is a field name or complete message
 * @returns Zod schema that accepts HTML5-compliant email addresses
 *
 * @example
 * ```typescript
 * const schema = Html5EmailRequired();
 * schema.parse('user@example.com'); // ✓ Valid
 * schema.parse('user+tag@example.com'); // ✓ Valid (supports plus addressing)
 *
 * // With custom error message
 * const customSchema = Html5EmailRequired({ msg: 'Registration Email' });
 * ```
 */
export const Html5EmailRequired = (
  options: Omit<EmailSchemaOptions, "pattern"> = {},
) => {
  return emailSchemas.EmailRequired({
    ...options,
    pattern: z.regexes.html5Email,
  });
};

/**
 * Creates an optional email schema using HTML5 browser validation pattern
 *
 * @param options - Configuration options (pattern is pre-set to HTML5)
 * @returns Zod schema that accepts HTML5-compliant email addresses or undefined
 */
export const Html5EmailOptional = (
  options: Omit<EmailSchemaOptions, "pattern"> = {},
) => {
  return emailSchemas.EmailOptional({
    ...options,
    pattern: z.regexes.html5Email,
  });
};

/**
 * Creates a required email schema using RFC 5322 compliant validation
 *
 * This is the most comprehensive email validation pattern, following the full
 * RFC 5322 specification. Use this for systems that need strict email compliance.
 *
 * @param options - Configuration options (pattern is pre-set to RFC 5322)
 * @param options.msg - Custom field name or error message
 * @param options.msgType - Whether msg is a field name or complete message
 * @returns Zod schema that accepts RFC 5322 compliant email addresses
 *
 * @example
 * ```typescript
 * const schema = Rfc5322EmailRequired();
 * schema.parse('user@example.com'); // ✓ Valid
 * schema.parse('very.long.email.address@example.com'); // ✓ Valid
 *
 * // For API endpoints requiring strict validation
 * const apiSchema = Rfc5322EmailRequired({ msg: 'API User Email' });
 * ```
 */
export const Rfc5322EmailRequired = (
  options: Omit<EmailSchemaOptions, "pattern"> = {},
) => {
  return emailSchemas.EmailRequired({
    ...options,
    pattern: z.regexes.rfc5322Email,
  });
};

/**
 * Creates an optional email schema using RFC 5322 compliant validation
 *
 * @param options - Configuration options (pattern is pre-set to RFC 5322)
 * @returns Zod schema that accepts RFC 5322 compliant email addresses or undefined
 */
export const Rfc5322EmailOptional = (
  options: Omit<EmailSchemaOptions, "pattern"> = {},
) => {
  return emailSchemas.EmailOptional({
    ...options,
    pattern: z.regexes.rfc5322Email,
  });
};

/**
 * Creates a required email schema with Unicode support for international emails
 *
 * This pattern supports international domain names and Unicode characters,
 * making it ideal for global applications that need to support non-Latin email addresses.
 *
 * @param options - Configuration options (pattern is pre-set to Unicode)
 * @param options.msg - Custom field name or error message
 * @param options.msgType - Whether msg is a field name or complete message
 * @returns Zod schema that accepts Unicode-friendly email addresses
 *
 * @example
 * ```typescript
 * const schema = UnicodeEmailRequired();
 * schema.parse('user@example.com'); // ✓ Valid
 * schema.parse('用户@例え.テスト'); // ✓ Valid (international characters)
 *
 * // For international applications
 * const globalSchema = UnicodeEmailRequired({ msg: 'International Email' });
 * ```
 */
export const UnicodeEmailRequired = (
  options: Omit<EmailSchemaOptions, "pattern"> = {},
) => {
  return emailSchemas.EmailRequired({
    ...options,
    pattern: z.regexes.unicodeEmail,
  });
};

/**
 * Creates an optional email schema with Unicode support for international emails
 *
 * @param options - Configuration options (pattern is pre-set to Unicode)
 * @returns Zod schema that accepts Unicode-friendly email addresses or undefined
 */
export const UnicodeEmailOptional = (
  options: Omit<EmailSchemaOptions, "pattern"> = {},
) => {
  return emailSchemas.EmailOptional({
    ...options,
    pattern: z.regexes.unicodeEmail,
  });
};

// --- Types ---
type EmailSchemasFactory = ReturnType<typeof createEmailSchemas>;
export type EmailOptional = z.infer<
  ReturnType<EmailSchemasFactory["EmailOptional"]>
>;
export type EmailRequired = z.infer<
  ReturnType<EmailSchemasFactory["EmailRequired"]>
>;
