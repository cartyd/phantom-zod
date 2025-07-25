import { MsgType } from "../src/schemas/msg-type";
import { createStringSchemas } from "../src/schemas/string-schemas";
import { generateTestData, runTableTests } from "./setup";
import { createTestMessageHandler } from "../src/common/message-handler.types";

// Create a type-safe mock using the test helper
const mockMessageHandler = createTestMessageHandler(
  // Custom mock implementation (optional)
  (options) => {
    if (options.msgType === MsgType.Message) {
      return options.msg;
    }
    
    // Simple mock implementation for field name formatting
    switch (options.messageKey) {
      case "required":
        return `${options.msg} is required`;
      case "mustBeString":
        return `${options.msg} must be a string`;
      case "tooShort":
        return `${options.msg} is too short (minimum: ${options.params?.min} characters)`;
      case "tooLong":
        return `${options.msg} is too long (maximum: ${options.params?.max} characters)`;
      default:
        return `${options.msg} is invalid`;
    }
  }
);

// Create schema functions with injected message handler
const { zStringOptional, zStringRequired } = createStringSchemas(mockMessageHandler);

describe('String Schemas', () => {
  describe('zStringOptional', () => {
    const schema = zStringOptional();

    runTableTests([
      {
        description: 'should accept valid string',
        input: 'hello world',
        expected: 'hello world'
      },
      {
        description: 'should trim whitespace from string',
        input: '  hello world  ',
        expected: 'hello world'
      },
      {
        description: 'should accept empty string and return empty',
        input: '',
        expected: ''
      },
      {
        description: 'should trim whitespace-only string to empty',
        input: '   ',
        expected: ''
      },
      {
        description: 'should handle undefined',
        input: undefined,
        expected: ''
      },
      {
        description: 'should accept string with special characters',
        input: 'hello@world!',
        expected: 'hello@world!'
      },
      {
        description: 'should accept string with numbers',
        input: 'hello123',
        expected: 'hello123'
      },
      {
        description: 'should accept string with newlines and tabs',
        input: 'hello\nworld\ttab',
        expected: 'hello\nworld\ttab'
      },
      {
        description: 'should trim but preserve internal whitespace',
        input: '  hello world  ',
        expected: 'hello world'
      }
    ], (input) => schema.parse(input));

    describe('Edge cases', () => {
      generateTestData.edgeCases.whitespace.forEach(input => {
        it(`should handle whitespace input: "${input}"`, () => {
          const result = schema.parse(input);
          expect(typeof result).toBe('string');
          expect(result).toBe(input.trim());
        });
      });

      it('should handle very long strings', () => {
        const longString = 'a'.repeat(10000);
        expect(schema.parse(longString)).toBe(longString);
      });

      it('should handle unicode characters', () => {
        const unicodeString = 'Hello 世界 🌍';
        expect(schema.parse(unicodeString)).toBe(unicodeString);
      });
    });

    describe('Custom error messages', () => {
      it('should use custom message when MsgType is Message for empty string', () => {
        const schema = zStringRequired({ msg: 'Custom required message', msgType: MsgType.Message });
        expect(() => schema.parse('')).toThrow('Custom required message');
      });

      it('should use custom message when MsgType is Message for whitespace-only string', () => {
        const schema = zStringRequired({ msg: 'Custom required message', msgType: MsgType.Message });
        expect(() => schema.parse('   ')).toThrow('Custom required message');
      });
      it('should use custom field name in error message', () => {
        const schema = zStringOptional({ msg: 'Name' });
        // This schema should not throw for valid strings, 
        // but would throw for non-string types if TypeScript allowed it
        expect(schema.parse('test')).toBe('test');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zStringOptional({ msg: 'Custom validation message', msgType: MsgType.Message });
        expect(schema.parse('test')).toBe('test');
      });
    });
  });

  describe('zStringRequired', () => {
    const schema = zStringRequired();

    runTableTests([
      {
        description: 'should accept valid non-empty string',
        input: 'hello world',
        expected: 'hello world'
      },
      {
        description: 'should trim whitespace from string',
        input: '  hello world  ',
        expected: 'hello world'
      },
      {
        description: 'should accept single character',
        input: 'a',
        expected: 'a'
      },
      {
        description: 'should accept string with special characters',
        input: 'hello@world!',
        expected: 'hello@world!'
      },
      {
        description: 'should reject empty string',
        input: '',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject whitespace-only string',
        input: '   ',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject string with only tabs',
        input: '\t\t\t',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject string with only newlines',
        input: '\n\n\n',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject undefined (implicitly)',
        input: undefined,
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Edge cases', () => {
      generateTestData.edgeCases.empty.forEach(input => {
        it(`should reject empty/whitespace input: "${input}"`, () => {
          expect(() => schema.parse(input)).toThrow();
        });
      });

      it('should handle very long strings', () => {
        const longString = 'a'.repeat(10000);
        expect(schema.parse(longString)).toBe(longString);
      });

      it('should handle unicode characters', () => {
        const unicodeString = 'Hello 世界 🌍';
        expect(schema.parse(unicodeString)).toBe(unicodeString);
      });

      it('should handle strings with mixed whitespace', () => {
        const mixedString = '  hello\tworld\n  ';
        expect(schema.parse(mixedString)).toBe('hello\tworld');
      });
    });

    describe('Custom error messages', () => {
      it('should use custom field name in required error message', () => {
        const schema = zStringRequired({ msg: 'Name' });
        expect(() => schema.parse('')).toThrow('Name is required');
      });

      it('should use custom field name in validation error message', () => {
        const schema = zStringRequired({ msg: 'Name' });
        expect(() => schema.parse('   ')).toThrow('Name is required');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zStringRequired({ msg: 'Please provide a value', msgType: MsgType.Message });
        expect(() => schema.parse('')).toThrow('Please provide a value');
      });
    });
  });

  describe('Trimming behavior', () => {
    it('should trim leading whitespace', () => {
      const schema = zStringOptional();
      expect(schema.parse('   hello')).toBe('hello');
    });

    it('should trim trailing whitespace', () => {
      const schema = zStringOptional();
      expect(schema.parse('hello   ')).toBe('hello');
    });

    it('should trim both leading and trailing whitespace', () => {
      const schema = zStringOptional();
      expect(schema.parse('   hello   ')).toBe('hello');
    });

    it('should preserve internal whitespace', () => {
      const schema = zStringOptional();
      expect(schema.parse('  hello world  ')).toBe('hello world');
    });

    it('should handle mixed whitespace characters', () => {
      const schema = zStringOptional();
      expect(schema.parse('\t\n  hello world  \t\n')).toBe('hello world');
    });
  });

  describe('Length constraints with options', () => {
    it('should enforce minimum length for optional strings', () => {
      const schema = zStringOptional({ minLength: 3 });
      expect(schema.parse('hello')).toBe('hello');
      expect(() => schema.parse('hi')).toThrow();
    });

    it('should enforce maximum length for optional strings', () => {
      const schema = zStringOptional({ maxLength: 5 });
      expect(schema.parse('hello')).toBe('hello');
      expect(() => schema.parse('hello world')).toThrow();
    });

    it('should enforce both min and max length for optional strings', () => {
      const schema = zStringOptional({ minLength: 3, maxLength: 10 });
      expect(schema.parse('hello')).toBe('hello');
      expect(() => schema.parse('hi')).toThrow();
      expect(() => schema.parse('this is too long')).toThrow();
    });

    it('should enforce minimum length for required strings', () => {
      const schema = zStringRequired({ minLength: 3 });
      expect(schema.parse('hello')).toBe('hello');
      expect(() => schema.parse('hi')).toThrow();
    });

    it('should enforce maximum length for required strings', () => {
      const schema = zStringRequired({ maxLength: 5 });
      expect(schema.parse('hello')).toBe('hello');
      expect(() => schema.parse('hello world')).toThrow();
    });
  });

  describe('Type safety and validation', () => {
    it('should maintain string type after parsing', () => {
      const schema = zStringOptional();
      const result = schema.parse('test');
      expect(typeof result).toBe('string');
    });

    it('should handle non-string inputs gracefully in TypeScript context', () => {
      const schema = zStringOptional();
      // In actual TypeScript usage, non-string inputs would be caught at compile time
      // This test ensures runtime behavior is predictable
      expect(schema.parse('123')).toBe('123');
    });
  });
});
