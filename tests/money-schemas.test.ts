import { 
  CurrencyCode,
  MoneyAmount,
  MoneyAmountFromString,
  MoneyOptional,
  MoneyRequired,
  MoneyFromString,
  Price,
  PriceRange,
  ISO_4217_CURRENCIES 
} from "../src/schemas/money-schemas";
import { MsgType } from "../src/common/types/msg-type";
import { createTestMessageHandler } from "../src/localization/types/message-handler.types";

describe("Money Schemas", () => {
    describe("CurrencyCode", () => {
        const schema = CurrencyCode();

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

    describe("MoneyAmount", () => {
        const schema = MoneyAmount();

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
            const schema = MoneyAmount({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 4 });
            expect(schema.parse(10.9999)).toBe(10.9999);
            expect(() => schema.parse(10.99999)).toThrow(); // 5 decimal places
        });

        it("should reject non-number input", () => {
            expect(() => schema.parse("10.50")).toThrow();
            expect(() => schema.parse(null)).toThrow();
            expect(() => schema.parse(undefined)).toThrow();
        });
    });

    describe("MoneyAmountFromString", () => {
        const schema = MoneyAmountFromString();

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
            const schema = MoneyAmountFromString({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 4 });
            expect(schema.parse("10.9999")).toBe(10.9999);
            expect(() => schema.parse("10.99999")).toThrow(); // 5 decimal places
        });

        it("should reject non-string input", () => {
            expect(() => schema.parse(10.50)).toThrow();
            expect(() => schema.parse(null)).toThrow();
            expect(() => schema.parse(undefined)).toThrow();
        });
    });

    describe("MoneyOptional", () => {
        const schema = MoneyOptional();

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
            const schema = MoneyOptional({ msg: "Price", msgType: MsgType.FieldName, maxDecimals: 4 });
            expect(schema.parse({ amount: 99.9999, currency: "USD" })).toEqual({ amount: 99.9999, currency: "USD" });
            expect(() => schema.parse({ amount: 99.99999, currency: "USD" })).toThrow();
        });
    });

    describe("MoneyRequired", () => {
        const schema = MoneyRequired();

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
            const schema = MoneyRequired({ msg: "Price", msgType: MsgType.FieldName, maxDecimals: 3 });
            expect(schema.parse({ amount: 99.999, currency: "USD" })).toEqual({ amount: 99.999, currency: "USD" });
            expect(() => schema.parse({ amount: 99.9999, currency: "USD" })).toThrow();
        });
    });

    describe("MoneyFromString", () => {
        const schema = MoneyFromString();

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

    describe("Price", () => {
        const schema = Price("USD");

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
            const eurSchema = Price("EUR");
            const result = eurSchema.parse(50.00);
            expect(result).toEqual({ amount: 50.00, currency: "EUR" });
        });

        it("should validate custom decimal places", () => {
            const schema = Price("USD", { msg: "Price", msgType: MsgType.FieldName, maxDecimals: 3 });
            expect(schema.parse(99.999)).toEqual({ amount: 99.999, currency: "USD" });
            expect(() => schema.parse(99.9999)).toThrow();
        });
    });

    describe("PriceRange", () => {
        const schema = PriceRange("USD");

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
            const eurSchema = PriceRange("EUR");
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
            const schema = MoneyRequired({ msg: "Product Price" });
            try {
                schema.parse({ amount: -10, currency: "USD" });
                fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.issues[0].message).toContain("Amount");
            }
        });

        it("should use custom message when msgType is Message", () => {
            const schema = MoneyRequired({ msg: "Custom error message", msgType: MsgType.Message });
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
            const schema = MoneyAmount({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 8 });
            expect(schema.parse(0.00000001)).toBe(0.00000001);
        });

        it("should handle very large amounts", () => {
            const schema = MoneyAmount();
            expect(schema.parse(999999999.99)).toBe(999999999.99);
        });

        it("should handle different decimal place requirements", () => {
            const schemas = [
                MoneyAmount({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 0 }),
                MoneyAmount({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 1 }),
                MoneyAmount({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 2 }),
                MoneyAmount({ msg: "Amount", msgType: MsgType.FieldName, maxDecimals: 4 }),
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
            const schema = MoneyAmountFromString();
            expect(schema.parse("10")).toBe(10);
            expect(schema.parse("10.0")).toBe(10);
            expect(schema.parse("10.00")).toBe(10);
            expect(schema.parse("0.01")).toBe(0.01);
        });
    });

    // Tests for Money Schema String Parameter Overloads
    describe("Money Schema String Parameter Overloads", () => {
        describe("CurrencyCode overloads", () => {
            it("should work with string parameter (new simple syntax)", () => {
                const schema = CurrencyCode('Currency Code');
                
                // Should work with valid values
                expect(schema.parse('USD')).toBe('USD');
                expect(schema.parse('EUR')).toBe('EUR');
                expect(schema.parse('GBP')).toBe('GBP');
                
                // Should use the string as field name in error messages
                try {
                    schema.parse('INVALID');
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Currency Code');
                }
            });

            it("should still work with options object (backward compatibility)", () => {
                const schema = CurrencyCode({ msg: 'Payment Currency', msgType: MsgType.FieldName });
                
                expect(schema.parse('USD')).toBe('USD');
                try {
                    schema.parse('INVALID');
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Payment Currency');
                }
            });

            it("should work with no parameters (default usage)", () => {
                const schema = CurrencyCode();
                
                expect(schema.parse('USD')).toBe('USD');
                try {
                    schema.parse('INVALID');
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Currency');
                }
            });
        });

        describe("MoneyAmount overloads", () => {
            it("should work with string parameter", () => {
                const schema = MoneyAmount('Product Price');
                
                expect(schema.parse(99.99)).toBe(99.99);
                expect(schema.parse(1.50)).toBe(1.50);
                
                // Should use the string as field name in error messages
                try {
                    schema.parse(-10);
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Product Price');
                }
            });

            it("should still work with options object", () => {
                const schema = MoneyAmount({ msg: 'Item Cost', maxDecimals: 3 });
                
                expect(schema.parse(99.999)).toBe(99.999);
                try {
                    schema.parse(99.9999);
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Item Cost');
                }
            });
        });

        describe("MoneyAmountFromString overloads", () => {
            it("should work with string parameter", () => {
                const schema = MoneyAmountFromString('String Price');
                
                expect(schema.parse('99.99')).toBe(99.99);
                expect(schema.parse('1.50')).toBe(1.50);
                
                try {
                    schema.parse('invalid');
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('String Price');
                }
            });

            it("should still work with options object", () => {
                const schema = MoneyAmountFromString({ msg: 'Form Amount', maxDecimals: 4 });
                
                expect(schema.parse('99.9999')).toBe(99.9999);
                try {
                    schema.parse('99.99999');
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Form Amount');
                }
            });
        });

        describe("MoneyOptional overloads", () => {
            it("should work with string parameter", () => {
                const schema = MoneyOptional('Optional Payment');
                
                const validMoney = { amount: 99.99, currency: "USD" };
                expect(schema.parse(validMoney)).toEqual(validMoney);
                expect(schema.parse(undefined)).toBeUndefined();
                
                try {
                    schema.parse({ amount: -10, currency: "USD" });
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Amount');
                }
            });

            it("should still work with options object", () => {
                const schema = MoneyOptional({ msg: 'Purchase Amount', maxDecimals: 3 });
                
                const validMoney = { amount: 99.999, currency: "USD" };
                expect(schema.parse(validMoney)).toEqual(validMoney);
                
                try {
                    schema.parse({ amount: 99.9999, currency: "USD" });
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Amount');
                }
            });
        });

        describe("MoneyRequired overloads", () => {
            it("should work with string parameter", () => {
                const schema = MoneyRequired('Required Payment');
                
                const validMoney = { amount: 99.99, currency: "USD" };
                expect(schema.parse(validMoney)).toEqual(validMoney);
                
                try {
                    schema.parse(undefined);
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Required Payment');
                }
            });

            it("should still work with options object", () => {
                const schema = MoneyRequired({ msg: 'Order Total', maxDecimals: 4 });
                
                const validMoney = { amount: 99.9999, currency: "USD" };
                expect(schema.parse(validMoney)).toEqual(validMoney);
                
                try {
                    schema.parse({ amount: 99.99999, currency: "USD" });
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Amount');
                }
            });
        });

        describe("MoneyFromString overloads", () => {
            it("should work with string parameter", () => {
                const schema = MoneyFromString('Form Money');
                
                const validInput = { amount: "99.99", currency: "USD" };
                const expected = { amount: 99.99, currency: "USD" };
                expect(schema.parse(validInput)).toEqual(expected);
                
                try {
                    schema.parse({ amount: "invalid", currency: "USD" });
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Amount');
                }
            });

            it("should still work with options object", () => {
                const schema = MoneyFromString({ msg: 'Input Money', maxDecimals: 3 });
                
                const validInput = { amount: "99.999", currency: "USD" };
                const expected = { amount: 99.999, currency: "USD" };
                expect(schema.parse(validInput)).toEqual(expected);
                
                try {
                    schema.parse({ amount: "99.9999", currency: "USD" });
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Amount');
                }
            });
        });

        describe("Price overloads", () => {
            it("should work with string parameter for options", () => {
                const schema = Price('USD', 'Product Price');
                
                const result = schema.parse(99.99);
                expect(result).toEqual({ amount: 99.99, currency: 'USD' });
                
                try {
                    schema.parse(-10);
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Product Price');
                }
            });

            it("should still work with options object", () => {
                const schema = Price('EUR', { msg: 'Item Price', maxDecimals: 3 });
                
                const result = schema.parse(99.999);
                expect(result).toEqual({ amount: 99.999, currency: 'EUR' });
                
                try {
                    schema.parse(99.9999);
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Item Price');
                }
            });

            it("should work with just currency parameter", () => {
                const schema = Price('GBP');
                
                const result = schema.parse(50.99);
                expect(result).toEqual({ amount: 50.99, currency: 'GBP' });
                
                try {
                    schema.parse(-10);
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Price');
                }
            });
        });

        describe("PriceRange overloads", () => {
            it("should work with string parameter for options", () => {
                const schema = PriceRange('USD', 'Price Range');
                
                const validRange = { min: 10.00, max: 100.00 };
                const expected = {
                    min: { amount: 10.00, currency: 'USD' },
                    max: { amount: 100.00, currency: 'USD' }
                };
                expect(schema.parse(validRange)).toEqual(expected);
                
                try {
                    schema.parse({ min: 100.00, max: 10.00 });
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Price Range');
                }
            });

            it("should still work with options object", () => {
                const schema = PriceRange('EUR', { msg: 'Cost Range', maxDecimals: 3 });
                
                const validRange = { min: 10.999, max: 100.999 };
                const expected = {
                    min: { amount: 10.999, currency: 'EUR' },
                    max: { amount: 100.999, currency: 'EUR' }
                };
                expect(schema.parse(validRange)).toEqual(expected);
                
                try {
                    schema.parse({ min: 10.9999, max: 100.999 });
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Minimum Price');
                }
            });

            it("should work with just currency parameter", () => {
                const schema = PriceRange('JPY');
                
                const validRange = { min: 1000, max: 10000 };
                const expected = {
                    min: { amount: 1000, currency: 'JPY' },
                    max: { amount: 10000, currency: 'JPY' }
                };
                expect(schema.parse(validRange)).toEqual(expected);
                
                try {
                    schema.parse({ min: 10000, max: 1000 });
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Price Range');
                }
            });
        });

        describe("Real-world usage examples", () => {
            it("should handle e-commerce pricing with overloaded schemas", () => {
                const productPriceSchema = Price('USD', 'Product Price');
                const discountSchema = MoneyAmount('Discount Amount');
                const totalSchema = MoneyRequired('Order Total');
                
                // Valid usage
                expect(productPriceSchema.parse(29.99)).toEqual({ amount: 29.99, currency: 'USD' });
                expect(discountSchema.parse(5.00)).toBe(5.00);
                expect(totalSchema.parse({ amount: 24.99, currency: 'USD' })).toEqual({ amount: 24.99, currency: 'USD' });
                
                // Invalid usage with proper error messages
                try {
                    productPriceSchema.parse(-10);
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Product Price');
                }
                
                try {
                    discountSchema.parse(0);
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Discount Amount');
                }
                
                try {
                    totalSchema.parse(undefined);
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Order Total');
                }
            });

            it("should handle financial form validation", () => {
                const currencySchema = CurrencyCode('Payment Currency');
                const amountSchema = MoneyAmountFromString('Payment Amount');
                const priceRangeSchema = PriceRange('USD', 'Budget Range');
                
                // Valid form data
                expect(currencySchema.parse('EUR')).toBe('EUR');
                expect(amountSchema.parse('1500.50')).toBe(1500.50);
                expect(priceRangeSchema.parse({ min: 100, max: 2000 })).toEqual({
                    min: { amount: 100, currency: 'USD' },
                    max: { amount: 2000, currency: 'USD' }
                });
                
                // Invalid form data
                try {
                    currencySchema.parse('INVALID');
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Payment Currency');
                }
                
                try {
                    amountSchema.parse('not-a-number');
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Payment Amount');
                }
                
                try {
                    priceRangeSchema.parse({ min: 2000, max: 100 });
                    fail('Should have thrown an error');
                } catch (error: any) {
                    expect(error.issues[0].message).toContain('Budget Range');
                }
            });

            it("should maintain type safety across all overloaded schemas", () => {
                // Compile-time test to ensure all schemas work with both syntax types
                const currencySchema1 = CurrencyCode('Base Currency');
                const currencySchema2 = CurrencyCode({ msg: 'Quote Currency', msgType: MsgType.FieldName });
                const moneySchema1 = MoneyRequired('Transaction Amount');
                const moneySchema2 = MoneyRequired({ msg: 'Settlement Amount', maxDecimals: 4 });
                const priceSchema1 = Price('USD', 'Unit Price');
                const priceSchema2 = Price('EUR', { msg: 'Base Price', maxDecimals: 3 });
                
                // All should return the same schema type and work correctly
                expect(typeof currencySchema1.parse).toBe('function');
                expect(typeof currencySchema2.parse).toBe('function');
                expect(typeof moneySchema1.parse).toBe('function');
                expect(typeof moneySchema2.parse).toBe('function');
                expect(typeof priceSchema1.parse).toBe('function');
                expect(typeof priceSchema2.parse).toBe('function');
                
                expect(currencySchema1.parse('USD')).toBe('USD');
                expect(currencySchema2.parse('EUR')).toBe('EUR');
                expect(moneySchema1.parse({ amount: 100, currency: 'USD' })).toEqual({ amount: 100, currency: 'USD' });
                expect(moneySchema2.parse({ amount: 100.1234, currency: 'EUR' })).toEqual({ amount: 100.1234, currency: 'EUR' });
                expect(priceSchema1.parse(50)).toEqual({ amount: 50, currency: 'USD' });
                expect(priceSchema2.parse(75.123)).toEqual({ amount: 75.123, currency: 'EUR' });
            });
        });
    });
});
