import { normalizeUSPhone, phoneTransformAndValidate, phoneRefine } from "../src/utils/phone-utils";
import { PhoneFormat } from "../src/schemas/phone-schemas";

describe("phone-utils", () => {
  describe("normalizeUSPhone", () => {
    it("should normalize 10-digit number to E.164", () => {
      expect(normalizeUSPhone("1234567890")).toBe("+11234567890");
    });
    it("should normalize 11-digit number to E.164", () => {
      expect(normalizeUSPhone("11234567890")).toBe("+11234567890");
    });
    it("should keep valid E.164 format", () => {
      expect(normalizeUSPhone("+11234567890")).toBe("+11234567890");
    });
    it("should handle formatted numbers", () => {
      expect(normalizeUSPhone("(123) 456-7890")).toBe("+11234567890");
    });
    it("should return null for invalid input", () => {
      expect(normalizeUSPhone("123")).toBeNull();
    });
    it("should return null for non-US country code", () => {
      expect(normalizeUSPhone("+44123456789")).toBeNull();
    });
    it("should normalize to national format", () => {
      expect(normalizeUSPhone("1234567890", PhoneFormat.National)).toBe("1234567890");
      expect(normalizeUSPhone("+11234567890", PhoneFormat.National)).toBe("1234567890");
      expect(normalizeUSPhone("11234567890", PhoneFormat.National)).toBe("1234567890");
    });
  });

  describe("phoneTransformAndValidate", () => {
    it("should transform valid phone number", () => {
      expect(phoneTransformAndValidate("1234567890")).toBe("+11234567890");
    });
    it("should return undefined for empty string", () => {
      expect(phoneTransformAndValidate("")).toBeUndefined();
    });
    it("should return undefined for whitespace", () => {
      expect(phoneTransformAndValidate("   ")).toBeUndefined();
    });
    it("should return null for invalid input", () => {
      expect(phoneTransformAndValidate("123")).toBeNull();
    });
  });

  describe("phoneRefine", () => {
    it("should validate E.164 format", () => {
      expect(phoneRefine("+11234567890")).toBe(true);
    });
    it("should reject national format when E.164 expected", () => {
      expect(phoneRefine("1234567890")).toBe(false);
    });
    it("should return true for undefined", () => {
      expect(phoneRefine(undefined)).toBe(true);
    });
    it("should return false for invalid format", () => {
      expect(phoneRefine("123")).toBe(false);
    });
    it("should validate national format", () => {
      expect(phoneRefine("1234567890", PhoneFormat.National)).toBe(true);
    });
    it("should reject E.164 format when national expected", () => {
      expect(phoneRefine("+11234567890", PhoneFormat.National)).toBe(false);
    });
  });
});
