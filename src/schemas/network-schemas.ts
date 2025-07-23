
import { z } from "zod";

import { formatErrorMessage } from "../common/message-handler";
import { IPV4_PATTERN, IPV6_PATTERN, MAC_ADDRESS_PATTERN } from "../common/regex-patterns";
import { MsgType } from "./msg-type";

/**
 * Creates a Zod schema for an optional IPv4 address string.
 *
 * The schema accepts a valid IPv4 address string, `null`, or `undefined`.
 * If the value is `null` or `undefined`, it transforms the output to `undefined`.
 * Custom error messages can be provided for validation failures.
 *
 * @param msg - The base error message to use for validation
 * @param msgType - The type of message formatting to use
 * @example
 * const schema = zIPv4Optional();
 * schema.parse("192.168.1.1"); // "192.168.1.1"
 * schema.parse(null); // undefined
 * schema.parse(undefined); // undefined
 * schema.parse("invalid"); // throws ZodError
 */
export const zIPv4Optional = (
  msg = "IPv4 address",
  msgType: MsgType = MsgType.FieldName
) =>
  z
    .union([
      z.string({
        message: formatErrorMessage(msg, msgType),
      }).refine((val) => IPV4_PATTERN.test(val), {
        message: formatErrorMessage(msg, msgType, "is not a valid IPv4 address"),
      }),
      z.null(),
      z.undefined(),
    ])
    .transform((val) => (val === null || val === undefined ? undefined : val));

/**
 * Creates a Zod string schema that validates required IPv4 addresses.
 *
 * The schema accepts a valid IPv4 address string.
 * Custom error messages can be provided for validation failures.
 *
 * @param msg - The base error message to use for validation
 * @param msgType - The type of message formatting to use
 * @example
 * const schema = zIPv4Required();
 * schema.parse("192.168.1.1"); // "192.168.1.1"
 * schema.parse("invalid"); // throws ZodError
 */
export const zIPv4Required = (
  msg = "IPv4 address",
  msgType: MsgType = MsgType.FieldName
) =>
  z
    .string({
      message: formatErrorMessage(msg, msgType),
    })
    .refine((val) => IPV4_PATTERN.test(val), {
      message: formatErrorMessage(msg, msgType, "is not a valid IPv4 address"),
    });


/**
 * Creates a Zod schema for an optional IPv6 address string.
 *
 * The schema accepts a valid IPv6 address string, `null`, or `undefined`.
 * If the value is `null` or `undefined`, it transforms the output to `undefined`.
 * Custom error messages can be provided for validation failures.
 *
 * @param msg - The base error message to use for validation
 * @param msgType - The type of message formatting to use
 * @example
 * const schema = zIPv6Optional();
 * schema.parse("2001:0db8:85a3:0000:0000:8a2e:0370:7334"); // "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
 * schema.parse(null); // undefined
 * schema.parse(undefined); // undefined
 * schema.parse("invalid"); // throws ZodError
 */
export const zIPv6Optional = (
  msg = "IPv6 address",
  msgType: MsgType = MsgType.FieldName
) =>
  z
    .union([
      z.string({
        message: formatErrorMessage(msg, msgType),
      }).refine((val) => IPV6_PATTERN.test(val), {
        message: formatErrorMessage(msg, msgType, "is not a valid IPv6 address"),
      }),
      z.null(),
      z.undefined(),
    ])
    .transform((val) => (val === null || val === undefined ? undefined : val));

/**
 * Creates a Zod schema for a required IPv6 address string.
 *
 * The schema accepts a valid IPv6 address string.
 * Custom error messages can be provided for validation failures.
 *
 * @param msg - The base error message to use for validation
 * @param msgType - The type of message formatting to use
 * @example
 * const schema = zIPv6Required();
 * schema.parse("2001:0db8:85a3:0000:0000:8a2e:0370:7334"); // "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
 * schema.parse("invalid"); // throws ZodError
 */
export const zIPv6Required = (
  msg = "IPv6 address",
  msgType: MsgType = MsgType.FieldName
) =>
  z
    .string({
      message: formatErrorMessage(msg, msgType),
    })
    .refine((val) => IPV6_PATTERN.test(val), {
      message: formatErrorMessage(msg, msgType, "is not a valid IPv6 address"),
    });

/**
 * Creates a Zod schema for an optional MAC address string.
 *
 * The schema accepts a valid MAC address string, `null`, or `undefined`.
 * If the value is `null` or `undefined`, it transforms the output to `undefined`.
 * Custom error messages can be provided for validation failures.
 *
 * @param msg - The base error message to use for validation
 * @param msgType - The type of message formatting to use
 * @example
 * const schema = zMacAddressOptional();
 * schema.parse("00:1A:2B:3C:4D:5E"); // "00:1A:2B:3C:4D:5E"
 * schema.parse(null); // undefined
 * schema.parse(undefined); // undefined
 * schema.parse("invalid"); // throws ZodError
 */
export const zMacAddressOptional = (
  msg = "MAC address",
  msgType: MsgType = MsgType.FieldName
) =>
  z
    .union([
      z.string({
        message: formatErrorMessage(msg, msgType),
      }).refine((val) => MAC_ADDRESS_PATTERN.test(val), {
        message: formatErrorMessage(msg, msgType, "is not a valid MAC address"),
      }),
      z.null(),
      z.undefined(),
    ])
    .transform((val) => (val === null || val === undefined ? undefined : val));

/**
 * Creates a Zod string schema that validates a required MAC address.
 *
 * The schema accepts a valid MAC address string.
 * Custom error messages can be provided for validation failures.
 *
 * @param msg - The error message or field name to display in validation errors. Defaults to "MAC address".
 * @param msgType - The type of message formatting to use. Defaults to `MsgType.FieldName`.
 * @example
 * const schema = zMacAddressRequired();
 * schema.parse("00:1A:2B:3C:4D:5E"); // "00:1A:2B:3C:4D:5E"
 * schema.parse("invalid"); // throws ZodError
 * @returns A Zod schema that requires the value to be a valid MAC address.
 */
export const zMacAddressRequired = (
  msg = "MAC address",
  msgType: MsgType = MsgType.FieldName
) =>
  z
    .string({
      message: formatErrorMessage(msg, msgType),
    })
    .refine((val) => MAC_ADDRESS_PATTERN.test(val), {
      message: formatErrorMessage(msg, msgType, "is not a valid MAC address"),
    });
