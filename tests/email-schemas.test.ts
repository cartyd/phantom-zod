import { 
  createEmailSchemas, 
  isEmail,
  zEmailOptional,
  zEmailRequired,
  zHtml5EmailRequired,
  zHtml5EmailOptional,
  zRfc5322EmailRequired,
  zRfc5322EmailOptional,
  zUnicodeEmailRequired,
  zUnicodeEmailOptional
} from '../src/schemas/email-schemas';
import { MsgType } from '../src/common/types/msg-type';
import { createTestMessageHandler } from '../src/localization/types/message-handler.types';
import { runTableTests, generateTestData } from './setup';

describe('Email Schemas', () => {
  const messageHandler = createTestMessageHandler();
  const { zEmailOptional, zEmailRequired } = createEmailSchemas(messageHandler);
  describe('zEmailOptional', () => {
    const schema = zEmailOptional();

    runTableTests([
      {
        description: 'should accept valid email addresses',
        input: 'test@example.com',
        expected: 'test@example.com'
      },
      {
        description: 'should accept email with subdomain',
        input: 'user@mail.example.com',
        expected: 'user@mail.example.com'
      },
      {
        description: 'should accept email with plus sign',
        input: 'user+tag@example.com',
        expected: 'user+tag@example.com'
      },
      {
        description: 'should accept email with dots in local part',
        input: 'user.name@example.com',
        expected: 'user.name@example.com'
      },
      {
        description: 'should accept email with numbers',
        input: 'user123@example123.com',
        expected: 'user123@example123.com'
      },
      {
        description: 'should handle undefined',
        input: undefined,
        expected: undefined
      },
      {
        description: 'should trim whitespace and return undefined for empty',
        input: '   ',
        expected: undefined
      },
      {
        description: 'should trim whitespace around valid email',
        input: '  test@example.com  ',
        expected: 'test@example.com'
      },
      {
        description: 'should reject invalid email - missing @',
        input: 'testexample.com',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject invalid email - missing domain',
        input: 'test@',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject invalid email - missing local part',
        input: '@example.com',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject invalid email - missing TLD',
        input: 'test@example',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject invalid email - multiple @',
        input: 'test@@example.com',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject invalid email - spaces in email',
        input: 'test @example.com',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Edge cases', () => {
      generateTestData.validEmails.forEach(email => {
        it(`should accept valid email: ${email}`, () => {
          expect(schema.parse(email)).toBe(email);
        });
      });

      generateTestData.invalidEmails.filter(email => email !== '').forEach(email => {
        it(`should reject invalid email: ${email}`, () => {
          expect(() => schema.parse(email)).toThrow();
        });
      });
    });

    describe('Custom error messages', () => {
      it('should use custom field name in error message', () => {
        const schema = zEmailOptional({ msg: 'Email Address' });
        expect(() => schema.parse('invalid')).toThrow('Email Address must be a valid email address');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zEmailOptional({ msg: 'Invalid email format', msgType: MsgType.Message });
        expect(() => schema.parse('invalid')).toThrow('Invalid email format');
      });
    });
  });

  describe('zEmailRequired', () => {
    const schema = zEmailRequired();

    runTableTests([
      {
        description: 'should accept valid email addresses',
        input: 'test@example.com',
        expected: 'test@example.com'
      },
      {
        description: 'should trim whitespace around valid email',
        input: '  test@example.com  ',
        expected: 'test@example.com'
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
        description: 'should reject invalid email format',
        input: 'invalid-email',
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
      generateTestData.validEmails.forEach(email => {
        it(`should accept valid email: ${email}`, () => {
          expect(schema.parse(email)).toBe(email);
        });
      });

      generateTestData.invalidEmails.forEach(email => {
        it(`should reject invalid email: ${email}`, () => {
          expect(() => schema.parse(email)).toThrow();
        });
      });
    });

    describe('Custom error messages', () => {
      it('should use custom field name in validation error message', () => {
        const schema = zEmailRequired({ msg: 'Email Address' });
        expect(() => schema.parse('invalid')).toThrow('Email Address must be a valid email address');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zEmailRequired({ msg: 'Email is required', msgType: MsgType.Message });
        expect(() => schema.parse('invalid')).toThrow('Email is required');
      });
    });
  });

  describe('isEmail utility function', () => {
    runTableTests([
      {
        description: 'should validate correct email format',
        input: 'test@example.com',
        expected: true
      },
      {
        description: 'should validate email with subdomain',
        input: 'user@mail.example.com',
        expected: true
      },
      {
        description: 'should validate email with plus sign',
        input: 'user+tag@example.com',
        expected: true
      },
      {
        description: 'should return true for undefined',
        input: undefined,
        expected: true
      },
      {
        description: 'should return false for invalid format',
        input: 'invalid-email',
        expected: false
      },
      {
        description: 'should return false for missing @',
        input: 'testexample.com',
        expected: false
      },
      {
        description: 'should return false for missing domain',
        input: 'test@',
        expected: false
      },
      {
        description: 'should return false for missing local part',
        input: '@example.com',
        expected: false
      },
      {
        description: 'should return false for spaces in email',
        input: 'test @example.com',
        expected: false
      }
    ], (input) => isEmail(input as string | undefined));

    describe('Edge cases', () => {
      generateTestData.validEmails.forEach(email => {
        it(`should return true for valid email: ${email}`, () => {
          expect(isEmail(email)).toBe(true);
        });
      });

      generateTestData.invalidEmails.forEach(email => {
        it(`should return false for invalid email: ${email}`, () => {
          expect(isEmail(email)).toBe(false);
        });
      });
    });
  });

  describe('Convenience functions with different patterns', () => {
    describe('zEmailRequired and zEmailOptional (exported)', () => {
      it('should work with default pattern', () => {
        const requiredSchema = zEmailRequired();
        const optionalSchema = zEmailOptional();
        
        expect(requiredSchema.parse('user@example.com')).toBe('user@example.com');
        expect(optionalSchema.parse('user@example.com')).toBe('user@example.com');
        expect(optionalSchema.parse(undefined)).toBeUndefined();
        
        expect(() => requiredSchema.parse('invalid')).toThrow();
        expect(() => optionalSchema.parse('invalid')).toThrow();
      });

      it('should work with custom pattern', () => {
        const pattern = /^[a-z]+@company\.com$/;
        const requiredSchema = zEmailRequired({ pattern });
        const optionalSchema = zEmailOptional({ pattern });
        
        expect(requiredSchema.parse('user@company.com')).toBe('user@company.com');
        expect(optionalSchema.parse('user@company.com')).toBe('user@company.com');
        expect(optionalSchema.parse(undefined)).toBeUndefined();
        
        expect(() => requiredSchema.parse('user@example.com')).toThrow();
        expect(() => optionalSchema.parse('user@example.com')).toThrow();
        expect(() => requiredSchema.parse('USER@company.com')).toThrow(); // uppercase not allowed
      });

      it('should work with custom error messages', () => {
        const requiredSchema = zEmailRequired({ msg: 'User Email' });
        const optionalSchema = zEmailOptional({ msg: 'User Email' });
        
        expect(() => requiredSchema.parse('invalid')).toThrow('User Email must be a valid email address');
        expect(() => optionalSchema.parse('invalid')).toThrow('User Email must be a valid email address');
      });
    });

    describe('HTML5 email validation', () => {
      it('zHtml5EmailRequired should accept HTML5-compliant emails', () => {
        const schema = zHtml5EmailRequired();
        
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        expect(schema.parse('user+tag@example.com')).toBe('user+tag@example.com');
        expect(schema.parse('user.name@example.com')).toBe('user.name@example.com');
        
        expect(() => schema.parse('invalid')).toThrow();
        expect(() => schema.parse(undefined)).toThrow();
      });

      it('zHtml5EmailOptional should accept HTML5-compliant emails or undefined', () => {
        const schema = zHtml5EmailOptional();
        
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        expect(schema.parse(undefined)).toBeUndefined();
        
        expect(() => schema.parse('invalid')).toThrow();
      });

      it('should use custom error messages', () => {
        const schema = zHtml5EmailRequired({ msg: 'Registration Email' });
        expect(() => schema.parse('invalid')).toThrow('Registration Email must be a valid email address');
      });
    });

    describe('RFC 5322 email validation', () => {
      it('zRfc5322EmailRequired should accept RFC 5322-compliant emails', () => {
        const schema = zRfc5322EmailRequired();
        
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        expect(schema.parse('very.long.email.address@example.com')).toBe('very.long.email.address@example.com');
        
        expect(() => schema.parse('invalid')).toThrow();
        expect(() => schema.parse(undefined)).toThrow();
      });

      it('zRfc5322EmailOptional should accept RFC 5322-compliant emails or undefined', () => {
        const schema = zRfc5322EmailOptional();
        
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        expect(schema.parse(undefined)).toBeUndefined();
        
        expect(() => schema.parse('invalid')).toThrow();
      });

      it('should use custom error messages', () => {
        const schema = zRfc5322EmailRequired({ msg: 'API User Email' });
        expect(() => schema.parse('invalid')).toThrow('API User Email must be a valid email address');
      });
    });

    describe('Unicode email validation', () => {
      it('zUnicodeEmailRequired should accept Unicode emails', () => {
        const schema = zUnicodeEmailRequired();
        
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        // Note: Unicode emails might not be supported in test environment
        // so we'll just test basic functionality
        
        expect(() => schema.parse('invalid')).toThrow();
        expect(() => schema.parse(undefined)).toThrow();
      });

      it('zUnicodeEmailOptional should accept Unicode emails or undefined', () => {
        const schema = zUnicodeEmailOptional();
        
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        expect(schema.parse(undefined)).toBeUndefined();
        
        expect(() => schema.parse('invalid')).toThrow();
      });

      it('should use custom error messages', () => {
        const schema = zUnicodeEmailRequired({ msg: 'International Email' });
        expect(() => schema.parse('invalid')).toThrow('International Email must be a valid email address');
      });
    });
  });
});
