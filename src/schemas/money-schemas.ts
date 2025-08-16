import { z } from "zod";

import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { MONEY_DECIMAL_PATTERN } from "../common/regex-patterns";
import type { MoneySchemaOptions } from "../common/types/schema-options.types";

// --- Money Schema Types ---
// Note: These types are simplified since they rely on the factory functions
export type MoneyOptional = { amount: number; currency: string } | undefined;
export type MoneyRequired = { amount: number; currency: string };
export type PriceOptional = { amount: number; currency: string } | undefined;
export type PriceRequired = { amount: number; currency: string };

// --- ISO 4217 Currency Codes ---

/**
 * Common ISO 4217 currency codes.
 * This is a subset of the full ISO 4217 standard for common currencies.
 */
export const ISO_4217_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CHF",
  "CAD",
  "AUD",
  "NZD",
  "CNY",
  "INR",
  "BRL",
  "RUB",
  "KRW",
  "MXN",
  "ZAR",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "BGN",
  "RON",
  "HRK",
  "ISK",
  "TRY",
  "ILS",
  "AED",
  "SAR",
  "QAR",
  "KWD",
  "BHD",
  "OMR",
  "JOD",
  "LBP",
  "EGP",
  "MAD",
  "TND",
  "DZD",
  "LYD",
  "NGN",
  "GHS",
  "KES",
  "UGX",
  "TZS",
  "ZMW",
  "BWP",
  "MUR",
  "SCR",
  "ETB",
  "MGA",
  "XOF",
  "XAF",
  "THB",
  "VND",
  "IDR",
  "MYR",
  "SGD",
  "PHP",
  "TWD",
  "HKD",
  "MOP",
  "BND",
  "LAK",
  "KHR",
  "MMK",
  "NPR",
  "PKR",
  "LKR",
  "BDT",
  "BTN",
  "MVR",
  "AFN",
  "IRR",
  "IQD",
  "SYP",
  "YER",
  "UZS",
  "KZT",
  "KGS",
  "TJS",
  "TMT",
  "AZN",
  "GEL",
  "AMD",
  "MDL",
  "UAH",
  "BYN",
  "MKD",
  "ALL",
  "BAM",
  "RSD",
  "EUR",
  "CLP",
  "COP",
  "PEN",
  "UYU",
  "PYG",
  "BOB",
  "VES",
  "GYD",
  "SRD",
  "FKP",
  "TTD",
  "BBD",
  "JMD",
  "BSD",
  "KYD",
  "XCD",
  "AWG",
  "ANG",
  "CUP",
  "DOP",
  "GTQ",
  "HNL",
  "NIO",
  "CRC",
  "PAB",
  "BZD",
  "SVC",
] as const;

/**
 * Type for ISO 4217 currency codes.
 */
export type CurrencyCode = (typeof ISO_4217_CURRENCIES)[number];

// --- Money Schemas ---

/**
 * Creates a factory function for money schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing money schema creation functions
 */
export const createMoneySchemas = (messageHandler: ErrorMessageFormatter) => {
  /**
   * Currency code schema that validates against ISO 4217 currency codes.
   * @param options - Options to configure field name and message type
   */
  const zCurrencyCode = (options: MoneySchemaOptions = {}) => {
    const { msg = "Currency", msgType = MsgType.FieldName } = options;
    return z
      .string({
        message: messageHandler.formatErrorMessage({
          group: "money",
          messageKey: "required",
          params: {},
          msg,
          msgType,
        }),
      })
      .refine((val) => ISO_4217_CURRENCIES.includes(val as any), {
        message: messageHandler.formatErrorMessage({
          group: "money",
          messageKey: "invalidCurrencyCode",
          params: { code: "{value}" },
          msg,
          msgType,
        }),
      });
  };

  /**
   * Money amount schema that validates positive decimal values.
   * @param options - Options to configure field name, message type, and max decimals
   */
  const zMoneyAmount = (options: MoneySchemaOptions = {}) => {
    const {
      msg = "Amount",
      msgType = MsgType.FieldName,
      maxDecimals = 2,
    } = options;
    return z
      .number({
        message: messageHandler.formatErrorMessage({
          group: "money",
          messageKey: "required",
          params: {},
          msg,
          msgType,
        }),
      })
      .refine((value) => typeof value === "number" && !isNaN(value), {
        message: messageHandler.formatErrorMessage({
          group: "money",
          messageKey: "mustBeValidAmount",
          params: {},
          msg,
          msgType,
        }),
      })
      .refine((value) => value > 0, {
        message: messageHandler.formatErrorMessage({
          group: "money",
          messageKey: "mustBePositiveAmount",
          params: {},
          msg,
          msgType,
        }),
      })
      .refine(
        (value) => {
          const decimals = value.toString().split(".")[1]?.length || 0;
          return decimals <= maxDecimals;
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "money",
            messageKey: "invalidDecimalPlaces",
            params: { max: maxDecimals },
            msg,
            msgType,
          }),
        },
      );
  };

  /**
   * Money amount schema that accepts string input and converts to number.
   * @param options - Options to configure field name, message type, and max decimals
   */
  const zMoneyAmountFromString = (options: MoneySchemaOptions = {}) => {
    const {
      msg = "Amount",
      msgType = MsgType.FieldName,
      maxDecimals = 2,
    } = options;
    return z
      .string({
        message: messageHandler.formatErrorMessage({
          group: "money",
          messageKey: "required",
          params: {},
          msg,
          msgType,
        }),
      })
      .regex(MONEY_DECIMAL_PATTERN, {
        message: messageHandler.formatErrorMessage({
          group: "money",
          messageKey: "mustBeValidAmount",
          params: {},
          msg,
          msgType,
        }),
      })
      .transform((val) => parseFloat(val))
      .refine((value) => value > 0, {
        message: messageHandler.formatErrorMessage({
          group: "money",
          messageKey: "mustBePositiveAmount",
          params: {},
          msg,
          msgType,
        }),
      })
      .refine(
        (value) => {
          const decimals = value.toString().split(".")[1]?.length || 0;
          return decimals <= maxDecimals;
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "money",
            messageKey: "invalidDecimalPlaces",
            params: { max: maxDecimals },
            msg,
            msgType,
          }),
        },
      );
  };

  /**
   * Optional money schema with currency and amount validation.
   * @param options - Options to configure field name, message type, and max decimals
   */
  const zMoneyOptional = (options: MoneySchemaOptions = {}) => {
    const {
      msg = "Money",
      msgType = MsgType.FieldName,
      maxDecimals = 2,
    } = options;
    return z
      .object({
        amount: zMoneyAmount({
          msg: msgType === MsgType.Message ? "Amount is required" : "Amount",
          msgType,
          maxDecimals,
        }),
        currency: zCurrencyCode({
          msg:
            msgType === MsgType.Message ? "Currency is required" : "Currency",
          msgType,
        }),
      })
      .optional()
      .refine(
        (val) => val === undefined || (typeof val === "object" && val !== null),
        {
          message: messageHandler.formatErrorMessage({
            group: "money",
            messageKey: "mustBeMoneyObject",
            params: {},
            msg,
            msgType,
          }),
        },
      );
  };

  /**
   * Required money schema with currency and amount validation.
   * @param options - Options to configure field name, message type, and max decimals
   */
  const zMoneyRequired = (options: MoneySchemaOptions = {}) => {
    const {
      msg = "Money",
      msgType = MsgType.FieldName,
      maxDecimals = 2,
    } = options;
    return z.object(
      {
        amount: zMoneyAmount({
          msg: msgType === MsgType.Message ? "Amount is required" : "Amount",
          msgType,
          maxDecimals,
        }),
        currency: zCurrencyCode({
          msg:
            msgType === MsgType.Message ? "Currency is required" : "Currency",
          msgType,
        }),
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "money",
          messageKey: "required",
          params: {},
          msg,
          msgType,
        }),
      },
    );
  };

  /**
   * Money schema with string amount input (useful for form data).
   * @param options - Options to configure field name, message type, and max decimals
   */
  const zMoneyFromString = (options: MoneySchemaOptions = {}) => {
    const {
      msg = "Money",
      msgType = MsgType.FieldName,
      maxDecimals = 2,
    } = options;
    return z.object(
      {
        amount: zMoneyAmountFromString({
          msg: msgType === MsgType.Message ? "Amount is required" : "Amount",
          msgType,
          maxDecimals,
        }),
        currency: zCurrencyCode({
          msg:
            msgType === MsgType.Message ? "Currency is required" : "Currency",
          msgType,
        }),
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "money",
          messageKey: "required",
          params: {},
          msg,
          msgType,
        }),
      },
    );
  };

  /**
   * Simple price schema for single currency applications.
   * @param currency - The fixed currency code to use.
   * @param options - Options to configure field name, message type, and max decimals
   * @returns Zod schema for a price with fixed currency.
   *
   * @example
   * const priceSchema = zPrice("USD", { msg: "Price" });
   * const result = priceSchema.parse(99.99);
   */
  const zPrice = (currency: CurrencyCode, options: MoneySchemaOptions = {}) => {
    const {
      msg = "Price",
      msgType = MsgType.FieldName,
      maxDecimals = 2,
    } = options;
    return zMoneyAmount({ msg, msgType, maxDecimals }).transform((amount) => ({
      amount,
      currency,
    }));
  };

  /**
   * Price range schema for validating min/max price ranges.
   * @param currency - The fixed currency code to use.
   * @param options - Options to configure field name, message type, and max decimals
   * @returns Zod schema for a price range.
   *
   * @example
   * const priceRangeSchema = zPriceRange("USD", { msg: "Price Range" });
   * const result = priceRangeSchema.parse({ min: 10.00, max: 100.00 });
   */
  const zPriceRange = (
    currency: CurrencyCode,
    options: MoneySchemaOptions = {},
  ) => {
    const {
      msg = "Price Range",
      msgType = MsgType.FieldName,
      maxDecimals = 2,
    } = options;
    return z
      .object({
        min: zMoneyAmount({
          msg:
            msgType === MsgType.Message
              ? "Minimum price is required"
              : "Minimum Price",
          msgType,
          maxDecimals,
        }),
        max: zMoneyAmount({
          msg:
            msgType === MsgType.Message
              ? "Maximum price is required"
              : "Maximum Price",
          msgType,
          maxDecimals,
        }),
      })
      .refine((data) => data.min <= data.max, {
        message: messageHandler.formatErrorMessage({
          group: "money",
          messageKey: "invalid",
          params: {},
          msg,
          msgType,
        }),
        path: ["min"],
      })
      .transform((data) => ({
        min: { amount: data.min, currency },
        max: { amount: data.max, currency },
      }));
  };

  return {
    CurrencyCode: zCurrencyCode,
    MoneyAmount: zMoneyAmount,
    MoneyAmountFromString: zMoneyAmountFromString,
    MoneyOptional: zMoneyOptional,
    MoneyRequired: zMoneyRequired,
    MoneyFromString: zMoneyFromString,
    Price: zPrice,
    PriceRange: zPriceRange,
  };
};

// Create a default message handler and export direct schemas
import { createTestMessageHandler } from "../localization/types/message-handler.types";

const defaultMoneySchemas = createMoneySchemas(createTestMessageHandler());

// Direct schema exports with clean naming
export const CurrencyCode = defaultMoneySchemas.CurrencyCode;
export const MoneyAmount = defaultMoneySchemas.MoneyAmount;
export const MoneyAmountFromString = defaultMoneySchemas.MoneyAmountFromString;
export const MoneyOptional = defaultMoneySchemas.MoneyOptional;
export const MoneyRequired = defaultMoneySchemas.MoneyRequired;
export const MoneyFromString = defaultMoneySchemas.MoneyFromString;
export const Price = defaultMoneySchemas.Price;
export const PriceRange = defaultMoneySchemas.PriceRange;
