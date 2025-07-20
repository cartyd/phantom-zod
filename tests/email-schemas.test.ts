import { zEmailOptional, zEmailRequired, isEmail } from '../src/schemas/email-schemas';
import { MsgType } from '../src/schemas/msg-type';
import { runTableTests, generateTestData } from './setup';

describe('Email Schemas', () => {
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
        const schema = zEmailOptional('Email Address');
        expect(() => schema.parse('invalid')).toThrow('Email Address must be a valid email address');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zEmailOptional('Invalid email format', MsgType.Message);
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
      it('should use custom field name in required error message', () => {
        const schema = zEmailRequired('Email Address');
        expect(() => schema.parse('')).toThrow('Email Address is required');
      });

      it('should use custom field name in validation error message', () => {
        const schema = zEmailRequired('Email Address');
        expect(() => schema.parse('invalid')).toThrow('Email Address must be a valid email address');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zEmailRequired('Email is required', MsgType.Message);
        expect(() => schema.parse('')).toThrow('Email is required');
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
});
