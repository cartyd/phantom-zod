import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createTestMessageHandler } from "../localization/types/message-handler.types";
import type { BaseSchemaOptions } from "../common/types/schema-options.types";
import type { UrlMessageParams } from "../localization/types/message-params.types";

type UrlMessageKey = keyof UrlMessageParams;

/**
 * Options for URL schema validation
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const schema = zUrlRequired();
 * 
 * // Protocol validation
 * const httpsOnly = zUrlRequired({ protocol: /^https$/ });
 * 
 * // Hostname validation
 * const specificDomain = zUrlRequired({ hostname: /^api\.example\.com$/ });
 * 
 * // Combined validation
 * const secureApi = zUrlRequired({ 
 *   protocol: /^https$/, 
 *   hostname: /^api\.company\.com$/ 
 * });
 * 
 * // Custom error messages
 * const customSchema = zUrlRequired({ 
 *   msg: 'API Endpoint',
 *   protocol: /^https$/,
 *   hostname: /^api\.example\.com$/
 * });
 * ```
 */
interface UrlSchemaOptions extends BaseSchemaOptions {
  /** 
   * Protocol regex pattern for validating URL protocols
   * @example /^https$/ - Only HTTPS URLs
   * @example /^https?$/ - HTTP or HTTPS URLs
   * @example /^(ftp|ftps)$/ - FTP or FTPS URLs
   */
  protocol?: RegExp;
  /** 
   * Hostname regex pattern for validating URL hostnames/domains
   * @example /^example\.com$/ - Only example.com domain
   * @example /^(api|admin)\.company\.com$/ - Specific subdomains
   * @example /\.example\.com$/ - Any subdomain of example.com
   */
  hostname?: RegExp;
}

/**
 * Creates a factory function for URL schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing URL schema creation functions
 */
export const createUrlSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Helper function to create error message
   */
  const createErrorMessage = (messageKey: UrlMessageKey, options: UrlSchemaOptions = {}, params: any = {}) => {
    const { msg = "URL", msgType = MsgType.FieldName } = options;
    return messageHandler.formatErrorMessage({
      group: "url" as const,
      msg,
      msgType,
      messageKey,
      params,
    });
  };

  /**
   * Helper function to determine appropriate error message based on validation options
   */
  const getErrorMessage = (options: UrlSchemaOptions) => {
    const { protocol, hostname } = options;
    
    if (protocol && hostname) {
      return createErrorMessage("invalid", options, { reason: "protocol or hostname mismatch" });
    } else if (protocol) {
      return createErrorMessage("invalidProtocol", options, { protocol: "expected protocol" });
    } else if (hostname) {
      return createErrorMessage("invalidDomain", options, { domain: "expected hostname" });
    } else {
      return createErrorMessage("mustBeValidUrl", options);
    }
  };

  /**
   * Creates an optional URL schema that accepts valid URLs or undefined
   * 
   * @param options - Configuration options for URL validation
   * @param options.protocol - RegExp to validate URL protocol (e.g., /^https$/ for HTTPS only)
   * @param options.hostname - RegExp to validate URL hostname (e.g., /^api\.example\.com$/ for specific domain)
   * @param options.msg - Custom field name or error message for validation errors
   * @param options.msgType - Whether msg is a field name or complete message
   * @returns Zod schema that accepts valid URLs matching the criteria or undefined
   * 
   * @example
   * ```typescript
   * // Accept any valid URL or undefined
   * const anyUrl = zUrlOptional();
   * 
   * // Accept only HTTPS URLs or undefined
   * const httpsUrl = zUrlOptional({ protocol: /^https$/ });
   * 
   * // Accept URLs from specific domain or undefined
   * const domainUrl = zUrlOptional({ hostname: /^api\.company\.com$/ });
   * 
   * // Combined validation with custom error message
   * const secureApi = zUrlOptional({
   *   protocol: /^https$/,
   *   hostname: /^api\.company\.com$/,
   *   msg: 'Secure API URL'
   * });
   * ```
   */
  const zUrlOptional = (options: UrlSchemaOptions = {}) => {
    const { protocol, hostname } = options;
    
    const urlConfig: any = {
      message: getErrorMessage(options)
    };
    
    if (protocol) {
      urlConfig.protocol = protocol;
    }
    
    if (hostname) {
      urlConfig.hostname = hostname;
    }
    
    return z.union([
      z.url(urlConfig),
      z.undefined()
    ]);
  };

  /**
   * Creates a required URL schema that accepts only valid URLs
   * 
   * @param options - Configuration options for URL validation
   * @param options.protocol - RegExp to validate URL protocol (e.g., /^https$/ for HTTPS only)
   * @param options.hostname - RegExp to validate URL hostname (e.g., /^api\.example\.com$/ for specific domain)
   * @param options.msg - Custom field name or error message for validation errors
   * @param options.msgType - Whether msg is a field name or complete message
   * @returns Zod schema that accepts only valid URLs matching the criteria
   * 
   * @example
   * ```typescript
   * // Accept any valid URL
   * const anyUrl = zUrlRequired();
   * 
   * // Accept only HTTPS URLs
   * const httpsUrl = zUrlRequired({ protocol: /^https$/ });
   * 
   * // Accept URLs from specific domain
   * const domainUrl = zUrlRequired({ hostname: /^api\.company\.com$/ });
   * 
   * // Combined validation with custom error message
   * const secureApi = zUrlRequired({
   *   protocol: /^https$/,
   *   hostname: /^api\.company\.com$/,
   *   msg: 'Secure API URL'
   * });
   * ```
   */
  const zUrlRequired = (options: UrlSchemaOptions = {}) => {
    const { protocol, hostname } = options;
    
    const urlConfig: any = {
      message: getErrorMessage(options)
    };
    
    if (protocol) {
      urlConfig.protocol = protocol;
    }
    
    if (hostname) {
      urlConfig.hostname = hostname;
    }
    
    return z.url(urlConfig);
  };

  return { zUrlOptional, zUrlRequired };
};

// Create a custom message handler for URL validation
const urlMessageHandler = createTestMessageHandler((options) => {
  if (options.msgType === MsgType.Message) {
    return options.msg;
  }

  // URL-specific error messages
  switch (options.messageKey) {
    case "required":
      return `${options.msg} is required`;
    case "mustBeValidUrl":
      return `${options.msg} must be a valid URL`;
    case "invalidProtocol":
      return `${options.msg} has invalid protocol: ${options.params?.protocol}`;
    case "invalidDomain":
      return `${options.msg} has invalid domain: ${options.params?.domain}`;
    case "missingProtocol":
      return `${options.msg} is missing protocol. Try adding ${options.params?.suggestedProtocols?.join(" or ") || "https://"}`;
    case "invalid":
      return `${options.msg} is invalid: ${options.params?.reason}`;
    default:
      return `${options.msg} is invalid`;
  }
});

// Create schemas with default handler
const { zUrlOptional: baseZUrlOptional, zUrlRequired: baseZUrlRequired } = createUrlSchemas(urlMessageHandler);

// Export schemas with new API pattern

/**
 * Creates an optional URL schema that accepts valid URLs or undefined
 * 
 * This is the base URL validation schema that accepts any valid URL format.
 * For protocol or hostname restrictions, use the options parameter or the
 * specialized convenience functions.
 * 
 * @param options - Configuration options for URL validation
 * @returns Zod schema that accepts valid URLs or undefined
 * 
 * @example
 * ```typescript
 * const schema = zUrlOptional();
 * schema.parse('https://example.com'); // ✓ Valid
 * schema.parse('http://example.com');  // ✓ Valid
 * schema.parse('ftp://example.com');   // ✓ Valid
 * schema.parse(undefined);             // ✓ Valid
 * schema.parse('not-a-url');           // ✗ Throws error
 * ```
 */
export const zUrlOptional = baseZUrlOptional;

/**
 * Creates a required URL schema that accepts only valid URLs
 * 
 * This is the base URL validation schema that accepts any valid URL format.
 * For protocol or hostname restrictions, use the options parameter or the
 * specialized convenience functions.
 * 
 * @param options - Configuration options for URL validation
 * @returns Zod schema that accepts only valid URLs
 * 
 * @example
 * ```typescript
 * const schema = zUrlRequired();
 * schema.parse('https://example.com'); // ✓ Valid
 * schema.parse('http://example.com');  // ✓ Valid
 * schema.parse('ftp://example.com');   // ✓ Valid
 * schema.parse(undefined);             // ✗ Throws error
 * schema.parse('not-a-url');           // ✗ Throws error
 * ```
 */
export const zUrlRequired = baseZUrlRequired;

// Export the options interface for external use
export type { UrlSchemaOptions };

// Convenience functions for common protocol validations

/**
 * Creates a required URL schema that only accepts HTTPS URLs
 * 
 * This is a convenience function that pre-configures the protocol validation
 * to only accept HTTPS URLs. All other URL validation rules still apply.
 * 
 * @param options - Configuration options (protocol is pre-set to HTTPS)
 * @param options.hostname - RegExp to validate URL hostname
 * @param options.msg - Custom field name or error message
 * @param options.msgType - Whether msg is a field name or complete message
 * @returns Zod schema that accepts only valid HTTPS URLs
 * 
 * @example
 * ```typescript
 * const schema = zHttpsUrlRequired();
 * schema.parse('https://example.com'); // ✓ Valid
 * schema.parse('http://example.com');  // ✗ Throws error
 * 
 * // With hostname validation
 * const apiSchema = zHttpsUrlRequired({ 
 *   hostname: /^api\.company\.com$/ 
 * });
 * apiSchema.parse('https://api.company.com'); // ✓ Valid
 * apiSchema.parse('https://example.com');     // ✗ Throws error
 * ```
 */
export const zHttpsUrlRequired = (options: Omit<UrlSchemaOptions, 'protocol'> = {}) => {
  return baseZUrlRequired({ ...options, protocol: /^https$/ });
};

/**
 * Creates an optional URL schema that only accepts HTTPS URLs or undefined
 * 
 * This is a convenience function that pre-configures the protocol validation
 * to only accept HTTPS URLs. Undefined values are also accepted.
 * 
 * @param options - Configuration options (protocol is pre-set to HTTPS)
 * @param options.hostname - RegExp to validate URL hostname
 * @param options.msg - Custom field name or error message
 * @param options.msgType - Whether msg is a field name or complete message
 * @returns Zod schema that accepts valid HTTPS URLs or undefined
 * 
 * @example
 * ```typescript
 * const schema = zHttpsUrlOptional();
 * schema.parse('https://example.com'); // ✓ Valid
 * schema.parse(undefined);             // ✓ Valid
 * schema.parse('http://example.com');  // ✗ Throws error
 * 
 * // With hostname validation
 * const apiSchema = zHttpsUrlOptional({ 
 *   hostname: /^api\.company\.com$/ 
 * });
 * ```
 */
export const zHttpsUrlOptional = (options: Omit<UrlSchemaOptions, 'protocol'> = {}) => {
  return baseZUrlOptional({ ...options, protocol: /^https$/ });
};

/**
 * Creates a required URL schema that only accepts HTTP URLs
 * 
 * This is a convenience function that pre-configures the protocol validation
 * to only accept HTTP URLs. This is typically used for legacy systems or
 * internal services that don't require encryption.
 * 
 * @param options - Configuration options (protocol is pre-set to HTTP)
 * @param options.hostname - RegExp to validate URL hostname
 * @param options.msg - Custom field name or error message
 * @param options.msgType - Whether msg is a field name or complete message
 * @returns Zod schema that accepts only valid HTTP URLs
 * 
 * @example
 * ```typescript
 * const schema = zHttpUrlRequired();
 * schema.parse('http://example.com');  // ✓ Valid
 * schema.parse('https://example.com'); // ✗ Throws error
 * 
 * // With hostname validation for internal services
 * const internalSchema = zHttpUrlRequired({ 
 *   hostname: /^internal\.company\.local$/ 
 * });
 * ```
 */
export const zHttpUrlRequired = (options: Omit<UrlSchemaOptions, 'protocol'> = {}) => {
  return baseZUrlRequired({ ...options, protocol: /^http$/ });
};

/**
 * Creates an optional URL schema that only accepts HTTP URLs or undefined
 * 
 * This is a convenience function that pre-configures the protocol validation
 * to only accept HTTP URLs. Undefined values are also accepted.
 * 
 * @param options - Configuration options (protocol is pre-set to HTTP)
 * @param options.hostname - RegExp to validate URL hostname
 * @param options.msg - Custom field name or error message
 * @param options.msgType - Whether msg is a field name or complete message
 * @returns Zod schema that accepts valid HTTP URLs or undefined
 * 
 * @example
 * ```typescript
 * const schema = zHttpUrlOptional();
 * schema.parse('http://example.com');  // ✓ Valid
 * schema.parse(undefined);             // ✓ Valid
 * schema.parse('https://example.com'); // ✗ Throws error
 * ```
 */
export const zHttpUrlOptional = (options: Omit<UrlSchemaOptions, 'protocol'> = {}) => {
  return baseZUrlOptional({ ...options, protocol: /^http$/ });
};

/**
 * Creates a required URL schema that accepts both HTTP and HTTPS URLs
 * 
 * This is a convenience function for web URLs that accepts both HTTP and HTTPS
 * protocols. This is the most common validation for general web URLs.
 * 
 * @param options - Configuration options (protocol is pre-set to HTTP/HTTPS)
 * @param options.hostname - RegExp to validate URL hostname
 * @param options.msg - Custom field name or error message
 * @param options.msgType - Whether msg is a field name or complete message
 * @returns Zod schema that accepts valid HTTP or HTTPS URLs
 * 
 * @example
 * ```typescript
 * const schema = zWebUrlRequired();
 * schema.parse('http://example.com');  // ✓ Valid
 * schema.parse('https://example.com'); // ✓ Valid
 * schema.parse('ftp://example.com');   // ✗ Throws error
 * 
 * // With hostname validation for specific websites
 * const websiteSchema = zWebUrlRequired({ 
 *   hostname: /^(www\.)?company\.com$/ 
 * });
 * ```
 */
export const zWebUrlRequired = (options: Omit<UrlSchemaOptions, 'protocol'> = {}) => {
  return baseZUrlRequired({ ...options, protocol: /^https?$/ });
};

/**
 * Creates an optional URL schema that accepts both HTTP and HTTPS URLs or undefined
 * 
 * This is a convenience function for optional web URLs that accepts both HTTP 
 * and HTTPS protocols. Undefined values are also accepted.
 * 
 * @param options - Configuration options (protocol is pre-set to HTTP/HTTPS)
 * @param options.hostname - RegExp to validate URL hostname
 * @param options.msg - Custom field name or error message
 * @param options.msgType - Whether msg is a field name or complete message
 * @returns Zod schema that accepts valid HTTP/HTTPS URLs or undefined
 * 
 * @example
 * ```typescript
 * const schema = zWebUrlOptional();
 * schema.parse('http://example.com');  // ✓ Valid
 * schema.parse('https://example.com'); // ✓ Valid
 * schema.parse(undefined);             // ✓ Valid
 * schema.parse('ftp://example.com');   // ✗ Throws error
 * 
 * // For optional website fields
 * const profileSchema = z.object({
 *   name: z.string(),
 *   website: zWebUrlOptional({ msg: 'Website URL' })
 * });
 * ```
 */
export const zWebUrlOptional = (options: Omit<UrlSchemaOptions, 'protocol'> = {}) => {
  return baseZUrlOptional({ ...options, protocol: /^https?$/ });
};

