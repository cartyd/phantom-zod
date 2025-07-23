
import { z } from "zod";
import { IPV4_PATTERN, IPV6_PATTERN } from "../common/regex-patterns";
import { MsgType } from "./msg-type";
import { formatErrorMessage } from "../common/message-handler";

/**
 * Required IPv4 address schema.
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
 * Optional IPv4 address schema.
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
 * Required IPv6 address schema.
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
 * Optional IPv6 address schema.
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
