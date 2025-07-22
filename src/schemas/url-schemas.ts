import { z } from "zod";
import { MsgType } from "./msg-type";
import { formatErrorMessage } from "../common/message-handler";
import { IPV4_PATTERN } from "../common/regex-patterns";

// --- URL Schemas ---

/**
 * Optional URL schema.
 * Accepts a string that is a valid URL or undefined.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for an optional URL.
 */
// Custom URL validator function to handle edge cases manually
const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url); // Be sure to use "URL" object
    // Check if protocol is allowed
    const allowedProtocols = ["http:", "https:", "ftp:", "mailto:", "file:", "data:"];
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Special cases for protocols that don't have traditional hostnames
    if (parsedUrl.protocol === "mailto:") {
      // mailto URLs are valid if they contain an @ symbol
      return url.includes("@");
    }
    if (parsedUrl.protocol === "file:") {
      // file URLs are valid if they have a path
      return parsedUrl.pathname.length > 0;
    }
    if (parsedUrl.protocol === "data:") {
      // data URLs are valid if they have content after the protocol
      return url.length > 5; // "data:" is 5 characters
    }
    
    // For HTTP/HTTPS/FTP protocols, check domains
    const domainPart = parsedUrl.hostname;
    
    // IPv6 addresses are wrapped in brackets and don't need dots
    if (domainPart.startsWith("[") && domainPart.endsWith("]")) {
      return true; // IPv6 address
    }
    
    // IP addresses (IPv4) don't need dots in domain validation
    if (IPV4_PATTERN.test(domainPart)) {
      return true; // IPv4 address
    }
    
    // Regular domain validation - must contain at least one dot and no empty parts
    const hasValidDomain =
      domainPart.includes(".") &&    // Contains at least one dot
      !domainPart.split(".").some((part) => part === "");
    return hasValidDomain;
  } catch (e) {
    return false;
  }
};

export const zUrlOptional = (
  msg = "URL",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .refine((val) => isValidUrl(val), {
      message: formatErrorMessage(msg, msgType, "must be a valid URL"),
    })
    .optional();

/**
 * Required URL schema.
 * Accepts a non-empty string that is a valid URL.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a required URL.
 */
export const zUrlRequired = (
  msg = "URL",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .string()
    .nonempty({
      message: formatErrorMessage(msg, msgType, "is required"),
    })
    .refine((val) => isValidUrl(val), {
      message: formatErrorMessage(msg, msgType, "must be a valid URL"),
    });
