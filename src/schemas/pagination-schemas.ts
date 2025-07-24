import { z } from "zod";

import { MsgType } from "./msg-type";
import { zStringOptional } from "./string-schemas";
import { formatErrorMessage } from "../common/message-handler";

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
      message: formatErrorMessage({
        msg: fieldName,
        msgType: msgType,
        messageKey: "numberRequired",
        params: { fieldName, constraint: "integer" },
        
      }),
    }).int().nonnegative().default(0),
    limit: z.number({
      message: formatErrorMessage({
        msg: fieldName,
        msgType: msgType,
        messageKey: "limitRange",
        params: { fieldName, min: 1, max: maxLimit },
        
      }),
    }).int().positive().max(maxLimit).default(defaultLimit),
    sort: zStringOptional(
      msgType === MsgType.Message ? "Sort parameter is optional" : "Sort",
      msgType,
    ),
    order: z.enum(["asc", "desc"], {
      message: formatErrorMessage({
        msg: fieldName,
        msgType: msgType,
        messageKey: "orderChoice",
        params: { fieldName, choices: "asc, desc" },
        
      }),
    }).optional(),
  }).refine(data => data.page >= 0, {
    message: formatErrorMessage({
      msg: fieldName,
      msgType: msgType,
      messageKey: "nonNegativeInteger",
      params: { fieldName },
      
    }),
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
        message: formatErrorMessage({
          msg: fieldName,
          msgType: msgType,
          messageKey: "nonNegativeInteger",
          params: { fieldName },
          
        }),
      }),
    limit: z.string()
      .optional()
      .default(defaultLimit.toString())
      .transform(val => parseInt(val, 10))
      .refine(val => !isNaN(val) && val > 0 && val <= maxLimit, {
        message: formatErrorMessage({
          msg: fieldName,
          msgType: msgType,
          messageKey: "limitRange",
          params: { fieldName, min: 1, max: maxLimit },
          
        }),
      }),
    sort: zStringOptional(
      msgType === MsgType.Message ? "Sort parameter is optional" : "Sort",
      msgType,
    ),
    order: z.enum(["asc", "desc"], {
      message: formatErrorMessage({
        msg: fieldName,
        msgType: msgType,
        messageKey: "orderChoice",
        params: { fieldName, choices: "asc, desc" },
        
      }),
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
      message: formatErrorMessage({
        msg: fieldName,
        msgType: msgType,
        messageKey: "stringRequired",
        params: { fieldName },
        
      }),
    }).optional(),
    limit: z.number({
      message: formatErrorMessage({
        msg: fieldName,
        msgType: msgType,
        messageKey: "limitRange",
        params: { fieldName, min: 1, max: maxLimit },
        
      }),
    }).int().positive().max(maxLimit).default(defaultLimit),
    sort: zStringOptional(
      msgType === MsgType.Message ? "Sort parameter is optional" : "Sort",
      msgType,
    ),
    order: z.enum(["asc", "desc"], {
      message: formatErrorMessage({
        msg: fieldName,
        msgType: msgType,
        messageKey: "orderChoice",
        params: { fieldName, choices: "asc, desc" },
        
      }),
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
      message: formatErrorMessage({
        msg: fieldName,
        msgType: msgType,
        messageKey: "nonNegativeInteger",
        params: { fieldName },
        
      }),
    }).int().nonnegative().default(0),
    limit: z.number({
      message: formatErrorMessage({
        msg: fieldName,
        msgType: msgType,
        messageKey: "limitRange",
        params: { fieldName, min: 1, max: maxLimit },
        
      }),
    }).int().positive().max(maxLimit).default(defaultLimit),
    sort: zStringOptional(
      msgType === MsgType.Message ? "Sort parameter is optional" : "Sort",
      msgType,
    ),
    order: z.enum(["asc", "desc"], {
      message: formatErrorMessage({
        msg: fieldName,
        msgType: msgType,
        messageKey: "orderChoice",
        params: { fieldName, choices: "asc, desc" },
        
      }),
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
    message: formatErrorMessage({
      msg: fieldName,
      msgType: msgType,
      messageKey: "invalid",
      params: { fieldName },
      
    }),
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
    message: formatErrorMessage({
      msg: fieldName,
      msgType: msgType,
      messageKey: "invalid",
      params: { fieldName },
      
    }),
  });
