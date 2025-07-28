import { 
  zNumberOptional, 
  zNumberRequired, 
  zNumberStringOptional, 
  zNumberStringRequired,
  zIntegerRequired,
  zIntegerOptional,
  zPositiveRequired,
  zPositiveOptional,
  zNegativeRequired,
  zNegativeOptional,
  zNonNegativeRequired,
  zNonNegativeOptional,
  zNonPositiveRequired,
  zNonPositiveOptional,
  zFiniteRequired,
  zFiniteOptional,
  zSafeIntegerRequired,
  zSafeIntegerOptional
} from "../src/schemas/number-schemas";
import { MsgType } from '../src/common/types/msg-type';
import { createTestMessageHandler } from '../src/localization/types/message-handler.types';

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
      const schema = zNumberOptional({ msg: "Value" });
      expect(schema.parse("78.9")).toEqual(78.9);
      expect(schema.parse(123.45)).toEqual(123.45);
    });

    it("should throw error for invalid optional input", () => {
      const schema = zNumberOptional();
      expect(() => schema.parse("abc")).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it("should validate with min/max constraints", () => {
      const schema = zNumberOptional({ msg: "Value", min: 10, max: 100 });
      expect(schema.parse(50)).toEqual(50);
      expect(() => schema.parse(5)).toThrow();
      expect(() => schema.parse(150)).toThrow();
    });

    it("should validate with only min constraint", () => {
      const schema = zNumberOptional({ msg: "Value", min: 10 });
      expect(schema.parse(15)).toEqual(15);
      expect(() => schema.parse(5)).toThrow();
    });

    it("should validate with only max constraint", () => {
      const schema = zNumberOptional({ msg: "Value", max: 100 });
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
      const schema = zNumberRequired({ msg: "Value" });
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
      const schema = zNumberRequired({ msg: "Value", min: 10, max: 100 });
      expect(schema.parse(50)).toEqual(50);
      expect(() => schema.parse(5)).toThrow();
      expect(() => schema.parse(150)).toThrow();
    });

    it("should throw error for non-integer when integer required", () => {
      const schema = zIntegerRequired({ msg: "Value" });
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
      const schema = zNumberStringOptional({ msg: "Value" });
      expect(schema.parse("78.9")).toEqual("78.9");
      expect(schema.parse(123.45)).toEqual("123.45");
    });

    it("should throw error for invalid optional input as string", () => {
      const schema = zNumberStringOptional();
      expect(() => schema.parse("abc")).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it("should validate with min/max constraints as string", () => {
      const schema = zNumberStringOptional({ msg: "Value", min: 10, max: 100 });
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
      const schema = zNumberStringRequired({ msg: "Value" });
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
      const schema = zNumberStringRequired({ msg: "Value", min: 10, max: 100 });
      expect(schema.parse(50)).toEqual("50");
      expect(() => schema.parse(5)).toThrow();
      expect(() => schema.parse(150)).toThrow();
    });

    it("should throw error for non-integer when integer required as string", () => {
      const schema = zIntegerRequired({ msg: "Value" });
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
      const schema = zNumberOptional({ msg: "Value" });
      expect(schema.parse(1.23e-4)).toEqual(1.23e-4);
      expect(schema.parse(123.45)).toEqual(123.45);
    });

    it("should handle very large numbers", () => {
      const schema = zNumberOptional({ msg: "Value" });
      expect(schema.parse(Number.MAX_SAFE_INTEGER)).toEqual(Number.MAX_SAFE_INTEGER);
      expect(schema.parse(String(Number.MAX_SAFE_INTEGER))).toEqual(Number.MAX_SAFE_INTEGER);
    });

    it("should handle decimal strings for float", () => {
      const schema = zNumberOptional({ msg: "Value" });
      expect(schema.parse("123.456")).toEqual(123.456);
      expect(schema.parse("0.1")).toEqual(0.1);
    });

    it("should throw error for invalid decimal format", () => {
      const schema = zNumberOptional({ msg: "Value" });
      expect(() => schema.parse("123.456.789")).toThrow();
      expect(() => schema.parse("123.")).toThrow();
    });
  });

  // Tests for error messages
  describe("Error Messages", () => {
    it("should provide custom error message for integer constraint", () => {
      const schema = zNumberRequired({ msg: "Age", min: 0, max: 150 });
      try {
        schema.parse(200);
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.issues[0].message).toContain("Age");
      }
    });

    it("should provide custom error message for float constraint", () => {
      const schema = zNumberRequired({ msg: "Price", min: 0.01 });
      try {
        schema.parse(0);
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.issues[0].message).toContain("Price");
      }
    });

    it("should provide custom error message for max constraint only", () => {
      const schema = zNumberRequired({ msg: "Discount", max: 100 });
      try {
        schema.parse(150);
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.issues[0].message).toContain("Discount");
      }
    });
  });

  // Tests for new Zod-based schemas
  describe("zIntegerRequired", () => {
    it("should accept integer values", () => {
      const schema = zIntegerRequired();
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse("456")).toEqual(456);
      expect(schema.parse(-789)).toEqual(-789);
    });

    it("should reject decimal values", () => {
      const schema = zIntegerRequired();
      expect(() => schema.parse(123.45)).toThrow();
      expect(() => schema.parse("123.45")).toThrow();
    });
  });

  describe("zPositiveRequired", () => {
    it("should accept positive values", () => {
      const schema = zPositiveRequired();
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse("456.78")).toEqual(456.78);
    });

    it("should reject zero and negative values", () => {
      const schema = zPositiveRequired();
      expect(() => schema.parse(0)).toThrow();
      expect(() => schema.parse(-1)).toThrow();
    });
  });

  describe("zNegativeRequired", () => {
    it("should accept negative values", () => {
      const schema = zNegativeRequired();
      expect(schema.parse(-123)).toEqual(-123);
      expect(schema.parse("-456.78")).toEqual(-456.78);
    });

    it("should reject zero and positive values", () => {
      const schema = zNegativeRequired();
      expect(() => schema.parse(0)).toThrow();
      expect(() => schema.parse(1)).toThrow();
    });
  });

  describe("zNonNegativeRequired", () => {
    it("should accept zero and positive values", () => {
      const schema = zNonNegativeRequired();
      expect(schema.parse(0)).toEqual(0);
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse("456.78")).toEqual(456.78);
    });

    it("should reject negative values", () => {
      const schema = zNonNegativeRequired();
      expect(() => schema.parse(-1)).toThrow();
      expect(() => schema.parse("-0.01")).toThrow();
    });
  });

  describe("zNonPositiveRequired", () => {
    it("should accept zero and negative values", () => {
      const schema = zNonPositiveRequired();
      expect(schema.parse(0)).toEqual(0);
      expect(schema.parse(-123)).toEqual(-123);
      expect(schema.parse("-456.78")).toEqual(-456.78);
    });

    it("should reject positive values", () => {
      const schema = zNonPositiveRequired();
      expect(() => schema.parse(1)).toThrow();
      expect(() => schema.parse("0.01")).toThrow();
    });
  });

  describe("zFiniteRequired", () => {
    it("should accept finite numbers", () => {
      const schema = zFiniteRequired();
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse(-456.78)).toEqual(-456.78);
      expect(schema.parse(0)).toEqual(0);
    });

    it("should reject Infinity and -Infinity", () => {
      const schema = zFiniteRequired();
      expect(() => schema.parse(Infinity)).toThrow();
      expect(() => schema.parse(-Infinity)).toThrow();
    });
  });

  describe("zSafeIntegerRequired", () => {
    it("should accept safe integers", () => {
      const schema = zSafeIntegerRequired();
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse(Number.MAX_SAFE_INTEGER)).toEqual(Number.MAX_SAFE_INTEGER);
      expect(schema.parse(Number.MIN_SAFE_INTEGER)).toEqual(Number.MIN_SAFE_INTEGER);
    });

    it("should reject unsafe integers", () => {
      const schema = zSafeIntegerRequired();
      expect(() => schema.parse(Number.MAX_SAFE_INTEGER + 1)).toThrow();
      expect(() => schema.parse(Number.MIN_SAFE_INTEGER - 1)).toThrow();
    });
  });

  // Tests for optional variants
  describe("Optional schemas", () => {
    it("should accept undefined for all optional schemas", () => {
      expect(zIntegerOptional().parse(undefined)).toBeUndefined();
      expect(zPositiveOptional().parse(undefined)).toBeUndefined();
      expect(zNegativeOptional().parse(undefined)).toBeUndefined();
      expect(zNonNegativeOptional().parse(undefined)).toBeUndefined();
      expect(zNonPositiveOptional().parse(undefined)).toBeUndefined();
      expect(zFiniteOptional().parse(undefined)).toBeUndefined();
      expect(zSafeIntegerOptional().parse(undefined)).toBeUndefined();
    });

    it("should work the same as required variants for valid values", () => {
      expect(zIntegerOptional().parse(123)).toEqual(123);
      expect(zPositiveOptional().parse(456)).toEqual(456);
      expect(zNegativeOptional().parse(-789)).toEqual(-789);
      expect(zNonNegativeOptional().parse(0)).toEqual(0);
      expect(zNonPositiveOptional().parse(-1)).toEqual(-1);
      expect(zFiniteOptional().parse(123.45)).toEqual(123.45);
      expect(zSafeIntegerOptional().parse(Number.MAX_SAFE_INTEGER)).toEqual(Number.MAX_SAFE_INTEGER);
    });
  });
});

