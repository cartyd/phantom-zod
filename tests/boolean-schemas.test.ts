import { pz } from '../src/pz';
import { MsgType } from '../src/common/types/msg-type';
import { runTableTests, extractZodIssueMessage } from './setup';
import { createTestMessageHandler } from '../src/localization/types/message-handler.types';

const { BooleanOptional, BooleanRequired, BooleanStringOptional, BooleanStringRequired } = pz;

// Create a type-safe mock using the test helper for message testing
const mockMessageHandler = createTestMessageHandler(
  (options) => {
    const params = options.params || {};
    if (options.msgType === MsgType.Message) {
      return options.msg;
    }
    switch (options.messageKey) {
      case "mustBeBoolean":
        return `${options.msg} must be a boolean value` + (params.receivedType ? ` (received: ${params.receivedType})` : "");
      case "mustBeBooleanString":
        return `${options.msg} must be a boolean value (\"true\" or \"false\")` + (params.receivedValue ? ` (received: ${params.receivedValue})` : "");
      case "invalid":
        return `${options.msg} is invalid` + (params.receivedValue !== undefined ? ` (received: ${params.receivedValue})` : "") + (params.receivedType ? ` (type: ${params.receivedType})` : "");
      case "invalidBooleanString":
        return `${options.msg} is not a valid boolean string` + (params.receivedValue !== undefined ? ` (received: ${params.receivedValue})` : "") + (params.validOptions ? ` (valid: ${params.validOptions.join(", ")})` : "");
      default:
        return `${options.msg} is invalid`;
    }
  }
);
describe('BooleanMessageParams contract coverage', () => {
  it('should format mustBeBoolean with receivedType', () => {
    const msg = mockMessageHandler.formatErrorMessage({
      group: 'boolean',
      messageKey: 'mustBeBoolean',
      params: { receivedType: 'string' },
      msg: 'Field',
      msgType: MsgType.FieldName,
    });
    expect(msg).toContain('must be a boolean value');
    expect(msg).toContain('received: string');
  });

  it('should format mustBeBooleanString with receivedValue', () => {
    const msg = mockMessageHandler.formatErrorMessage({
      group: 'boolean',
      messageKey: 'mustBeBooleanString',
      params: { receivedValue: 'foo' },
      msg: 'Field',
      msgType: MsgType.FieldName,
    });
    expect(msg).toContain('must be a boolean value');
    expect(msg).toContain('received: foo');
  });

  it('should format invalid with receivedValue and receivedType', () => {
    const msg = mockMessageHandler.formatErrorMessage({
      group: 'boolean',
      messageKey: 'invalid',
      params: { receivedValue: 'bar', receivedType: 'object' },
      msg: 'Field',
      msgType: MsgType.FieldName,
    });
    expect(msg).toContain('is invalid');
    expect(msg).toContain('received: bar');
    expect(msg).toContain('type: object');
  });

  it('should format invalidBooleanString with receivedValue and validOptions', () => {
    const msg = mockMessageHandler.formatErrorMessage({
      group: 'boolean',
      messageKey: 'invalidBooleanString',
      params: { receivedValue: 'baz', validOptions: ['true', 'false'] },
      msg: 'Field',
      msgType: MsgType.FieldName,
    });
    expect(msg).toContain('not a valid boolean string');
    expect(msg).toContain('received: baz');
    expect(msg).toContain('valid: true, false');
  });
});

describe('Boolean Schemas', () => {

  describe('BooleanOptional', () => {
    const schema = BooleanOptional();

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
        const schema = BooleanOptional({ msg: 'Active' });
        try {
          schema.parse('true');
          fail('Expected schema to throw error');
        } catch (e) {
          expect(extractZodIssueMessage(e as any)).toBe('Active must be a boolean value');
        }
      });

      it('should use custom message when msgType is Message', () => {
        const schema = BooleanOptional({ msg: 'Invalid boolean format', msgType: MsgType.Message });
        expect(() => schema.parse('true')).toThrow('Invalid boolean format');
      });
    });
  });

  describe('BooleanRequired', () => {
    const schema = BooleanRequired();

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
        const schema = BooleanRequired({ msg: 'Active' });
        try {
          schema.parse('true');
          fail('Expected schema to throw error');
        } catch (e) {
          expect(extractZodIssueMessage(e as any)).toBe('Active must be a boolean value');
        }
      });

      it('should use custom message when msgType is Message', () => {
        const schema = BooleanRequired({ msg: 'Invalid boolean format', msgType: MsgType.Message });
        expect(() => schema.parse('true')).toThrow('Invalid boolean format');
      });
    });
  });

  describe('BooleanStringOptional', () => {
    const schema = BooleanStringOptional();

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
        const schema = BooleanStringOptional({ msg: 'Active' });
        try {
          schema.parse('invalid');
          fail('Expected schema to throw error');
        } catch (e) {
          expect(extractZodIssueMessage(e as any)).toBe('Active must be a boolean value ("true" or "false")');
        }
      });

      it('should use custom message when msgType is Message', () => {
        const schema = BooleanStringOptional({ msg: 'Invalid boolean format', msgType: MsgType.Message });
        expect(() => schema.parse('invalid')).toThrow('Invalid boolean format');
      });
    });
  });

  describe('BooleanStringRequired', () => {
    const schema = BooleanStringRequired();

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
        const schema = BooleanStringRequired({ msg: 'Active' });
        try {
          schema.parse('invalid');
          fail('Expected schema to throw error');
        } catch (e) {
          expect(extractZodIssueMessage(e as any)).toBe('Active must be a boolean value ("true" or "false")');
        }
      });

      it('should use custom message when msgType is Message', () => {
        const schema = BooleanStringRequired({ msg: 'Invalid boolean format', msgType: MsgType.Message });
        expect(() => schema.parse('invalid')).toThrow('Invalid boolean format');
      });
    });
  });

  describe('Edge cases and special scenarios', () => {
    it('should handle boolean string conversion consistently', () => {
      const schema = BooleanStringOptional();
      
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
      const optionalSchema = BooleanStringOptional();
      const requiredSchema = BooleanStringRequired();
      
      expect(optionalSchema.parse(true)).toBe('true');
      expect(optionalSchema.parse(false)).toBe('false');
      expect(requiredSchema.parse(true)).toBe('true');
      expect(requiredSchema.parse(false)).toBe('false');
    });

    it('should reject truthy/falsy values that are not boolean', () => {
      const schema = BooleanStringOptional();
      
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

  describe('Boolean Schema String Parameter Overloads', () => {
    describe('BooleanOptional overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema1 = BooleanOptional('Is Active');
        const schema2 = BooleanOptional({ msg: 'Is Active' });
        
        expect(schema1.parse(true)).toBe(true);
        expect(schema2.parse(true)).toBe(true);
        expect(schema1.parse(false)).toBe(false);
        expect(schema2.parse(false)).toBe(false);
        expect(schema1.parse(undefined)).toBeUndefined();
        expect(schema2.parse(undefined)).toBeUndefined();
        
        // Test error message consistency
        try {
          schema1.parse('invalid');
        } catch (error1) {
          try {
            schema2.parse('invalid');
          } catch (error2) {
            expect((error1 as Error).message).toEqual((error2 as Error).message);
          }
        }
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = BooleanOptional({ msg: 'Feature Flag', msgType: MsgType.FieldName });
        expect(schema.parse(true)).toBe(true);
        expect(schema.parse(false)).toBe(false);
        expect(schema.parse(undefined)).toBeUndefined();
      });

      it('should work with no parameters (default usage)', () => {
        const schema = BooleanOptional();
        expect(schema.parse(true)).toBe(true);
        expect(schema.parse(false)).toBe(false);
        expect(schema.parse(undefined)).toBeUndefined();
      });
    });

    describe('BooleanRequired overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema1 = BooleanRequired('Is Active');
        const schema2 = BooleanRequired({ msg: 'Is Active' });
        
        expect(schema1.parse(true)).toBe(true);
        expect(schema2.parse(true)).toBe(true);
        expect(schema1.parse(false)).toBe(false);
        expect(schema2.parse(false)).toBe(false);
        
        // Test error message consistency
        try {
          schema1.parse('invalid');
        } catch (error1) {
          try {
            schema2.parse('invalid');
          } catch (error2) {
            expect((error1 as Error).message).toEqual((error2 as Error).message);
          }
        }
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = BooleanRequired({ msg: 'Terms Accepted', msgType: MsgType.FieldName });
        expect(schema.parse(true)).toBe(true);
        expect(schema.parse(false)).toBe(false);
      });

      it('should work with no parameters (default usage)', () => {
        const schema = BooleanRequired();
        expect(schema.parse(true)).toBe(true);
        expect(schema.parse(false)).toBe(false);
      });
    });

    describe('BooleanStringOptional overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema1 = BooleanStringOptional('Newsletter Subscription');
        const schema2 = BooleanStringOptional({ msg: 'Newsletter Subscription' });
        
        expect(schema1.parse(true)).toBe('true');
        expect(schema2.parse(true)).toBe('true');
        expect(schema1.parse(false)).toBe('false');
        expect(schema2.parse(false)).toBe('false');
        expect(schema1.parse('true')).toBe('true');
        expect(schema2.parse('true')).toBe('true');
        expect(schema1.parse(undefined)).toBeUndefined();
        expect(schema2.parse(undefined)).toBeUndefined();
        
        // Test error message consistency
        try {
          schema1.parse('invalid');
        } catch (error1) {
          try {
            schema2.parse('invalid');
          } catch (error2) {
            expect((error1 as Error).message).toEqual((error2 as Error).message);
          }
        }
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = BooleanStringOptional({ msg: 'Email Notifications', msgType: MsgType.FieldName });
        expect(schema.parse(true)).toBe('true');
        expect(schema.parse('FALSE')).toBe('false');
        expect(schema.parse(undefined)).toBeUndefined();
      });

      it('should work with no parameters (default usage)', () => {
        const schema = BooleanStringOptional();
        expect(schema.parse(true)).toBe('true');
        expect(schema.parse('false')).toBe('false');
        expect(schema.parse(undefined)).toBeUndefined();
      });
    });

    describe('BooleanStringRequired overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema1 = BooleanStringRequired('Marketing Consent');
        const schema2 = BooleanStringRequired({ msg: 'Marketing Consent' });
        
        expect(schema1.parse(true)).toBe('true');
        expect(schema2.parse(true)).toBe('true');
        expect(schema1.parse(false)).toBe('false');
        expect(schema2.parse(false)).toBe('false');
        expect(schema1.parse('TRUE')).toBe('true');
        expect(schema2.parse('TRUE')).toBe('true');
        
        // Test error message consistency
        try {
          schema1.parse('invalid');
        } catch (error1) {
          try {
            schema2.parse('invalid');
          } catch (error2) {
            expect((error1 as Error).message).toEqual((error2 as Error).message);
          }
        }
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = BooleanStringRequired({ msg: 'Privacy Agreement', msgType: MsgType.FieldName });
        expect(schema.parse(true)).toBe('true');
        expect(schema.parse('false')).toBe('false');
      });

      it('should work with no parameters (default usage)', () => {
        const schema = BooleanStringRequired();
        expect(schema.parse(true)).toBe('true');
        expect(schema.parse('False')).toBe('false');
      });
    });

    describe('Real-world usage examples', () => {
      it('should handle user preference form with overloaded schemas', () => {
        const emailNotificationsSchema = BooleanRequired('Email Notifications');
        const marketingConsentSchema = BooleanStringOptional('Marketing Consent');
        const darkModeSchema = BooleanOptional('Dark Mode');
        
        const preferences = {
          emailNotifications: true,
          marketingConsent: 'false',
          darkMode: undefined,
        };
        
        const parsedPreferences = {
          emailNotifications: emailNotificationsSchema.parse(preferences.emailNotifications),
          marketingConsent: marketingConsentSchema.parse(preferences.marketingConsent),
          darkMode: darkModeSchema.parse(preferences.darkMode),
        };
        
        expect(parsedPreferences.emailNotifications).toBe(true);
        expect(parsedPreferences.marketingConsent).toBe('false');
        expect(parsedPreferences.darkMode).toBeUndefined();
      });

      it('should handle form validation with different boolean formats', () => {
        const agreeToTermsSchema = BooleanRequired('Terms Agreement');
        const subscribeNewsletterSchema = BooleanStringRequired('Newsletter Subscription');
        const enableTwoFactorSchema = BooleanOptional('Two Factor Authentication');
        
        const formData = {
          agreeToTerms: true,
          subscribeNewsletter: 'TRUE',
          enableTwoFactor: false,
        };
        
        expect(agreeToTermsSchema.parse(formData.agreeToTerms)).toBe(true);
        expect(subscribeNewsletterSchema.parse(formData.subscribeNewsletter)).toBe('true');
        expect(enableTwoFactorSchema.parse(formData.enableTwoFactor)).toBe(false);
      });

      it('should maintain type safety across all overloaded boolean schemas', () => {
        const schemas = {
          required: BooleanRequired('Required'),
          optional: BooleanOptional('Optional'),
          stringRequired: BooleanStringRequired('String Required'),
          stringOptional: BooleanStringOptional('String Optional'),
        };
        
        // Test boolean inputs
        expect(schemas.required.parse(true)).toBe(true);
        expect(schemas.optional.parse(false)).toBe(false);
        expect(schemas.stringRequired.parse(true)).toBe('true');
        expect(schemas.stringOptional.parse(false)).toBe('false');
        
        // Test string inputs
        expect(schemas.stringRequired.parse('TRUE')).toBe('true');
        expect(schemas.stringOptional.parse('False')).toBe('false');
        
        // Test undefined/optional behavior
        expect(schemas.optional.parse(undefined)).toBeUndefined();
        expect(schemas.stringOptional.parse(undefined)).toBeUndefined();
      });
    });
  });
});
