import { createNumberSchemas, NumberFieldType, NumberFieldRequirement } from "../src/schemas/number-schemas";
import { MsgType } from '../src/schemas/msg-type';
import { createTestMessageHandler } from '../src/common/message-handler.types';

// Create a type-safe mock using the test helper
const mockMessageHandler = createTestMessageHandler(
  // Custom mock implementation (optional)
  (options) => {
    if (options.msgType === MsgType.Message) {
      return options.msg;
    }
    
    // Simple mock implementation for field name formatting
    switch (options.messageKey) {
      case "invalid":
        return `${options.msg} is invalid`;
      default:
        return `${options.msg} is invalid`;
    }
  }
);

// Create schema functions with injected message handler
const { zNumberOptional, zNumberRequired, zNumberStringOptional, zNumberStringRequired } = createNumberSchemas(mockMessageHandler);

describe("Number Schemas", () => {
  // Tests for zNumberOptional
  describe("zNumberOptional", () => {
    it("should parse valid optional integer", () => {
      const schema = zNumberOptional();
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse("456")).toEqual(456);
      expect(schema.parse(undefined)).toEqual(undefined);
    });

    it("should parse valid optional float", () => {
      const schema = zNumberOptional({ msg: "Value", type: NumberFieldType.Float });
      expect(schema.parse("78.9")).toEqual(78.9);
      expect(schema.parse(123.45)).toEqual(123.45);
    });

    it("should throw error for invalid optional input", () => {
      const schema = zNumberOptional();
      expect(() => schema.parse("abc")).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it("should validate with min/max constraints", () => {
      const schema = zNumberOptional({ msg: "Value", type: NumberFieldType.Integer, min: 10, max: 100 });
      expect(schema.parse(50)).toEqual(50);
      expect(() => schema.parse(5)).toThrow();
      expect(() => schema.parse(150)).toThrow();
    });

    it("should validate with only min constraint", () => {
      const schema = zNumberOptional({ msg: "Value", type: NumberFieldType.Integer, min: 10 });
      expect(schema.parse(15)).toEqual(15);
      expect(() => schema.parse(5)).toThrow();
    });

    it("should validate with only max constraint", () => {
      const schema = zNumberOptional({ msg: "Value", type: NumberFieldType.Integer, max: 100 });
      expect(schema.parse(50)).toEqual(50);
      expect(() => schema.parse(150)).toThrow();
    });
  });

  // Tests for zNumberRequired
  describe("zNumberRequired", () => {
    it("should parse valid required integer", () => {
      const schema = zNumberRequired();
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse("456")).toEqual(456);
    });

    it("should parse valid required float", () => {
      const schema = zNumberRequired({ msg: "Value", type: NumberFieldType.Float });
      expect(schema.parse("78.9")).toEqual(78.9);
      expect(schema.parse(123.45)).toEqual(123.45);
    });

    it("should throw error for invalid required input", () => {
      const schema = zNumberRequired();
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse("abc")).toThrow();
    });

    it("should validate with min/max constraints", () => {
      const schema = zNumberRequired({ msg: "Value", type: NumberFieldType.Integer, min: 10, max: 100 });
      expect(schema.parse(50)).toEqual(50);
      expect(() => schema.parse(5)).toThrow();
      expect(() => schema.parse(150)).toThrow();
    });

    it("should throw error for non-integer when integer required", () => {
      const schema = zNumberRequired({ msg: "Value", type: NumberFieldType.Integer });
      expect(() => schema.parse(123.45)).toThrow();
      expect(() => schema.parse("123.45")).toThrow();
    });
  });

  // Tests for zNumberStringOptional
  describe("zNumberStringOptional", () => {
    it("should parse valid optional integer as string", () => {
      const schema = zNumberStringOptional();
      expect(schema.parse(123)).toEqual("123");
      expect(schema.parse("456")).toEqual("456");
      expect(schema.parse(undefined)).toEqual(undefined);
    });

    it("should parse valid optional float as string", () => {
      const schema = zNumberStringOptional({ msg: "Value", type: NumberFieldType.Float });
      expect(schema.parse("78.9")).toEqual("78.9");
      expect(schema.parse(123.45)).toEqual("123.45");
    });

    it("should throw error for invalid optional input as string", () => {
      const schema = zNumberStringOptional();
      expect(() => schema.parse("abc")).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it("should validate with min/max constraints as string", () => {
      const schema = zNumberStringOptional({ msg: "Value", type: NumberFieldType.Integer, min: 10, max: 100 });
      expect(schema.parse(50)).toEqual("50");
      expect(() => schema.parse(5)).toThrow();
      expect(() => schema.parse(150)).toThrow();
    });
  });

  // Tests for zNumberStringRequired
  describe("zNumberStringRequired", () => {
    it("should parse valid required integer as string", () => {
      const schema = zNumberStringRequired();
      expect(schema.parse(123)).toEqual("123");
      expect(schema.parse("456")).toEqual("456");
    });

    it("should parse valid required float as string", () => {
      const schema = zNumberStringRequired({ msg: "Value", type: NumberFieldType.Float });
      expect(schema.parse("78.9")).toEqual("78.9");
      expect(schema.parse(123.45)).toEqual("123.45");
    });

    it("should throw error for invalid required input as string", () => {
      const schema = zNumberStringRequired();
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse("abc")).toThrow();
    });

    it("should validate with min/max constraints as string", () => {
      const schema = zNumberStringRequired({ msg: "Value", type: NumberFieldType.Integer, min: 10, max: 100 });
      expect(schema.parse(50)).toEqual("50");
      expect(() => schema.parse(5)).toThrow();
      expect(() => schema.parse(150)).toThrow();
    });

    it("should throw error for non-integer when integer required as string", () => {
      const schema = zNumberStringRequired({ msg: "Value", type: NumberFieldType.Integer });
      expect(() => schema.parse(123.45)).toThrow();
      expect(() => schema.parse("123.45")).toThrow();
    });
  });

  // Tests for edge cases
  describe("Edge Cases", () => {
    it("should handle negative numbers", () => {
      const schema = zNumberOptional();
      expect(schema.parse(-123)).toEqual(-123);
      expect(schema.parse("-456")).toEqual(-456);
    });

    it("should handle zero", () => {
      const schema = zNumberOptional();
      expect(schema.parse(0)).toEqual(0);
      expect(schema.parse("0")).toEqual(0);
    });

    it("should throw error for empty string in optional", () => {
      const schema = zNumberOptional();
      expect(() => schema.parse("")).toThrow();
    });

    it("should throw error for empty string in required", () => {
      const schema = zNumberRequired();
      expect(() => schema.parse("")).toThrow();
    });

    it("should handle scientific notation for float", () => {
      const schema = zNumberOptional({ msg: "Value", type: NumberFieldType.Float });
      expect(schema.parse(1.23e-4)).toEqual(1.23e-4);
      expect(schema.parse(123.45)).toEqual(123.45);
    });

    it("should handle very large numbers", () => {
      const schema = zNumberOptional({ msg: "Value", type: NumberFieldType.Float });
      expect(schema.parse(Number.MAX_SAFE_INTEGER)).toEqual(Number.MAX_SAFE_INTEGER);
      expect(schema.parse(String(Number.MAX_SAFE_INTEGER))).toEqual(Number.MAX_SAFE_INTEGER);
    });

    it("should handle decimal strings for float", () => {
      const schema = zNumberOptional({ msg: "Value", type: NumberFieldType.Float });
      expect(schema.parse("123.456")).toEqual(123.456);
      expect(schema.parse("0.1")).toEqual(0.1);
    });

    it("should throw error for invalid decimal format", () => {
      const schema = zNumberOptional({ msg: "Value", type: NumberFieldType.Float });
      expect(() => schema.parse("123.456.789")).toThrow();
      expect(() => schema.parse("123.")).toThrow();
    });
  });

  // Tests for error messages
  describe("Error Messages", () => {
    it("should provide custom error message for integer constraint", () => {
      const schema = zNumberRequired({ msg: "Age", type: NumberFieldType.Integer, min: 0, max: 150 });
      try {
        schema.parse(200);
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.issues[0].message).toContain("Age is invalid");
      }
    });

    it("should provide custom error message for float constraint", () => {
      const schema = zNumberRequired({ msg: "Price", type: NumberFieldType.Float, min: 0.01 });
      try {
        schema.parse(0);
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.issues[0].message).toContain("Price is invalid");
      }
    });

    it("should provide custom error message for max constraint only", () => {
      const schema = zNumberRequired({ msg: "Discount", type: NumberFieldType.Float, max: 100 });
      try {
        schema.parse(150);
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.issues[0].message).toContain("Discount is invalid");
      }
    });
  });
});

