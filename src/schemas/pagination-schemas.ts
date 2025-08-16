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
export const createPaginationSchemas = (
  messageHandler: ErrorMessageFormatter,
) => {
  const stringSchemas = createStringSchemas(messageHandler);

  /**
   * Offset-based pagination schema.
   */
  const OffsetPagination = (
    msg = "Offset Pagination",
    msgType: MsgType = MsgType.FieldName,
    defaultLimit = 10,
    maxLimit = 100,
  ) =>
    z.object({
      offset: z
        .number({
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
      limit: z
        .number({
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
      sort: stringSchemas.StringOptional({ msg: "Sort", msgType }),
      order: z
        .enum(["asc", "desc"], {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidSortOrder",
            msg,
            msgType,
            params: { order: "asc, desc" },
          }),
        })
        .optional(),
    });
  /**
   * Cursor-based pagination schema.
   */
  const CursorPagination = (
    msg = "Cursor Pagination",
    msgType: MsgType = MsgType.FieldName,
    defaultLimit = 10,
    maxLimit = 100,
  ) =>
    z.object({
      cursor: z
        .string()
        .optional()
        .refine((val) => val === undefined || typeof val === "string", {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidCursor",
            msg,
            msgType,
            params: { cursor: "" },
          }),
        }),
      limit: z
        .number({
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
      sort: stringSchemas.StringOptional({ msg: "Sort", msgType }),
      order: z
        .enum(["asc", "desc"], {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidSortOrder",
            msg,
            msgType,
            params: { order: "asc, desc" },
          }),
        })
        .optional(),
    });
  /**
   * Pagination query schema for parsing query params as strings and converting to numbers.
   */
  const PaginationQuery = (
    msg = "Pagination",
    msgType: MsgType = MsgType.FieldName,
    defaultLimit = 10,
    maxLimit = 100,
  ) =>
    z.object({
      page: z
        .string()
        .optional()
        .default("0")
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val >= 0, {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidPageNumber",
            msg,
            msgType,
            params: { page: 0 },
          }),
        }),
      limit: z
        .string()
        .optional()
        .default(defaultLimit.toString())
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidLimit",
            msg,
            msgType,
            params: { limit: 1 },
          }),
        })
        .refine((val) => val <= maxLimit, {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "limitExceeded",
            msg,
            msgType,
            params: { limit: maxLimit },
          }),
        }),
      sort: stringSchemas.StringOptional({ msg: "Sort", msgType }),
      order: z
        .enum(["asc", "desc"], {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidSortOrder",
            msg,
            msgType,
            params: { order: "asc, desc" },
          }),
        })
        .optional(),
    });
  /**
   * Pagination schema standardizing query parameters: page, limit, sort, and order.
   */
  const Pagination = (
    msg = "Pagination",
    msgType: MsgType = MsgType.FieldName,
    defaultLimit = 10,
    maxLimit = 100,
  ) =>
    z.object({
      page: z
        .number({
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
      limit: z
        .number({
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
      sort: stringSchemas.StringOptional({ msg: "Sort", msgType }),
      order: z
        .enum(["asc", "desc"], {
          message: messageHandler.formatErrorMessage({
            group: "pagination",
            messageKey: "invalidSortOrder",
            msg,
            msgType,
            params: { order: "asc, desc" },
          }),
        })
        .optional(),
    });

  /**
   * Pagination response schema for API responses.
   */
  const PaginationResponse = (
    msg = "Pagination Response",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object(
      {
        page: z.number().int().nonnegative(),
        limit: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        pages: z.number().int().nonnegative(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "invalid",
          msg,
          msgType,
        }),
      },
    );

  /**
   * Paginated data schema that wraps data with pagination metadata.
   */
  const PaginatedData = <T extends z.ZodTypeAny>(
    dataSchema: T,
    msg = "Paginated Data",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object(
      {
        data: dataSchema,
        pagination: PaginationResponse(msg, msgType),
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "pagination",
          messageKey: "invalid",
          msg,
          msgType,
        }),
      },
    );

  return {
    Pagination,
    PaginationQuery,
    CursorPagination,
    OffsetPagination,
    PaginationResponse,
    PaginatedData,
  };
};

// --- Type Exports ---
// Provide a default message handler for test and direct import usage

const defaultPaginationSchemas = createPaginationSchemas(
  createTestMessageHandler(),
);
// Export without z prefix for new naming convention
export const Pagination = defaultPaginationSchemas.Pagination;
export const PaginationQuery = defaultPaginationSchemas.PaginationQuery;
export const CursorPagination = defaultPaginationSchemas.CursorPagination;
export const OffsetPagination = defaultPaginationSchemas.OffsetPagination;
export const PaginationResponse = defaultPaginationSchemas.PaginationResponse;
export const PaginatedData = defaultPaginationSchemas.PaginatedData;

/**
 * Type for a pagination schema.
 */
export type PaginationType = z.infer<
  ReturnType<ReturnType<typeof createPaginationSchemas>["Pagination"]>
>;

/**
 * Type for query parameter pagination (from URL query string).
 */
export type PaginationQueryType = z.infer<
  ReturnType<ReturnType<typeof createPaginationSchemas>["PaginationQuery"]>
>;
