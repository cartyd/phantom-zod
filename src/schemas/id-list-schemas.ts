import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createUuidSchemas } from "./uuid-schemas";
import { createStringSchemas } from "./string-schemas";
import { addArrayConstraints } from "../common/utils/zod-utils";

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
  ) => {
    const baseSchema = z
      .array(uuidSchemas.UuidRequired({ msg: "ID", msgType }))
      .optional();

    return addArrayConstraints(
      baseSchema,
      { min: minItems, max: maxItems },
      {
        tooSmall: (min) =>
          messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "mustHaveMinItems",
            msg,
            msgType,
            params: { min },
          }),
        tooBig: (max) =>
          messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "mustHaveMaxItems",
            msg,
            msgType,
            params: { max },
          }),
      },
    );
  };

  /**
   * Required ID list schema for batch operations.
   * Validates an array of UUIDs with configurable min/max constraints.
   */
  const zIdListRequired = (
    msg = "ID List",
    msgType: MsgType = MsgType.FieldName,
    minItems = 1,
    maxItems = 1000,
  ) => {
    const baseSchema = z.array(
      uuidSchemas.UuidRequired({ msg: "ID", msgType }),
    );

    return addArrayConstraints(
      baseSchema,
      { min: minItems, max: maxItems },
      {
        tooSmall: (min) =>
          messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "mustHaveMinItems",
            msg,
            msgType,
            params: { min },
          }),
        tooBig: (max) =>
          messageHandler.formatErrorMessage({
            group: "array",
            messageKey: "mustHaveMaxItems",
            msg,
            msgType,
            params: { max },
          }),
      },
    );
  };

  /**
   * Generic ID schema for validating single UUID.
   * Wrapper around UUID validation for ID-specific use cases.
   */
  const zId = (msg = "ID", msgType: MsgType = MsgType.FieldName) =>
    uuidSchemas.UuidRequired({ msg, msgType });

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
    zIdListRequired(msg, msgType, minItems, maxItems).refine(
      (list) =>
        Array.isArray(list) ? new Set(list).size === list.length : true,
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
    z.object(
      {
        ids: zIdListRequired("IDs", msgType, minItems, maxItems),
        page: z
          .number({
            message: messageHandler.formatErrorMessage({
              group: "number",
              messageKey: "mustBeNumber",
              msg: "Page",
              msgType,
            }),
          })
          .int()
          .nonnegative(),
        limit: z
          .number({
            message: messageHandler.formatErrorMessage({
              group: "number",
              messageKey: "mustBeNumber",
              msg: "Limit",
              msgType,
            }),
          })
          .int()
          .positive()
          .max(maxItems)
          .default(minItems),
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "string",
          messageKey: "required",
          msg,
          msgType,
        }),
      },
    );

  /**
   * Batch operation response schema includes processed IDs and errors.
   */
  const zBatchOperationResponse = (
    msg = "Batch Operation Response",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object(
      {
        successIds: zIdListRequired("Success IDs", msgType, 0, 10000),
        failedIds: zIdListOptional("Failed IDs", msgType, 0, 10000),
        errors: z.array(z.string()).optional(),
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "string",
          messageKey: "required",
          msg,
          msgType,
        }),
      },
    );

  /**
   * Custom ID validation schema with specification.
   * Allows passing a custom validation function for ID format.
   */
  const zCustomId = (
    validateFn: (val: string) => boolean,
    msg = "Custom ID",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    stringSchemas.StringRequired({ msg, msgType }).refine(validateFn, {
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
    stringSchemas
      .StringRequired({ msg, msgType })
      .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
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
    z
      .array(zMongoId("ID", msgType))
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
  const zFlexibleId = (msg = "ID", msgType: MsgType = MsgType.FieldName) =>
    z.union(
      [uuidSchemas.UuidRequired({ msg, msgType }), zMongoId(msg, msgType)],
      {
        message: messageHandler.formatErrorMessage({
          group: "uuid",
          messageKey: "invalid",
          msg,
          msgType,
        }),
      },
    );

  return {
    IdListOptional: zIdListOptional,
    IdListRequired: zIdListRequired,
    Id: zId,
    UniqueIdList: zUniqueIdList,
    PaginatedIdList: zPaginatedIdList,
    BatchOperationResponse: zBatchOperationResponse,
    CustomId: zCustomId,
    MongoId: zMongoId,
    MongoIdList: zMongoIdList,
    FlexibleId: zFlexibleId,
  };
};

// Create a default message handler and export direct schemas
import { createTestMessageHandler } from "../localization/types/message-handler.types";

const defaultIdListSchemas = createIdListSchemas(createTestMessageHandler());

// Define types for function overloads
type IdListSchemaOptions = {
  msg?: string;
  msgType?: MsgType;
  minItems?: number;
  maxItems?: number;
};

type SimpleIdSchemaOptions = {
  msg?: string;
  msgType?: MsgType;
};

// Helper functions with overloads to support both string and options object
function createIdListOptionalOverload(
  msg: string,
): ReturnType<typeof defaultIdListSchemas.IdListOptional>;
function createIdListOptionalOverload(
  msg?: string,
  msgType?: MsgType,
  minItems?: number,
  maxItems?: number,
): ReturnType<typeof defaultIdListSchemas.IdListOptional>;
function createIdListOptionalOverload(
  msg: string = "ID List",
  msgType: MsgType = MsgType.FieldName,
  minItems: number = 1,
  maxItems: number = 1000,
): ReturnType<typeof defaultIdListSchemas.IdListOptional> {
  return defaultIdListSchemas.IdListOptional(msg, msgType, minItems, maxItems);
}

function createIdListRequiredOverload(
  msg: string,
): ReturnType<typeof defaultIdListSchemas.IdListRequired>;
function createIdListRequiredOverload(
  msg?: string,
  msgType?: MsgType,
  minItems?: number,
  maxItems?: number,
): ReturnType<typeof defaultIdListSchemas.IdListRequired>;
function createIdListRequiredOverload(
  msg: string = "ID List",
  msgType: MsgType = MsgType.FieldName,
  minItems: number = 1,
  maxItems: number = 1000,
): ReturnType<typeof defaultIdListSchemas.IdListRequired> {
  return defaultIdListSchemas.IdListRequired(msg, msgType, minItems, maxItems);
}

function createIdOverload(
  msg: string,
): ReturnType<typeof defaultIdListSchemas.Id>;
function createIdOverload(
  msg?: string,
  msgType?: MsgType,
): ReturnType<typeof defaultIdListSchemas.Id>;
function createIdOverload(
  msg: string = "ID",
  msgType: MsgType = MsgType.FieldName,
): ReturnType<typeof defaultIdListSchemas.Id> {
  return defaultIdListSchemas.Id(msg, msgType);
}

function createUniqueIdListOverload(
  msg: string,
): ReturnType<typeof defaultIdListSchemas.UniqueIdList>;
function createUniqueIdListOverload(
  msg?: string,
  msgType?: MsgType,
  minItems?: number,
  maxItems?: number,
): ReturnType<typeof defaultIdListSchemas.UniqueIdList>;
function createUniqueIdListOverload(
  msg: string = "Unique ID List",
  msgType: MsgType = MsgType.FieldName,
  minItems: number = 1,
  maxItems: number = 1000,
): ReturnType<typeof defaultIdListSchemas.UniqueIdList> {
  return defaultIdListSchemas.UniqueIdList(msg, msgType, minItems, maxItems);
}

function createCustomIdOverload(
  validateFn: (val: string) => boolean,
  msg: string,
): ReturnType<typeof defaultIdListSchemas.CustomId>;
function createCustomIdOverload(
  validateFn: (val: string) => boolean,
  msg?: string,
  msgType?: MsgType,
): ReturnType<typeof defaultIdListSchemas.CustomId>;
function createCustomIdOverload(
  validateFn: (val: string) => boolean,
  msg: string = "Custom ID",
  msgType: MsgType = MsgType.FieldName,
): ReturnType<typeof defaultIdListSchemas.CustomId> {
  return defaultIdListSchemas.CustomId(validateFn, msg, msgType);
}

function createMongoIdOverload(
  msg: string,
): ReturnType<typeof defaultIdListSchemas.MongoId>;
function createMongoIdOverload(
  msg?: string,
  msgType?: MsgType,
): ReturnType<typeof defaultIdListSchemas.MongoId>;
function createMongoIdOverload(
  msg: string = "MongoDB ObjectId",
  msgType: MsgType = MsgType.FieldName,
): ReturnType<typeof defaultIdListSchemas.MongoId> {
  return defaultIdListSchemas.MongoId(msg, msgType);
}

function createMongoIdListOverload(
  msg: string,
): ReturnType<typeof defaultIdListSchemas.MongoIdList>;
function createMongoIdListOverload(
  msg?: string,
  msgType?: MsgType,
  minItems?: number,
  maxItems?: number,
): ReturnType<typeof defaultIdListSchemas.MongoIdList>;
function createMongoIdListOverload(
  msg: string = "MongoDB ObjectId List",
  msgType: MsgType = MsgType.FieldName,
  minItems: number = 1,
  maxItems: number = 1000,
): ReturnType<typeof defaultIdListSchemas.MongoIdList> {
  return defaultIdListSchemas.MongoIdList(msg, msgType, minItems, maxItems);
}

function createFlexibleIdOverload(
  msg: string,
): ReturnType<typeof defaultIdListSchemas.FlexibleId>;
function createFlexibleIdOverload(
  msg?: string,
  msgType?: MsgType,
): ReturnType<typeof defaultIdListSchemas.FlexibleId>;
function createFlexibleIdOverload(
  msg: string = "ID",
  msgType: MsgType = MsgType.FieldName,
): ReturnType<typeof defaultIdListSchemas.FlexibleId> {
  return defaultIdListSchemas.FlexibleId(msg, msgType);
}

// Export schemas with string parameter overloads
export const IdListOptional = createIdListOptionalOverload;
export const IdListRequired = createIdListRequiredOverload;
export const Id = createIdOverload;
export const UniqueIdList = createUniqueIdListOverload;
export const PaginatedIdList = defaultIdListSchemas.PaginatedIdList;
export const BatchOperationResponse = defaultIdListSchemas.BatchOperationResponse;
export const CustomId = createCustomIdOverload;
export const MongoId = createMongoIdOverload;
export const MongoIdList = createMongoIdListOverload;
export const FlexibleId = createFlexibleIdOverload;
