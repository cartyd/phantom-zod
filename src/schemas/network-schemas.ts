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
  const createErrorMessage = (
    messageKey: NetworkMessageKey,
    options: NetworkSchemaOptions = {},
  ) => {
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
  const IPv4Optional = (options: NetworkSchemaOptions = {}) => {
    return makeOptional(
      z.ipv4({ message: createErrorMessage("mustBeValidIPv4", options) }),
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
  const IPv4Required = (options: NetworkSchemaOptions = {}) => {
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
  const IPv6Optional = (options: NetworkSchemaOptions = {}) => {
    return makeOptional(
      z.ipv6({ message: createErrorMessage("mustBeValidIPv6", options) }),
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
  const IPv6Required = (options: NetworkSchemaOptions = {}) => {
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
  const MacAddressOptional = (options: NetworkSchemaOptions = {}) => {
    return makeOptional(
      z.string().refine((val) => MAC_ADDRESS_PATTERN.test(val), {
        message: createErrorMessage("mustBeValidMacAddress", options),
      }),
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
  const MacAddressRequired = (options: NetworkSchemaOptions = {}) => {
    return z.string().refine((val) => MAC_ADDRESS_PATTERN.test(val), {
      message: createErrorMessage("mustBeValidMacAddress", options),
    });
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
  const NetworkAddressGeneric = (options: NetworkSchemaOptions = {}) => {
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
      { message: createErrorMessage("invalid", options) },
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
  const IPAddressGeneric = (options: NetworkSchemaOptions = {}) => {
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
      { message: createErrorMessage("invalid", options) },
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
  const IPv4CIDROptional = (options: NetworkSchemaOptions = {}) => {
    return makeOptionalSimple(
      z.cidrv4({ message: createErrorMessage("mustBeValidIPv4", options) }),
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
  const IPv4CIDRRequired = (options: NetworkSchemaOptions = {}) => {
    return z.cidrv4({
      message: createErrorMessage("mustBeValidIPv4", options),
    });
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
  const IPv6CIDROptional = (options: NetworkSchemaOptions = {}) => {
    return makeOptionalSimple(
      z.cidrv6({ message: createErrorMessage("mustBeValidIPv6", options) }),
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
  const IPv6CIDRRequired = (options: NetworkSchemaOptions = {}) => {
    return z.cidrv6({
      message: createErrorMessage("mustBeValidIPv6", options),
    });
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
  const CIDRGeneric = (options: NetworkSchemaOptions = {}) => {
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
      { message: createErrorMessage("invalid", options) },
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
      ipv6Cidr: "2001:db8::/32",
    };
  };

  return {
    IPv4Optional,
    IPv4Required,
    IPv6Optional,
    IPv6Required,
    IPv4CIDROptional,
    IPv4CIDRRequired,
    IPv6CIDROptional,
    IPv6CIDRRequired,
    CIDRGeneric,
    MacAddressOptional,
    MacAddressRequired,
    NetworkAddressGeneric,
    IPAddressGeneric,
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
  IPv4Optional: baseIPv4Optional,
  IPv4Required: baseIPv4Required,
  IPv6Optional: baseIPv6Optional,
  IPv6Required: baseIPv6Required,
  IPv4CIDROptional: baseIPv4CIDROptional,
  IPv4CIDRRequired: baseIPv4CIDRRequired,
  IPv6CIDROptional: baseIPv6CIDROptional,
  IPv6CIDRRequired: baseIPv6CIDRRequired,
  CIDRGeneric: baseCIDRGeneric,
  MacAddressOptional: baseMacAddressOptional,
  MacAddressRequired: baseMacAddressRequired,
  NetworkAddressGeneric: baseNetworkAddressGeneric,
  IPAddressGeneric: baseIPAddressGeneric,
  getNetworkAddressExamples: baseGetNetworkAddressExamples,
} = createNetworkSchemas(networkMessageHandler);

// Top-level exports using the same pattern as string-schemas.ts
const testMessageHandler = createTestMessageHandler();
const networkSchemas = createNetworkSchemas(testMessageHandler);

// Helper functions with overloads to support both string and options object
function createIPv4OptionalOverload(
  msg: string,
): ReturnType<typeof networkSchemas.IPv4Optional>;
function createIPv4OptionalOverload(
  options?: NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv4Optional>;
function createIPv4OptionalOverload(
  msgOrOptions?: string | NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv4Optional> {
  if (typeof msgOrOptions === "string") {
    return networkSchemas.IPv4Optional({ msg: msgOrOptions });
  }
  return networkSchemas.IPv4Optional(msgOrOptions);
}

function createIPv4RequiredOverload(
  msg: string,
): ReturnType<typeof networkSchemas.IPv4Required>;
function createIPv4RequiredOverload(
  options?: NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv4Required>;
function createIPv4RequiredOverload(
  msgOrOptions?: string | NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv4Required> {
  if (typeof msgOrOptions === "string") {
    return networkSchemas.IPv4Required({ msg: msgOrOptions });
  }
  return networkSchemas.IPv4Required(msgOrOptions);
}

function createIPv6OptionalOverload(
  msg: string,
): ReturnType<typeof networkSchemas.IPv6Optional>;
function createIPv6OptionalOverload(
  options?: NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv6Optional>;
function createIPv6OptionalOverload(
  msgOrOptions?: string | NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv6Optional> {
  if (typeof msgOrOptions === "string") {
    return networkSchemas.IPv6Optional({ msg: msgOrOptions });
  }
  return networkSchemas.IPv6Optional(msgOrOptions);
}

function createIPv6RequiredOverload(
  msg: string,
): ReturnType<typeof networkSchemas.IPv6Required>;
function createIPv6RequiredOverload(
  options?: NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv6Required>;
function createIPv6RequiredOverload(
  msgOrOptions?: string | NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv6Required> {
  if (typeof msgOrOptions === "string") {
    return networkSchemas.IPv6Required({ msg: msgOrOptions });
  }
  return networkSchemas.IPv6Required(msgOrOptions);
}

function createMacAddressOptionalOverload(
  msg: string,
): ReturnType<typeof networkSchemas.MacAddressOptional>;
function createMacAddressOptionalOverload(
  options?: NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.MacAddressOptional>;
function createMacAddressOptionalOverload(
  msgOrOptions?: string | NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.MacAddressOptional> {
  if (typeof msgOrOptions === "string") {
    return networkSchemas.MacAddressOptional({ msg: msgOrOptions });
  }
  return networkSchemas.MacAddressOptional(msgOrOptions);
}

function createMacAddressRequiredOverload(
  msg: string,
): ReturnType<typeof networkSchemas.MacAddressRequired>;
function createMacAddressRequiredOverload(
  options?: NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.MacAddressRequired>;
function createMacAddressRequiredOverload(
  msgOrOptions?: string | NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.MacAddressRequired> {
  if (typeof msgOrOptions === "string") {
    return networkSchemas.MacAddressRequired({ msg: msgOrOptions });
  }
  return networkSchemas.MacAddressRequired(msgOrOptions);
}

function createNetworkAddressGenericOverload(
  msg: string,
): ReturnType<typeof networkSchemas.NetworkAddressGeneric>;
function createNetworkAddressGenericOverload(
  options?: NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.NetworkAddressGeneric>;
function createNetworkAddressGenericOverload(
  msgOrOptions?: string | NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.NetworkAddressGeneric> {
  if (typeof msgOrOptions === "string") {
    return networkSchemas.NetworkAddressGeneric({ msg: msgOrOptions });
  }
  return networkSchemas.NetworkAddressGeneric(msgOrOptions);
}

function createIPAddressGenericOverload(
  msg: string,
): ReturnType<typeof networkSchemas.IPAddressGeneric>;
function createIPAddressGenericOverload(
  options?: NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPAddressGeneric>;
function createIPAddressGenericOverload(
  msgOrOptions?: string | NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPAddressGeneric> {
  if (typeof msgOrOptions === "string") {
    return networkSchemas.IPAddressGeneric({ msg: msgOrOptions });
  }
  return networkSchemas.IPAddressGeneric(msgOrOptions);
}

function createIPv4CIDROptionalOverload(
  msg: string,
): ReturnType<typeof networkSchemas.IPv4CIDROptional>;
function createIPv4CIDROptionalOverload(
  options?: NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv4CIDROptional>;
function createIPv4CIDROptionalOverload(
  msgOrOptions?: string | NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv4CIDROptional> {
  if (typeof msgOrOptions === "string") {
    return networkSchemas.IPv4CIDROptional({ msg: msgOrOptions });
  }
  return networkSchemas.IPv4CIDROptional(msgOrOptions);
}

function createIPv4CIDRRequiredOverload(
  msg: string,
): ReturnType<typeof networkSchemas.IPv4CIDRRequired>;
function createIPv4CIDRRequiredOverload(
  options?: NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv4CIDRRequired>;
function createIPv4CIDRRequiredOverload(
  msgOrOptions?: string | NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv4CIDRRequired> {
  if (typeof msgOrOptions === "string") {
    return networkSchemas.IPv4CIDRRequired({ msg: msgOrOptions });
  }
  return networkSchemas.IPv4CIDRRequired(msgOrOptions);
}

function createIPv6CIDROptionalOverload(
  msg: string,
): ReturnType<typeof networkSchemas.IPv6CIDROptional>;
function createIPv6CIDROptionalOverload(
  options?: NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv6CIDROptional>;
function createIPv6CIDROptionalOverload(
  msgOrOptions?: string | NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv6CIDROptional> {
  if (typeof msgOrOptions === "string") {
    return networkSchemas.IPv6CIDROptional({ msg: msgOrOptions });
  }
  return networkSchemas.IPv6CIDROptional(msgOrOptions);
}

function createIPv6CIDRRequiredOverload(
  msg: string,
): ReturnType<typeof networkSchemas.IPv6CIDRRequired>;
function createIPv6CIDRRequiredOverload(
  options?: NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv6CIDRRequired>;
function createIPv6CIDRRequiredOverload(
  msgOrOptions?: string | NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.IPv6CIDRRequired> {
  if (typeof msgOrOptions === "string") {
    return networkSchemas.IPv6CIDRRequired({ msg: msgOrOptions });
  }
  return networkSchemas.IPv6CIDRRequired(msgOrOptions);
}

function createCIDRGenericOverload(
  msg: string,
): ReturnType<typeof networkSchemas.CIDRGeneric>;
function createCIDRGenericOverload(
  options?: NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.CIDRGeneric>;
function createCIDRGenericOverload(
  msgOrOptions?: string | NetworkSchemaOptions,
): ReturnType<typeof networkSchemas.CIDRGeneric> {
  if (typeof msgOrOptions === "string") {
    return networkSchemas.CIDRGeneric({ msg: msgOrOptions });
  }
  return networkSchemas.CIDRGeneric(msgOrOptions);
}

export const IPv4Optional = createIPv4OptionalOverload;
export const IPv4Required = createIPv4RequiredOverload;
export const IPv6Optional = createIPv6OptionalOverload;
export const IPv6Required = createIPv6RequiredOverload;
export const MacAddressOptional = createMacAddressOptionalOverload;
export const MacAddressRequired = createMacAddressRequiredOverload;
export const NetworkAddressGeneric = createNetworkAddressGenericOverload;
export const IPAddressGeneric = createIPAddressGenericOverload;
export const IPv4CIDROptional = createIPv4CIDROptionalOverload;
export const IPv4CIDRRequired = createIPv4CIDRRequiredOverload;
export const IPv6CIDROptional = createIPv6CIDROptionalOverload;
export const IPv6CIDRRequired = createIPv6CIDRRequiredOverload;
export const CIDRGeneric = createCIDRGenericOverload;

// Re-export utility functions
export const getNetworkAddressExamples = networkSchemas.getNetworkAddressExamples;

// Export the options interface for external use
export type { NetworkSchemaOptions };

// --- Types ---
type NetworkSchemasFactory = ReturnType<typeof createNetworkSchemas>;
export type IPv4Address = z.infer<
  ReturnType<NetworkSchemasFactory["IPv4Required"]>
>;
export type IPv6Address = z.infer<
  ReturnType<NetworkSchemasFactory["IPv6Required"]>
>;
export type IPv4CIDR = z.infer<
  ReturnType<NetworkSchemasFactory["IPv4CIDRRequired"]>
>;
export type IPv6CIDR = z.infer<
  ReturnType<NetworkSchemasFactory["IPv6CIDRRequired"]>
>;
export type CIDRBlock = z.infer<
  ReturnType<NetworkSchemasFactory["CIDRGeneric"]>
>;
export type MacAddress = z.infer<
  ReturnType<NetworkSchemasFactory["MacAddressRequired"]>
>;
export type NetworkAddress = z.infer<
  ReturnType<NetworkSchemasFactory["NetworkAddressGeneric"]>
>;
export type IPAddress = z.infer<
  ReturnType<NetworkSchemasFactory["IPAddressGeneric"]>
>;
