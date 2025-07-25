import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/message-handler.types";
import { createUuidSchemas } from "./uuid-schemas";
import { createStringSchemas } from "./string-schemas";

/**
 * Creates a factory function for ID list schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing ID list schema creation functions
 */
export const createIdListSchemas = (messageHandler: ErrorMessageFormatter) => {
  const uuidSchemas = createUuidSchemas(messageHandler);
  const stringSchemas = createStringSchemas(messageHandler);

  /**
   * Optional ID list schema for batch operations.
   * Validates an array of UUIDs with configurable min/max constraints.
   */
  const zIdListOptional = (
    msg = "ID List",
    msgType: MsgType = MsgType.FieldName,
    minItems = 1,
    maxItems = 1000,
  ) =>
    z
      .array(uuidSchemas.zUuidRequired("ID", msgType))
      .min(minItems, {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustHaveMinItems",
          msg,
          msgType,
          params: { min: minItems },
        }),
      })
      .max(maxItems, {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustHaveMaxItems",
          msg,
          msgType,
          params: { max: maxItems },
        }),
      })
      .optional();

  /**
   * Required ID list schema for batch operations.
   * Validates an array of UUIDs with configurable min/max constraints.
   */
  const zIdListRequired = (
    msg = "ID List",
    msgType: MsgType = MsgType.FieldName,
    minItems = 1,
    maxItems = 1000,
  ) =>
    z.array(uuidSchemas.zUuidRequired("ID", msgType))
      .min(minItems, {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustHaveMinItems",
          msg,
          msgType,
          params: { min: minItems },
        }),
      })
      .max(maxItems, {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustHaveMaxItems",
          msg,
          msgType,
          params: { max: maxItems },
        }),
      });

  /**
   * Generic ID schema for validating single UUID.
   * Wrapper around UUID validation for ID-specific use cases.
   */
  const zId = (
    msg = "ID",
    msgType: MsgType = MsgType.FieldName,
  ) => uuidSchemas.zUuidRequired(msg, msgType);

  /**
   * ID list with duplicates removal.
   * Ensures all IDs in the list are unique.
   */
  const zUniqueIdList = (
    msg = "Unique ID List",
    msgType: MsgType = MsgType.FieldName,
    minItems = 1,
    maxItems = 1000,
  ) =>
    zIdListRequired(msg, msgType, minItems, maxItems)
      .refine(
        (list) => Array.isArray(list) ? new Set(list).size === list.length : true,
        {
          message: messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "duplicateItems",
            msg,
            msgType,
          }),
        },
      );

  /**
   * Paginated ID list schema for batch processing with pagination.
   */
  const zPaginatedIdList = (
    msg = "Paginated ID List",
    msgType: MsgType = MsgType.FieldName,
    minItems = 1,
    maxItems = 1000,
  ) =>
    z.object({
      ids: zIdListRequired("IDs", msgType, minItems, maxItems),
      page: z.number({
        message: messageHandler.formatErrorMessage({
          group: "number",
          messageKey: "mustBeNumber",
          msg: "Page",
          msgType,
        }),
      }).int().nonnegative(),
      limit: z.number({
        message: messageHandler.formatErrorMessage({
          group: "number",
          messageKey: "mustBeNumber",
          msg: "Limit",
          msgType,
        }),
      }).int().positive().max(maxItems).default(minItems),
    }, {
      message: messageHandler.formatErrorMessage({
        group: "string",
        messageKey: "required",
        msg,
        msgType,
      }),
    });

  /**
   * Batch operation response schema includes processed IDs and errors.
   */
  const zBatchOperationResponse = (
    msg = "Batch Operation Response",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object({
      successIds: zIdListRequired("Success IDs", msgType, 0, 10000),
      failedIds: zIdListOptional("Failed IDs", msgType, 0, 10000),
      errors: z.array(z.string()).optional(),
    }, {
      message: messageHandler.formatErrorMessage({
        group: "string",
        messageKey: "required",
        msg,
        msgType,
      }),
    });

  /**
   * Custom ID validation schema with specification.
   * Allows passing a custom validation function for ID format.
   */
  const zCustomId = (
    validateFn: (val: string) => boolean,
    msg = "Custom ID",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    stringSchemas.zStringRequired({ msg, msgType })
      .refine(validateFn, {
        message: messageHandler.formatErrorMessage({
          group: "uuid",
          messageKey: "invalid",
          msg,
          msgType,
        }),
      });

  /**
   * MongoDB ObjectId validation schema.
   */
  const zMongoId = (
    msg = "MongoDB ObjectId",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    stringSchemas.zStringRequired({ msg, msgType })
      .refine(val => /^[0-9a-fA-F]{24}$/.test(val), {
        message: messageHandler.formatErrorMessage({
          group: "uuid",
          messageKey: "invalid",
          msg,
          msgType,
        }),
      });

  /**
   * MongoDB ObjectId list schema.
   */
  const zMongoIdList = (
    msg = "MongoDB ObjectId List",
    msgType: MsgType = MsgType.FieldName,
    minItems = 1,
    maxItems = 1000,
  ) =>
    z.array(zMongoId("ID", msgType))
      .min(minItems, {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustHaveMinItems",
          msg,
          msgType,
          params: { min: minItems },
        }),
      })
      .max(maxItems, {
        message: messageHandler.formatErrorMessage({
          group: "array",
          messageKey: "mustHaveMaxItems",
          msg,
          msgType,
          params: { max: maxItems },
        }),
      });

  /**
   * Flexible ID schema that accepts either UUIDs or MongoDB ObjectIds.
   */
  const zFlexibleId = (
    msg = "ID",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.union([
      uuidSchemas.zUuidRequired(msg, msgType),
      zMongoId(msg, msgType),
    ], {
      message: messageHandler.formatErrorMessage({
        group: "uuid",
        messageKey: "invalid",
        msg,
        msgType,
      }),
    });

  return {
    zIdListOptional,
    zIdListRequired,
    zId,
    zUniqueIdList,
    zPaginatedIdList,
    zBatchOperationResponse,
    zCustomId,
    zMongoId,
    zMongoIdList,
    zFlexibleId,
  };
};
