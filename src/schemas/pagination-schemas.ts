import { z } from "zod";

import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/message-handler.types";
import { createStringSchemas } from "./string-schemas";

/**
 * Creates a factory function for pagination schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing pagination schema creation functions
 */
export const createPaginationSchemas = (messageHandler: ErrorMessageFormatter) => {
  const stringSchemas = createStringSchemas(messageHandler);

  /**
   * Pagination schema standardizing query parameters: page, limit, sort, and order.
   */
  const zPagination = (
    msg = "Pagination",
    msgType: MsgType = MsgType.FieldName,
    defaultLimit = 10,
    maxLimit = 100,
  ) =>
    z.object({
      page: z.number({
        message: messageHandler.formatErrorMessage({
          group: "number",
          messageKey: "required",
          msg,
          msgType,
        }),
      }).int().nonnegative().default(0),
      limit: z.number({
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "limitRange",
          msg,
          msgType,
          params: { min: 1, max: maxLimit },
        }),
      }).int().positive().max(maxLimit).default(defaultLimit),
      sort: stringSchemas.zStringOptional({ msg: "Sort", msgType }),
      order: z.enum(["asc", "desc"], {
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "orderChoice",
          msg,
          msgType,
          params: { choices: "asc, desc" },
        }),
      }).optional(),
    }).refine(data => data.page >= 0, {
      message: messageHandler.formatErrorMessage({
        group: "number",
        messageKey: "nonNegative",
        msg,
        msgType,
      }),
      path: ["page"],
    });

  /**
   * Pagination schema for query parameters (from URL query string).
   * Converts string inputs to appropriate types.
   */
  const zPaginationQuery = (
    msg = "Pagination",
    msgType: MsgType = MsgType.FieldName,
    defaultLimit = 10,
    maxLimit = 100,
  ) =>
    z.object({
      page: z.string()
        .optional()
        .default("0")
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val >= 0, {
          message: messageHandler.formatErrorMessage({
            group: "number",
            messageKey: "nonNegative",
            msg,
            msgType,
          }),
        }),
      limit: z.string()
        .optional()
        .default(defaultLimit.toString())
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val > 0 && val <= maxLimit, {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "limitRange",
            msg,
            msgType,
            params: { min: 1, max: maxLimit },
          }),
        }),
      sort: stringSchemas.zStringOptional({ msg: "Sort", msgType }),
      order: z.enum(["asc", "desc"], {
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "orderChoice",
          msg,
          msgType,
          params: { choices: "asc, desc" },
        }),
      }).optional(),
    });

  /**
   * Cursor-based pagination schema for better performance with large datasets.
   */
  const zCursorPagination = (
    msg = "Cursor Pagination",
    msgType: MsgType = MsgType.FieldName,
    defaultLimit = 10,
    maxLimit = 100,
  ) =>
    z.object({
      cursor: stringSchemas.zStringOptional({ msg: "Cursor", msgType }),
      limit: z.number({
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "limitRange",
          msg,
          msgType,
          params: { min: 1, max: maxLimit },
        }),
      }).int().positive().max(maxLimit).default(defaultLimit),
      sort: stringSchemas.zStringOptional({ msg: "Sort", msgType }),
      order: z.enum(["asc", "desc"], {
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "orderChoice",
          msg,
          msgType,
          params: { choices: "asc, desc" },
        }),
      }).optional(),
    });

  /**
   * Offset-based pagination schema (alternative to page-based).
   */
  const zOffsetPagination = (
    msg = "Offset Pagination",
    msgType: MsgType = MsgType.FieldName,
    defaultLimit = 10,
    maxLimit = 100,
  ) =>
    z.object({
      offset: z.number({
        message: messageHandler.formatErrorMessage({
          group: "number",
          messageKey: "nonNegative",
          msg,
          msgType,
        }),
      }).int().nonnegative().default(0),
      limit: z.number({
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "limitRange",
          msg,
          msgType,
          params: { min: 1, max: maxLimit },
        }),
      }).int().positive().max(maxLimit).default(defaultLimit),
      sort: stringSchemas.zStringOptional({ msg: "Sort", msgType }),
      order: z.enum(["asc", "desc"], {
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "orderChoice",
          msg,
          msgType,
          params: { choices: "asc, desc" },
        }),
      }).optional(),
    });

  /**
   * Pagination response schema for API responses.
   */
  const zPaginationResponse = (
    msg = "Pagination Response",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object({
      page: z.number().int().nonnegative(),
      limit: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      pages: z.number().int().nonnegative(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }, {
      message: messageHandler.formatErrorMessage({
        group: "object",
        messageKey: "invalid",
        msg,
        msgType,
      }),
    });

  /**
   * Paginated data schema that wraps data with pagination metadata.
   */
  const zPaginatedData = <T extends z.ZodTypeAny>(
    dataSchema: T,
    msg = "Paginated Data",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object({
      data: dataSchema,
      pagination: zPaginationResponse(msg, msgType),
    }, {
      message: messageHandler.formatErrorMessage({
        group: "object",
        messageKey: "invalid",
        msg,
        msgType,
      }),
    });

  return {
    zPagination,
    zPaginationQuery,
    zCursorPagination,
    zOffsetPagination,
    zPaginationResponse,
    zPaginatedData,
  };
};

// --- Type Exports ---

/**
 * Type for a pagination schema.
 */
export type PaginationType = z.infer<ReturnType<ReturnType<typeof createPaginationSchemas>["zPagination"]>>;

/**
 * Type for query parameter pagination (from URL query string).
 */
export type PaginationQueryType = z.infer<ReturnType<ReturnType<typeof createPaginationSchemas>["zPaginationQuery"]>>;
