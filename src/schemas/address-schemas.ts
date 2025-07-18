import { z } from "zod";

import { MsgType } from "./msg-type";
import { zStringRequired, zStringOptional } from "./string-schemas";
import { zPostalCodeRequired, zPostalCodeOptional } from "./postal-code-schemas";

// --- Address Schema Types ---

/**
 * Type for an optional address.
 */
export type AddressOptional = z.infer<ReturnType<typeof zAddressOptional>>;

/**
 * Type for a required address.
 */
export type AddressRequired = z.infer<ReturnType<typeof zAddressRequired>>;

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
      message:
        msgType === MsgType.Message
          ? String(fieldName)
          : `${fieldName} must be a valid address object`,
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
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} is required`,
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
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} is required`,
  });

/**
 * US-specific address schema with state validation.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a US address object.
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
    state: z.string().regex(/^[A-Z]{2}$/, {
      message:
        msgType === MsgType.Message
          ? "State must be a valid 2-letter US state code"
          : "State must be a valid 2-letter US state code",
    }),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, {
      message:
        msgType === MsgType.Message
          ? "Postal code must be a valid US ZIP code"
          : "Postal code must be a valid US ZIP code (e.g., 12345 or 12345-6789)",
    }),
    country: z.literal("US"),
  }, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} is required`,
  })
  .transform((val) => {
    // Remove empty string fields
    const result = { ...val } as Partial<typeof val>;
    if (result.street2 === "") {
      delete result.street2;
    }
    return result;
  });
