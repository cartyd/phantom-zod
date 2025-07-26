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
      case "mustBeStringArray":
        return `${options.msg} must be an array of strings`;
      case "mustNotBeEmpty":
        return `${options.msg} must be an array of strings with at least one item`;
      case "mustHaveMinItems":
        return `${options.msg} must have at least ${options.params?.min} items`;
      case "mustHaveMaxItems":
        return `${options.msg} must have at most ${options.params?.max} items`;
      default:
        return `${options.msg} is invalid`;
    }
  }
);

// Create schema functions with injected message handler
const { zStringArrayOptional, zStringArrayRequired } = createArraySchemas(mockMessageHandler);

describe('Array Schemas', () => {
  // Helper to extract ZodError issues for fine-grained assertions
  function getIssues(fn: () => any) {
    try {
      fn();
      return [];
    } catch (e) {
      return e.issues || (e.errors && e.errors[0]?.issues) || [];
    }
  }

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
        const schema = zStringArrayOptional({ msg: 'Tags' });
        expect(() => schema.parse(['valid', 123])).toThrow('Tags must be an array of strings');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zStringArrayOptional({ msg: 'Invalid array format', msgType: MsgType.Message });
        expect(() => schema.parse(['valid', 123])).toThrow('Invalid array format');
      });
    });

    describe('Contract compliance', () => {
      it('should trigger mustBeArray for non-array input', () => {
        const schema = zStringArrayOptional({ msg: 'Field' });
        const issues = getIssues(() => schema.parse('not an array'));
        expect(issues.some(i => i.message.includes('must be an array'))).toBe(true);
        expect(issues.some(i => i.messageKey === 'mustBeArray')).toBe(true);
      });

      it('should trigger mustBeStringArray with receivedTypes and invalidIndices', () => {
        const schema = zStringArrayOptional({ msg: 'Field' });
        const issues = getIssues(() => schema.parse(['a', 1, true, 'b', null]));
        const stringArrayIssue = issues.find(i => i.messageKey === 'mustBeStringArray');
        expect(stringArrayIssue).toBeTruthy();
        expect(stringArrayIssue.params).toHaveProperty('receivedTypes');
        expect(stringArrayIssue.params).toHaveProperty('invalidIndices');
        expect(stringArrayIssue.params.invalidIndices).toEqual([1,2,4]);
        expect(stringArrayIssue.params.receivedTypes).toEqual(['string','number','boolean','string','object']);
      });

      it('should trigger mustNotBeEmpty for required schema with empty array', () => {
        const schema = zStringArrayRequired({ msg: 'Field' });
        const issues = getIssues(() => schema.parse([]));
        expect(issues.some(i => i.messageKey === 'mustNotBeEmpty')).toBe(true);
      });

      it('should trigger mustHaveMinItems with min param', () => {
        const schema = zStringArrayOptional({ msg: 'Field', minItems: 3 });
        const issues = getIssues(() => schema.parse(['a']));
        const minIssue = issues.find(i => i.messageKey === 'mustHaveMinItems');
        expect(minIssue).toBeTruthy();
        expect(minIssue.params).toHaveProperty('min', 3);
      });

      it('should trigger mustHaveMaxItems with max param', () => {
        const schema = zStringArrayOptional({ msg: 'Field', maxItems: 2 });
        const issues = getIssues(() => schema.parse(['a','b','c']));
        const maxIssue = issues.find(i => i.messageKey === 'mustHaveMaxItems');
        expect(maxIssue).toBeTruthy();
        expect(maxIssue.params).toHaveProperty('max', 2);
      });

      it('should trigger duplicateItems with duplicateIndices', () => {
        const schema = zStringArrayOptional({ msg: 'Field' });
        const arr = ['a', 'b', 'a', 'c', 'b'];
        const issues = getIssues(() => schema.parse(arr));
        const dupIssue = issues.find(i => i.messageKey === 'duplicateItems');
        expect(dupIssue).toBeTruthy();
        expect(dupIssue.params).toHaveProperty('duplicateIndices');
        // Duplicates: 'a' at 0,2 and 'b' at 1,4
        expect(dupIssue.params.duplicateIndices.sort()).toEqual([0,1,2,4]);
      });
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
        const schema = zStringArrayRequired({ msg: 'Tags' });
        expect(() => schema.parse([])).toThrow('Tags must be an array of strings with at least one item');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zStringArrayRequired({ msg: 'At least one item required', msgType: MsgType.Message });
        expect(() => schema.parse([])).toThrow('At least one item required');
      });
    });
  });
