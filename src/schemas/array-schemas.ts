import { z } from "zod";
import { MsgType } from "./msg-type";
import { formatErrorMessage } from "./message-handler";

// --- Types ---
export type StringArrayOptional = z.infer<
  ReturnType<typeof zStringArrayOptional>
>;
export type StringArrayRequired = z.infer<
  ReturnType<typeof zStringArrayRequired>
>;

// --- Array Schemas ---

/**
 * Returns a Zod schema for an optional array of strings.
 *
 * @returns {ZodOptional<ZodArray<ZodString>>} A Zod schema that validates an optional array of strings.
 *
 * @example
 * const schema = zStringArrayOptional();
 * schema.parse(['a', 'b']); // passes
 * schema.parse(undefined); // passes
 * schema.parse([1, 2]); // fails
 */
export const zStringArrayOptional = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .array(z.string({
      message: formatErrorMessage(
        msg,
        msgType,
        "must be an array of strings"
      ),
    }))
    .optional();

/**
 * Creates a Zod schema for a required array of strings with at least one item.
 *
 * @param msg - The base message or field name to use in the validation error.
 * @param msgType - The type of message formatting to use.
 * @returns {ZodArray<ZodString>} A Zod schema that validates a required array of strings with at least one item.
 *
 * @example
 * const schema = zStringArrayRequired();
 * schema.parse(['foo']); // passes
 * schema.parse([]); // fails
 * schema.parse(undefined); // fails
 * schema.parse([1, 2]); // fails
 */
export const zStringArrayRequired = (
  msg = "Value",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.array(z.string()).nonempty({
    message: formatErrorMessage(
      msg,
      msgType,
      "must be an array of strings with at least one item"
    ),
  });
