import { zStringArrayOptional, zStringArrayRequired } from '../src/schemas/array-schemas';
import { MsgType } from '../src/schemas/msg-type';
import { runTableTests } from './setup';

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
        input: ['', 'valid', ''],
        expected: ['', 'valid', '']
      },
      {
        description: 'should accept array with whitespace strings',
        input: ['  ', 'valid', '  '],
        expected: ['  ', 'valid', '  ']
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
        const schema = zStringArrayOptional('Tags');
        expect(() => schema.parse(['valid', 123])).toThrow('Tags must be an array of strings');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zStringArrayOptional('Invalid array format', MsgType.Message);
        expect(() => schema.parse(['valid', 123])).toThrow('Invalid array format');
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
        input: ['', 'valid', ''],
        expected: ['', 'valid', '']
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
        const schema = zStringArrayRequired('Tags');
        expect(() => schema.parse([])).toThrow('Tags must be an array of strings with at least one item');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zStringArrayRequired('At least one item required', MsgType.Message);
        expect(() => schema.parse([])).toThrow('At least one item required');
      });
    });
  });
});
