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
 * const schema = zEmailRequired();
 *
 * // Custom email pattern
 * const customSchema = zEmailRequired({ pattern: /^[a-z]+@company\.com$/ });
 *
 * // Custom error messages
 * const customMessageSchema = zEmailRequired({
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
   * const schema = zEmailOptional();
   *
   * // Optional email with custom pattern
   * const companySchema = zEmailOptional({
   *   pattern: /^[a-z]+@company\.com$/
   * });
   *
   * // Optional email with custom error message
   * const customSchema = zEmailOptional({
   *   msg: 'User Email',
   *   pattern: z.regexes.unicodeEmail
   * });
   * ```
   */
  const zEmailOptional = (options: EmailSchemaOptions = {}) => {
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
   * const schema = zEmailRequired();
   *
   * // Required email with custom pattern
   * const companySchema = zEmailRequired({
   *   pattern: /^[a-z]+@company\.com$/
   * });
   *
   * // Required email with custom error message
   * const customSchema = zEmailRequired({
   *   msg: 'User Email',
   *   pattern: z.regexes.html5Email
   * });
   * ```
   */
  const zEmailRequired = (options: EmailSchemaOptions = {}) => {
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
    zEmailOptional,
    zEmailRequired,
  };
};

// Create a test message handler for email validation
const emailMessageHandler = createTestMessageHandler((options) => {
  if (options.msgType === MsgType.Message) {
    return options.msg;
  }

  // Email-specific error messages
  switch (options.messageKey) {
    case "required":
      return `${options.msg} is required`;
    case "mustBeValidEmail":
      return `${options.msg} must be a valid email address`;
    case "invalidFormat":
      return `${options.msg} has invalid format: expected ${options.params?.expectedFormat || "user@example.com"}`;
    case "domainInvalid":
      return `${options.msg} has invalid domain: ${options.params?.domain || "missing or invalid"}`;
    default:
      return `${options.msg} is invalid`;
  }
});

// Create schemas with default handler
const {
  zEmailOptional: baseZEmailOptional,
  zEmailRequired: baseZEmailRequired,
} = createEmailSchemas(emailMessageHandler);

// Export schemas with updated API

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
 * const schema = zEmailOptional();
 * schema.parse('user@example.com'); // ✓ Valid
 * schema.parse('invalid-email');    // ✗ Throws error
 * schema.parse(undefined);          // ✓ Valid
 *
 * // With custom pattern for company emails
 * const companySchema = zEmailOptional({
 *   pattern: /^[a-z.]+@company\.com$/
 * });
 * ```
 */
export const zEmailOptional = baseZEmailOptional;

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
 * const schema = zEmailRequired();
 * schema.parse('user@example.com'); // ✓ Valid
 * schema.parse('invalid-email');    // ✗ Throws error
 * schema.parse(undefined);          // ✗ Throws error
 *
 * // With HTML5 browser validation pattern
 * const html5Schema = zEmailRequired({
 *   pattern: z.regexes.html5Email
 * });
 *
 * // With unicode support for international emails
 * const unicodeSchema = zEmailRequired({
 *   pattern: z.regexes.unicodeEmail
 * });
 * ```
 */
export const zEmailRequired = baseZEmailRequired;

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
 * const schema = zHtml5EmailRequired();
 * schema.parse('user@example.com'); // ✓ Valid
 * schema.parse('user+tag@example.com'); // ✓ Valid (supports plus addressing)
 *
 * // With custom error message
 * const customSchema = zHtml5EmailRequired({ msg: 'Registration Email' });
 * ```
 */
export const zHtml5EmailRequired = (
  options: Omit<EmailSchemaOptions, "pattern"> = {},
) => {
  return baseZEmailRequired({ ...options, pattern: z.regexes.html5Email });
};

/**
 * Creates an optional email schema using HTML5 browser validation pattern
 *
 * @param options - Configuration options (pattern is pre-set to HTML5)
 * @returns Zod schema that accepts HTML5-compliant email addresses or undefined
 */
export const zHtml5EmailOptional = (
  options: Omit<EmailSchemaOptions, "pattern"> = {},
) => {
  return baseZEmailOptional({ ...options, pattern: z.regexes.html5Email });
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
 * const schema = zRfc5322EmailRequired();
 * schema.parse('user@example.com'); // ✓ Valid
 * schema.parse('very.long.email.address@example.com'); // ✓ Valid
 *
 * // For API endpoints requiring strict validation
 * const apiSchema = zRfc5322EmailRequired({ msg: 'API User Email' });
 * ```
 */
export const zRfc5322EmailRequired = (
  options: Omit<EmailSchemaOptions, "pattern"> = {},
) => {
  return baseZEmailRequired({ ...options, pattern: z.regexes.rfc5322Email });
};

/**
 * Creates an optional email schema using RFC 5322 compliant validation
 *
 * @param options - Configuration options (pattern is pre-set to RFC 5322)
 * @returns Zod schema that accepts RFC 5322 compliant email addresses or undefined
 */
export const zRfc5322EmailOptional = (
  options: Omit<EmailSchemaOptions, "pattern"> = {},
) => {
  return baseZEmailOptional({ ...options, pattern: z.regexes.rfc5322Email });
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
 * const schema = zUnicodeEmailRequired();
 * schema.parse('user@example.com'); // ✓ Valid
 * schema.parse('用户@例え.テスト'); // ✓ Valid (international characters)
 *
 * // For international applications
 * const globalSchema = zUnicodeEmailRequired({ msg: 'International Email' });
 * ```
 */
export const zUnicodeEmailRequired = (
  options: Omit<EmailSchemaOptions, "pattern"> = {},
) => {
  return baseZEmailRequired({ ...options, pattern: z.regexes.unicodeEmail });
};

/**
 * Creates an optional email schema with Unicode support for international emails
 *
 * @param options - Configuration options (pattern is pre-set to Unicode)
 * @returns Zod schema that accepts Unicode-friendly email addresses or undefined
 */
export const zUnicodeEmailOptional = (
  options: Omit<EmailSchemaOptions, "pattern"> = {},
) => {
  return baseZEmailOptional({ ...options, pattern: z.regexes.unicodeEmail });
};

// --- Types ---
type EmailSchemasFactory = ReturnType<typeof createEmailSchemas>;
export type EmailOptional = z.infer<
  ReturnType<EmailSchemasFactory["zEmailOptional"]>
>;
export type EmailRequired = z.infer<
  ReturnType<EmailSchemasFactory["zEmailRequired"]>
>;
