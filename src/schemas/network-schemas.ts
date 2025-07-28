import { z } from "zod";
import { MAC_ADDRESS_PATTERN } from "../common/regex-patterns";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createTestMessageHandler } from "../localization/types/message-handler.types";
import type { BaseSchemaOptions } from "../common/types/schema-options.types";
import type { NetworkMessageParams } from "../localization/types/message-params.types";
import { makeOptional, makeOptionalSimple } from "../common/utils/zod-utils";

type NetworkMessageKey = keyof NetworkMessageParams;

/**
 * Options for network schema validation
 */
interface NetworkSchemaOptions extends BaseSchemaOptions {
  /** Optional version constraint for IP addresses */
  version?: "v4" | "v6";
}

/**
 * Creates a factory function for network schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing network schema creation functions
 */
export const createNetworkSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Helper function to create error message
   */
  const createErrorMessage = (messageKey: NetworkMessageKey, options: NetworkSchemaOptions = {}) => {
    const { msg = "Network Address", msgType = MsgType.FieldName } = options;
    return messageHandler.formatErrorMessage({
      group: "network" as const,
      msg,
      msgType,
      messageKey,
      params: {},
    });
  };

  /**
   * Creates an optional IPv4 address schema using Zod's built-in IP validation
   * 
   * @param options - Configuration options for IPv4 validation
   * @returns Zod schema that accepts valid IPv4 addresses or undefined
   * 
   * @example
   * ```typescript
   * const schema = zIPv4Optional();
   * schema.parse('192.168.1.1');  // ✓ Valid
   * schema.parse(undefined);      // ✓ Valid
   * schema.parse('invalid-ip');   // ✗ Throws error
   * ```
   */
  const zIPv4Optional = (options: NetworkSchemaOptions = {}) => {
    return makeOptional(
      z.ipv4({ message: createErrorMessage("mustBeValidIPv4", options) })
    );
  };

  /**
   * Creates a required IPv4 address schema using Zod's built-in IP validation
   * 
   * @param options - Configuration options for IPv4 validation
   * @returns Zod schema that accepts only valid IPv4 addresses
   * 
   * @example
   * ```typescript
   * const schema = zIPv4Required();
   * schema.parse('192.168.1.1');  // ✓ Valid
   * schema.parse(undefined);      // ✗ Throws error
   * schema.parse('invalid-ip');   // ✗ Throws error
   * ```
   */
  const zIPv4Required = (options: NetworkSchemaOptions = {}) => {
    return z.ipv4({ message: createErrorMessage("mustBeValidIPv4", options) });
  };

  /**
   * Creates an optional IPv6 address schema using Zod's built-in IP validation
   * 
   * @param options - Configuration options for IPv6 validation
   * @returns Zod schema that accepts valid IPv6 addresses or undefined
   * 
   * @example
   * ```typescript
   * const schema = zIPv6Optional();
   * schema.parse('2001:db8::1');     // ✓ Valid
   * schema.parse(undefined);         // ✓ Valid
   * schema.parse('invalid-ipv6');    // ✗ Throws error
   * ```
   */
  const zIPv6Optional = (options: NetworkSchemaOptions = {}) => {
    return makeOptional(
      z.ipv6({ message: createErrorMessage("mustBeValidIPv6", options) })
    );
  };

  /**
   * Creates a required IPv6 address schema using Zod's built-in IP validation
   * 
   * @param options - Configuration options for IPv6 validation
   * @returns Zod schema that accepts only valid IPv6 addresses
   * 
   * @example
   * ```typescript
   * const schema = zIPv6Required();
   * schema.parse('2001:db8::1');     // ✓ Valid
   * schema.parse(undefined);         // ✗ Throws error
   * schema.parse('invalid-ipv6');    // ✗ Throws error
   * ```
   */
  const zIPv6Required = (options: NetworkSchemaOptions = {}) => {
    return z.ipv6({ message: createErrorMessage("mustBeValidIPv6", options) });
  };

  /**
   * Creates an optional MAC address schema using regex validation
   * 
   * @param options - Configuration options for MAC address validation  
   * @returns Zod schema that accepts valid MAC addresses or undefined
   * 
   * @example
   * ```typescript
   * const schema = zMacAddressOptional();
   * schema.parse('00:1A:2B:3C:4D:5E'); // ✓ Valid
   * schema.parse('00-1A-2B-3C-4D-5E'); // ✓ Valid  
   * schema.parse(undefined);           // ✓ Valid
   * schema.parse('invalid-mac');       // ✗ Throws error
   * ```
   */
  const zMacAddressOptional = (options: NetworkSchemaOptions = {}) => {
    return makeOptional(
      z.string().refine(
        (val) => MAC_ADDRESS_PATTERN.test(val),
        { message: createErrorMessage("mustBeValidMacAddress", options) }
      )
    );
  };

  /**
   * Creates a required MAC address schema using regex validation
   * 
   * @param options - Configuration options for MAC address validation
   * @returns Zod schema that accepts only valid MAC addresses
   * 
   * @example
   * ```typescript
   * const schema = zMacAddressRequired();
   * schema.parse('00:1A:2B:3C:4D:5E'); // ✓ Valid
   * schema.parse('00-1A-2B-3C-4D-5E'); // ✓ Valid
   * schema.parse(undefined);           // ✗ Throws error
   * schema.parse('invalid-mac');       // ✗ Throws error
   * ```
   */
  const zMacAddressRequired = (options: NetworkSchemaOptions = {}) => {
    return z.string().refine(
      (val) => MAC_ADDRESS_PATTERN.test(val),
      { message: createErrorMessage("mustBeValidMacAddress", options) }
    );
  };

  /**
   * Creates a generic network address schema that accepts IPv4, IPv6, or MAC addresses
   * Uses Zod's built-in IP validation for IP addresses and regex for MAC addresses
   * 
   * @param options - Configuration options for network address validation
   * @returns Zod schema that accepts valid network addresses
   * 
   * @example
   * ```typescript
   * const schema = zNetworkAddressGeneric();
   * schema.parse('192.168.1.1');       // ✓ Valid IPv4
   * schema.parse('2001:db8::1');       // ✓ Valid IPv6  
   * schema.parse('00:1A:2B:3C:4D:5E'); // ✓ Valid MAC
   * schema.parse('invalid-address');   // ✗ Throws error
   * ```
   */
  const zNetworkAddressGeneric = (options: NetworkSchemaOptions = {}) => {
    return z.string().refine(
      (val) => {
        // Try IPv4 validation using Zod
        const ipv4Result = z.ipv4().safeParse(val);
        if (ipv4Result.success) return true;
        
        // Try IPv6 validation using Zod
        const ipv6Result = z.ipv6().safeParse(val);
        if (ipv6Result.success) return true;
        
        // Try MAC address validation using regex
        return MAC_ADDRESS_PATTERN.test(val);
      },
      { message: createErrorMessage("invalid", options) }
    );
  };

  /**
   * Creates a schema that accepts any valid IP address (IPv4 or IPv6) using Zod's built-in validation
   * 
   * @param options - Configuration options for IP address validation
   * @returns Zod schema that accepts valid IP addresses
   * 
   * @example
   * ```typescript
   * const schema = zIPAddressGeneric();
   * schema.parse('192.168.1.1'); // ✓ Valid IPv4
   * schema.parse('2001:db8::1'); // ✓ Valid IPv6
   * schema.parse('invalid-ip');  // ✗ Throws error
   * ```
   */
  const zIPAddressGeneric = (options: NetworkSchemaOptions = {}) => {
    return z.string().refine(
      (val) => {
        // Try IPv4 validation using Zod
        const ipv4Result = z.ipv4().safeParse(val);
        if (ipv4Result.success) return true;
        
        // Try IPv6 validation using Zod
        const ipv6Result = z.ipv6().safeParse(val);
        if (ipv6Result.success) return true;
        
        return false;
      },
      { message: createErrorMessage("invalid", options) }
    );
  };

  /**
   * Creates an optional IPv4 CIDR block schema using Zod's built-in CIDR validation
   * 
   * @param options - Configuration options for IPv4 CIDR validation
   * @returns Zod schema that accepts valid IPv4 CIDR blocks or undefined
   * 
   * @example
   * ```typescript
   * const schema = zIPv4CIDROptional();
   * schema.parse('192.168.1.0/24');   // ✓ Valid
   * schema.parse('10.0.0.0/8');      // ✓ Valid
   * schema.parse(undefined);         // ✓ Valid
   * schema.parse('192.168.1.1');     // ✗ Throws error (missing CIDR)
   * schema.parse('192.168.1.0/33');  // ✗ Throws error (invalid prefix)
   * ```
   */
  const zIPv4CIDROptional = (options: NetworkSchemaOptions = {}) => {
    return makeOptionalSimple(
      z.cidrv4({ message: createErrorMessage("mustBeValidIPv4", options) })
    );
  };

  /**
   * Creates a required IPv4 CIDR block schema using Zod's built-in CIDR validation
   * 
   * @param options - Configuration options for IPv4 CIDR validation
   * @returns Zod schema that accepts only valid IPv4 CIDR blocks
   * 
   * @example
   * ```typescript
   * const schema = zIPv4CIDRRequired();
   * schema.parse('192.168.1.0/24');   // ✓ Valid
   * schema.parse('10.0.0.0/8');      // ✓ Valid
   * schema.parse(undefined);         // ✗ Throws error
   * schema.parse('192.168.1.1');     // ✗ Throws error (missing CIDR)
   * schema.parse('192.168.1.0/33');  // ✗ Throws error (invalid prefix)
   * ```
   */
  const zIPv4CIDRRequired = (options: NetworkSchemaOptions = {}) => {
    return z.cidrv4({ message: createErrorMessage("mustBeValidIPv4", options) });
  };

  /**
   * Creates an optional IPv6 CIDR block schema using Zod's built-in CIDR validation
   * 
   * @param options - Configuration options for IPv6 CIDR validation
   * @returns Zod schema that accepts valid IPv6 CIDR blocks or undefined
   * 
   * @example
   * ```typescript
   * const schema = zIPv6CIDROptional();
   * schema.parse('2001:db8::/32');    // ✓ Valid
   * schema.parse('fe80::/10');       // ✓ Valid
   * schema.parse(undefined);         // ✓ Valid
   * schema.parse('2001:db8::1');     // ✗ Throws error (missing CIDR)
   * schema.parse('2001:db8::/129');  // ✗ Throws error (invalid prefix)
   * ```
   */
  const zIPv6CIDROptional = (options: NetworkSchemaOptions = {}) => {
    return makeOptionalSimple(
      z.cidrv6({ message: createErrorMessage("mustBeValidIPv6", options) })
    );
  };

  /**
   * Creates a required IPv6 CIDR block schema using Zod's built-in CIDR validation
   * 
   * @param options - Configuration options for IPv6 CIDR validation
   * @returns Zod schema that accepts only valid IPv6 CIDR blocks
   * 
   * @example
   * ```typescript
   * const schema = zIPv6CIDRRequired();
   * schema.parse('2001:db8::/32');    // ✓ Valid
   * schema.parse('fe80::/10');       // ✓ Valid
   * schema.parse(undefined);         // ✗ Throws error
   * schema.parse('2001:db8::1');     // ✗ Throws error (missing CIDR)
   * schema.parse('2001:db8::/129');  // ✗ Throws error (invalid prefix)
   * ```
   */
  const zIPv6CIDRRequired = (options: NetworkSchemaOptions = {}) => {
    return z.cidrv6({ message: createErrorMessage("mustBeValidIPv6", options) });
  };

  /**
   * Creates a generic CIDR block schema that accepts IPv4 or IPv6 CIDR blocks
   * 
   * @param options - Configuration options for CIDR validation
   * @returns Zod schema that accepts valid CIDR blocks
   * 
   * @example
   * ```typescript
   * const schema = zCIDRGeneric();
   * schema.parse('192.168.1.0/24');   // ✓ Valid IPv4 CIDR
   * schema.parse('2001:db8::/32');    // ✓ Valid IPv6 CIDR
   * schema.parse('invalid-cidr');     // ✗ Throws error
   * ```
   */
  const zCIDRGeneric = (options: NetworkSchemaOptions = {}) => {
    return z.string().refine(
      (val) => {
        // Try IPv4 CIDR validation using Zod
        const ipv4Result = z.cidrv4().safeParse(val);
        if (ipv4Result.success) return true;
        
        // Try IPv6 CIDR validation using Zod
        const ipv6Result = z.cidrv6().safeParse(val);
        if (ipv6Result.success) return true;
        
        return false;
      },
      { message: createErrorMessage("invalid", options) }
    );
  };

  /**
   * Returns example network address formats for user guidance
   */
  const getNetworkAddressExamples = () => {
    return {
      ipv4: "192.168.1.1",
      ipv6: "2001:db8::1", 
      mac: "00:1A:2B:3C:4D:5E",
      ipv4Cidr: "192.168.1.0/24",
      ipv6Cidr: "2001:db8::/32"
    };
  };

  return {
    zIPv4Optional,
    zIPv4Required,
    zIPv6Optional,
    zIPv6Required,
    zIPv4CIDROptional,
    zIPv4CIDRRequired,
    zIPv6CIDROptional,
    zIPv6CIDRRequired,
    zCIDRGeneric,
    zMacAddressOptional,
    zMacAddressRequired,
    zNetworkAddressGeneric,
    zIPAddressGeneric,
    getNetworkAddressExamples,
  };
};

// Create a test message handler for network validation
const networkMessageHandler = createTestMessageHandler((options) => {
  if (options.msgType === MsgType.Message) {
    return options.msg;
  }

  // Network-specific error messages
  switch (options.messageKey) {
    case "required":
      return `${options.msg} is required`;
    case "mustBeValidIPv4":
      return `${options.msg} must be a valid IPv4 address`;
    case "mustBeValidIPv6":
      return `${options.msg} must be a valid IPv6 address`;
    case "mustBeValidMacAddress":
      return `${options.msg} must be a valid MAC address`;
    case "invalidIPv4Format":
      return `${options.msg} is not a valid IPv4 address`;
    case "invalidIPv6Format":
      return `${options.msg} is not a valid IPv6 address`;
    case "invalidMacFormat":
      return `${options.msg} is not a valid MAC address`;
    default:
      return `${options.msg} is invalid`;
  }
});

// Create schemas with default handler
const {
  zIPv4Optional: baseZIPv4Optional,
  zIPv4Required: baseZIPv4Required,
  zIPv6Optional: baseZIPv6Optional,
  zIPv6Required: baseZIPv6Required,
  zIPv4CIDROptional: baseZIPv4CIDROptional,
  zIPv4CIDRRequired: baseZIPv4CIDRRequired,
  zIPv6CIDROptional: baseZIPv6CIDROptional,
  zIPv6CIDRRequired: baseZIPv6CIDRRequired,
  zCIDRGeneric: baseZCIDRGeneric,
  zMacAddressOptional: baseZMacAddressOptional,
  zMacAddressRequired: baseZMacAddressRequired,
  zNetworkAddressGeneric: baseZNetworkAddressGeneric,
  zIPAddressGeneric: baseZIPAddressGeneric,
  getNetworkAddressExamples: baseGetNetworkAddressExamples,
} = createNetworkSchemas(networkMessageHandler);

// Export schemas for direct use

/**
 * Creates an optional IPv4 address schema using Zod's built-in IP validation
 * 
 * @param options - Configuration options for IPv4 validation
 * @returns Zod schema that accepts valid IPv4 addresses or undefined
 * 
 * @example
 * ```typescript
 * const schema = zIPv4Optional();
 * schema.parse('192.168.1.1');  // ✓ Valid
 * schema.parse(undefined);      // ✓ Valid
 * schema.parse('300.1.1.1');    // ✗ Throws error
 * ```
 */
export const zIPv4Optional = baseZIPv4Optional;

/**
 * Creates a required IPv4 address schema using Zod's built-in IP validation
 * 
 * @param options - Configuration options for IPv4 validation
 * @returns Zod schema that accepts only valid IPv4 addresses
 * 
 * @example
 * ```typescript
 * const schema = zIPv4Required();
 * schema.parse('192.168.1.1');  // ✓ Valid
 * schema.parse(undefined);      // ✗ Throws error
 * schema.parse('300.1.1.1');    // ✗ Throws error
 * ```
 */
export const zIPv4Required = baseZIPv4Required;

/**
 * Creates an optional IPv6 address schema using Zod's built-in IP validation
 * 
 * @param options - Configuration options for IPv6 validation
 * @returns Zod schema that accepts valid IPv6 addresses or undefined
 * 
 * @example
 * ```typescript
 * const schema = zIPv6Optional();
 * schema.parse('2001:0db8:85a3::8a2e:0370:7334'); // ✓ Valid
 * schema.parse('::1');                            // ✓ Valid (localhost)
 * schema.parse(undefined);                        // ✓ Valid
 * schema.parse('invalid-ipv6');                   // ✗ Throws error
 * ```
 */
export const zIPv6Optional = baseZIPv6Optional;

/**
 * Creates a required IPv6 address schema using Zod's built-in IP validation
 * 
 * @param options - Configuration options for IPv6 validation
 * @returns Zod schema that accepts only valid IPv6 addresses
 * 
 * @example
 * ```typescript
 * const schema = zIPv6Required();
 * schema.parse('2001:0db8:85a3::8a2e:0370:7334'); // ✓ Valid
 * schema.parse('::1');                            // ✓ Valid (localhost)
 * schema.parse(undefined);                        // ✗ Throws error
 * schema.parse('invalid-ipv6');                   // ✗ Throws error
 * ```
 */
export const zIPv6Required = baseZIPv6Required;

/**
 * Creates an optional MAC address schema
 * 
 * Supports common MAC address formats including colon, hyphen, and dot separators.
 * 
 * @param options - Configuration options for MAC address validation
 * @returns Zod schema that accepts valid MAC addresses or undefined
 * 
 * @example
 * ```typescript
 * const schema = zMacAddressOptional();
 * schema.parse('00:1A:2B:3C:4D:5E'); // ✓ Valid (colon format)
 * schema.parse('00-1A-2B-3C-4D-5E'); // ✓ Valid (hyphen format)
 * schema.parse('001A2B3C4D5E');      // ✓ Valid (no separators)
 * schema.parse(undefined);           // ✓ Valid
 * schema.parse('invalid-mac');       // ✗ Throws error
 * ```
 */
export const zMacAddressOptional = baseZMacAddressOptional;

/**
 * Creates a required MAC address schema
 * 
 * Supports common MAC address formats including colon, hyphen, and dot separators.
 * 
 * @param options - Configuration options for MAC address validation
 * @returns Zod schema that accepts only valid MAC addresses
 * 
 * @example
 * ```typescript
 * const schema = zMacAddressRequired();
 * schema.parse('00:1A:2B:3C:4D:5E'); // ✓ Valid (colon format)
 * schema.parse('00-1A-2B-3C-4D-5E'); // ✓ Valid (hyphen format)
 * schema.parse('001A2B3C4D5E');      // ✓ Valid (no separators)
 * schema.parse(undefined);           // ✗ Throws error
 * schema.parse('invalid-mac');       // ✗ Throws error
 * ```
 */
export const zMacAddressRequired = baseZMacAddressRequired;

/**
 * Creates a generic network address schema that accepts IPv4, IPv6, or MAC addresses
 * 
 * Uses Zod's built-in IP validation for IPv4/IPv6 and regex for MAC addresses.
 * This is useful when you need to accept any type of network address.
 * 
 * @param options - Configuration options for network address validation
 * @returns Zod schema that accepts valid network addresses
 * 
 * @example
 * ```typescript
 * const schema = zNetworkAddressGeneric();
 * schema.parse('192.168.1.1');                   // ✓ Valid IPv4
 * schema.parse('2001:0db8:85a3::8a2e:0370:7334'); // ✓ Valid IPv6
 * schema.parse('00:1A:2B:3C:4D:5E');             // ✓ Valid MAC
 * schema.parse('invalid-address');               // ✗ Throws error
 * ```
 */
export const zNetworkAddressGeneric = baseZNetworkAddressGeneric;

/**
 * Creates a schema that accepts any valid IP address (IPv4 or IPv6)
 * 
 * Uses Zod's built-in IP validation without version constraint.
 * This is useful when you specifically need IP addresses but don't care about the version.
 * 
 * @param options - Configuration options for IP address validation
 * @returns Zod schema that accepts valid IP addresses
 * 
 * @example
 * ```typescript
 * const schema = zIPAddressGeneric();
 * schema.parse('192.168.1.1');                   // ✓ Valid IPv4
 * schema.parse('2001:0db8:85a3::8a2e:0370:7334'); // ✓ Valid IPv6
 * schema.parse('00:1A:2B:3C:4D:5E');             // ✗ Throws error (MAC not allowed)
 * schema.parse('invalid-ip');                    // ✗ Throws error
 * ```
 */
export const zIPAddressGeneric = baseZIPAddressGeneric;

/**
 * Creates an optional IPv4 CIDR block schema using Zod's built-in CIDR validation
 * 
 * CIDR (Classless Inter-Domain Routing) notation specifies an IP network and its prefix length.
 * IPv4 CIDR blocks use slash notation like "192.168.1.0/24" where 24 is the prefix length.
 * 
 * @param options - Configuration options for IPv4 CIDR validation
 * @returns Zod schema that accepts valid IPv4 CIDR blocks or undefined
 * 
 * @example
 * ```typescript
 * const schema = zIPv4CIDROptional();
 * schema.parse('192.168.1.0/24');     // ✓ Valid (private network)
 * schema.parse('10.0.0.0/8');        // ✓ Valid (class A private)
 * schema.parse('172.16.0.0/12');     // ✓ Valid (class B private)
 * schema.parse('0.0.0.0/0');         // ✓ Valid (default route)
 * schema.parse(undefined);           // ✓ Valid
 * schema.parse('192.168.1.1');       // ✗ Throws error (missing /prefix)
 * schema.parse('192.168.1.0/33');    // ✗ Throws error (invalid prefix > 32)
 * schema.parse('256.1.1.0/24');      // ✗ Throws error (invalid IP)
 * ```
 */
export const zIPv4CIDROptional = baseZIPv4CIDROptional;

/**
 * Creates a required IPv4 CIDR block schema using Zod's built-in CIDR validation
 * 
 * CIDR (Classless Inter-Domain Routing) notation specifies an IP network and its prefix length.
 * IPv4 CIDR blocks use slash notation like "192.168.1.0/24" where 24 is the prefix length.
 * 
 * @param options - Configuration options for IPv4 CIDR validation
 * @returns Zod schema that accepts only valid IPv4 CIDR blocks
 * 
 * @example
 * ```typescript
 * const schema = zIPv4CIDRRequired();
 * schema.parse('192.168.1.0/24');     // ✓ Valid (private network)
 * schema.parse('10.0.0.0/8');        // ✓ Valid (class A private)
 * schema.parse('172.16.0.0/12');     // ✓ Valid (class B private)
 * schema.parse('0.0.0.0/0');         // ✓ Valid (default route)
 * schema.parse(undefined);           // ✗ Throws error
 * schema.parse('192.168.1.1');       // ✗ Throws error (missing /prefix)
 * schema.parse('192.168.1.0/33');    // ✗ Throws error (invalid prefix > 32)
 * 
 * // For network configuration
 * const networkConfig = z.object({
 *   subnet: zIPv4CIDRRequired({ msg: 'Network Subnet' }),
 *   gateway: zIPv4Required({ msg: 'Gateway IP' })
 * });
 * ```
 */
export const zIPv4CIDRRequired = baseZIPv4CIDRRequired;

/**
 * Creates an optional IPv6 CIDR block schema using Zod's built-in CIDR validation
 * 
 * IPv6 CIDR blocks use slash notation like "2001:db8::/32" where 32 is the prefix length.
 * IPv6 supports prefix lengths from 0 to 128.
 * 
 * @param options - Configuration options for IPv6 CIDR validation
 * @returns Zod schema that accepts valid IPv6 CIDR blocks or undefined
 * 
 * @example
 * ```typescript
 * const schema = zIPv6CIDROptional();
 * schema.parse('2001:db8::/32');      // ✓ Valid (documentation prefix)
 * schema.parse('fe80::/10');         // ✓ Valid (link-local)
 * schema.parse('::1/128');           // ✓ Valid (localhost with /128)
 * schema.parse('::/0');              // ✓ Valid (default route)
 * schema.parse(undefined);           // ✓ Valid
 * schema.parse('2001:db8::1');       // ✗ Throws error (missing /prefix)
 * schema.parse('2001:db8::/129');    // ✗ Throws error (invalid prefix > 128)
 * schema.parse('invalid::/32');      // ✗ Throws error (invalid IPv6)
 * ```
 */
export const zIPv6CIDROptional = baseZIPv6CIDROptional;

/**
 * Creates a required IPv6 CIDR block schema using Zod's built-in CIDR validation
 * 
 * IPv6 CIDR blocks use slash notation like "2001:db8::/32" where 32 is the prefix length.
 * IPv6 supports prefix lengths from 0 to 128.
 * 
 * @param options - Configuration options for IPv6 CIDR validation
 * @returns Zod schema that accepts only valid IPv6 CIDR blocks
 * 
 * @example
 * ```typescript
 * const schema = zIPv6CIDRRequired();
 * schema.parse('2001:db8::/32');      // ✓ Valid (documentation prefix)
 * schema.parse('fe80::/10');         // ✓ Valid (link-local)
 * schema.parse('::1/128');           // ✓ Valid (localhost with /128)
 * schema.parse('::/0');              // ✓ Valid (default route)
 * schema.parse(undefined);           // ✗ Throws error
 * schema.parse('2001:db8::1');       // ✗ Throws error (missing /prefix)
 * schema.parse('2001:db8::/129');    // ✗ Throws error (invalid prefix > 128)
 * 
 * // For IPv6 network configuration
 * const ipv6Config = z.object({
 *   prefix: zIPv6CIDRRequired({ msg: 'IPv6 Prefix' }),
 *   gateway: zIPv6Required({ msg: 'IPv6 Gateway' })
 * });
 * ```
 */
export const zIPv6CIDRRequired = baseZIPv6CIDRRequired;

/**
 * Creates a generic CIDR block schema that accepts IPv4 or IPv6 CIDR blocks
 * 
 * This schema accepts both IPv4 and IPv6 CIDR notation, making it useful for
 * applications that need to handle mixed IP version environments.
 * 
 * @param options - Configuration options for CIDR validation
 * @returns Zod schema that accepts valid CIDR blocks (IPv4 or IPv6)
 * 
 * @example
 * ```typescript
 * const schema = zCIDRGeneric();
 * schema.parse('192.168.1.0/24');     // ✓ Valid IPv4 CIDR
 * schema.parse('10.0.0.0/8');        // ✓ Valid IPv4 CIDR
 * schema.parse('2001:db8::/32');      // ✓ Valid IPv6 CIDR
 * schema.parse('fe80::/10');         // ✓ Valid IPv6 CIDR
 * schema.parse('invalid-cidr');       // ✗ Throws error
 * schema.parse('192.168.1.1');       // ✗ Throws error (missing /prefix)
 * 
 * // For dual-stack network configurations
 * const routeConfig = z.object({
 *   destination: zCIDRGeneric({ msg: 'Route Destination' }),
 *   gateway: zIPAddressGeneric({ msg: 'Route Gateway' }),
 *   metric: z.number().int().positive()
 * });
 * ```
 */
export const zCIDRGeneric = baseZCIDRGeneric;

/**
 * Returns example network address formats for user guidance
 * 
 * @returns Object containing example addresses for each supported format
 * 
 * @example
 * ```typescript
 * const examples = getNetworkAddressExamples();
 * console.log(examples.ipv4); // "192.168.1.1"
 * console.log(examples.ipv6); // "2001:db8::1"
 * console.log(examples.mac);  // "00:1A:2B:3C:4D:5E"
 * ```
 */
export const getNetworkAddressExamples = baseGetNetworkAddressExamples;

// Export the options interface for external use
export type { NetworkSchemaOptions };

// --- Types ---
type NetworkSchemasFactory = ReturnType<typeof createNetworkSchemas>;
export type IPv4Address = z.infer<ReturnType<NetworkSchemasFactory['zIPv4Required']>>;
export type IPv6Address = z.infer<ReturnType<NetworkSchemasFactory['zIPv6Required']>>;
export type IPv4CIDR = z.infer<ReturnType<NetworkSchemasFactory['zIPv4CIDRRequired']>>;
export type IPv6CIDR = z.infer<ReturnType<NetworkSchemasFactory['zIPv6CIDRRequired']>>;
export type CIDRBlock = z.infer<ReturnType<NetworkSchemasFactory['zCIDRGeneric']>>;
export type MacAddress = z.infer<ReturnType<NetworkSchemasFactory['zMacAddressRequired']>>;
export type NetworkAddress = z.infer<ReturnType<NetworkSchemasFactory['zNetworkAddressGeneric']>>;
export type IPAddress = z.infer<ReturnType<NetworkSchemasFactory['zIPAddressGeneric']>>;
