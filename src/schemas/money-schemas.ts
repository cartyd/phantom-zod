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
  const zCurrencyCode = (options: MoneySchemaOptions = {}): z.ZodTypeAny => {
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
  const zMoneyAmount = (options: MoneySchemaOptions = {}): z.ZodTypeAny => {
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
  const zMoneyAmountFromString = (
    options: MoneySchemaOptions = {},
  ): z.ZodTypeAny => {
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
  const zMoneyOptional = (options: MoneySchemaOptions = {}): z.ZodTypeAny => {
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
  const zMoneyRequired = (options: MoneySchemaOptions = {}): z.ZodTypeAny => {
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
  const zMoneyFromString = (options: MoneySchemaOptions = {}): z.ZodTypeAny => {
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
  const zPrice = (
    currency: CurrencyCode,
    options: MoneySchemaOptions = {},
  ): z.ZodTypeAny => {
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
  ): z.ZodTypeAny => {
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
      .refine((data) => (data as any).min <= (data as any).max, {
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
        min: { amount: (data as any).min, currency },
        max: { amount: (data as any).max, currency },
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

// Helper function with overloads to support both string and options object
function createCurrencyCodeOverload(
  msg: string,
): ReturnType<typeof defaultMoneySchemas.CurrencyCode>;
function createCurrencyCodeOverload(
  options?: MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.CurrencyCode>;
function createCurrencyCodeOverload(
  msgOrOptions?: string | MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.CurrencyCode> {
  if (typeof msgOrOptions === "string") {
    return defaultMoneySchemas.CurrencyCode({ msg: msgOrOptions });
  }
  return defaultMoneySchemas.CurrencyCode(msgOrOptions);
}

function createMoneyAmountOverload(
  msg: string,
): ReturnType<typeof defaultMoneySchemas.MoneyAmount>;
function createMoneyAmountOverload(
  options?: MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.MoneyAmount>;
function createMoneyAmountOverload(
  msgOrOptions?: string | MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.MoneyAmount> {
  if (typeof msgOrOptions === "string") {
    return defaultMoneySchemas.MoneyAmount({ msg: msgOrOptions });
  }
  return defaultMoneySchemas.MoneyAmount(msgOrOptions);
}

function createMoneyAmountFromStringOverload(
  msg: string,
): ReturnType<typeof defaultMoneySchemas.MoneyAmountFromString>;
function createMoneyAmountFromStringOverload(
  options?: MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.MoneyAmountFromString>;
function createMoneyAmountFromStringOverload(
  msgOrOptions?: string | MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.MoneyAmountFromString> {
  if (typeof msgOrOptions === "string") {
    return defaultMoneySchemas.MoneyAmountFromString({ msg: msgOrOptions });
  }
  return defaultMoneySchemas.MoneyAmountFromString(msgOrOptions);
}

function createMoneyOptionalOverload(
  msg: string,
): ReturnType<typeof defaultMoneySchemas.MoneyOptional>;
function createMoneyOptionalOverload(
  options?: MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.MoneyOptional>;
function createMoneyOptionalOverload(
  msgOrOptions?: string | MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.MoneyOptional> {
  if (typeof msgOrOptions === "string") {
    return defaultMoneySchemas.MoneyOptional({ msg: msgOrOptions });
  }
  return defaultMoneySchemas.MoneyOptional(msgOrOptions);
}

function createMoneyRequiredOverload(
  msg: string,
): ReturnType<typeof defaultMoneySchemas.MoneyRequired>;
function createMoneyRequiredOverload(
  options?: MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.MoneyRequired>;
function createMoneyRequiredOverload(
  msgOrOptions?: string | MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.MoneyRequired> {
  if (typeof msgOrOptions === "string") {
    return defaultMoneySchemas.MoneyRequired({ msg: msgOrOptions });
  }
  return defaultMoneySchemas.MoneyRequired(msgOrOptions);
}

function createMoneyFromStringOverload(
  msg: string,
): ReturnType<typeof defaultMoneySchemas.MoneyFromString>;
function createMoneyFromStringOverload(
  options?: MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.MoneyFromString>;
function createMoneyFromStringOverload(
  msgOrOptions?: string | MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.MoneyFromString> {
  if (typeof msgOrOptions === "string") {
    return defaultMoneySchemas.MoneyFromString({ msg: msgOrOptions });
  }
  return defaultMoneySchemas.MoneyFromString(msgOrOptions);
}

function createPriceOverload(
  currency: CurrencyCode,
): ReturnType<typeof defaultMoneySchemas.Price>;
function createPriceOverload(
  currency: CurrencyCode,
  msg: string,
): ReturnType<typeof defaultMoneySchemas.Price>;
function createPriceOverload(
  currency: CurrencyCode,
  options: MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.Price>;
function createPriceOverload(
  currency: CurrencyCode,
  msgOrOptions?: string | MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.Price> {
  if (typeof msgOrOptions === "string") {
    return defaultMoneySchemas.Price(currency, { msg: msgOrOptions });
  }
  return defaultMoneySchemas.Price(currency, msgOrOptions);
}

function createPriceRangeOverload(
  currency: CurrencyCode,
): ReturnType<typeof defaultMoneySchemas.PriceRange>;
function createPriceRangeOverload(
  currency: CurrencyCode,
  msg: string,
): ReturnType<typeof defaultMoneySchemas.PriceRange>;
function createPriceRangeOverload(
  currency: CurrencyCode,
  options: MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.PriceRange>;
function createPriceRangeOverload(
  currency: CurrencyCode,
  msgOrOptions?: string | MoneySchemaOptions,
): ReturnType<typeof defaultMoneySchemas.PriceRange> {
  if (typeof msgOrOptions === "string") {
    return defaultMoneySchemas.PriceRange(currency, { msg: msgOrOptions });
  }
  return defaultMoneySchemas.PriceRange(currency, msgOrOptions);
}

// Direct schema exports with overloads
export const CurrencyCode = createCurrencyCodeOverload;
export const MoneyAmount = createMoneyAmountOverload;
export const MoneyAmountFromString = createMoneyAmountFromStringOverload;
export const MoneyOptional = createMoneyOptionalOverload;
export const MoneyRequired = createMoneyRequiredOverload;
export const MoneyFromString = createMoneyFromStringOverload;
export const Price = createPriceOverload;
export const PriceRange = createPriceRangeOverload;
