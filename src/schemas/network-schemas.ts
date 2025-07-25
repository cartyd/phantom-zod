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

  return {
    zIPv4Optional,
    zIPv4Required,
    zIPv6Optional,
    zIPv6Required,
    zMacAddressOptional,
    zMacAddressRequired,
  };
};
