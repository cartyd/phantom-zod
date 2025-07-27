import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { IPV4_PATTERN } from "../common/regex-patterns";



// Enhanced URL validator to return error info for contract keys
function getUrlValidationError(url: string):
  | { key: 'mustBeValidUrl'; params: { receivedValue: string } }
  | { key: 'invalidProtocol'; params: { protocol: string } }
  | { key: 'invalidDomain'; params: { domain: string } }
  | { key: 'missingProtocol'; params: { suggestedProtocols?: string[] } }
  | { key: 'invalid'; params: { reason: string } }
  | null {
  if (typeof url !== 'string') {
    return { key: 'invalid', params: { reason: 'Not a string' } };
  }
  if (!url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/)) {
    // No protocol
    return { key: 'missingProtocol', params: { suggestedProtocols: ['https', 'http'] } };
  }
  try {
    const parsedUrl = new URL(url);
    const allowedProtocols = ["http:", "https:", "ftp:", "mailto:", "file:", "data:"];
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return { key: 'invalidProtocol', params: { protocol: parsedUrl.protocol.replace(':', '') } };
    }
    if (parsedUrl.protocol === "mailto:") {
      if (!url.includes("@")) {
        return { key: 'mustBeValidUrl', params: { receivedValue: url } };
      }
      return null;
    }
    if (parsedUrl.protocol === "file:") {
      if (parsedUrl.pathname.length === 0) {
        return { key: 'mustBeValidUrl', params: { receivedValue: url } };
      }
      return null;
    }
    if (parsedUrl.protocol === "data:") {
      if (url.length <= 5) {
        return { key: 'mustBeValidUrl', params: { receivedValue: url } };
      }
      return null;
    }
    // For HTTP/HTTPS/FTP protocols, check domains
    const domainPart = parsedUrl.hostname;
    if (domainPart.startsWith("[") && domainPart.endsWith("]")) {
      return null; // IPv6
    }
    if (IPV4_PATTERN.test(domainPart)) {
      return null; // IPv4
    }
    if (!domainPart.includes(".")) {
      return { key: 'invalidDomain', params: { domain: domainPart } };
    }
    if (domainPart.split(".").some((part) => part === "")) {
      return { key: 'invalidDomain', params: { domain: domainPart } };
    }
    return null;
  } catch (e) {
    return { key: 'mustBeValidUrl', params: { receivedValue: url } };
  }
}

/**
 * Creates a factory function for URL schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing URL schema creation functions
 */

// Default message handler for direct use (for tests and convenience)
import { createTestMessageHandler } from "../localization/types/message-handler.types";

/**
 * Creates a Zod schema for an optional URL string with customizable error messages.
 * @param msg - The field name or custom message for error messages
 * @param msgType - The type of message formatting to use
 */
// Factory for handler-injected URL schemas
export const createUrlSchemas = (messageHandler: ErrorMessageFormatter) => {
  function zUrlOptional(
    msg: string = "URL",
    msgType: MsgType = MsgType.FieldName
  ) {
    return z
      .string()
      .superRefine((val, ctx) => {
        const error = getUrlValidationError(val);
        if (!error) return;
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "url",
            messageKey: error.key,
            params: error.params,
            msg,
            msgType,
          }),
        });
      })
      .optional();
  }

  function zUrlRequired(
    msg: string = "URL",
    msgType: MsgType = MsgType.FieldName
  ) {
    return z
      .string()
      .nonempty({
        message: messageHandler.formatErrorMessage({
          group: "url",
          messageKey: "required",
          params: {},
          msg,
          msgType,
        }),
      })
      .superRefine((val, ctx) => {
        const error = getUrlValidationError(val);
        if (!error) return;
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messageHandler.formatErrorMessage({
            group: "url",
            messageKey: error.key,
            params: error.params,
            msg,
            msgType,
          }),
        });
      });
  }
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

// Export default handler-bound versions for test imports
export const { zUrlOptional, zUrlRequired } = createUrlSchemas(urlMessageHandler);

