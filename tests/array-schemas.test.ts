import { createArraySchemas } from '../src/schemas/array-schemas';
import { MsgType } from '../src/common/types/msg-type';
import { runTableTests } from './setup';
import { createTestMessageHandler } from '../src/localization/message-handler.types';

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
const { zStringArrayOptional, zStringArrayRequired } = createArraySchemas(mockMessageHandler);

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
});
