import { 
  createPhoneSchemas, 
  PhoneFormat
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
  zPhoneOptional,
  zPhoneRequired,
} = createPhoneSchemas(mockMessageHandler);

describe('Phone Schemas', () => {
  describe('zPhoneOptional', () => {
    describe('E.164 format (default)', () => {
      const schema = zPhoneOptional();
      
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
      const schema = zPhoneOptional({ msg: 'Phone', format: PhoneFormat.National });
      
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
        const schema = zPhoneOptional({ msg: 'Mobile Number' });
        try {
          schema.parse('invalid');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Mobile Number is invalid');
          expect(message).toContain('+11234567890');
          expect(message).toContain('1234567890');
          expect(message).toContain('supported');
        }
      });

      it('should use custom message when msgType is Message and include examples', () => {
        const schema = zPhoneOptional({ msg: 'Invalid phone format', format: PhoneFormat.E164, msgType: MsgType.Message });
        try {
          schema.parse('invalid');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Invalid phone format');
          expect(message).toContain('+11234567890');
          expect(message).toContain('1234567890');
          expect(message).toContain('supported');
        }
      });
    });
  });

  describe('zPhoneRequired', () => {
    describe('E.164 format (default)', () => {
      const schema = zPhoneRequired();
      
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
      const schema = zPhoneRequired({ msg: 'Phone', format: PhoneFormat.National });
      
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
        const schema = zPhoneRequired({ msg: 'Mobile Number' });
        expect(() => schema.parse('')).toThrow('Mobile Number is required');
      });

      it('should use custom field name in validation error message and include examples', () => {
        const schema = zPhoneRequired({ msg: 'Mobile Number' });
        try {
          schema.parse('invalid');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Mobile Number is invalid');
          expect(message).toContain('+11234567890');
          expect(message).toContain('1234567890');
          expect(message).toContain('supported');
        }
      });

      it('should use custom message when msgType is Message and include examples', () => {
        const schema = zPhoneRequired({ msg: 'Phone is required', format: PhoneFormat.E164, msgType: MsgType.Message });
        try {
          schema.parse('invalid');
        } catch (e) {
          const message = (e as { issues?: Array<{ message: string }> }).issues?.[0]?.message 
            || (e as Error).message 
            || String(e);
          expect(message).toContain('Phone is required');
          expect(message).toContain('+11234567890');
          expect(message).toContain('1234567890');
          expect(message).toContain('supported');
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
});

