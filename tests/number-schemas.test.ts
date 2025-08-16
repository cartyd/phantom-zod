import { 
  NumberOptional, 
  NumberRequired, 
  NumberStringOptional, 
  NumberStringRequired,
  IntegerRequired,
  IntegerOptional,
  PositiveRequired,
  PositiveOptional,
  NegativeRequired,
  NegativeOptional,
  NonNegativeRequired,
  NonNegativeOptional,
  NonPositiveRequired,
  NonPositiveOptional,
  FiniteRequired,
  FiniteOptional,
  SafeIntegerRequired,
  SafeIntegerOptional
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
  // Tests for NumberOptional
  describe("NumberOptional", () => {
    it("should parse valid optional integer", () => {
      const schema = NumberOptional();
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse("456")).toEqual(456);
      expect(schema.parse(undefined)).toEqual(undefined);
    });

    it("should parse valid optional float", () => {
      const schema = NumberOptional({ msg: "Value" });
      expect(schema.parse("78.9")).toEqual(78.9);
      expect(schema.parse(123.45)).toEqual(123.45);
    });

    it("should throw error for invalid optional input", () => {
      const schema = NumberOptional();
      expect(() => schema.parse("abc")).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it("should validate with min/max constraints", () => {
      const schema = NumberOptional({ msg: "Value", min: 10, max: 100 });
      expect(schema.parse(50)).toEqual(50);
      expect(() => schema.parse(5)).toThrow();
      expect(() => schema.parse(150)).toThrow();
    });

    it("should validate with only min constraint", () => {
      const schema = NumberOptional({ msg: "Value", min: 10 });
      expect(schema.parse(15)).toEqual(15);
      expect(() => schema.parse(5)).toThrow();
    });

    it("should validate with only max constraint", () => {
      const schema = NumberOptional({ msg: "Value", max: 100 });
      expect(schema.parse(50)).toEqual(50);
      expect(() => schema.parse(150)).toThrow();
    });
  });

  // Tests for NumberRequired
  describe("NumberRequired", () => {
    it("should parse valid required integer", () => {
      const schema = NumberRequired();
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse("456")).toEqual(456);
    });

    it("should parse valid required float", () => {
      const schema = NumberRequired({ msg: "Value" });
      expect(schema.parse("78.9")).toEqual(78.9);
      expect(schema.parse(123.45)).toEqual(123.45);
    });

    it("should throw error for invalid required input", () => {
      const schema = NumberRequired();
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse("abc")).toThrow();
    });

    it("should validate with min/max constraints", () => {
      const schema = NumberRequired({ msg: "Value", min: 10, max: 100 });
      expect(schema.parse(50)).toEqual(50);
      expect(() => schema.parse(5)).toThrow();
      expect(() => schema.parse(150)).toThrow();
    });

    it("should throw error for non-integer when integer required", () => {
      const schema = IntegerRequired({ msg: "Value" });
      expect(() => schema.parse(123.45)).toThrow();
      expect(() => schema.parse("123.45")).toThrow();
    });
  });

  // Tests for NumberStringOptional
  describe("NumberStringOptional", () => {
    it("should parse valid optional integer as string", () => {
      const schema = NumberStringOptional();
      expect(schema.parse(123)).toEqual("123");
      expect(schema.parse("456")).toEqual("456");
      expect(schema.parse(undefined)).toEqual(undefined);
    });

    it("should parse valid optional float as string", () => {
      const schema = NumberStringOptional({ msg: "Value" });
      expect(schema.parse("78.9")).toEqual("78.9");
      expect(schema.parse(123.45)).toEqual("123.45");
    });

    it("should throw error for invalid optional input as string", () => {
      const schema = NumberStringOptional();
      expect(() => schema.parse("abc")).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it("should validate with min/max constraints as string", () => {
      const schema = NumberStringOptional({ msg: "Value", min: 10, max: 100 });
      expect(schema.parse(50)).toEqual("50");
      expect(() => schema.parse(5)).toThrow();
      expect(() => schema.parse(150)).toThrow();
    });
  });

  // Tests for NumberStringRequired
  describe("NumberStringRequired", () => {
    it("should parse valid required integer as string", () => {
      const schema = NumberStringRequired();
      expect(schema.parse(123)).toEqual("123");
      expect(schema.parse("456")).toEqual("456");
    });

    it("should parse valid required float as string", () => {
      const schema = NumberStringRequired({ msg: "Value" });
      expect(schema.parse("78.9")).toEqual("78.9");
      expect(schema.parse(123.45)).toEqual("123.45");
    });

    it("should throw error for invalid required input as string", () => {
      const schema = NumberStringRequired();
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse(null)).toThrow();
      expect(() => schema.parse("abc")).toThrow();
    });

    it("should validate with min/max constraints as string", () => {
      const schema = NumberStringRequired({ msg: "Value", min: 10, max: 100 });
      expect(schema.parse(50)).toEqual("50");
      expect(() => schema.parse(5)).toThrow();
      expect(() => schema.parse(150)).toThrow();
    });

    it("should throw error for non-integer when integer required as string", () => {
      const schema = IntegerRequired({ msg: "Value" });
      expect(() => schema.parse(123.45)).toThrow();
      expect(() => schema.parse("123.45")).toThrow();
    });
  });

  // Tests for edge cases
  describe("Edge Cases", () => {
    it("should handle negative numbers", () => {
      const schema = NumberOptional();
      expect(schema.parse(-123)).toEqual(-123);
      expect(schema.parse("-456")).toEqual(-456);
    });

    it("should handle zero", () => {
      const schema = NumberOptional();
      expect(schema.parse(0)).toEqual(0);
      expect(schema.parse("0")).toEqual(0);
    });

    it("should throw error for empty string in optional", () => {
      const schema = NumberOptional();
      expect(() => schema.parse("")).toThrow();
    });

    it("should throw error for empty string in required", () => {
      const schema = NumberRequired();
      expect(() => schema.parse("")).toThrow();
    });

    it("should handle scientific notation for float", () => {
      const schema = NumberOptional({ msg: "Value" });
      expect(schema.parse(1.23e-4)).toEqual(1.23e-4);
      expect(schema.parse(123.45)).toEqual(123.45);
    });

    it("should handle very large numbers", () => {
      const schema = NumberOptional({ msg: "Value" });
      expect(schema.parse(Number.MAX_SAFE_INTEGER)).toEqual(Number.MAX_SAFE_INTEGER);
      expect(schema.parse(String(Number.MAX_SAFE_INTEGER))).toEqual(Number.MAX_SAFE_INTEGER);
    });

    it("should handle decimal strings for float", () => {
      const schema = NumberOptional({ msg: "Value" });
      expect(schema.parse("123.456")).toEqual(123.456);
      expect(schema.parse("0.1")).toEqual(0.1);
    });

    it("should throw error for invalid decimal format", () => {
      const schema = NumberOptional({ msg: "Value" });
      expect(() => schema.parse("123.456.789")).toThrow();
      expect(() => schema.parse("123.")).toThrow();
    });
  });

  // Tests for error messages
  describe("Error Messages", () => {
    it("should provide custom error message for integer constraint", () => {
      const schema = NumberRequired({ msg: "Age", min: 0, max: 150 });
      try {
        schema.parse(200);
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.issues[0].message).toContain("Age");
      }
    });

    it("should provide custom error message for float constraint", () => {
      const schema = NumberRequired({ msg: "Price", min: 0.01 });
      try {
        schema.parse(0);
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.issues[0].message).toContain("Price");
      }
    });

    it("should provide custom error message for max constraint only", () => {
      const schema = NumberRequired({ msg: "Discount", max: 100 });
      try {
        schema.parse(150);
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.issues[0].message).toContain("Discount");
      }
    });
  });

  // Tests for new Zod-based schemas
  describe("IntegerRequired", () => {
    it("should accept integer values", () => {
      const schema = IntegerRequired();
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse("456")).toEqual(456);
      expect(schema.parse(-789)).toEqual(-789);
    });

    it("should reject decimal values", () => {
      const schema = IntegerRequired();
      expect(() => schema.parse(123.45)).toThrow();
      expect(() => schema.parse("123.45")).toThrow();
    });
  });

  describe("PositiveRequired", () => {
    it("should accept positive values", () => {
      const schema = PositiveRequired();
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse("456.78")).toEqual(456.78);
    });

    it("should reject zero and negative values", () => {
      const schema = PositiveRequired();
      expect(() => schema.parse(0)).toThrow();
      expect(() => schema.parse(-1)).toThrow();
    });
  });

  describe("NegativeRequired", () => {
    it("should accept negative values", () => {
      const schema = NegativeRequired();
      expect(schema.parse(-123)).toEqual(-123);
      expect(schema.parse("-456.78")).toEqual(-456.78);
    });

    it("should reject zero and positive values", () => {
      const schema = NegativeRequired();
      expect(() => schema.parse(0)).toThrow();
      expect(() => schema.parse(1)).toThrow();
    });
  });

  describe("NonNegativeRequired", () => {
    it("should accept zero and positive values", () => {
      const schema = NonNegativeRequired();
      expect(schema.parse(0)).toEqual(0);
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse("456.78")).toEqual(456.78);
    });

    it("should reject negative values", () => {
      const schema = NonNegativeRequired();
      expect(() => schema.parse(-1)).toThrow();
      expect(() => schema.parse("-0.01")).toThrow();
    });
  });

  describe("NonPositiveRequired", () => {
    it("should accept zero and negative values", () => {
      const schema = NonPositiveRequired();
      expect(schema.parse(0)).toEqual(0);
      expect(schema.parse(-123)).toEqual(-123);
      expect(schema.parse("-456.78")).toEqual(-456.78);
    });

    it("should reject positive values", () => {
      const schema = NonPositiveRequired();
      expect(() => schema.parse(1)).toThrow();
      expect(() => schema.parse("0.01")).toThrow();
    });
  });

  describe("FiniteRequired", () => {
    it("should accept finite numbers", () => {
      const schema = FiniteRequired();
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse(-456.78)).toEqual(-456.78);
      expect(schema.parse(0)).toEqual(0);
    });

    it("should reject Infinity and -Infinity", () => {
      const schema = FiniteRequired();
      expect(() => schema.parse(Infinity)).toThrow();
      expect(() => schema.parse(-Infinity)).toThrow();
    });
  });

  describe("SafeIntegerRequired", () => {
    it("should accept safe integers", () => {
      const schema = SafeIntegerRequired();
      expect(schema.parse(123)).toEqual(123);
      expect(schema.parse(Number.MAX_SAFE_INTEGER)).toEqual(Number.MAX_SAFE_INTEGER);
      expect(schema.parse(Number.MIN_SAFE_INTEGER)).toEqual(Number.MIN_SAFE_INTEGER);
    });

    it("should reject unsafe integers", () => {
      const schema = SafeIntegerRequired();
      expect(() => schema.parse(Number.MAX_SAFE_INTEGER + 1)).toThrow();
      expect(() => schema.parse(Number.MIN_SAFE_INTEGER - 1)).toThrow();
    });
  });

  // Tests for optional variants
  describe("Optional schemas", () => {
    it("should accept undefined for all optional schemas", () => {
      expect(IntegerOptional().parse(undefined)).toBeUndefined();
      expect(PositiveOptional().parse(undefined)).toBeUndefined();
      expect(NegativeOptional().parse(undefined)).toBeUndefined();
      expect(NonNegativeOptional().parse(undefined)).toBeUndefined();
      expect(NonPositiveOptional().parse(undefined)).toBeUndefined();
      expect(FiniteOptional().parse(undefined)).toBeUndefined();
      expect(SafeIntegerOptional().parse(undefined)).toBeUndefined();
    });

    it("should work the same as required variants for valid values", () => {
      expect(IntegerOptional().parse(123)).toEqual(123);
      expect(PositiveOptional().parse(456)).toEqual(456);
      expect(NegativeOptional().parse(-789)).toEqual(-789);
      expect(NonNegativeOptional().parse(0)).toEqual(0);
      expect(NonPositiveOptional().parse(-1)).toEqual(-1);
      expect(FiniteOptional().parse(123.45)).toEqual(123.45);
      expect(SafeIntegerOptional().parse(Number.MAX_SAFE_INTEGER)).toEqual(Number.MAX_SAFE_INTEGER);
    });
  });
});

