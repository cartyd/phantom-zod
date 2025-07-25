import { createMoneySchemas, ISO_4217_CURRENCIES } from "../src/schemas/money-schemas";
import { MsgType } from "../src/schemas/msg-type";
import { createTestMessageHandler } from "../src/common/message-handler.types";

// Create schemas using the factory with test message handler
const mockMessageHandler = createTestMessageHandler();
const {
  zCurrencyCode,
  zMoneyAmount,
  zMoneyAmountFromString,
  zMoneyOptional,
  zMoneyRequired,
  zMoneyFromString,
  zPrice,
  zPriceRange,
} = createMoneySchemas(mockMessageHandler);

describe("Money Schemas", () => {
    describe("zCurrencyCode", () => {
        const schema = zCurrencyCode();

        it("should accept valid ISO 4217 currency codes", () => {
            expect(schema.parse("USD")).toBe("USD");
            expect(schema.parse("EUR")).toBe("EUR");
            expect(schema.parse("GBP")).toBe("GBP");
            expect(schema.parse("JPY")).toBe("JPY");
        });

        it("should reject invalid currency codes", () => {
            expect(() => schema.parse("INVALID")).toThrow();
            expect(() => schema.parse("usd")).toThrow();
            expect(() => schema.parse("")).toThrow();
            expect(() => schema.parse("USDD")).toThrow();
        });

        it("should reject non-string input", () => {
            expect(() => schema.parse(123)).toThrow();
            expect(() => schema.parse(null)).toThrow();
            expect(() => schema.parse(undefined)).toThrow();
        });
    });

    describe("zMoneyAmount", () => {
        const schema = zMoneyAmount();

        it("should accept valid positive amounts", () => {
            expect(schema.parse(10.50)).toBe(10.50);
            expect(schema.parse(100)).toBe(100);
            expect(schema.parse(0.01)).toBe(0.01);
        });

        it("should reject negative amounts", () => {
            expect(() => schema.parse(-10.50)).toThrow();
            expect(() => schema.parse(-1)).toThrow();
        });

        it("should reject zero", () => {
            expect(() => schema.parse(0)).toThrow();
        });

        it("should validate decimal places", () => {
            expect(schema.parse(10.99)).toBe(10.99);
            expect(() => schema.parse(10.999)).toThrow(); // 3 decimal places
        });

        it("should accept custom decimal places", () => {
            const schema = zMoneyAmount({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 4 });
            expect(schema.parse(10.9999)).toBe(10.9999);
            expect(() => schema.parse(10.99999)).toThrow(); // 5 decimal places
        });

        it("should reject non-number input", () => {
            expect(() => schema.parse("10.50")).toThrow();
            expect(() => schema.parse(null)).toThrow();
            expect(() => schema.parse(undefined)).toThrow();
        });
    });

    describe("zMoneyAmountFromString", () => {
        const schema = zMoneyAmountFromString();

        it("should accept valid string amounts and convert to number", () => {
            expect(schema.parse("10.50")).toBe(10.50);
            expect(schema.parse("100")).toBe(100);
            expect(schema.parse("0.01")).toBe(0.01);
        });

        it("should reject invalid string formats", () => {
            expect(() => schema.parse("10.50.00")).toThrow();
            expect(() => schema.parse("abc")).toThrow();
            expect(() => schema.parse("10.50a")).toThrow();
            expect(() => schema.parse("")).toThrow();
        });

        it("should reject negative amounts", () => {
            expect(() => schema.parse("-10.50")).toThrow();
        });

        it("should reject zero", () => {
            expect(() => schema.parse("0")).toThrow();
            expect(() => schema.parse("0.00")).toThrow();
        });

        it("should validate decimal places", () => {
            expect(schema.parse("10.99")).toBe(10.99);
            expect(() => schema.parse("10.999")).toThrow(); // 3 decimal places
        });

        it("should accept custom decimal places", () => {
            const schema = zMoneyAmountFromString({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 4 });
            expect(schema.parse("10.9999")).toBe(10.9999);
            expect(() => schema.parse("10.99999")).toThrow(); // 5 decimal places
        });

        it("should reject non-string input", () => {
            expect(() => schema.parse(10.50)).toThrow();
            expect(() => schema.parse(null)).toThrow();
            expect(() => schema.parse(undefined)).toThrow();
        });
    });

    describe("zMoneyOptional", () => {
        const schema = zMoneyOptional();

        it("should accept undefined", () => {
            expect(schema.parse(undefined)).toBe(undefined);
        });

        it("should accept valid money object", () => {
            const validMoney = { amount: 99.99, currency: "USD" };
            expect(schema.parse(validMoney)).toEqual(validMoney);
        });

        it("should reject invalid money object", () => {
            expect(() => schema.parse({ amount: -10, currency: "USD" })).toThrow();
            expect(() => schema.parse({ amount: 10, currency: "INVALID" })).toThrow();
            expect(() => schema.parse({ amount: 10 })).toThrow();
            expect(() => schema.parse({ currency: "USD" })).toThrow();
        });

        it("should reject non-object input", () => {
            expect(() => schema.parse("invalid")).toThrow();
            expect(() => schema.parse(123)).toThrow();
            expect(() => schema.parse(null)).toThrow();
        });

        it("should validate with custom decimal places", () => {
            const schema = zMoneyOptional({ msg: "Price", msgType: MsgType.FieldName, maxDecimals: 4 });
            expect(schema.parse({ amount: 99.9999, currency: "USD" })).toEqual({ amount: 99.9999, currency: "USD" });
            expect(() => schema.parse({ amount: 99.99999, currency: "USD" })).toThrow();
        });
    });

    describe("zMoneyRequired", () => {
        const schema = zMoneyRequired();

        it("should accept valid money object", () => {
            const validMoney = { amount: 99.99, currency: "USD" };
            expect(schema.parse(validMoney)).toEqual(validMoney);
        });

        it("should reject undefined", () => {
            expect(() => schema.parse(undefined)).toThrow();
        });

        it("should reject null", () => {
            expect(() => schema.parse(null)).toThrow();
        });

        it("should reject invalid money object", () => {
            expect(() => schema.parse({ amount: -10, currency: "USD" })).toThrow();
            expect(() => schema.parse({ amount: 10, currency: "INVALID" })).toThrow();
        });

        it("should validate with custom decimal places", () => {
            const schema = zMoneyRequired({ msg: "Price", msgType: MsgType.FieldName, maxDecimals: 3 });
            expect(schema.parse({ amount: 99.999, currency: "USD" })).toEqual({ amount: 99.999, currency: "USD" });
            expect(() => schema.parse({ amount: 99.9999, currency: "USD" })).toThrow();
        });
    });

    describe("zMoneyFromString", () => {
        const schema = zMoneyFromString();

        it("should accept valid money object with string amount", () => {
            const validMoney = { amount: "99.99", currency: "USD" };
            const expected = { amount: 99.99, currency: "USD" };
            expect(schema.parse(validMoney)).toEqual(expected);
        });

        it("should reject invalid string amounts", () => {
            expect(() => schema.parse({ amount: "abc", currency: "USD" })).toThrow();
            expect(() => schema.parse({ amount: "-10.50", currency: "USD" })).toThrow();
            expect(() => schema.parse({ amount: "0", currency: "USD" })).toThrow();
        });

        it("should reject invalid currency", () => {
            expect(() => schema.parse({ amount: "10.50", currency: "INVALID" })).toThrow();
        });

        it("should validate decimal places", () => {
            expect(schema.parse({ amount: "10.99", currency: "USD" })).toEqual({ amount: 10.99, currency: "USD" });
            expect(() => schema.parse({ amount: "10.999", currency: "USD" })).toThrow();
        });
    });

    describe("zPrice", () => {
        const schema = zPrice("USD");

        it("should accept valid price and transform to money object", () => {
            const result = schema.parse(99.99);
            expect(result).toEqual({ amount: 99.99, currency: "USD" });
        });

        it("should reject invalid price", () => {
            expect(() => schema.parse(-10)).toThrow();
            expect(() => schema.parse(0)).toThrow();
            expect(() => schema.parse(10.999)).toThrow(); // too many decimal places
        });

        it("should work with different currencies", () => {
            const eurSchema = zPrice("EUR");
            const result = eurSchema.parse(50.00);
            expect(result).toEqual({ amount: 50.00, currency: "EUR" });
        });

        it("should validate custom decimal places", () => {
            const schema = zPrice("USD", { msg: "Price", msgType: MsgType.FieldName, maxDecimals: 3 });
            expect(schema.parse(99.999)).toEqual({ amount: 99.999, currency: "USD" });
            expect(() => schema.parse(99.9999)).toThrow();
        });
    });

    describe("zPriceRange", () => {
        const schema = zPriceRange("USD");

        it("should accept valid price range", () => {
            const validRange = { min: 10.00, max: 100.00 };
            const expected = {
                min: { amount: 10.00, currency: "USD" },
                max: { amount: 100.00, currency: "USD" }
            };
            expect(schema.parse(validRange)).toEqual(expected);
        });

        it("should reject invalid price range where min > max", () => {
            const invalidRange = { min: 100.00, max: 10.00 };
            expect(() => schema.parse(invalidRange)).toThrow();
        });

        it("should accept equal min and max", () => {
            const validRange = { min: 50.00, max: 50.00 };
            const expected = {
                min: { amount: 50.00, currency: "USD" },
                max: { amount: 50.00, currency: "USD" }
            };
            expect(schema.parse(validRange)).toEqual(expected);
        });

        it("should reject negative prices", () => {
            expect(() => schema.parse({ min: -10.00, max: 100.00 })).toThrow();
            expect(() => schema.parse({ min: 10.00, max: -100.00 })).toThrow();
        });

        it("should reject zero prices", () => {
            expect(() => schema.parse({ min: 0, max: 100.00 })).toThrow();
            expect(() => schema.parse({ min: 10.00, max: 0 })).toThrow();
        });

        it("should validate decimal places", () => {
            expect(() => schema.parse({ min: 10.999, max: 100.00 })).toThrow();
            expect(() => schema.parse({ min: 10.00, max: 100.999 })).toThrow();
        });

        it("should work with different currencies", () => {
            const eurSchema = zPriceRange("EUR");
            const validRange = { min: 10.00, max: 100.00 };
            const expected = {
                min: { amount: 10.00, currency: "EUR" },
                max: { amount: 100.00, currency: "EUR" }
            };
            expect(eurSchema.parse(validRange)).toEqual(expected);
        });
    });

    describe("Custom Error Messages", () => {
        it("should use custom field name in error messages", () => {
            const schema = zMoneyRequired({ msg: "Product Price" });
            try {
                schema.parse({ amount: -10, currency: "USD" });
                fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.issues[0].message).toContain("Amount");
            }
        });

        it("should use custom message when msgType is Message", () => {
            const schema = zMoneyRequired({ msg: "Custom error message", msgType: MsgType.Message });
            try {
                schema.parse(undefined);
                fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.issues[0].message).toContain("Custom error message");
            }
        });
    });

    describe("ISO 4217 Currency Constants", () => {
        it("should contain major currencies", () => {
            expect(ISO_4217_CURRENCIES).toContain("USD");
            expect(ISO_4217_CURRENCIES).toContain("EUR");
            expect(ISO_4217_CURRENCIES).toContain("GBP");
            expect(ISO_4217_CURRENCIES).toContain("JPY");
            expect(ISO_4217_CURRENCIES).toContain("CHF");
            expect(ISO_4217_CURRENCIES).toContain("CAD");
            expect(ISO_4217_CURRENCIES).toContain("AUD");
        });

        it("should contain emerging market currencies", () => {
            expect(ISO_4217_CURRENCIES).toContain("CNY");
            expect(ISO_4217_CURRENCIES).toContain("INR");
            expect(ISO_4217_CURRENCIES).toContain("BRL");
            expect(ISO_4217_CURRENCIES).toContain("RUB");
            expect(ISO_4217_CURRENCIES).toContain("KRW");
        });

        it("should contain regional currencies", () => {
            expect(ISO_4217_CURRENCIES).toContain("SEK");
            expect(ISO_4217_CURRENCIES).toContain("NOK");
            expect(ISO_4217_CURRENCIES).toContain("DKK");
            expect(ISO_4217_CURRENCIES).toContain("PLN");
        });

        it("should be properly formatted", () => {
            ISO_4217_CURRENCIES.forEach(currency => {
                expect(currency).toMatch(/^[A-Z]{3}$/);
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle very small amounts", () => {
            const schema = zMoneyAmount({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 8 });
            expect(schema.parse(0.00000001)).toBe(0.00000001);
        });

        it("should handle very large amounts", () => {
            const schema = zMoneyAmount();
            expect(schema.parse(999999999.99)).toBe(999999999.99);
        });

        it("should handle different decimal place requirements", () => {
            const schemas = [
                zMoneyAmount({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 0 }),
                zMoneyAmount({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 1 }),
                zMoneyAmount({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 2 }),
                zMoneyAmount({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 4 }),
            ];

            expect(schemas[0].parse(10)).toBe(10);
            expect(() => schemas[0].parse(10.5)).toThrow();

            expect(schemas[1].parse(10.5)).toBe(10.5);
            expect(() => schemas[1].parse(10.55)).toThrow();

            expect(schemas[2].parse(10.55)).toBe(10.55);
            expect(() => schemas[2].parse(10.555)).toThrow();

            expect(schemas[3].parse(10.5555)).toBe(10.5555);
            expect(() => schemas[3].parse(10.55555)).toThrow();
        });

        it("should handle string conversion edge cases", () => {
            const schema = zMoneyAmountFromString();
            expect(schema.parse("10")).toBe(10);
            expect(schema.parse("10.0")).toBe(10);
            expect(schema.parse("10.00")).toBe(10);
            expect(schema.parse("0.01")).toBe(0.01);
        });
    });
});
