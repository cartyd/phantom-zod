import { z } from "zod";
import { MsgType } from "./msg-type";
import type { IMessageHandler } from "../common/message-handler";
import { IPV4_PATTERN } from "../common/regex-patterns";


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

/**
 * Creates a factory function for URL schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing URL schema creation functions
 */
export const createUrlSchemas = (messageHandler: IMessageHandler) => {
  /**
   * Optional URL schema.
   * Accepts a string that is a valid URL or undefined.
   */
  const zUrlOptional = (
    msg = "URL",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .string()
      .refine((val) => isValidUrl(val), {
          message: messageHandler.formatErrorMessage({ msg, msgType, messageKey: "url.mustBeValidUrl"}),
      })
      .optional();

  /**
   * Required URL schema.
   * Accepts a non-empty string that is a valid URL.
   */
  const zUrlRequired = (
    msg = "URL",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .string()
      .nonempty({
        message: messageHandler.formatErrorMessage({ msg, msgType, messageKey: "url.required"}),
      })
      .refine((val) => isValidUrl(val), {
          message: messageHandler.formatErrorMessage({ msg, msgType, messageKey: "url.mustBeValidUrl"}),
      });

  return {
    zUrlOptional,
    zUrlRequired,
  };
};

/**
 * Individual schema creation functions that accept messageHandler as first parameter
 */

export const zUrlOptional = (
  messageHandler: IMessageHandler,
  msg = "URL",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createUrlSchemas(messageHandler).zUrlOptional(msg, msgType);
};

export const zUrlRequired = (
  messageHandler: IMessageHandler,
  msg = "URL",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createUrlSchemas(messageHandler).zUrlRequired(msg, msgType);
};
