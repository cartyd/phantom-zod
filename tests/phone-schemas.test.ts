import { 
  createPhoneSchemas, 
  PhoneFormat,
  PhoneOptional,
  PhoneRequired
} from '../src/schemas/phone-schemas';
import { normalizeUSPhone, phoneTransformAndValidate, phoneRefine } from '../src/common/utils/phone-utils';
import { MsgType } from '../src/common/types/msg-type';
import { createTestMessageHandler } from '../src/localization/types/message-handler.types';
import { runTableTests } from './setup';

// Custom test message handler to include exampleParams and supportedFormats in error messages
const mockMessageHandler = createTestMessageHandler((options) => {
  // Only for phone group
  if (options.group === 'phone') {
    let base = options.msgType === MsgType.Message ? options.msg : `${options.msg} is invalid`;
    if (options.messageKey === 'required') {
      base = `${options.msg} is required`;
    }
    if (options.params) {
      if (options.params.supportedFormats) {
        base += ` (supported: ${options.params.supportedFormats.join(', ')})`;
      }
      if (options.params.e164) {
        base += ` [e164: ${options.params.e164}]`;
      }
      if (options.params.national) {
        base += ` [national: ${options.params.national}]`;
      }
    }
    return base;
  }
  // fallback to default
  if (options.msgType === MsgType.Message) {
    return options.msg;
  }
  return `${options.msg} is invalid`;
});
const {
  PhoneOptional: PhoneOptionalFactory,
  PhoneRequired: PhoneRequiredFactory,
} = createPhoneSchemas(mockMessageHandler);

describe('Phone Schemas', () => {
  describe('PhoneOptional', () => {
    describe('E.164 format (default)', () => {
      const schema = PhoneOptional();
      
      runTableTests([
        {
          description: 'should accept valid E.164 format',
          input: '+11234567890',
          expected: '+11234567890'
        },
        {
          description: 'should normalize 10-digit number to E.164',
          input: '1234567890',
          expected: '+11234567890'
        },
        {
          description: 'should normalize 11-digit number to E.164',
          input: '11234567890',
          expected: '+11234567890'
        },
        {
          description: 'should normalize formatted phone numbers',
          input: '(123) 456-7890',
          expected: '+11234567890'
        },
        {
          description: 'should handle undefined',
          input: undefined,
          expected: undefined
        },
        {
          description: 'should handle empty string',
          input: '',
          expected: undefined
        },
        {
          description: 'should handle whitespace-only string',
          input: '   ',
          expected: undefined
        },
        {
          description: 'should reject invalid short number',
          input: '123',
          expected: new Error(),
          shouldThrow: true
        },
        {
          description: 'should reject invalid long number',
          input: '12345678901234',
          expected: new Error(),
          shouldThrow: true
        },
        {
          description: 'should reject non-US country code',
          input: '+44123456789',
          expected: new Error(),
          shouldThrow: true
        },
        {
          description: 'should reject alphabetic characters',
          input: 'abc123def456',
          expected: new Error(),
          shouldThrow: true
        }
      ], (input) => schema.parse(input));
    });

    describe('National format', () => {
      const schema = PhoneOptional({ msg: 'Phone', format: PhoneFormat.National });
      
      runTableTests([
        {
          description: 'should accept valid 10-digit format',
          input: '1234567890',
          expected: '1234567890'
        },
        {
          description: 'should normalize E.164 to national',
          input: '+11234567890',
          expected: '1234567890'
        },
        {
          description: 'should normalize 11-digit to national',
          input: '11234567890',
          expected: '1234567890'
        },
        {
          description: 'should handle undefined',
          input: undefined,
          expected: undefined
        }
      ], (input) => schema.parse(input));
    });

    describe('Custom error messages', () => {
      it('should use custom field name in error message and include examples', () => {
        const schema = PhoneOptional({ msg: 'Mobile Number' });
        try {
          schema.parse('invalid');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Mobile Number must be a valid phone number');
        }
      });

      it('should use custom message when msgType is Message and include examples', () => {
        const schema = PhoneOptional({ msg: 'Invalid phone format', format: PhoneFormat.E164, msgType: MsgType.Message });
        try {
          schema.parse('invalid');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Invalid phone format');
        }
      });
    });
  });

  describe('PhoneRequired', () => {
    describe('E.164 format (default)', () => {
      const schema = PhoneRequired();
      
      runTableTests([
        {
          description: 'should accept valid E.164 format',
          input: '+11234567890',
          expected: '+11234567890'
        },
        {
          description: 'should normalize 10-digit number to E.164',
          input: '1234567890',
          expected: '+11234567890'
        },
        {
          description: 'should normalize formatted phone numbers',
          input: '(123) 456-7890',
          expected: '+11234567890'
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
          description: 'should reject invalid short number',
          input: '123',
          expected: new Error(),
          shouldThrow: true
        }
      ], (input) => schema.parse(input));
    });

    describe('National format', () => {
      const schema = PhoneRequired({ msg: 'Phone', format: PhoneFormat.National });
      
      runTableTests([
        {
          description: 'should accept valid 10-digit format',
          input: '1234567890',
          expected: '1234567890'
        },
        {
          description: 'should normalize E.164 to national',
          input: '+11234567890',
          expected: '1234567890'
        }
      ], (input) => schema.parse(input));
    });

    describe('Custom error messages', () => {
      it('should use custom field name in required error message', () => {
        const schema = PhoneRequired({ msg: 'Mobile Number' });
       expect(() => schema.parse('')).toThrow('Mobile Number is required');
      });

      it('should use custom field name in validation error message and include examples', () => {
        const schema = PhoneRequired({ msg: 'Mobile Number' });
        try {
          schema.parse('invalid');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Mobile Number must be a valid phone number');
        }
      });

      it('should use custom message when msgType is Message and include examples', () => {
        const schema = PhoneRequired({ msg: 'Phone is required', format: PhoneFormat.E164, msgType: MsgType.Message });
        try {
          schema.parse('invalid');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Phone is required');
        }
      });
    });
  });

  describe('normalizeUSPhone', () => {
    describe('E.164 format (default)', () => {
      runTableTests([
        {
          description: 'should normalize 10-digit number',
          input: '1234567890',
          expected: '+11234567890'
        },
        {
          description: 'should normalize 11-digit number',
          input: '11234567890',
          expected: '+11234567890'
        },
        {
          description: 'should keep valid E.164 format',
          input: '+11234567890',
          expected: '+11234567890'
        },
        {
          description: 'should handle formatted numbers',
          input: '(123) 456-7890',
          expected: '+11234567890'
        },
        {
          description: 'should return null for invalid input',
          input: '123',
          expected: null
        },
        {
          description: 'should return null for non-US country code',
          input: '+44123456789',
          expected: null
        }
      ], (input) => normalizeUSPhone(input as string));
    });

    describe('National format', () => {
      runTableTests([
        {
          description: 'should normalize to 10-digit format',
          input: '1234567890',
          expected: '1234567890'
        },
        {
          description: 'should normalize E.164 to national',
          input: '+11234567890',
          expected: '1234567890'
        },
        {
          description: 'should normalize 11-digit to national',
          input: '11234567890',
          expected: '1234567890'
        }
      ], (input) => normalizeUSPhone(input as string, PhoneFormat.National));
    });
  });

  describe('phoneTransformAndValidate', () => {
    runTableTests([
      {
        description: 'should transform valid phone number',
        input: '1234567890',
        expected: '+11234567890'
      },
      {
        description: 'should return undefined for empty string',
        input: '',
        expected: undefined
      },
      {
        description: 'should return undefined for whitespace',
        input: '   ',
        expected: undefined
      },
      {
        description: 'should return null for invalid input',
        input: '123',
        expected: null
      }
    ], (input) => phoneTransformAndValidate(input));
  });

  describe('phoneRefine', () => {
    describe('E.164 format (default)', () => {
      runTableTests([
        {
          description: 'should validate E.164 format',
          input: '+11234567890',
          expected: true
        },
        {
          description: 'should reject national format when E.164 expected',
          input: '1234567890',
          expected: false
        },
        {
          description: 'should return true for undefined',
          input: undefined,
          expected: true
        },
        {
          description: 'should return false for invalid format',
          input: '123',
          expected: false
        }
      ], (input) => phoneRefine(input as string | undefined));
    });

    describe('National format', () => {
      runTableTests([
        {
          description: 'should validate national format',
          input: '1234567890',
          expected: true
        },
        {
          description: 'should reject E.164 format when national expected',
          input: '+11234567890',
          expected: false
        },
        {
          description: 'should return true for undefined',
          input: undefined,
          expected: true
        },
        {
          description: 'should return false for invalid format',
          input: '123',
          expected: false
        }
      ], (input) => phoneRefine(input as string | undefined, PhoneFormat.National));
    });
  });

  describe('Phone Schemas - String Parameter Overloads', () => {
    describe('PhoneOptional overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema = PhoneOptional('Contact Phone');
        
        // Should work with valid values
        expect(schema.parse('1234567890')).toBe('+11234567890');
        expect(schema.parse('+11234567890')).toBe('+11234567890');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(schema.parse('')).toBeUndefined();
        
        // Should use the string as field name in error messages
        try {
          schema.parse('invalid');
          fail('Should have thrown');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Contact Phone');
        }
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = PhoneOptional({ msg: 'Mobile Phone', format: PhoneFormat.National });
        
        expect(schema.parse('1234567890')).toBe('1234567890');
        expect(schema.parse('+11234567890')).toBe('1234567890');
        
        try {
          schema.parse('invalid');
          fail('Should have thrown');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Mobile Phone');
        }
      });

      it('should work with no parameters (default usage)', () => {
        const schema = PhoneOptional();
        
        expect(schema.parse('1234567890')).toBe('+11234567890');
        expect(schema.parse(undefined)).toBeUndefined();
        
        try {
          schema.parse('invalid');
          fail('Should have thrown');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Phone');
        }
      });

      it('should maintain type safety for string parameters', () => {
        // This is a compile-time test to ensure TypeScript types work correctly
        const schema1 = PhoneOptional('Contact Phone');  // string param
        const schema2 = PhoneOptional({ msg: 'Mobile Phone' });  // options object
        const schema3 = PhoneOptional();  // no params
        
        // All should return the same schema type
        expect(typeof schema1.parse).toBe('function');
        expect(typeof schema2.parse).toBe('function');
        expect(typeof schema3.parse).toBe('function');
      });
    });

    describe('PhoneRequired overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema = PhoneRequired('Primary Phone');
        
        // Should work with valid values
        expect(schema.parse('1234567890')).toBe('+11234567890');
        expect(schema.parse('+11234567890')).toBe('+11234567890');
        
        // Should use the string as field name in error messages
        expect(() => schema.parse('')).toThrow('Primary Phone is required');
        
        try {
          schema.parse('invalid');
          fail('Should have thrown');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Primary Phone');
        }
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = PhoneRequired({ msg: 'Emergency Contact', format: PhoneFormat.National });
        
        expect(schema.parse('1234567890')).toBe('1234567890');
        expect(schema.parse('+11234567890')).toBe('1234567890');
        
        expect(() => schema.parse('')).toThrow('Emergency Contact is required');
        
        try {
          schema.parse('invalid');
          fail('Should have thrown');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Emergency Contact');
        }
      });

      it('should work with no parameters (default usage)', () => {
        const schema = PhoneRequired();
        
        expect(schema.parse('1234567890')).toBe('+11234567890');
        
        expect(() => schema.parse('')).toThrow('Phone is required');
        
        try {
          schema.parse('invalid');
          fail('Should have thrown');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Phone');
        }
      });

      it('should maintain type safety for string parameters', () => {
        // This is a compile-time test to ensure TypeScript types work correctly
        const schema1 = PhoneRequired('Contact Phone');  // string param
        const schema2 = PhoneRequired({ msg: 'Mobile Phone' });  // options object
        const schema3 = PhoneRequired();  // no params
        
        // All should return the same schema type
        expect(typeof schema1.parse).toBe('function');
        expect(typeof schema2.parse).toBe('function');
        expect(typeof schema3.parse).toBe('function');
      });
    });

    describe('Real-world usage examples', () => {
      it('should handle contact form phone validation', () => {
        const contactPhoneSchema = PhoneOptional('Contact Phone');
        const emergencyPhoneSchema = PhoneRequired('Emergency Contact');
        
        // Optional phone - should handle empty values
        expect(contactPhoneSchema.parse('')).toBeUndefined();
        expect(contactPhoneSchema.parse('555-123-4567')).toBe('+15551234567');
        
        // Required phone - should enforce presence
        expect(() => emergencyPhoneSchema.parse('')).toThrow('Emergency Contact is required');
        expect(emergencyPhoneSchema.parse('555-123-4567')).toBe('+15551234567');
      });

      it('should handle user registration form', () => {
        const mobileSchema = PhoneRequired('Mobile Phone');
        const workPhoneSchema = PhoneOptional('Work Phone');
        
        // Mobile is required
        expect(() => mobileSchema.parse(undefined as any)).toThrow();
        expect(mobileSchema.parse('(555) 987-6543')).toBe('+15559876543');
        
        // Work phone is optional
        expect(workPhoneSchema.parse(undefined)).toBeUndefined();
        expect(workPhoneSchema.parse('(555) 987-6543')).toBe('+15559876543');
      });

      it('should work with different formats specified', () => {
        const e164Schema = PhoneRequired('International Number');
        const nationalSchema = PhoneRequired({ msg: 'US Number', format: PhoneFormat.National });
        
        // E.164 format (default)
        expect(e164Schema.parse('5551234567')).toBe('+15551234567');
        
        // National format
        expect(nationalSchema.parse('5551234567')).toBe('5551234567');
      });
    });
  });
});

