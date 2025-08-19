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

  // Tests for basic and specialized number schema string parameter overloads
  describe("Number Schema String Parameter Overloads", () => {
    describe("NumberOptional overloads", () => {
      it("should work with string parameter (new simple syntax)", () => {
        const schema = NumberOptional('Score');
        
        // Should work with valid values
        expect(schema.parse(123)).toBe(123);
        expect(schema.parse(123.45)).toBe(123.45);
        expect(schema.parse('456')).toBe(456);
        expect(schema.parse(undefined)).toBeUndefined();
        
        // Should use the string as field name in error messages
        expect(() => schema.parse('invalid')).toThrow('Score must be a number');
      });

      it("should still work with options object (backward compatibility)", () => {
        const schema = NumberOptional({ msg: 'Player Score', min: 0, max: 100 });
        
        expect(schema.parse(50)).toBe(50);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse(150)).toThrow('Player Score');
      });

      it("should work with no parameters (default usage)", () => {
        const schema = NumberOptional();
        
        expect(schema.parse(123)).toBe(123);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse('invalid')).toThrow('Value must be a number');
      });

      it("should work with constraints via options object", () => {
        const schema = NumberOptional({ msg: 'Limit', min: 1, max: 100 }).default(50);
        
        expect(schema.parse(25)).toBe(25);
        expect(schema.parse(undefined)).toBe(50);
        expect(() => schema.parse(150)).toThrow('Limit must be at most 100');
      });
    });

    describe("NumberRequired overloads", () => {
      it("should work with string parameter (new simple syntax)", () => {
        const schema = NumberRequired('Score');
        
        // Should work with valid values
        expect(schema.parse(123)).toBe(123);
        expect(schema.parse(123.45)).toBe(123.45);
        expect(schema.parse('456')).toBe(456);
        
        // Should use the string as field name in error messages
        expect(() => schema.parse('invalid')).toThrow('Score must be a number');
      });

      it("should still work with options object (backward compatibility)", () => {
        const schema = NumberRequired({ msg: 'Player Score', min: 0, max: 100 });
        
        expect(schema.parse(50)).toBe(50);
        expect(() => schema.parse(150)).toThrow('Player Score');
      });

      it("should work with no parameters (default usage)", () => {
        const schema = NumberRequired();
        
        expect(schema.parse(123)).toBe(123);
        expect(() => schema.parse('invalid')).toThrow('Value must be a number');
      });

      it("should work with constraints via options object", () => {
        const schema = NumberRequired({ msg: 'Limit', min: 1, max: 100 });
        
        expect(schema.parse(25)).toBe(25);
        expect(() => schema.parse(150)).toThrow('Limit must be at most 100');
      });
    });

  describe("Specialized Number Schema String Parameter Overloads", () => {
    describe("IntegerRequired overloads", () => {
      it("should work with string parameter (new simple syntax)", () => {
        const schema = IntegerRequired('Score');
        
        // Should work with valid values
        expect(schema.parse(123)).toBe(123);
        expect(schema.parse('456')).toBe(456);
        expect(schema.parse(-789)).toBe(-789);
        
        // Should use the string as field name in error messages
        expect(() => schema.parse(123.45)).toThrow('Score must be an integer');
      });

      it("should still work with options object (backward compatibility)", () => {
        const schema = IntegerRequired({ msg: 'Player Score', min: 0, max: 100 });
        
        expect(schema.parse(50)).toBe(50);
        expect(() => schema.parse(150)).toThrow('Player Score');
      });

      it("should work with no parameters (default usage)", () => {
        const schema = IntegerRequired();
        
        expect(schema.parse(123)).toBe(123);
        expect(() => schema.parse(123.45)).toThrow('Value must be an integer');
      });
    });

    describe("IntegerOptional overloads", () => {
      it("should work with string parameter", () => {
        const schema = IntegerOptional('Optional Score');
        
        expect(schema.parse(123)).toBe(123);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse(123.45)).toThrow('Optional Score must be an integer');
      });
    });

    describe("PositiveRequired overloads", () => {
      it("should work with string parameter", () => {
        const schema = PositiveRequired('Price');
        
        expect(schema.parse(19.99)).toBe(19.99);
        expect(schema.parse('25.50')).toBe(25.50);
        expect(() => schema.parse(0)).toThrow('Price must be positive');
        expect(() => schema.parse(-5)).toThrow('Price must be positive');
      });

      it("should still work with options object", () => {
        const schema = PositiveRequired({ msg: 'Item Cost', max: 1000 });
        
        expect(schema.parse(500)).toBe(500);
        expect(() => schema.parse(1500)).toThrow('Item Cost');
      });
    });

    describe("PositiveOptional overloads", () => {
      it("should work with string parameter", () => {
        const schema = PositiveOptional('Optional Price');
        
        expect(schema.parse(19.99)).toBe(19.99);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse(-5)).toThrow('Optional Price must be positive');
      });
    });

    describe("NegativeRequired overloads", () => {
      it("should work with string parameter", () => {
        const schema = NegativeRequired('Deficit');
        
        expect(schema.parse(-100)).toBe(-100);
        expect(schema.parse('-50.25')).toBe(-50.25);
        expect(() => schema.parse(0)).toThrow('Deficit must be negative');
        expect(() => schema.parse(5)).toThrow('Deficit must be negative');
      });
    });

    describe("NegativeOptional overloads", () => {
      it("should work with string parameter", () => {
        const schema = NegativeOptional('Optional Deficit');
        
        expect(schema.parse(-100)).toBe(-100);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse(5)).toThrow('Optional Deficit must be negative');
      });
    });

    describe("NonNegativeRequired overloads", () => {
      it("should work with string parameter", () => {
        const schema = NonNegativeRequired('Count');
        
        expect(schema.parse(0)).toBe(0);
        expect(schema.parse(100)).toBe(100);
        expect(schema.parse('50')).toBe(50);
        expect(() => schema.parse(-1)).toThrow('Count must be non-negative');
      });
    });

    describe("NonNegativeOptional overloads", () => {
      it("should work with string parameter", () => {
        const schema = NonNegativeOptional('Optional Count');
        
        expect(schema.parse(100)).toBe(100);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse(-1)).toThrow('Optional Count must be non-negative');
      });
    });

    describe("NonPositiveRequired overloads", () => {
      it("should work with string parameter", () => {
        const schema = NonPositiveRequired('Temperature Change');
        
        expect(schema.parse(0)).toBe(0);
        expect(schema.parse(-5)).toBe(-5);
        expect(schema.parse('-10.5')).toBe(-10.5);
        expect(() => schema.parse(1)).toThrow('Temperature Change must be non-positive');
      });
    });

    describe("NonPositiveOptional overloads", () => {
      it("should work with string parameter", () => {
        const schema = NonPositiveOptional('Optional Change');
        
        expect(schema.parse(-5)).toBe(-5);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse(1)).toThrow('Optional Change must be non-positive');
      });
    });

    describe("FiniteRequired overloads", () => {
      it("should work with string parameter", () => {
        const schema = FiniteRequired('Measurement');
        
        expect(schema.parse(123.45)).toBe(123.45);
        expect(schema.parse('678.90')).toBe(678.90);
        expect(() => schema.parse(Infinity)).toThrow('Measurement must be a number');
        expect(() => schema.parse(-Infinity)).toThrow('Measurement must be a number');
      });
    });

    describe("FiniteOptional overloads", () => {
      it("should work with string parameter", () => {
        const schema = FiniteOptional('Optional Measurement');
        
        expect(schema.parse(123.45)).toBe(123.45);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse(Infinity)).toThrow('Optional Measurement must be a number');
      });
    });

    describe("SafeIntegerRequired overloads", () => {
      it("should work with string parameter", () => {
        const schema = SafeIntegerRequired('Safe Number');
        
        expect(schema.parse(123)).toBe(123);
        expect(schema.parse(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
        expect(() => schema.parse(Number.MAX_SAFE_INTEGER + 1)).toThrow('Safe Number is invalid');
      });
    });

    describe("SafeIntegerOptional overloads", () => {
      it("should work with string parameter", () => {
        const schema = SafeIntegerOptional('Optional Safe Number');
        
        expect(schema.parse(123)).toBe(123);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse(Number.MAX_SAFE_INTEGER + 1)).toThrow('Optional Safe Number is invalid');
      });
    });

    describe("Real-world usage examples", () => {
      it("should handle financial calculations with specialized schemas", () => {
        const priceSchema = PositiveRequired('Price');
        const discountSchema = NonNegativeRequired('Discount Percentage');
        const temperatureSchema = FiniteRequired('Temperature');
        
        // Valid usage
        expect(priceSchema.parse(29.99)).toBe(29.99);
        expect(discountSchema.parse(15)).toBe(15);
        expect(temperatureSchema.parse(23.5)).toBe(23.5);
        
        // Invalid usage with proper error messages
        expect(() => priceSchema.parse(-10)).toThrow('Price must be positive');
        expect(() => discountSchema.parse(-5)).toThrow('Discount Percentage must be non-negative');
        expect(() => temperatureSchema.parse(Infinity)).toThrow('Temperature must be a number');
      });

      it("should handle game scoring with integer constraints", () => {
        const scoreSchema = IntegerRequired('Score');
        const levelSchema = PositiveRequired('Level');
        const livesSchema = NonNegativeRequired('Lives');
        
        // Valid game values
        expect(scoreSchema.parse(1500)).toBe(1500);
        expect(levelSchema.parse(3)).toBe(3);
        expect(livesSchema.parse(0)).toBe(0); // Game over!
        
        // Invalid values
        expect(() => scoreSchema.parse(1500.5)).toThrow('Score must be an integer');
        expect(() => levelSchema.parse(0)).toThrow('Level must be positive');
        expect(() => livesSchema.parse(-1)).toThrow('Lives must be non-negative');
      });

      it("should maintain type safety across all overloaded schemas", () => {
        // Compile-time test to ensure all schemas work with both syntax types
        const integerSchema1 = IntegerRequired('Age');
        const integerSchema2 = IntegerRequired({ msg: 'Years', min: 0, max: 120 });
        const positiveSchema1 = PositiveRequired('Amount');
        const positiveSchema2 = PositiveRequired({ msg: 'Value', max: 1000 });
        
        // All should return the same schema type and work correctly
        expect(typeof integerSchema1.parse).toBe('function');
        expect(typeof integerSchema2.parse).toBe('function');
        expect(typeof positiveSchema1.parse).toBe('function');
        expect(typeof positiveSchema2.parse).toBe('function');
        
        expect(integerSchema1.parse(25)).toBe(25);
        expect(integerSchema2.parse(30)).toBe(30);
        expect(positiveSchema1.parse(42)).toBe(42);
        expect(positiveSchema2.parse(100)).toBe(100);
      });
    });
  });
  });
});

