import { z } from "zod";

import { MsgType } from "./msg-type";
import { zUuidRequired } from "./uuid-schemas";
import { zStringRequired } from "./string-schemas";
import { getErrorMessage, createErrorMessage } from "../utils/error-utils";

// --- ID List Schema Types ---

/**
 * Type for an optional ID list.
 */
export type IdListOptional = z.infer<ReturnType<typeof zIdListOptional>>;

/**
 * Type for a required ID list.
 */
export type IdListRequired = z.infer<ReturnType<typeof zIdListRequired>>;

// --- ID List Schemas ---

/**
 * Optional ID list schema for batch operations.
 * Validates an array of UUIDs or Mongo ObjectIds.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param minItems - Minimum number of IDs (default: 1).
 * @param maxItems - Maximum number of IDs (default: 1000).
 * @returns Zod schema for an optional ID list.
 * 
 * @example
 * const idListSchema = zIdListOptional("User IDs", MsgType.FieldName, 1, 100);
 * const result = idListSchema.parse(["123e4567-e89b-12d3-a456-426614174000"]);
 */
export const zIdListOptional = (
  fieldName = "ID List",
  msgType: MsgType = MsgType.FieldName,
  minItems = 1,
  maxItems = 1000,
) =>
  z
    .array(zUuidRequired(
      msgType === MsgType.Message ? "ID must be valid" : "ID",
      msgType,
    ))
    .min(minItems, {
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} must contain at least ${minItems} IDs`,
    })
    .max(maxItems, {
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} must contain at most ${maxItems} IDs`,
    })
    .optional();

/**
 * Required ID list schema for batch operations.
 * Validates an array of UUIDs or Mongo ObjectIds.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param minItems - Minimum number of IDs (default: 1).
 * @param maxItems - Maximum number of IDs (default: 1000).
 * @returns Zod schema for a required ID list.
 * 
 * @example
 * const idListSchema = zIdListRequired("User IDs", MsgType.FieldName, 1, 100);
 * const result = idListSchema.parse(["123e4567-e89b-12d3-a456-426614174000"]);
 */
export const zIdListRequired = (
  fieldName = "ID List",
  msgType: MsgType = MsgType.FieldName,
  minItems = 1,
  maxItems = 1000,
) =>
  z.array(zUuidRequired(
    msgType === MsgType.Message ? "ID must be valid" : "ID",
    msgType,
  ))
  .min(minItems, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} must contain at least ${minItems} IDs`,
  })
  .max(maxItems, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} must contain at most ${maxItems} IDs`,
  });

/**
 * Generic ID schema for validating single UUID or Mongo ObjectId.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a single ID.
 * 
 * @example
 * const idSchema = zId("User ID");
 * const result = idSchema.parse("123e4567-e89b-12d3-a456-426614174000");
 */
export const zId = (
  fieldName = "ID",
  msgType: MsgType = MsgType.FieldName,
) => zUuidRequired(
  msgType === MsgType.Message ? "ID must be valid" : fieldName,
  msgType,
);

/**
 * ID list with duplicates removal.
 * Ensures all IDs in the list are unique.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param minItems - Minimum number of IDs (default: 1).
 * @param maxItems - Maximum number of IDs (default: 1000).
 * @returns Zod schema for a unique ID list.
 * 
 * @example
 * const uniqueIdListSchema = zUniqueIdList("Unique User IDs");
 * const result = uniqueIdListSchema.parse(["123e4567-e89b-12d3-a456-426614174000"]);
 */
export const zUniqueIdList = (
  fieldName = "Unique ID List",
  msgType: MsgType = MsgType.FieldName,
  minItems = 1,
  maxItems = 1000,
) =>
  zIdListRequired(fieldName, msgType, minItems, maxItems)
    .refine(
      (list) => Array.isArray(list) ? new Set(list).size === list.length : true,
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} must have unique IDs`,
      },
    );

/**
 * Paginated ID list schema for batch processing with pagination.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param minItems - Minimum number of IDs per page (default: 1).
 * @param maxItems - Maximum number of IDs per page (default: 1000).
 * @returns Zod schema for a paginated ID list.
 * 
 * @example
 * const paginatedIdListSchema = zPaginatedIdList("Paginated User IDs");
 * const result = paginatedIdListSchema.parse({
 *   ids: ["123e4567-e89b-12d3-a456-426614174000"],
 *   page: 0,
 *   limit: 10
 * });
 */
export const zPaginatedIdList = (
  fieldName = "Paginated ID List",
  msgType: MsgType = MsgType.FieldName,
  minItems = 1,
  maxItems = 1000,
) =>
  z.object({
    ids: zIdListRequired(fieldName, msgType, minItems, maxItems),
    page: z.number({
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} page number must be an integer`,
    }).int().nonnegative(),
    limit: z.number({
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} limit must be an integer between 1 and ${maxItems}`,
    }).int().positive().max(maxItems).default(minItems),
  }, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} is required`,
  });

/**
 * Batch operation response schema includes processed IDs and errors.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for batch operation response with ID list.
 * 
 * @example
 * const batchResponseSchema = zBatchOperationResponse("Batch Delete Response");
 * const result = batchResponseSchema.parse({
 *   successIds: ["123e4567-e89b-12d3-a456-426614174000"],
 *   failedIds: ["987fcdeb-51a2-4321-b654-321098765432"],
 *   errors: ["Access denied for ID 987fcdeb-51a2-4321-b654-321098765432"]
 * });
 */
export const zBatchOperationResponse = (
  fieldName = "Batch Operation Response",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.object({
    successIds: zIdListRequired("Success IDs", msgType, 0, 10000),
    failedIds: zIdListOptional("Failed IDs", msgType, 0, 10000),
    errors: z.array(z.string(), {
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} errors must be an array of strings`,
    }).optional(),
  }, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} must be a valid batch operation response`,
  });

/**
 * Custom ID validation schema with specification.
 * Allows passing a custom validation function for ID format.
 * @param validateFn - Custom function for ID validation.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a custom ID validation.
 * 
 * @example
 * const mongoIdSchema = zCustomId(
 *   (id) => /^[0-9a-fA-F]{24}$/.test(id),
 *   "MongoDB ObjectId"
 * );
 * const result = mongoIdSchema.parse("507f1f77bcf86cd799439011");
 */
export const zCustomId = (
  validateFn: (val: string) => boolean,
  fieldName = "Custom ID",
  msgType: MsgType = MsgType.FieldName,
) =>
  zStringRequired(fieldName, msgType)
    .refine(validateFn, {
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} must pass custom validation`,
    });

/**
 * MongoDB ObjectId validation schema.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for MongoDB ObjectId validation.
 * 
 * @example
 * const mongoIdSchema = zMongoId("Document ID");
 * const result = mongoIdSchema.parse("507f1f77bcf86cd799439011");
 */
export const zMongoId = (
  fieldName = "MongoDB ObjectId",
  msgType: MsgType = MsgType.FieldName,
) =>
  zStringRequired(fieldName, msgType)
    .refine(val => /^[0-9a-fA-F]{24}$/.test(val), {
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} must be a valid MongoDB ObjectId`,
    });

/**
 * MongoDB ObjectId list schema.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param minItems - Minimum number of IDs (default: 1).
 * @param maxItems - Maximum number of IDs (default: 1000).
 * @returns Zod schema for MongoDB ObjectId list.
 * 
 * @example
 * const mongoIdListSchema = zMongoIdList("Document IDs");
 * const result = mongoIdListSchema.parse(["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]);
 */
export const zMongoIdList = (
  fieldName = "MongoDB ObjectId List",
  msgType: MsgType = MsgType.FieldName,
  minItems = 1,
  maxItems = 1000,
) =>
  z.array(zMongoId(
    msgType === MsgType.Message ? "ID must be valid" : "ID",
    msgType,
  ))
  .min(minItems, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} must contain at least ${minItems} IDs`,
  })
  .max(maxItems, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} must contain at most ${maxItems} IDs`,
  });

/**
 * Flexible ID schema that accepts either UUIDs or MongoDB ObjectIds.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for flexible ID validation.
 * 
 * @example
 * const flexibleIdSchema = zFlexibleId("Record ID");
 * const result1 = flexibleIdSchema.parse("123e4567-e89b-12d3-a456-426614174000"); // UUID
 * const result2 = flexibleIdSchema.parse("507f1f77bcf86cd799439011"); // MongoDB ObjectId
 */
export const zFlexibleId = (
  fieldName = "ID",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.union([
    zUuidRequired(fieldName, msgType),
    zMongoId(fieldName, msgType),
  ], {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} must be a valid UUID or MongoDB ObjectId`,
  });
