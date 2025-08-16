import { createArraySchemas, NumberArrayOptional, NumberArrayRequired, BooleanArrayOptional, BooleanArrayRequired, UuidArrayOptional, UuidArrayRequired } from '../src/schemas/array-schemas';
import { MsgType } from '../src/common/types/msg-type';
import { runTableTests } from './setup';
import { createTestMessageHandler } from '../src/localization/types/message-handler.types';
import { z } from 'zod';

// Create a type-safe mock using the test helper
const mockMessageHandler = createTestMessageHandler(
  // Custom mock implementation (optional)
  (options) => {
    if (options.msgType === MsgType.Message) {
      return options.msg;
    }
    
    // Simple mock implementation for field name formatting
    switch (options.messageKey) {
      case "mustBeArray":
        return `${options.msg} must be an array`;
      case "mustBeStringArray":
        return `${options.msg} must be an array of strings`;
      case "mustNotBeEmpty":
        return `${options.msg} must be an array of strings with at least one item`;
      case "mustHaveMinItems":
      case "tooSmall":
        return `${options.msg} must have at least ${options.params?.min} items`;
      case "mustHaveMaxItems":
      case "tooBig":
        return `${options.msg} must have at most ${options.params?.max} items`;
      case "duplicateItems":
        return `${options.msg} must not contain duplicate items`;
      default:
        return `${options.msg} is invalid`;
    }
  }
);

// Create schema functions with injected message handler
const { ArrayOptional: zArrayOptional, ArrayRequired: zArrayRequired } = createArraySchemas(mockMessageHandler);

// Create convenience functions for the tests
const zStringArrayOptional = (options: any = {}) => zArrayOptional(z.string(), options);
const zStringArrayRequired = (options: any = {}) => zArrayRequired(z.string(), options);

describe('Array Schemas', () => {
  describe('zStringArrayOptional', () => {
    const schema = zStringArrayOptional();

    runTableTests([
      {
        description: 'should accept valid string array',
        input: ['apple', 'banana', 'cherry'],
        expected: ['apple', 'banana', 'cherry']
      },
      {
        description: 'should accept empty array',
        input: [],
        expected: []
      },
      {
        description: 'should accept single string array',
        input: ['single'],
        expected: ['single']
      },
      {
        description: 'should accept array with empty strings',
        input: ['', 'valid'],
        expected: ['', 'valid']
      },
      {
        description: 'should accept array with whitespace strings',
        input: ['  ', 'valid', '   '],
        expected: ['  ', 'valid', '   ']
      },
      {
        description: 'should handle undefined',
        input: undefined,
        expected: undefined
      },
      {
        description: 'should reject array with non-string elements',
        input: ['valid', 123, 'also valid'],
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject array with null elements',
        input: ['valid', null, 'also valid'],
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject array with boolean elements',
        input: ['valid', true, 'also valid'],
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject array with object elements',
        input: ['valid', { key: 'value' }, 'also valid'],
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject non-array input',
        input: 'not an array',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject number input',
        input: 123,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject object input',
        input: { key: 'value' },
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Edge cases', () => {
      it('should handle very long arrays', () => {
        const longArray = Array.from({ length: 1000 }, (_, i) => `item${i}`);
        expect(schema.parse(longArray)).toEqual(longArray);
      });

      it('should handle arrays with unicode strings', () => {
        const unicodeArray = ['Hello', '世界', '🌍', 'مرحبا'];
        expect(schema.parse(unicodeArray)).toEqual(unicodeArray);
      });

      it('should handle arrays with very long strings', () => {
        const longString = 'a'.repeat(10000);
        const array = [longString, 'short'];
        expect(schema.parse(array)).toEqual(array);
      });
    });

    describe('Custom error messages', () => {
      it('should use custom field name in error message', () => {
        const schema = zStringArrayOptional({ msg: 'Tags' });
        expect(() => schema.parse(['valid', 123])).toThrow('Tags must be an array of strings');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zStringArrayOptional({ msg: 'Invalid array format', msgType: MsgType.Message });
        expect(() => schema.parse(['valid', 123])).toThrow('Invalid array format');
      });
    });

    describe('Error messages', () => {
      it('should provide clear error for non-array input', () => {
        const schema = zStringArrayOptional({ msg: 'Field' });
        expect(() => schema.parse('not an array')).toThrow('Field must be an array');
      });

      it('should provide clear error for array with non-string elements', () => {
        const schema = zStringArrayOptional({ msg: 'Tags' });
        expect(() => schema.parse(['valid', 123, 'also valid'])).toThrow('Tags must be an array of strings');
      });

      it('should provide clear error for empty required array', () => {
        const schema = zStringArrayRequired({ msg: 'Categories' });
        expect(() => schema.parse([])).toThrow('Categories must be an array of strings with at least one item');
      });

      it('should provide clear error for array too small', () => {
        const schema = zStringArrayOptional({ msg: 'Tags', minItems: 3 });
        expect(() => schema.parse(['one', 'two'])).toThrow('Tags must have at least 3 items');
      });

      it('should provide clear error for array too large', () => {
        const schema = zStringArrayOptional({ msg: 'Tags', maxItems: 2 });
        expect(() => schema.parse(['one', 'two', 'three'])).toThrow('Tags must have at most 2 items');
      });

      it('should provide clear error for duplicate items', () => {
        const schema = zStringArrayOptional({ msg: 'Tags' });
        expect(() => schema.parse(['a', 'b', 'a'])).toThrow('Tags must not contain duplicate items');
      });
    });

    describe('Array constraints', () => {
      it('should enforce minimum items constraint', () => {
        const schema = zStringArrayOptional({ msg: 'Tags', minItems: 2 });
        expect(schema.parse(['item1', 'item2'])).toEqual(['item1', 'item2']);
        expect(schema.parse(['item1', 'item2', 'item3'])).toEqual(['item1', 'item2', 'item3']);
        expect(() => schema.parse(['item1'])).toThrow('Tags must have at least 2 items');
        expect(schema.parse(undefined)).toBeUndefined(); // undefined should still be allowed for optional
      });

      it('should enforce maximum items constraint', () => {
        const schema = zStringArrayOptional({ msg: 'Tags', maxItems: 3 });
        expect(schema.parse(['item1'])).toEqual(['item1']);
        expect(schema.parse(['item1', 'item2', 'item3'])).toEqual(['item1', 'item2', 'item3']);
        expect(() => schema.parse(['item1', 'item2', 'item3', 'item4'])).toThrow('Tags must have at most 3 items');
      });

      it('should enforce both min and max items constraints', () => {
        const schema = zStringArrayOptional({ msg: 'Tags', minItems: 2, maxItems: 4 });
        expect(schema.parse(['item1', 'item2'])).toEqual(['item1', 'item2']);
        expect(schema.parse(['item1', 'item2', 'item3', 'item4'])).toEqual(['item1', 'item2', 'item3', 'item4']);
        expect(() => schema.parse(['item1'])).toThrow('Tags must have at least 2 items');
        expect(() => schema.parse(['item1', 'item2', 'item3', 'item4', 'item5'])).toThrow('Tags must have at most 4 items');
      });
    });
  });

  describe('zStringArrayRequired', () => {
    const schema = zStringArrayRequired();

    runTableTests([
      {
        description: 'should accept valid string array',
        input: ['apple', 'banana', 'cherry'],
        expected: ['apple', 'banana', 'cherry']
      },
      {
        description: 'should accept single string array',
        input: ['single'],
        expected: ['single']
      },
      {
        description: 'should accept array with empty strings',
        input: ['', 'valid'],
        expected: ['', 'valid']
      },
      {
        description: 'should reject empty array',
        input: [],
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject undefined',
        input: undefined,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject array with non-string elements',
        input: ['valid', 123, 'also valid'],
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject array with null elements',
        input: ['valid', null, 'also valid'],
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject non-array input',
        input: 'not an array',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Edge cases', () => {
      it('should handle very long arrays', () => {
        const longArray = Array.from({ length: 1000 }, (_, i) => `item${i}`);
        expect(schema.parse(longArray)).toEqual(longArray);
      });

      it('should handle arrays with unicode strings', () => {
        const unicodeArray = ['Hello', '世界', '🌍', 'مرحبا'];
        expect(schema.parse(unicodeArray)).toEqual(unicodeArray);
      });
    });

    describe('Custom error messages', () => {
      it('should use custom field name in error message', () => {
        const schema = zStringArrayRequired({ msg: 'Tags' });
        expect(() => schema.parse([])).toThrow('Tags must be an array of strings with at least one item');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zStringArrayRequired({ msg: 'At least one item required', msgType: MsgType.Message });
        expect(() => schema.parse([])).toThrow('At least one item required');
      });
    });
  });

  // NEW: Generic Array Functions Tests
  describe('Generic Array Functions', () => {
    describe('zArrayOptional', () => {
      it('should work with number arrays', () => {
        const schema = zArrayOptional(z.number(), { msg: 'Scores' });
        expect(schema.parse([1, 2, 3])).toEqual([1, 2, 3]);
        expect(schema.parse([])).toEqual([]);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse(['not', 'numbers'])).toThrow();
      });

      it('should work with boolean arrays', () => {
        const schema = zArrayOptional(z.boolean(), { msg: 'Flags', allowDuplicates: true });
        expect(schema.parse([true, false, true])).toEqual([true, false, true]);
        expect(schema.parse([])).toEqual([]);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse([1, 0])).toThrow();
      });

      it('should work with object arrays', () => {
        const userSchema = z.object({ id: z.string(), name: z.string() });
        const schema = zArrayOptional(userSchema, { msg: 'Users' });
        const users = [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }];
        expect(schema.parse(users)).toEqual(users);
        expect(schema.parse([])).toEqual([]);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse([{ id: 1, name: 'John' }])).toThrow(); // id should be string
      });

      it('should work with union type arrays', () => {
        const schema = zArrayOptional(z.union([z.string(), z.number()]), { msg: 'Mixed' });
        expect(schema.parse(['hello', 42, 'world'])).toEqual(['hello', 42, 'world']);
        expect(schema.parse([1, 2, 3])).toEqual([1, 2, 3]);
        expect(schema.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
        expect(() => schema.parse([true, false])).toThrow(); // booleans not allowed
      });

      it('should support allowDuplicates option', () => {
        const schema = zArrayOptional(z.string(), { msg: 'Tags', allowDuplicates: true });
        expect(schema.parse(['a', 'b', 'a'])).toEqual(['a', 'b', 'a']); // Should allow duplicates
      });

      it('should reject duplicates by default', () => {
        const schema = zArrayOptional(z.string(), { msg: 'Tags' });
        expect(() => schema.parse(['a', 'b', 'a'])).toThrow('Tags must not contain duplicate items');
      });

      it('should support minItems and maxItems constraints', () => {
        const schema = zArrayOptional(z.number(), { msg: 'Numbers', minItems: 2, maxItems: 4 });
        expect(schema.parse([1, 2])).toEqual([1, 2]);
        expect(schema.parse([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
        expect(() => schema.parse([1])).toThrow(); // Will throw generic validation error
        expect(() => schema.parse([1, 2, 3, 4, 5])).toThrow(); // Will throw generic validation error
      });

      it('should work with nested arrays', () => {
        const schema = zArrayOptional(zArrayRequired(z.number(), { minItems: 2, maxItems: 2 }), { msg: 'Matrix' });
        expect(schema.parse([[1, 2], [3, 4]])).toEqual([[1, 2], [3, 4]]);
        expect(() => schema.parse([[1], [2, 3]])).toThrow(); // First sub-array too short
      });
    });

    describe('zArrayRequired', () => {
      it('should work with number arrays', () => {
        const schema = zArrayRequired(z.number(), { msg: 'Scores' });
        expect(schema.parse([1, 2, 3])).toEqual([1, 2, 3]);
        expect(() => schema.parse([])).toThrow();
        expect(() => schema.parse(undefined)).toThrow();
        expect(() => schema.parse(['not', 'numbers'])).toThrow();
      });

      it('should work with UUID arrays', () => {
        const schema = zArrayRequired(z.string().uuid(), { msg: 'IDs' });
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        expect(schema.parse([uuid])).toEqual([uuid]);
        expect(() => schema.parse(['not-a-uuid'])).toThrow();
      });

      it('should enforce non-empty by default', () => {
        const schema = zArrayRequired(z.string(), { msg: 'Items' });
        expect(() => schema.parse([])).toThrow('Items must be an array of strings with at least one item');
      });

      it('should support custom minItems', () => {
        const schema = zArrayRequired(z.string(), { msg: 'Items', minItems: 3 });
        expect(schema.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
        expect(() => schema.parse(['a', 'b'])).toThrow('Items must have at least 3 items');
      });
    });
  });

  // NEW: Convenience Function Tests
  describe('Convenience Functions', () => {
    describe('Number Arrays', () => {
      it('NumberArrayOptional should work correctly', () => {
        const schema = NumberArrayOptional({ msg: 'Scores' });
        expect(schema.parse([1, 2, 3])).toEqual([1, 2, 3]);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse(['not', 'numbers'])).toThrow();
      });

      it('NumberArrayRequired should work correctly', () => {
        const schema = NumberArrayRequired({ msg: 'Scores' });
        expect(schema.parse([1, 2, 3])).toEqual([1, 2, 3]);
        expect(() => schema.parse([])).toThrow();
        expect(() => schema.parse(undefined)).toThrow();
      });
    });

    describe('Boolean Arrays', () => {
      it('BooleanArrayOptional should work correctly', () => {
        const schema = BooleanArrayOptional({ msg: 'Flags' });
        expect(schema.parse([true, false])).toEqual([true, false]);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse([1, 0])).toThrow();
      });

      it('BooleanArrayRequired should work correctly', () => {
        const schema = BooleanArrayRequired({ msg: 'Flags' });
        expect(schema.parse([true, false])).toEqual([true, false]);
        expect(() => schema.parse([])).toThrow();
        expect(() => schema.parse(undefined)).toThrow();
      });
    });

    describe('UUID Arrays', () => {
      it('UuidArrayOptional should work correctly', () => {
        const schema = UuidArrayOptional({ msg: 'IDs' });
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        expect(schema.parse([uuid])).toEqual([uuid]);
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse(['not-a-uuid'])).toThrow();
      });

      it('UuidArrayRequired should work correctly', () => {
        const schema = UuidArrayRequired({ msg: 'IDs' });
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        expect(schema.parse([uuid])).toEqual([uuid]);
        expect(() => schema.parse([])).toThrow();
        expect(() => schema.parse(['not-a-uuid'])).toThrow();
      });
    });
  });

  // NEW: Advanced Use Cases
  describe('Advanced Use Cases', () => {
    it('should handle complex object validation', () => {
      const productSchema = z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
        price: z.number().positive(),
        tags: z.array(z.string()).optional()
      });
      const schema = zArrayRequired(productSchema, { msg: 'Products' });
      
      const products = [
        { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Product 1', price: 10.99, tags: ['tag1'] },
        { id: '987fcdeb-51a2-4321-9876-543210987654', name: 'Product 2', price: 5.99 }
      ];
      
      expect(schema.parse(products)).toEqual(products);
      expect(() => schema.parse([{ id: 'invalid', name: 'Product', price: -1 }])).toThrow();
    });

    it('should work with discriminated unions', () => {
      const shapeSchema = z.discriminatedUnion('type', [
        z.object({ type: z.literal('circle'), radius: z.number() }),
        z.object({ type: z.literal('rectangle'), width: z.number(), height: z.number() })
      ]);
      const schema = zArrayOptional(shapeSchema, { msg: 'Shapes' });
      
      const shapes = [
        { type: 'circle' as const, radius: 5 },
        { type: 'rectangle' as const, width: 10, height: 20 }
      ];
      
      expect(schema.parse(shapes)).toEqual(shapes);
      expect(() => schema.parse([{ type: 'triangle', sides: 3 }])).toThrow();
    });

    it('should handle recursive schemas', () => {
      interface Category {
        name: string;
        subcategories?: Category[];
      }
      
      const categorySchema: z.ZodType<Category> = z.lazy(() => z.object({
        name: z.string(),
        subcategories: z.array(categorySchema).optional()
      }));
      
      const schema = zArrayRequired(categorySchema, { msg: 'Categories' });
      
      const categories = [
        {
          name: 'Electronics',
          subcategories: [
            { name: 'Phones' },
            { name: 'Computers', subcategories: [{ name: 'Laptops' }] }
          ]
        }
      ];
      
      expect(schema.parse(categories)).toEqual(categories);
    });

    it('should support custom validation', () => {
      const emailSchema = z.string().email();
      const schema = zArrayRequired(emailSchema, { msg: 'Emails' });
      
      expect(schema.parse(['test@example.com', 'user@domain.org']))
        .toEqual(['test@example.com', 'user@domain.org']);
      expect(() => schema.parse(['not-an-email'])).toThrow();
    });
  });

  // NEW: Error Message Tests for Generic Functions
  describe('Error Messages for Generic Functions', () => {
    it('should provide appropriate error messages for different types', () => {
      const numberSchema = zArrayRequired(z.number(), { msg: 'Numbers' });
      expect(() => numberSchema.parse(['not', 'numbers'])).toThrow('Numbers must be an array of strings'); // Uses the mock message
      
      const boolSchema = zArrayRequired(z.boolean(), { msg: 'Flags' });
      expect(() => boolSchema.parse([1, 0])).toThrow('Flags must be an array of strings'); // Uses the mock message
    });

    it('should support custom messages with MsgType.Message', () => {
      const schema = zArrayRequired(z.number(), { msg: 'Invalid numeric data provided', msgType: MsgType.Message });
      expect(() => schema.parse(['not', 'numbers'])).toThrow('Invalid numeric data provided');
    });
  });

  // NEW: Type Safety Tests
  describe('Type Safety', () => {
    it('should maintain proper TypeScript types', () => {
      const stringArray = zStringArrayRequired({ msg: 'Strings' });
      const numberArray = NumberArrayRequired({ msg: 'Numbers' });
      const objectArray = zArrayRequired(z.object({ id: z.string() }), { msg: 'Objects' });
      
      // These should compile correctly with proper types
      type StringArrayType = z.infer<typeof stringArray>; // string[]
      type NumberArrayType = z.infer<typeof numberArray>; // number[]
      type ObjectArrayType = z.infer<typeof objectArray>; // { id: string }[]
      
      // Runtime validation should match TypeScript expectations
      const strings: StringArrayType = stringArray.parse(['a', 'b']);
      const numbers: NumberArrayType = numberArray.parse([1, 2]);
      const objects: ObjectArrayType = objectArray.parse([{ id: '1' }]);
      
      expect(strings).toEqual(['a', 'b']);
      expect(numbers).toEqual([1, 2]);
      expect(objects).toEqual([{ id: '1' }]);
    });
  });
});
