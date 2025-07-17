import { 
  zBooleanOptional, 
  zBooleanRequired, 
  zBooleanStringOptional, 
  zBooleanStringRequired 
} from '../src/schemas/boolean-schemas';
import { MsgType } from '../src/schemas/msg-type';
import { runTableTests } from './setup';

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
        const schema = zBooleanOptional('Active');
        expect(() => schema.parse('true')).toThrow('Active must be a boolean value');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zBooleanOptional('Invalid boolean format', MsgType.Message);
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
        const schema = zBooleanRequired('Active');
        expect(() => schema.parse('true')).toThrow('Active must be a boolean value');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zBooleanRequired('Invalid boolean format', MsgType.Message);
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
        const schema = zBooleanStringOptional('Active');
        expect(() => schema.parse('invalid')).toThrow('Active must be a boolean value ("true" or "false")');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zBooleanStringOptional('Invalid boolean format', MsgType.Message);
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
        const schema = zBooleanStringRequired('Active');
        expect(() => schema.parse('invalid')).toThrow('Active must be a boolean value ("true" or "false")');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zBooleanStringRequired('Invalid boolean format', MsgType.Message);
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

  describe('Performance and reliability', () => {
    it('should handle large number of validations efficiently', () => {
      const schema = zBooleanStringOptional();
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        schema.parse(i % 2 === 0 ? 'true' : 'false');
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100);
    });

    it('should be consistent across multiple calls', () => {
      const schema = zBooleanStringOptional();
      
      for (let i = 0; i < 100; i++) {
        expect(schema.parse(true)).toBe('true');
        expect(schema.parse(false)).toBe('false');
        expect(schema.parse('TRUE')).toBe('true');
        expect(schema.parse('FALSE')).toBe('false');
      }
    });
  });
});
