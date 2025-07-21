import { z } from "zod";

import { formatErrorMessage } from "./message-handler";
import { MsgType } from "./msg-type";
import { zPostalCodeRequired } from "./postal-code-schemas";
import { zStringOptional, zStringRequired } from "./string-schemas";

// --- Address Schema Types ---

/**
 * Type for an optional address.
 */
export type AddressOptional = z.infer<ReturnType<typeof zAddressOptional>>;

/**
 * Type for a required address.
 */
export type AddressRequired = z.infer<ReturnType<typeof zAddressRequired>>;

// --- US State Codes ---
export const US_STATE_CODES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

// --- Address Schemas ---

/**
 * Optional address schema with all fields.
 * Includes street, city, state, postal code, and country validation.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for an optional address object.
 * 
 * @example
 * const addressSchema = zAddressOptional("Shipping Address");
 * const result = addressSchema.parse({
 *   street: "123 Main St",
 *   city: "New York",
 *   state: "NY",
 *   postalCode: "10001",
 *   country: "US"
 * });
 */
export const zAddressOptional = (
  fieldName = "Address",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .union([
      z.undefined(),
      z.object({
        street: zStringRequired(
          msgType === MsgType.Message ? "Street address is required" : "Street",
          msgType,
        ),
        street2: zStringOptional(
          msgType === MsgType.Message ? "Street address line 2 is optional" : "Street 2",
          msgType,
        ),
        city: zStringRequired(
          msgType === MsgType.Message ? "City is required" : "City",
          msgType,
        ),
        state: zStringRequired(
          msgType === MsgType.Message ? "State is required" : "State",
          msgType,
        ),
        postalCode: zPostalCodeRequired(
          msgType === MsgType.Message ? "Postal code is required" : "Postal Code",
          msgType,
        ),
        country: zStringRequired(
          msgType === MsgType.Message ? "Country is required" : "Country",
          msgType,
        ),
      })
      .transform((val) => {
        // Remove empty string fields
        const result = { ...val } as Partial<typeof val>;
        if (result.street2 === "") {
          delete result.street2;
        }
        return result;
      })
    ], {
      message: formatErrorMessage(
        fieldName,
        msgType,
        "must be a valid address object"
      ),
    });

/**
 * Required address schema with all fields.
 * Includes street, city, state, postal code, and country validation.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a required address object.
 * 
 * @example
 * const addressSchema = zAddressRequired("Billing Address");
 * const result = addressSchema.parse({
 *   street: "123 Main St",
 *   city: "New York",
 *   state: "NY",
 *   postalCode: "10001",
 *   country: "US"
 * });
 */
export const zAddressRequired = (
  fieldName = "Address",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.object({
    street: zStringRequired(
      msgType === MsgType.Message ? "Street address is required" : "Street",
      msgType,
    ),
    street2: zStringOptional(
      msgType === MsgType.Message ? "Street address line 2 is optional" : "Street 2",
      msgType,
    ),
    city: zStringRequired(
      msgType === MsgType.Message ? "City is required" : "City",
      msgType,
    ),
    state: zStringRequired(
      msgType === MsgType.Message ? "State is required" : "State",
      msgType,
    ),
    postalCode: zPostalCodeRequired(
      msgType === MsgType.Message ? "Postal code is required" : "Postal Code",
      msgType,
    ),
    country: zStringRequired(
      msgType === MsgType.Message ? "Country is required" : "Country",
      msgType,
    ),
  }, {
    message: formatErrorMessage(
      fieldName,
      msgType,
      "is required"
    ),
  })
  .transform((val) => {
    // Remove empty string fields
    const result = { ...val } as Partial<typeof val>;
    if (result.street2 === "") {
      delete result.street2;
    }
    return result;
  });

/**
 * Simple address schema with minimal fields (street, city, country).
 * Useful for basic address validation.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a simple address object.
 * 
 * @example
 * const simpleAddressSchema = zAddressSimple("Contact Address");
 * const result = simpleAddressSchema.parse({
 *   street: "456 Elm St",
 *   city: "Los Angeles",
 *   country: "US"
 * });
 */
export const zAddressSimple = (
  fieldName = "Address",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.object({
    street: zStringRequired(
      msgType === MsgType.Message ? "Street address is required" : "Street",
      msgType,
    ),
    city: zStringRequired(
      msgType === MsgType.Message ? "City is required" : "City",
      msgType,
    ),
    country: zStringRequired(
      msgType === MsgType.Message ? "Country is required" : "Country",
      msgType,
    ),
  }, {
    message: formatErrorMessage(
      fieldName,
      msgType,
      "is required"
    ),
  });

/**
 * Creates a Zod schema for validating US addresses.
 *
 * @param fieldName - The display name for the address field, used in error messages. Defaults to "Address".
 * @param msgType - The type of message formatting to use for error messages. Defaults to `MsgType.FieldName`.
 * @returns A Zod object schema for a US address, including validation for street, street2, city, state (2-letter code), postal code (ZIP), and country ("US").
 *
 * @remarks
 * - The `street` and `city` fields are required strings.
 * - The `street2` field is optional and will be omitted from the result if empty.
 * - The `state` field must be a valid 2-letter US state code.
 * - The `postalCode` field must match US ZIP code formats (e.g., 12345 or 12345-6789).
 * - The `country` field is always "US" and defaults to "US".
 * - Error messages are customizable based on the `msgType` parameter.
 * - The schema transforms the result to remove empty `street2` fields.
 *
 * @example
 * const usAddressSchema = zAddressUS("Shipping Address");
 * const result = usAddressSchema.parse({
 *   street: "1600 Pennsylvania Ave NW",
 *   city: "Washington",
 *   state: "DC",
 *   postalCode: "20500",
 *   country: "US"
 * });
 */
export const zAddressUS = (
  fieldName = "Address",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.object({
    street: zStringRequired(
      msgType === MsgType.Message ? "Street address is required" : "Street",
      msgType,
    ),
    street2: zStringOptional(
      msgType === MsgType.Message ? "Street address line 2 is optional" : "Street 2",
      msgType,
    ),
    city: zStringRequired(
      msgType === MsgType.Message ? "City is required" : "City",
      msgType,
    ),
    state: z.enum(
      US_STATE_CODES as [string, ...string[]],
      {
        message:
          msgType === MsgType.Message
            ? "State must be a valid 2-letter US state code"
            : "State must be a valid 2-letter US state code",
      }
    ),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, {
      message:
        msgType === MsgType.Message
          ? "Postal code must be a valid US ZIP code"
          : "Postal code must be a valid US ZIP code (e.g., 12345 or 12345-6789)",
    }),
    country: z.literal("US").default("US"),
  }, {
    message: formatErrorMessage(
      fieldName,
      msgType,
      "is required"
    ),
  })
  .transform((val) => {
    // Remove empty string fields
    const result = { ...val } as Partial<typeof val>;
    if (result.street2 === "") {
      delete result.street2;
    }
    return result;
  });


