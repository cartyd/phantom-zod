import { z } from "zod";

import type { IMessageHandler } from "../common/message-handler";
import { MsgType } from "./msg-type";


const baseBooleanStringSchema = z.union([z.string(), z.boolean()]);

/**
 * Creates a factory function for boolean schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing boolean schema creation functions
 */
export const createBooleanSchemas = (messageHandler: IMessageHandler) => {
  /**
   * Creates a Zod schema that validates an optional boolean value.
   */
  const zBooleanOptional = (
    msg = "Value",
    msgType: MsgType = MsgType.FieldName,
  ) => {
    return z.unknown()
      .refine(
        val => val === undefined || typeof val === "boolean",
        { message: messageHandler.formatErrorMessage({ msg, msgType, messageKey: "boolean.mustBeBoolean"}) }
      )
      .transform(val => val === undefined ? undefined : Boolean(val));
  };

  /**
   * Creates a Zod schema that validates if the input is a boolean value.
   */
  const zBooleanRequired = (
    msg = "Value",
    msgType: MsgType = MsgType.FieldName,
  ) => {
    return z.unknown()
      .refine(
        val => typeof val === "boolean",
        { message: messageHandler.formatErrorMessage({ msg, msgType, messageKey: "boolean.mustBeBoolean"}) }
      )
      .transform(val => Boolean(val));
  };

  /**
   * Creates a Zod schema that validates if the input is a boolean or a string "true"/"false".
   */
  const zBooleanStringRequired = (
    msg = "Value",
    msgType: MsgType = MsgType.FieldName,
  ) => {
    return baseBooleanStringSchema
      .refine(
        val =>
          (typeof val === "boolean") ||
          (typeof val === "string" && ["true", "false"].includes(val.trim().toLowerCase())),
        { message: messageHandler.formatErrorMessage({ msg, msgType, messageKey: "boolean.mustBeBooleanString"}) }
      )
      .transform(val =>
        typeof val === "boolean"
          ? val ? "true" : "false"
          : val.trim().toLowerCase()
      );
  };

  /**
   * Creates a Zod schema that validates an optional boolean value represented as a string.
   */
  const zBooleanStringOptional = (
    msg = "Value",
    msgType: MsgType = MsgType.FieldName,
  ) => {
    return zBooleanStringRequired(msg, msgType).optional();
  };

  return {
    zBooleanOptional,
    zBooleanRequired,
    zBooleanStringRequired,
    zBooleanStringOptional,
  };
};

/**
 * Individual schema creation functions that accept messageHandler as first parameter
 */

export const zBooleanOptional = (
  messageHandler: IMessageHandler,
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createBooleanSchemas(messageHandler).zBooleanOptional(msg, msgType);
};

export const zBooleanRequired = (
  messageHandler: IMessageHandler,
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createBooleanSchemas(messageHandler).zBooleanRequired(msg, msgType);
};

export const zBooleanStringRequired = (
  messageHandler: IMessageHandler,
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createBooleanSchemas(messageHandler).zBooleanStringRequired(msg, msgType);
};

export const zBooleanStringOptional = (
  messageHandler: IMessageHandler,
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) => {
  return createBooleanSchemas(messageHandler).zBooleanStringOptional(msg, msgType);
};

// --- Types ---
export type BooleanOptional = z.infer<ReturnType<typeof zBooleanOptional>>;
export type BooleanRequired = z.infer<ReturnType<typeof zBooleanRequired>>;
export type BooleanStringOptional = z.infer<ReturnType<typeof zBooleanStringOptional>>;
export type BooleanStringRequired = z.infer<ReturnType<typeof zBooleanStringRequired>>;
