import { z } from "zod";

import { MsgType } from "./msg-type";
import { formatErrorMessage } from "./message-handler";

// --- Money Schema Types ---

/**
 * Type for an optional money value.
 */
export type MoneyOptional = z.infer<ReturnType<typeof zMoneyOptional>>;

/**
 * Type for a required money value.
 */
export type MoneyRequired = z.infer<ReturnType<typeof zMoneyRequired>>;

// --- ISO 4217 Currency Codes ---

/**
 * Common ISO 4217 currency codes.
 * This is a subset of the full ISO 4217 standard for common currencies.
 */
export const ISO_4217_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD", "CNY", "INR",
  "BRL", "RUB", "KRW", "MXN", "ZAR", "SEK", "NOK", "DKK", "PLN", "CZK",
  "HUF", "BGN", "RON", "HRK", "ISK", "TRY", "ILS", "AED", "SAR", "QAR",
  "KWD", "BHD", "OMR", "JOD", "LBP", "EGP", "MAD", "TND", "DZD", "LYD",
  "NGN", "GHS", "KES", "UGX", "TZS", "ZMW", "BWP", "MUR", "SCR", "ETB",
  "MGA", "XOF", "XAF", "THB", "VND", "IDR", "MYR", "SGD", "PHP", "TWD",
  "HKD", "MOP", "BND", "LAK", "KHR", "MMK", "NPR", "PKR", "LKR", "BDT",
  "BTN", "MVR", "AFN", "IRR", "IQD", "SYP", "YER", "UZS", "KZT", "KGS",
  "TJS", "TMT", "AZN", "GEL", "AMD", "MDL", "UAH", "BYN", "MKD", "ALL",
  "BAM", "RSD", "EUR", "CLP", "COP", "PEN", "UYU", "PYG", "BOB", "VES",
  "GYD", "SRD", "FKP", "TTD", "BBD", "JMD", "BSD", "KYD", "XCD", "AWG",
  "ANG", "CUP", "DOP", "GTQ", "HNL", "NIO", "CRC", "PAB", "BZD", "SVC"
] as const;

/**
 * Type for ISO 4217 currency codes.
 */
export type CurrencyCode = typeof ISO_4217_CURRENCIES[number];

// --- Money Schemas ---

/**
 * Currency code schema that validates against ISO 4217 currency codes.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a currency code.
 */
export const zCurrencyCode = (
  fieldName = "Currency",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.enum(ISO_4217_CURRENCIES, {
    message: formatErrorMessage(
      fieldName,
      msgType,
      "must be a valid ISO 4217 currency code"
    ),
  });

/**
 * Money amount schema that validates positive decimal values.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param maxDecimals - Maximum number of decimal places allowed (default: 2).
 * @returns Zod schema for a money amount.
 */
export const zMoneyAmount = (
  fieldName = "Amount",
  msgType: MsgType = MsgType.FieldName,
  maxDecimals: number = 2,
) =>
  z
    .number({
      message: formatErrorMessage(
        fieldName,
        msgType,
        "must be a number"
      ),
    })
    .positive({
      message: formatErrorMessage(
        fieldName,
        msgType,
        "must be greater than 0"
      ),
    })
    .refine(
      (val) => {
        const decimals = val.toString().split('.')[1]?.length || 0;
        return decimals <= maxDecimals;
      },
      {
        message: formatErrorMessage(
          fieldName,
          msgType,
          `must have at most ${maxDecimals} decimal places`
        ),
      },
    );

/**
 * Money amount schema that accepts string input and converts to number.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param maxDecimals - Maximum number of decimal places allowed (default: 2).
 * @returns Zod schema for a money amount from string.
 */
export const zMoneyAmountFromString = (
  fieldName = "Amount",
  msgType: MsgType = MsgType.FieldName,
  maxDecimals: number = 2,
) =>
  z
    .string({
      message: formatErrorMessage(
        fieldName,
        msgType,
        "must be a string"
      ),
    })
    .regex(/^\d+(\.\d+)?$/, {
      message: formatErrorMessage(
        fieldName,
        msgType,
        "must be a valid decimal number"
      ),
    })
    .transform((val) => parseFloat(val))
    .refine(
      (val) => val > 0,
      {
        message: formatErrorMessage(
          fieldName,
          msgType,
          "must be greater than 0"
        ),
      },
    )
    .refine(
      (val) => {
        const decimals = val.toString().split('.')[1]?.length || 0;
        return decimals <= maxDecimals;
      },
      {
        message: formatErrorMessage(
          fieldName,
          msgType,
          `must have at most ${maxDecimals} decimal places`
        ),
      },
    );

/**
 * Optional money schema with currency and amount validation.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param maxDecimals - Maximum number of decimal places allowed (default: 2).
 * @returns Zod schema for an optional money object.
 * 
 * @example
 * const moneySchema = zMoneyOptional("Price");
 * const result = moneySchema.parse({
 *   amount: 99.99,
 *   currency: "USD"
 * });
 */
export const zMoneyOptional = (
  fieldName = "Money",
  msgType: MsgType = MsgType.FieldName,
  maxDecimals: number = 2,
) =>
  z
    .object({
      amount: zMoneyAmount(
        msgType === MsgType.Message ? "Amount is required" : "Amount",
        msgType,
        maxDecimals,
      ),
      currency: zCurrencyCode(
        msgType === MsgType.Message ? "Currency is required" : "Currency",
        msgType,
      ),
    })
    .optional()
    .refine(
      (val) => val === undefined || (typeof val === "object" && val !== null),
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} must be a valid money object`,
      },
    );

/**
 * Required money schema with currency and amount validation.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param maxDecimals - Maximum number of decimal places allowed (default: 2).
 * @returns Zod schema for a required money object.
 * 
 * @example
 * const moneySchema = zMoneyRequired("Price");
 * const result = moneySchema.parse({
 *   amount: 99.99,
 *   currency: "USD"
 * });
 */
export const zMoneyRequired = (
  fieldName = "Money",
  msgType: MsgType = MsgType.FieldName,
  maxDecimals: number = 2,
) =>
  z.object({
    amount: zMoneyAmount(
      msgType === MsgType.Message ? "Amount is required" : "Amount",
      msgType,
      maxDecimals,
    ),
    currency: zCurrencyCode(
      msgType === MsgType.Message ? "Currency is required" : "Currency",
      msgType,
    ),
  }, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} is required`,
  });

/**
 * Money schema with string amount input (useful for form data).
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param maxDecimals - Maximum number of decimal places allowed (default: 2).
 * @returns Zod schema for a money object with string amount.
 * 
 * @example
 * const moneySchema = zMoneyFromString("Price");
 * const result = moneySchema.parse({
 *   amount: "99.99",
 *   currency: "USD"
 * });
 */
export const zMoneyFromString = (
  fieldName = "Money",
  msgType: MsgType = MsgType.FieldName,
  maxDecimals: number = 2,
) =>
  z.object({
    amount: zMoneyAmountFromString(
      msgType === MsgType.Message ? "Amount is required" : "Amount",
      msgType,
      maxDecimals,
    ),
    currency: zCurrencyCode(
      msgType === MsgType.Message ? "Currency is required" : "Currency",
      msgType,
    ),
  }, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} is required`,
  });

/**
 * Simple price schema for single currency applications.
 * @param currency - The fixed currency code to use.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param maxDecimals - Maximum number of decimal places allowed (default: 2).
 * @returns Zod schema for a price with fixed currency.
 * 
 * @example
 * const priceSchema = zPrice("USD", "Price");
 * const result = priceSchema.parse(99.99);
 */
export const zPrice = (
  currency: CurrencyCode,
  fieldName = "Price",
  msgType: MsgType = MsgType.FieldName,
  maxDecimals: number = 2,
) =>
  zMoneyAmount(fieldName, msgType, maxDecimals)
    .transform((amount) => ({ amount, currency }));

/**
 * Price range schema for validating min/max price ranges.
 * @param currency - The fixed currency code to use.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param maxDecimals - Maximum number of decimal places allowed (default: 2).
 * @returns Zod schema for a price range.
 * 
 * @example
 * const priceRangeSchema = zPriceRange("USD", "Price Range");
 * const result = priceRangeSchema.parse({ min: 10.00, max: 100.00 });
 */
export const zPriceRange = (
  currency: CurrencyCode,
  fieldName = "Price Range",
  msgType: MsgType = MsgType.FieldName,
  maxDecimals: number = 2,
) =>
  z.object({
    min: zMoneyAmount(
      msgType === MsgType.Message ? "Minimum price is required" : "Minimum Price",
      msgType,
      maxDecimals,
    ),
    max: zMoneyAmount(
      msgType === MsgType.Message ? "Maximum price is required" : "Maximum Price",
      msgType,
      maxDecimals,
    ),
  })
  .refine(
    (data) => data.min <= data.max,
    {
      message: formatErrorMessage(
        fieldName,
        msgType,
        "minimum must be less than or equal to maximum"
      ),
      path: ["min"],
    },
  )
  .transform((data) => ({
    min: { amount: data.min, currency },
    max: { amount: data.max, currency },
  }));
