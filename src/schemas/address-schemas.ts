import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createTestMessageHandler } from "../localization/types/message-handler.types";
import { createPostalCodeSchemas } from "./postal-code-schemas";
import { createStringSchemas } from "./string-schemas";
import {
  makeOptionalSimple,
  removeEmptyStringFields,
} from "../common/utils/zod-utils";

// --- US State Codes ---
export const US_STATE_CODES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

/**
 * Creates a factory function for address schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing address schema creation functions
 */
/**
 * Creates a set of Zod schemas for validating address objects with various levels of strictness and formats.
 *
 * @param messageHandler - An error message formatter used to customize validation error messages.
 * @returns An object containing the following address schemas:
 * - `AddressOptional`: Validates an optional address object with all fields, allowing `undefined`.
 * - `AddressRequired`: Validates a required address object with all fields.
 * - `AddressSimple`: Validates a simple address object with minimal required fields (street, city, country).
 * - `AddressUS`: Validates a US-specific address object, including state and ZIP code validation.
 *
 * Each schema removes empty string fields (e.g., `street2`) from the result and supports custom error messages.
 *
 * @example
 * const schemas = createAddressSchemas(messageHandler);
 * const result = schemas.AddressRequired().safeParse({
 *   street: "123 Main St",
 *   street2: "",
 *   city: "Springfield",
 *   state: "IL",
 *   postalCode: "62704",
 *   country: "US"
 * });
 * // result.success === true
 * // result.data.street2 is undefined (empty string removed)
 */
export const createAddressSchemas = (messageHandler: ErrorMessageFormatter) => {
  const stringSchemas = createStringSchemas(messageHandler);
  const postalCodeSchemas = createPostalCodeSchemas(messageHandler);

  /**
   * Optional address schema with all fields.
   * Includes street, city, state, postal code, and country validation.
   */
  const AddressOptional = (
    msg = "Address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    makeOptionalSimple(
      z
        .object({
          street: stringSchemas.StringRequired({ msg: "Street", msgType }),
          street2: stringSchemas.StringOptional({ msg: "Street 2", msgType }),
          city: stringSchemas.StringRequired({ msg: "City", msgType }),
          state: stringSchemas.StringRequired({ msg: "State", msgType }),
          postalCode: postalCodeSchemas.PostalCodeRequired({
            msg: "Postal Code",
            msgType,
          }),
          country: stringSchemas.StringRequired({ msg: "Country", msgType }),
        })
        .transform(removeEmptyStringFields(["street2"])),
      messageHandler.formatErrorMessage({
        group: "address",
        messageKey: "mustBeValidAddress",
        msg,
        msgType,
      }),
    );

  /**
   * Required address schema with all fields.
   * Includes street, city, state, postal code, and country validation.
   */
  const AddressRequired = (
    msg = "Address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .object(
        {
          street: stringSchemas.StringRequired({ msg: "Street", msgType }),
          street2: stringSchemas.StringOptional({ msg: "Street 2", msgType }),
          city: stringSchemas.StringRequired({ msg: "City", msgType }),
          state: stringSchemas.StringRequired({ msg: "State", msgType }),
          postalCode: postalCodeSchemas.PostalCodeRequired({
            msg: "Postal Code",
            msgType,
          }),
          country: stringSchemas.StringRequired({ msg: "Country", msgType }),
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "address",
            messageKey: "required",
            msg,
            msgType,
          }),
        },
      )
      .transform(removeEmptyStringFields(["street2"]));

  /**
   * Simple address schema with minimal fields (street, city, country).
   * Useful for basic address validation.
   */
  const AddressSimple = (
    msg = "Address",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object(
      {
        street: stringSchemas.StringRequired({ msg: "Street", msgType }),
        city: stringSchemas.StringRequired({ msg: "City", msgType }),
        country: stringSchemas.StringRequired({ msg: "Country", msgType }),
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "address",
          messageKey: "required",
          msg,
          msgType,
        }),
      },
    );

  /**
   * US address schema with state validation and ZIP code format.
   * Includes validation for US-specific address formats.
   */
  const AddressUS = (msg = "Address", msgType: MsgType = MsgType.FieldName) =>
    z
      .object(
        {
          street: stringSchemas.StringRequired({ msg: "Street", msgType }),
          street2: stringSchemas.StringOptional({ msg: "Street 2", msgType }),
          city: stringSchemas.StringRequired({ msg: "City", msgType }),
          state: z.enum(US_STATE_CODES as [string, ...string[]], {
            message: messageHandler.formatErrorMessage({
              group: "address",
              messageKey: "invalidUSState",
              msg: "State",
              msgType,
            }),
          }),
          postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, {
            message: messageHandler.formatErrorMessage({
              group: "postalCode",
              messageKey: "mustBeValidZipCode",
              msg: "Postal Code",
              msgType,
            }),
          }),
          country: z.literal("US").default("US"),
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "address",
            messageKey: "required",
            msg,
            msgType,
          }),
        },
      )
      .transform(removeEmptyStringFields(["street2"]));

  return {
    AddressOptional,
    AddressRequired,
    AddressSimple,
    AddressUS,
  };
};

// Top-level exports for barrel usage
const testMessageHandler = createTestMessageHandler();
const addressSchemas = createAddressSchemas(testMessageHandler);

export const AddressOptional = addressSchemas.AddressOptional;
export const AddressRequired = addressSchemas.AddressRequired;
export const AddressSimple = addressSchemas.AddressSimple;
export const AddressUS = addressSchemas.AddressUS;

// --- Types ---
type AddressSchemasFactory = ReturnType<typeof createAddressSchemas>;
export type AddressOptional = z.infer<
  ReturnType<AddressSchemasFactory["AddressOptional"]>
>;
export type AddressRequired = z.infer<
  ReturnType<AddressSchemasFactory["AddressRequired"]>
>;
export type AddressSimple = z.infer<
  ReturnType<AddressSchemasFactory["AddressSimple"]>
>;
export type AddressUS = z.infer<ReturnType<AddressSchemasFactory["AddressUS"]>>;
