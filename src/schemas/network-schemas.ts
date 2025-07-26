import { z } from "zod";
import { IPV4_PATTERN, IPV6_PATTERN, MAC_ADDRESS_PATTERN } from "../common/regex-patterns";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/message-handler.types";

/**
 * Creates a factory function for network schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing network schema creation functions
 */
export const createNetworkSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Optional IPv4 address schema.
   * Accepts a valid IPv4 address string, null, or undefined.
   * If the value is null or undefined, it transforms the output to undefined.
   */
  const zIPv4Optional = (
    msg = "IPv4 address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .union([
        z.string()
          .refine((val) => IPV4_PATTERN.test(val), {
            message: messageHandler.formatErrorMessage({ group: "network", messageKey: "invalidIPv4Format", msg, msgType }),
          }),
        z.null(),
        z.undefined(),
      ])
      .transform((val) => (val === null || val === undefined ? undefined : val));

  /**
   * Required IPv4 address schema.
   * Accepts a valid IPv4 address string.
   */
  const zIPv4Required = (
    msg = "IPv4 address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .string({
        message: messageHandler.formatErrorMessage({ group: "network", messageKey: "required", msg, msgType }),
      })
      .refine((val) => IPV4_PATTERN.test(val), {
        message: messageHandler.formatErrorMessage({ group: "network", messageKey: "invalidIPv4Format", msg, msgType }),
      });

  /**
   * Optional IPv6 address schema.
   * Accepts a valid IPv6 address string, null, or undefined.
   * If the value is null or undefined, it transforms the output to undefined.
   */
  const zIPv6Optional = (
    msg = "IPv6 address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .union([
        z.string()
          .refine((val) => IPV6_PATTERN.test(val), {
            message: messageHandler.formatErrorMessage({ group: "network", messageKey: "invalidIPv6Format", msg, msgType }),
          }),
        z.null(),
        z.undefined(),
      ])
      .transform((val) => (val === null || val === undefined ? undefined : val));

  /**
   * Required IPv6 address schema.
   * Accepts a valid IPv6 address string.
   */
  const zIPv6Required = (
    msg = "IPv6 address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .string({
        message: messageHandler.formatErrorMessage({ group: "network", messageKey: "required", msg, msgType }),
      })
      .refine((val) => IPV6_PATTERN.test(val), {
        message: messageHandler.formatErrorMessage({ group: "network", messageKey: "invalidIPv6Format", msg, msgType }),
      });

  /**
   * Optional MAC address schema.
   * Accepts a valid MAC address string, null, or undefined.
   * If the value is null or undefined, it transforms the output to undefined.
   */
  const zMacAddressOptional = (
    msg = "MAC address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .union([
        z.string()
          .refine((val) => MAC_ADDRESS_PATTERN.test(val), {
            message: messageHandler.formatErrorMessage({ group: "network", messageKey: "invalidMacFormat", msg, msgType }),
          }),
        z.null(),
        z.undefined(),
      ])
      .transform((val) => (val === null || val === undefined ? undefined : val));

  /**
   * Required MAC address schema.
   * Accepts a valid MAC address string.
   */
  const zMacAddressRequired = (
    msg = "MAC address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .string({
        message: messageHandler.formatErrorMessage({ group: "network", messageKey: "required", msg, msgType }),
      })
      .refine((val) => MAC_ADDRESS_PATTERN.test(val), {
        message: messageHandler.formatErrorMessage({ group: "network", messageKey: "invalidMacFormat", msg, msgType }),
      });

  /**
   * Generic network address validator that accepts IPv4, IPv6, or MAC addresses.
   * Uses the generic "invalid" message key for validation errors.
   */
  const zNetworkAddressGeneric = (
    msg = "Network address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .string({
        message: messageHandler.formatErrorMessage({ group: "network", messageKey: "required", msg, msgType }),
      })
      .refine(
        (val) => IPV4_PATTERN.test(val) || IPV6_PATTERN.test(val) || MAC_ADDRESS_PATTERN.test(val),
        {
          message: messageHandler.formatErrorMessage({ group: "network", messageKey: "invalid", msg, msgType }),
        }
      );

  /**
   * Strict IPv4 validator using the specific "mustBeValidIPv4" message key.
   */
  const zIPv4Strict = (
    msg = "IPv4 address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .string({
        message: messageHandler.formatErrorMessage({ group: "network", messageKey: "required", msg, msgType }),
      })
      .refine((val) => IPV4_PATTERN.test(val), {
        message: messageHandler.formatErrorMessage({ group: "network", messageKey: "mustBeValidIPv4", msg, msgType }),
      });

  /**
   * Strict IPv6 validator using the specific "mustBeValidIPv6" message key.
   */
  const zIPv6Strict = (
    msg = "IPv6 address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .string({
        message: messageHandler.formatErrorMessage({ group: "network", messageKey: "required", msg, msgType }),
      })
      .refine((val) => IPV6_PATTERN.test(val), {
        message: messageHandler.formatErrorMessage({ group: "network", messageKey: "mustBeValidIPv6", msg, msgType }),
      });

  /**
   * Strict MAC address validator using the specific "mustBeValidMacAddress" message key.
   */
  const zMacAddressStrict = (
    msg = "MAC address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .string({
        message: messageHandler.formatErrorMessage({ group: "network", messageKey: "required", msg, msgType }),
      })
      .refine((val) => MAC_ADDRESS_PATTERN.test(val), {
        message: messageHandler.formatErrorMessage({ group: "network", messageKey: "mustBeValidMacAddress", msg, msgType }),
      });

  /**
   * Returns example network address formats for user guidance.
   * Uses the "examples" message key parameters.
   */
  const getNetworkAddressExamples = () => {
    return messageHandler.formatErrorMessage({
      group: "network",
      messageKey: "examples",
      msg: "Network address examples",
      msgType: MsgType.Message,
      params: {
        ipv4: "192.168.1.1",
        ipv6: "2001:db8::1",
        mac: "00:1A:2B:3C:4D:5E"
      }
    });
  };

  return {
    zIPv4Optional,
    zIPv4Required,
    zIPv6Optional,
    zIPv6Required,
    zMacAddressOptional,
    zMacAddressRequired,
    zNetworkAddressGeneric,
    zIPv4Strict,
    zIPv6Strict,
    zMacAddressStrict,
    getNetworkAddressExamples,
  };
};
