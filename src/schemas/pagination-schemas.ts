import { z } from "zod";

import { MsgType } from "./msg-type";
import { zStringOptional } from "./string-schemas";

// --- Pagination Schema Types ---

/**
 * Type for a pagination schema.
 */
export type PaginationType = z.infer<ReturnType<typeof zPagination>>;

/**
 * Type for query parameter pagination (from URL query string).
 */
export type PaginationQueryType = z.infer<ReturnType<typeof zPaginationQuery>>;

// --- Pagination Schema ---

/**
 * Pagination schema standardizing query parameters: page, limit, sort, and order.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param defaultLimit - Default value for the limit parameter.
 * @param maxLimit - Maximum value for the limit parameter.
 * @returns Zod schema for pagination parameters.
 * 
 * @example
 * const paginationSchema = zPagination("Paging");
 * const result = paginationSchema.parse({ page: 1, limit: 10, sort: "name", order: "asc" });
 */
export const zPagination = (
  fieldName = "Pagination",
  msgType: MsgType = MsgType.FieldName,
  defaultLimit = 10,
  maxLimit = 100,
) =>
  z.object({
    page: z.number({
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} page number must be an integer`,
    }).int().nonnegative().default(0),
    limit: z.number({
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} limit must be an integer between 1 and ${maxLimit}`,
    }).int().positive().max(maxLimit).default(defaultLimit),
    sort: zStringOptional(
      msgType === MsgType.Message ? "Sort parameter is optional" : "Sort",
      msgType,
    ),
    order: z.enum(["asc", "desc"], {
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} order must be either 'asc' or 'desc'`,
    }).optional(),
  }).refine(data => data.page >= 0, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} page number must be a non-negative integer`,
    path: ["page"],
  });

/**
 * Pagination schema for query parameters (from URL query string).
 * Converts string inputs to appropriate types.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param defaultLimit - Default value for the limit parameter.
 * @param maxLimit - Maximum value for the limit parameter.
 * @returns Zod schema for pagination from query parameters.
 * 
 * @example
 * const paginationSchema = zPaginationQuery("Paging");
 * const result = paginationSchema.parse({ page: "1", limit: "10", sort: "name", order: "asc" });
 */
export const zPaginationQuery = (
  fieldName = "Pagination",
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
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} page number must be a non-negative integer`,
      }),
    limit: z.string()
      .optional()
      .default(defaultLimit.toString())
      .transform(val => parseInt(val, 10))
      .refine(val => !isNaN(val) && val > 0 && val <= maxLimit, {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} limit must be between 1 and ${maxLimit}`,
      }),
    sort: zStringOptional(
      msgType === MsgType.Message ? "Sort parameter is optional" : "Sort",
      msgType,
    ),
    order: z.enum(["asc", "desc"], {
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} order must be either 'asc' or 'desc'`,
    }).optional(),
  });

/**
 * Cursor-based pagination schema for better performance with large datasets.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param defaultLimit - Default value for the limit parameter.
 * @param maxLimit - Maximum value for the limit parameter.
 * @returns Zod schema for cursor-based pagination.
 * 
 * @example
 * const cursorSchema = zCursorPagination("Cursor Paging");
 * const result = cursorSchema.parse({ limit: 10, cursor: "eyJpZCI6MTIzfQ==" });
 */
export const zCursorPagination = (
  fieldName = "Cursor Pagination",
  msgType: MsgType = MsgType.FieldName,
  defaultLimit = 10,
  maxLimit = 100,
) =>
  z.object({
    cursor: z.string({
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} cursor must be a string`,
    }).optional(),
    limit: z.number({
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} limit must be an integer between 1 and ${maxLimit}`,
    }).int().positive().max(maxLimit).default(defaultLimit),
    sort: zStringOptional(
      msgType === MsgType.Message ? "Sort parameter is optional" : "Sort",
      msgType,
    ),
    order: z.enum(["asc", "desc"], {
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} order must be either 'asc' or 'desc'`,
    }).optional(),
  });

/**
 * Offset-based pagination schema (alternative to page-based).
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param defaultLimit - Default value for the limit parameter.
 * @param maxLimit - Maximum value for the limit parameter.
 * @returns Zod schema for offset-based pagination.
 * 
 * @example
 * const offsetSchema = zOffsetPagination("Offset Paging");
 * const result = offsetSchema.parse({ offset: 20, limit: 10 });
 */
export const zOffsetPagination = (
  fieldName = "Offset Pagination",
  msgType: MsgType = MsgType.FieldName,
  defaultLimit = 10,
  maxLimit = 100,
) =>
  z.object({
    offset: z.number({
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} offset must be a non-negative integer`,
    }).int().nonnegative().default(0),
    limit: z.number({
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} limit must be an integer between 1 and ${maxLimit}`,
    }).int().positive().max(maxLimit).default(defaultLimit),
    sort: zStringOptional(
      msgType === MsgType.Message ? "Sort parameter is optional" : "Sort",
      msgType,
    ),
    order: z.enum(["asc", "desc"], {
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} order must be either 'asc' or 'desc'`,
    }).optional(),
  });

/**
 * Pagination response schema for API responses.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for pagination response metadata.
 * 
 * @example
 * const responseSchema = zPaginationResponse("Pagination Info");
 * const result = responseSchema.parse({ page: 1, limit: 10, total: 100, pages: 10 });
 */
export const zPaginationResponse = (
  fieldName = "Pagination Response",
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
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} must be a valid pagination response`,
  });

/**
 * Paginated data schema that wraps data with pagination metadata.
 * @param dataSchema - The schema for the data items.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for paginated data with metadata.
 * 
 * @example
 * const userSchema = z.object({ id: z.string(), name: z.string() });
 * const paginatedUsersSchema = zPaginatedData(z.array(userSchema), "Users");
 */
export const zPaginatedData = <T extends z.ZodTypeAny>(
  dataSchema: T,
  fieldName = "Paginated Data",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.object({
    data: dataSchema,
    pagination: zPaginationResponse(fieldName, msgType),
  }, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} must be a valid paginated response`,
  });
