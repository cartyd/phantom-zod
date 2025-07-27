import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createStringSchemas } from "./string-schemas";

// Provide a default message handler for test and direct import usage
import { createTestMessageHandler } from "../localization/types/message-handler.types";





/**
 * Creates a factory function for pagination schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing pagination schema creation functions
 */
export const createPaginationSchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Offset-based pagination schema.
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
          group: "pagination",
          messageKey: "required",
          msg,
          msgType,
        }),
      })
        .int({
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidOffset",
            msg,
            msgType,
            params: { offset: 0 },
          }),
        })
        .nonnegative({
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidOffset",
            msg,
            msgType,
            params: { offset: 0 },
          }),
        })
        .default(0),
      limit: z.number({
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "required",
          msg,
          msgType,
        }),
      })
        .int({
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidLimit",
            msg,
            msgType,
            params: { limit: 1 },
          }),
        })
        .positive({
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidLimit",
            msg,
            msgType,
            params: { limit: 1 },
          }),
        })
        .max(maxLimit, {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "limitExceeded",
            msg,
            msgType,
            params: { limit: maxLimit },
          }),
        })
        .default(defaultLimit),
      sort: stringSchemas.zStringOptional({ msg: "Sort", msgType }),
      order: z.enum(["asc", "desc"], {
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "invalidSortOrder",
          msg,
          msgType,
          params: { order: "asc, desc" },
        }),
      }).optional(),
    });
  /**
   * Cursor-based pagination schema.
   */
  const zCursorPagination = (
    msg = "Cursor Pagination",
    msgType: MsgType = MsgType.FieldName,
    defaultLimit = 10,
    maxLimit = 100,
  ) =>
    z.object({
      cursor: z.string().optional().refine(
        val => val === undefined || typeof val === "string",
        {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidCursor",
            msg,
            msgType,
            params: { cursor: "" },
          }),
        }
      ),
      limit: z.number({
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "required",
          msg,
          msgType,
        }),
      })
        .int({
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidLimit",
            msg,
            msgType,
            params: { limit: 1 },
          }),
        })
        .positive({
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidLimit",
            msg,
            msgType,
            params: { limit: 1 },
          }),
        })
        .max(maxLimit, {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "limitExceeded",
            msg,
            msgType,
            params: { limit: maxLimit },
          }),
        })
        .default(defaultLimit),
      sort: stringSchemas.zStringOptional({ msg: "Sort", msgType }),
      order: z.enum(["asc", "desc"], {
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "invalidSortOrder",
          msg,
          msgType,
          params: { order: "asc, desc" },
        }),
      }).optional(),
    });
  /**
   * Pagination query schema for parsing query params as strings and converting to numbers.
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
            group: "pagination",
            messageKey: "invalidPageNumber",
            msg,
            msgType,
            params: { page: 0 },
          }),
        }),
      limit: z.string()
        .optional()
        .default(defaultLimit.toString())
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val > 0, {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidLimit",
            msg,
            msgType,
            params: { limit: 1 },
          }),
        })
        .refine(val => val <= maxLimit, {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "limitExceeded",
            msg,
            msgType,
            params: { limit: maxLimit },
          }),
        }),
      sort: stringSchemas.zStringOptional({ msg: "Sort", msgType }),
      order: z.enum(["asc", "desc"], {
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "invalidSortOrder",
          msg,
          msgType,
          params: { order: "asc, desc" },
        }),
      }).optional(),
    });
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
          group: "pagination",
          messageKey: "required",
          msg,
          msgType,
        }),
      })
        .int({
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidPageNumber",
            msg,
            msgType,
            params: { page: 0 },
          }),
        })
        .nonnegative({
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidPageNumber",
            msg,
            msgType,
            params: { page: 0 },
          }),
        })
        .default(0),
      limit: z.number({
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "required",
          msg,
          msgType,
        }),
      })
        .int({
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidLimit",
            msg,
            msgType,
            params: { limit: 1 },
          }),
        })
        .positive({
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidLimit",
            msg,
            msgType,
            params: { limit: 1 },
          }),
        })
        .max(maxLimit, {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "limitExceeded",
            msg,
            msgType,
            params: { limit: maxLimit },
          }),
        })
        .default(defaultLimit),
      sort: stringSchemas.zStringOptional({ msg: "Sort", msgType }),
      order: z.enum(["asc", "desc"], {
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "invalidSortOrder",
          msg,
          msgType,
          params: { order: "asc, desc" },
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
        group: "pagination",
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
        group: "pagination",
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
// Provide a default message handler for test and direct import usage

const defaultPaginationSchemas = createPaginationSchemas(createTestMessageHandler());
export const zPagination = defaultPaginationSchemas.zPagination;
export const zPaginationQuery = defaultPaginationSchemas.zPaginationQuery;
export const zCursorPagination = defaultPaginationSchemas.zCursorPagination;
export const zOffsetPagination = defaultPaginationSchemas.zOffsetPagination;
export const zPaginationResponse = defaultPaginationSchemas.zPaginationResponse;
export const zPaginatedData = defaultPaginationSchemas.zPaginatedData;

/**
 * Type for a pagination schema.
 */
export type PaginationType = z.infer<ReturnType<ReturnType<typeof createPaginationSchemas>["zPagination"]>>;

/**
 * Type for query parameter pagination (from URL query string).
 */
export type PaginationQueryType = z.infer<ReturnType<ReturnType<typeof createPaginationSchemas>["zPaginationQuery"]>>;
