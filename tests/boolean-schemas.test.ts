import { createBooleanSchemas } from '../src/schemas/boolean-schemas';
import { MsgType } from '../src/common/types/msg-type';
import { runTableTests, extractZodIssueMessage } from './setup';
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
      case "mustBeBoolean":
        return `${options.msg} must be a boolean value`;
      case "mustBeBooleanString":
        return `${options.msg} must be a boolean value ("true" or "false")`;
      default:
        return `${options.msg} is invalid`;
    }
  }
);

// Create schema functions with injected message handler
const { zBooleanOptional, zBooleanRequired, zBooleanStringOptional, zBooleanStringRequired } = createBooleanSchemas(mockMessageHandler);

describe('Boolean Schemas', () => {

  describe('zBooleanOptional', () => {
    const schema = zBooleanOptional();

    runTableTests([
      {
        description: 'should accept true',
        input: true,
        expected: true
      },
      {
        description: 'should accept false',
        input: false,
        expected: false
      },
      {
        description: 'should accept undefined',
        input: undefined,
        expected: undefined
      },
      {
        description: 'should reject string',
        input: 'true',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject number',
        input: 1,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject object',
        input: {},
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject array',
        input: [],
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject null',
        input: null,
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Custom error messages', () => {
      it('should use custom field name in error message', () => {
        const schema = zBooleanOptional({ msg: 'Active' });
        try {
          schema.parse('true');
          fail('Expected schema to throw error');
        } catch (e) {
          expect(extractZodIssueMessage(e as any)).toBe('Active must be a boolean value');
        }
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zBooleanOptional({ msg: 'Invalid boolean format', msgType: MsgType.Message });
        expect(() => schema.parse('true')).toThrow('Invalid boolean format');
      });
    });
  });

  describe('zBooleanRequired', () => {
    const schema = zBooleanRequired();

    runTableTests([
      {
        description: 'should accept true',
        input: true,
        expected: true
      },
      {
        description: 'should accept false',
        input: false,
        expected: false
      },
      {
        description: 'should reject undefined',
        input: undefined,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject string',
        input: 'true',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject number',
        input: 1,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject object',
        input: {},
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject null',
        input: null,
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Custom error messages', () => {
      it('should use custom field name in error message', () => {
        const schema = zBooleanRequired({ msg: 'Active' });
        try {
          schema.parse('true');
          fail('Expected schema to throw error');
        } catch (e) {
          expect(extractZodIssueMessage(e as any)).toBe('Active must be a boolean value');
        }
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zBooleanRequired({ msg: 'Invalid boolean format', msgType: MsgType.Message });
        expect(() => schema.parse('true')).toThrow('Invalid boolean format');
      });
    });
  });

  describe('zBooleanStringOptional', () => {
    const schema = zBooleanStringOptional();

    runTableTests([
      {
        description: 'should accept boolean true and convert to string',
        input: true,
        expected: 'true'
      },
      {
        description: 'should accept boolean false and convert to string',
        input: false,
        expected: 'false'
      },
      {
        description: 'should accept string "true"',
        input: 'true',
        expected: 'true'
      },
      {
        description: 'should accept string "false"',
        input: 'false',
        expected: 'false'
      },
      {
        description: 'should accept string "TRUE" (case insensitive)',
        input: 'TRUE',
        expected: 'true'
      },
      {
        description: 'should accept string "FALSE" (case insensitive)',
        input: 'FALSE',
        expected: 'false'
      },
      {
        description: 'should accept string "True" (mixed case)',
        input: 'True',
        expected: 'true'
      },
      {
        description: 'should accept string "False" (mixed case)',
        input: 'False',
        expected: 'false'
      },
      {
        description: 'should accept string with whitespace " true "',
        input: ' true ',
        expected: 'true'
      },
      {
        description: 'should accept string with whitespace " false "',
        input: ' false ',
        expected: 'false'
      },
      {
        description: 'should handle undefined',
        input: undefined,
        expected: undefined
      },
      {
        description: 'should reject invalid string',
        input: 'invalid',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject number 1',
        input: 1,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject number 0',
        input: 0,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject object',
        input: {},
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject array',
        input: [],
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject null',
        input: null,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject empty string',
        input: '',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Custom error messages', () => {
      it('should use custom field name in error message', () => {
        const schema = zBooleanStringOptional({ msg: 'Active' });
        try {
          schema.parse('invalid');
          fail('Expected schema to throw error');
        } catch (e) {
          expect(extractZodIssueMessage(e as any)).toBe('Active must be a boolean value ("true" or "false")');
        }
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zBooleanStringOptional({ msg: 'Invalid boolean format', msgType: MsgType.Message });
        expect(() => schema.parse('invalid')).toThrow('Invalid boolean format');
      });
    });
  });

  describe('zBooleanStringRequired', () => {
    const schema = zBooleanStringRequired();

    runTableTests([
      {
        description: 'should accept boolean true and convert to string',
        input: true,
        expected: 'true'
      },
      {
        description: 'should accept boolean false and convert to string',
        input: false,
        expected: 'false'
      },
      {
        description: 'should accept string "true"',
        input: 'true',
        expected: 'true'
      },
      {
        description: 'should accept string "false"',
        input: 'false',
        expected: 'false'
      },
      {
        description: 'should accept case insensitive strings',
        input: 'TRUE',
        expected: 'true'
      },
      {
        description: 'should accept strings with whitespace',
        input: ' false ',
        expected: 'false'
      },
      {
        description: 'should reject undefined',
        input: undefined,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject invalid string',
        input: 'invalid',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject number',
        input: 1,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject object',
        input: {},
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject null',
        input: null,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject empty string',
        input: '',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Custom error messages', () => {
      it('should use custom field name in error message', () => {
        const schema = zBooleanStringRequired({ msg: 'Active' });
        try {
          schema.parse('invalid');
          fail('Expected schema to throw error');
        } catch (e) {
          expect(extractZodIssueMessage(e as any)).toBe('Active must be a boolean value ("true" or "false")');
        }
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zBooleanStringRequired({ msg: 'Invalid boolean format', msgType: MsgType.Message });
        expect(() => schema.parse('invalid')).toThrow('Invalid boolean format');
      });
    });
  });

  describe('Edge cases and special scenarios', () => {
    it('should handle boolean string conversion consistently', () => {
      const schema = zBooleanStringOptional();
      
      // Test all case variations
      const trueVariations = ['true', 'TRUE', 'True', 'tRuE', ' true ', '\ttrue\n'];
      const falseVariations = ['false', 'FALSE', 'False', 'fAlSe', ' false ', '\tfalse\n'];
      
      trueVariations.forEach(variation => {
        expect(schema.parse(variation)).toBe('true');
      });
      
      falseVariations.forEach(variation => {
        expect(schema.parse(variation)).toBe('false');
      });
    });

    it('should handle primitive boolean values consistently', () => {
      const optionalSchema = zBooleanStringOptional();
      const requiredSchema = zBooleanStringRequired();
      
      expect(optionalSchema.parse(true)).toBe('true');
      expect(optionalSchema.parse(false)).toBe('false');
      expect(requiredSchema.parse(true)).toBe('true');
      expect(requiredSchema.parse(false)).toBe('false');
    });

    it('should reject truthy/falsy values that are not boolean', () => {
      const schema = zBooleanStringOptional();
      
      const truthyValues = [1, 'yes', 'on', 'True', [], {}];
      const falsyValues = [0, '', 'no', 'off', 'False', null];
      
      // Only actual boolean values or valid string representations should pass
      truthyValues.forEach(value => {
        if (value !== 'True') { // 'True' is actually valid
          expect(() => schema.parse(value)).toThrow();
        }
      });
      
      falsyValues.forEach(value => {
        if (value !== 'False') { // 'False' is actually valid
          expect(() => schema.parse(value)).toThrow();
        }
      });
    });
  });
});
