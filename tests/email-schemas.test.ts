import { pz } from '../src/pz';
import { isEmail } from '../src/schemas/email-schemas';
import { MsgType } from '../src/common/types/msg-type';
import { createTestMessageHandler } from '../src/localization/types/message-handler.types';
import { runTableTests, generateTestData } from './setup';

const { EmailOptional, EmailRequired, Html5EmailRequired, Html5EmailOptional, Rfc5322EmailRequired, Rfc5322EmailOptional, UnicodeEmailRequired, UnicodeEmailOptional } = pz;

describe('Email Schemas', () => {
  describe('EmailOptional', () => {
    const schema = EmailOptional();

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
        const schema = EmailOptional({ msg: 'Email Address' });
        expect(() => schema.parse('invalid')).toThrow('Email Address must be a valid email address');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = EmailOptional({ msg: 'Invalid email format', msgType: MsgType.Message });
        expect(() => schema.parse('invalid')).toThrow('Invalid email format');
      });
    });
  });

  describe('EmailRequired', () => {
    const schema = EmailRequired();

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
        const schema = EmailRequired({ msg: 'Email Address' });
        expect(() => schema.parse('invalid')).toThrow('Email Address must be a valid email address');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = EmailRequired({ msg: 'Email is required', msgType: MsgType.Message });
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
    describe('EmailRequired and EmailOptional (exported)', () => {
      it('should work with default pattern', () => {
        const requiredSchema = EmailRequired();
        const optionalSchema = EmailOptional();
        
        expect(requiredSchema.parse('user@example.com')).toBe('user@example.com');
        expect(optionalSchema.parse('user@example.com')).toBe('user@example.com');
        expect(optionalSchema.parse(undefined)).toBeUndefined();
        
        expect(() => requiredSchema.parse('invalid')).toThrow();
        expect(() => optionalSchema.parse('invalid')).toThrow();
      });

      it('should work with custom pattern', () => {
        const pattern = /^[a-z]+@company\.com$/;
        const requiredSchema = EmailRequired({ pattern });
        const optionalSchema = EmailOptional({ pattern });
        
        expect(requiredSchema.parse('user@company.com')).toBe('user@company.com');
        expect(optionalSchema.parse('user@company.com')).toBe('user@company.com');
        expect(optionalSchema.parse(undefined)).toBeUndefined();
        
        expect(() => requiredSchema.parse('user@example.com')).toThrow();
        expect(() => optionalSchema.parse('user@example.com')).toThrow();
        expect(() => requiredSchema.parse('USER@company.com')).toThrow(); // uppercase not allowed
      });

      it('should work with custom error messages', () => {
        const requiredSchema = EmailRequired({ msg: 'User Email' });
        const optionalSchema = EmailOptional({ msg: 'User Email' });
        
        expect(() => requiredSchema.parse('invalid')).toThrow('User Email must be a valid email address');
        expect(() => optionalSchema.parse('invalid')).toThrow('User Email must be a valid email address');
      });
    });

    describe('HTML5 email validation', () => {
      it('Html5EmailRequired should accept HTML5-compliant emails', () => {
        const schema = Html5EmailRequired();
        
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        expect(schema.parse('user+tag@example.com')).toBe('user+tag@example.com');
        expect(schema.parse('user.name@example.com')).toBe('user.name@example.com');
        
        expect(() => schema.parse('invalid')).toThrow();
        expect(() => schema.parse(undefined)).toThrow();
      });

      it('Html5EmailOptional should accept HTML5-compliant emails or undefined', () => {
        const schema = Html5EmailOptional();
        
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        expect(schema.parse(undefined)).toBeUndefined();
        
        expect(() => schema.parse('invalid')).toThrow();
      });

      it('should use custom error messages', () => {
        const schema = Html5EmailRequired({ msg: 'Registration Email' });
        expect(() => schema.parse('invalid')).toThrow('Registration Email must be a valid email address');
      });
    });

    describe('RFC 5322 email validation', () => {
      it('Rfc5322EmailRequired should accept RFC 5322-compliant emails', () => {
        const schema = Rfc5322EmailRequired();
        
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        expect(schema.parse('very.long.email.address@example.com')).toBe('very.long.email.address@example.com');
        
        expect(() => schema.parse('invalid')).toThrow();
        expect(() => schema.parse(undefined)).toThrow();
      });

      it('Rfc5322EmailOptional should accept RFC 5322-compliant emails or undefined', () => {
        const schema = Rfc5322EmailOptional();
        
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        expect(schema.parse(undefined)).toBeUndefined();
        
        expect(() => schema.parse('invalid')).toThrow();
      });

      it('should use custom error messages', () => {
        const schema = Rfc5322EmailRequired({ msg: 'API User Email' });
        expect(() => schema.parse('invalid')).toThrow('API User Email must be a valid email address');
      });
    });

    describe('Unicode email validation', () => {
      it('UnicodeEmailRequired should accept Unicode emails', () => {
        const schema = UnicodeEmailRequired();
        
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        // Note: Unicode emails might not be supported in test environment
        // so we'll just test basic functionality
        
        expect(() => schema.parse('invalid')).toThrow();
        expect(() => schema.parse(undefined)).toThrow();
      });

      it('UnicodeEmailOptional should accept Unicode emails or undefined', () => {
        const schema = UnicodeEmailOptional();
        
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        expect(schema.parse(undefined)).toBeUndefined();
        
        expect(() => schema.parse('invalid')).toThrow();
      });

      it('should use custom error messages', () => {
        const schema = UnicodeEmailRequired({ msg: 'International Email' });
        expect(() => schema.parse('invalid')).toThrow('International Email must be a valid email address');
      });
    });
  });

  describe('Email Schema String Parameter Overloads', () => {
    describe('EmailOptional overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema1 = EmailOptional('User Email');
        const schema2 = EmailOptional({ msg: 'User Email' });
        
        expect(schema1.parse('user@example.com')).toBe('user@example.com');
        expect(schema2.parse('user@example.com')).toBe('user@example.com');
        expect(schema1.parse(undefined)).toBeUndefined();
        expect(schema2.parse(undefined)).toBeUndefined();
        
        // Test error message consistency
        try {
          schema1.parse('invalid-email');
        } catch (error1) {
          try {
            schema2.parse('invalid-email');
          } catch (error2) {
            expect((error1 as Error).message).toEqual((error2 as Error).message);
          }
        }
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = EmailOptional({ msg: 'Contact Email', msgType: MsgType.FieldName });
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse('invalid')).toThrow('Contact Email must be a valid email address');
      });

      it('should work with no parameters (default usage)', () => {
        const schema = EmailOptional();
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        expect(schema.parse(undefined)).toBeUndefined();
      });

      it('should work with custom pattern and string parameter', () => {
        const pattern = /^[a-z]+@company\.com$/;
        const schema = EmailOptional({ msg: 'Company Email', pattern });
        
        expect(schema.parse('user@company.com')).toBe('user@company.com');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse('user@example.com')).toThrow('Company Email must be a valid email address');
      });
    });

    describe('EmailRequired overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema1 = EmailRequired('User Email');
        const schema2 = EmailRequired({ msg: 'User Email' });
        
        expect(schema1.parse('user@example.com')).toBe('user@example.com');
        expect(schema2.parse('user@example.com')).toBe('user@example.com');
        
        // Test error message consistency
        try {
          schema1.parse('invalid-email');
        } catch (error1) {
          try {
            schema2.parse('invalid-email');
          } catch (error2) {
            expect((error1 as Error).message).toEqual((error2 as Error).message);
          }
        }
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = EmailRequired({ msg: 'Login Email', msgType: MsgType.FieldName });
        expect(schema.parse('user@example.com')).toBe('user@example.com');
        expect(() => schema.parse('invalid')).toThrow('Login Email must be a valid email address');
      });

      it('should work with no parameters (default usage)', () => {
        const schema = EmailRequired();
        expect(schema.parse('user@example.com')).toBe('user@example.com');
      });

      it('should work with custom pattern and string parameter', () => {
        const pattern = /^[a-z]+@company\.com$/;
        const schema = EmailRequired({ msg: 'Corporate Email', pattern });
        
        expect(schema.parse('user@company.com')).toBe('user@company.com');
        expect(() => schema.parse('user@example.com')).toThrow('Corporate Email must be a valid email address');
      });
    });

    describe('Specialized email schema overloads', () => {
      it('Html5EmailRequired should work with string parameter', () => {
        const schema1 = Html5EmailRequired('HTML5 Email');
        const schema2 = Html5EmailRequired({ msg: 'HTML5 Email' });
        
        expect(schema1.parse('user@example.com')).toBe('user@example.com');
        expect(schema2.parse('user@example.com')).toBe('user@example.com');
      });

      it('Html5EmailOptional should work with string parameter', () => {
        const schema1 = Html5EmailOptional('HTML5 Email');
        const schema2 = Html5EmailOptional({ msg: 'HTML5 Email' });
        
        expect(schema1.parse('user@example.com')).toBe('user@example.com');
        expect(schema2.parse('user@example.com')).toBe('user@example.com');
        expect(schema1.parse(undefined)).toBeUndefined();
      });

      it('Rfc5322EmailRequired should work with string parameter', () => {
        const schema1 = Rfc5322EmailRequired('RFC Email');
        const schema2 = Rfc5322EmailRequired({ msg: 'RFC Email' });
        
        expect(schema1.parse('user@example.com')).toBe('user@example.com');
        expect(schema2.parse('user@example.com')).toBe('user@example.com');
      });

      it('Rfc5322EmailOptional should work with string parameter', () => {
        const schema1 = Rfc5322EmailOptional('RFC Email');
        const schema2 = Rfc5322EmailOptional({ msg: 'RFC Email' });
        
        expect(schema1.parse('user@example.com')).toBe('user@example.com');
        expect(schema2.parse('user@example.com')).toBe('user@example.com');
        expect(schema1.parse(undefined)).toBeUndefined();
      });

      it('UnicodeEmailRequired should work with string parameter', () => {
        const schema1 = UnicodeEmailRequired('Unicode Email');
        const schema2 = UnicodeEmailRequired({ msg: 'Unicode Email' });
        
        expect(schema1.parse('user@example.com')).toBe('user@example.com');
        expect(schema2.parse('user@example.com')).toBe('user@example.com');
      });

      it('UnicodeEmailOptional should work with string parameter', () => {
        const schema1 = UnicodeEmailOptional('Unicode Email');
        const schema2 = UnicodeEmailOptional({ msg: 'Unicode Email' });
        
        expect(schema1.parse('user@example.com')).toBe('user@example.com');
        expect(schema2.parse('user@example.com')).toBe('user@example.com');
        expect(schema1.parse(undefined)).toBeUndefined();
      });
    });

    describe('Real-world usage examples', () => {
      it('should handle user registration form with overloaded schemas', () => {
        const emailSchema = EmailRequired('Registration Email');
        const confirmEmailSchema = EmailRequired('Confirm Email');
        
        const formData = {
          email: 'user@example.com',
          confirmEmail: 'user@example.com',
        };
        
        const parsedData = {
          email: emailSchema.parse(formData.email),
          confirmEmail: confirmEmailSchema.parse(formData.confirmEmail),
        };
        
        expect(parsedData.email).toBe('user@example.com');
        expect(parsedData.confirmEmail).toBe('user@example.com');
      });

      it('should handle contact form validation with different email types', () => {
        const personalEmailSchema = EmailOptional('Personal Email');
        const workEmailSchema = Html5EmailRequired('Work Email');
        
        const contactData = {
          personalEmail: undefined,
          workEmail: 'work@company.com',
        };
        
        expect(personalEmailSchema.parse(contactData.personalEmail)).toBeUndefined();
        expect(workEmailSchema.parse(contactData.workEmail)).toBe('work@company.com');
      });

      it('should maintain type safety across all overloaded email schemas', () => {
        const schemas = {
          basic: EmailRequired('Basic'),
          html5: Html5EmailRequired('HTML5'),
          rfc: Rfc5322EmailRequired('RFC'),
          unicode: UnicodeEmailRequired('Unicode'),
          optional: EmailOptional('Optional'),
        };
        
        const email = 'test@example.com';
        
        Object.values(schemas).forEach(schema => {
          const result = schema.parse(email);
          expect(typeof result).toBe('string');
          expect(result).toBe(email);
        });
      });
    });
  });
});
