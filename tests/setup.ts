// Global test setup
import { ZodError } from 'zod';

// Helper function to extract error messages from ZodError
export const extractZodIssueMessage = (error: ZodError): string => {
  return error.issues[0]?.message || 'Unknown error';
};

// Helper function to run table-driven tests
export const runTableTests = <T>(
  testCases: Array<{
    description: string;
    input: unknown;
    expected: T | Error;
    shouldThrow?: boolean;
  }>,
  testFunction: (input: unknown) => T
) => {
  testCases.forEach(({ description, input, expected, shouldThrow = false }) => {
    it(description, () => {
      if (shouldThrow || expected instanceof Error) {
        expect(() => testFunction(input)).toThrow();
      } else {
        expect(testFunction(input)).toEqual(expected);
      }
    });
  });
};

// Common test data generators
export const generateTestData = {
  validEmails: [
    'test@example.com',
    'user.name@domain.co.uk',
    'user+tag@example.org',
    'a@b.co'
  ],
  invalidEmails: [
    'invalid-email',
    '@example.com',
    'test@',
    'test.example.com',
    'test@.com',
    'test@domain',
    ''
  ],
  validPhones: {
    e164: ['+11234567890', '+19876543210'],
    national: ['1234567890', '9876543210'],
    various: ['123-456-7890', '(123) 456-7890', '123.456.7890']
  },
  invalidPhones: [
    '123',
    '12345',
    '123456789',
    '12345678901',
    'abc',
    '+2123456789',
    '1234567890123'
  ],
  edgeCases: {
    empty: ['', '   ', '\t', '\n'],
    whitespace: [' test ', '\ttest\t', '\ntest\n'],
    special: [null, undefined, 0, false, true, [], {}]
  }
};
