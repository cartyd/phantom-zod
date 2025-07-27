
import { MsgType } from '../src/common/types/msg-type';
import { runTableTests } from './setup';
import { createUuidSchemas } from '../src/schemas/uuid-schemas';

// Helper to create a mock message handler that records params
function createMockHandler() {
  const calls: any[] = [];
  const handler: { formatErrorMessage: (opts: any) => string } = {
    formatErrorMessage: jest.fn((opts: any) => {
      calls.push(opts);
      // Return a string that includes the messageKey and params for assertion
      return `${opts.messageKey} ${JSON.stringify(opts.params)}`;
    })
  };
  return { handler, calls };
}

describe('UUID Schemas', () => {
  // Test data
  const validUuids = [
    '123e4567-e89b-12d3-8456-426614174000', // v1
    '123e4567-e89b-22d3-9456-426614174000', // v2
    '123e4567-e89b-32d3-a456-426614174000', // v3
    '123e4567-e89b-42d3-b456-426614174000', // v4
    '123e4567-e89b-52d3-8456-426614174000', // v5
    '123E4567-E89B-42D3-8456-426614174000', // uppercase
    '123e4567-e89b-42d3-a456-426614174000', // lowercase mixed case
  ];

  const validUuidV4s = [
    '123e4567-e89b-42d3-8456-426614174000',
    '987fcdeb-51a2-4321-9876-543210987654',
    '123E4567-E89B-42D3-A456-426614174000', // uppercase
    '123e4567-e89b-42d3-b456-426614174000', // lowercase mixed case
  ];

  const invalidUuids = [
    'invalid-uuid',
    '123e4567-e89b-12d3-a456', // too short
    '123e4567-e89b-12d3-a456-426614174000-extra', // too long
    '123e4567-e89b-12d3-g456-426614174000', // invalid character
    '123e4567e89b12d3a456426614174000', // no dashes
    '123e4567-e89b-12d3-a456-42661417400', // missing character
    '',
    '123e4567-e89b-62d3-a456-426614174000', // invalid version (6)
    '123e4567-e89b-02d3-a456-426614174000', // invalid version (0)
  ];

  const invalidUuidV4s = [
    ...invalidUuids,
    '123e4567-e89b-12d3-a456-426614174000', // v1 (not v4)
    '123e4567-e89b-22d3-a456-426614174000', // v2 (not v4)
    '123e4567-e89b-32d3-a456-426614174000', // v3 (not v4)
    '123e4567-e89b-52d3-a456-426614174000', // v5 (not v4)
  ];

  describe('zUuidOptional', () => {
    const { zUuidOptional } = createUuidSchemas({ formatErrorMessage: () => '' });
    runTableTests([
      {
        description: 'should handle undefined',
        input: undefined,
        expected: undefined
      },
      {
        description: 'should handle empty string',
        input: '',
        expected: ''
      },
      ...validUuids.map(uuid => ({
        description: `should accept valid UUID: ${uuid}`,
        input: uuid,
        expected: uuid
      })),
      ...invalidUuids.filter(uuid => uuid !== '').map(uuid => ({
        description: `should reject invalid UUID: ${uuid}`,
        input: uuid,
        expected: new Error(),
        shouldThrow: true
      })),
      {
        description: 'should reject null',
        input: null,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject number',
        input: 123,
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
      }
    ], (input) => zUuidOptional({}).parse(input));

    it('should pass contract params to message handler for invalid values', () => {
      const { handler, calls } = createMockHandler();
      const { zUuidOptional } = createUuidSchemas(handler);
      const schema = zUuidOptional();
      // Invalid string
      calls.length = 0;
      expect(() => schema.parse('not-a-uuid')).toThrow(/mustBeValidUuid/);
      expect(calls[calls.length-1]?.params).toMatchObject({ receivedValue: 'not-a-uuid' });
      // Non-string values are rejected by Zod's union type checking, not our custom validation
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse({})).toThrow();
      expect(() => schema.parse([])).toThrow();
    });
  });

  describe('zUuidRequired', () => {
    const { zUuidRequired } = createUuidSchemas({ formatErrorMessage: () => '' });
    runTableTests([
      {
        description: 'should reject undefined',
        input: undefined,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject empty string',
        input: '',
        expected: new Error(),
        shouldThrow: true
      },
      ...validUuids.map(uuid => ({
        description: `should accept valid UUID: ${uuid}`,
        input: uuid,
        expected: uuid
      })),
      ...invalidUuids.map(uuid => ({
        description: `should reject invalid UUID: ${uuid}`,
        input: uuid,
        expected: new Error(),
        shouldThrow: true
      })),
      {
        description: 'should reject null',
        input: null,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject number',
        input: 123,
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => zUuidRequired({}).parse(input));

    it('should pass contract params to message handler for invalid values', () => {
      const { handler, calls } = createMockHandler();
      const { zUuidRequired } = createUuidSchemas(handler);
      const schema = zUuidRequired();
      // Invalid string
      calls.length = 0;
      expect(() => schema.parse('not-a-uuid')).toThrow(/mustBeValidUuid/);
      expect(calls[calls.length-1]?.params).toMatchObject({ receivedValue: 'not-a-uuid' });
      // Non-string values are rejected by Zod's built-in type checking
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse({})).toThrow();
      expect(() => schema.parse([])).toThrow();
    });
  });

  describe('zUuidV4Optional', () => {
    const { zUuidV4Optional } = createUuidSchemas({ formatErrorMessage: () => '' });
    runTableTests([
      {
        description: 'should handle undefined',
        input: undefined,
        expected: undefined
      },
      {
        description: 'should handle empty string',
        input: '',
        expected: ''
      },
      ...validUuidV4s.map(uuid => ({
        description: `should accept valid UUIDv4: ${uuid}`,
        input: uuid,
        expected: uuid
      })),
      ...invalidUuidV4s.filter(uuid => uuid !== '').map(uuid => ({
        description: `should reject invalid UUIDv4: ${uuid}`,
        input: uuid,
        expected: new Error(),
        shouldThrow: true
      })),
      {
        description: 'should reject null',
        input: null,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject number',
        input: 123,
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => zUuidV4Optional().parse(input));

    it('should pass contract params to message handler for invalid values', () => {
      const { handler, calls } = createMockHandler();
      const { zUuidV4Optional } = createUuidSchemas(handler);
      const schema = zUuidV4Optional();
      // Non-string values are rejected by Zod's union type checking
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse({})).toThrow();
      expect(() => schema.parse([])).toThrow();
      // Valid UUID but not v4
      calls.length = 0;
      expect(() => schema.parse('123e4567-e89b-12d3-a456-426614174000')).toThrow(/mustBeValidUuidV4/);
      expect(calls[calls.length-1]?.params).toMatchObject({ receivedVersion: '1' });
      // Completely invalid
      calls.length = 0;
      expect(() => schema.parse('not-a-uuid')).toThrow(/mustBeValidUuidV4/);
      expect(calls[calls.length-1]?.params).toMatchObject({ receivedVersion: undefined });
    });
  });

  describe('zUuidV4Required', () => {
    const { zUuidV4Required } = createUuidSchemas({ formatErrorMessage: () => '' });
    runTableTests([
      {
        description: 'should reject undefined',
        input: undefined,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject empty string',
        input: '',
        expected: new Error(),
        shouldThrow: true
      },
      ...validUuidV4s.map(uuid => ({
        description: `should accept valid UUIDv4: ${uuid}`,
        input: uuid,
        expected: uuid
      })),
      ...invalidUuidV4s.map(uuid => ({
        description: `should reject invalid UUIDv4: ${uuid}`,
        input: uuid,
        expected: new Error(),
        shouldThrow: true
      })),
      {
        description: 'should reject null',
        input: null,
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => zUuidV4Required().parse(input));

    it('should pass contract params to message handler for invalid values', () => {
      const { handler, calls } = createMockHandler();
      const { zUuidV4Required } = createUuidSchemas(handler);
      const schema = zUuidV4Required();
      // Not a string
      calls.length = 0;
      expect(() => schema.parse(123)).toThrow(/invalid/);
      if (calls.length > 0) {
        expect(calls[calls.length-1]?.params).toMatchObject({ receivedValue: 123 });
      }
      // Valid UUID but not v4
      calls.length = 0;
      expect(() => schema.parse('123e4567-e89b-12d3-a456-426614174000')).toThrow(/mustBeValidUuidV4/);
      if (calls.length > 0) {
        expect(calls[calls.length-1]?.params).toMatchObject({ receivedVersion: '1' });
      }
      // Completely invalid
      calls.length = 0;
      expect(() => schema.parse('not-a-uuid')).toThrow(/mustBeValidUuidV4/);
      if (calls.length > 0) {
        expect(calls[calls.length-1]?.params).toMatchObject({ receivedVersion: undefined });
      }
    });
  });

  describe('UUID version validation', () => {
    it('should distinguish between UUID versions correctly', () => {
      const { zUuidOptional, zUuidV4Optional } = createUuidSchemas({ formatErrorMessage: () => '' });
      const generalSchema = zUuidOptional();
      const v4Schema = zUuidV4Optional();

      // All versions should be valid for general UUID
      validUuids.forEach(uuid => {
        expect(generalSchema.parse(uuid)).toBe(uuid);
      });

      // Only v4 should be valid for UUIDv4
      validUuidV4s.forEach(uuid => {
        expect(v4Schema.parse(uuid)).toBe(uuid);
      });

      // Non-v4 UUIDs should be rejected by v4 schema
      const nonV4Uuids = [
        '123e4567-e89b-12d3-a456-426614174000', // v1
        '123e4567-e89b-22d3-a456-426614174000', // v2
        '123e4567-e89b-32d3-a456-426614174000', // v3
        '123e4567-e89b-52d3-a456-426614174000', // v5
      ];

      nonV4Uuids.forEach(uuid => {
        expect(() => v4Schema.parse(uuid)).toThrow();
      });
    });

    it('should handle case insensitive UUIDs', () => {
      const upperCaseUuid = '123E4567-E89B-42D3-A456-426614174000';
      const lowerCaseUuid = '123e4567-e89b-42d3-a456-426614174000';
      const mixedCaseUuid = '123e4567-E89b-42d3-A456-426614174000';

      const { zUuidV4Optional } = createUuidSchemas({ formatErrorMessage: () => '' });
      const schema = zUuidV4Optional();
      
      expect(schema.parse(upperCaseUuid)).toBe(upperCaseUuid);
      expect(schema.parse(lowerCaseUuid)).toBe(lowerCaseUuid);
      expect(schema.parse(mixedCaseUuid)).toBe(mixedCaseUuid);
    });
  });

  describe('Edge cases', () => {
    it('should handle borderline invalid UUIDs', () => {
      const { zUuidOptional: zUuidOptionalEdge } = createUuidSchemas({ formatErrorMessage: () => '' });
      const schema = zUuidOptionalEdge();
      const borderlineInvalid = [
        '123e4567-e89b-12d3-a456-42661417400', // missing one character
        '123e4567-e89b-12d3-a456-4266141740000', // one extra character
        '123e4567-e89b-12d3-a456-426614174000-', // extra dash
        '-123e4567-e89b-12d3-a456-426614174000', // leading dash
        '123e4567-e89b-12d3-a456-426614174000 ', // trailing space
        ' 123e4567-e89b-12d3-a456-426614174000', // leading space
      ];
      borderlineInvalid.forEach(uuid => {
        expect(() => schema.parse(uuid)).toThrow();
      });
    });

    it('should handle special characters in UUIDs', () => {
      const { zUuidOptional: zUuidOptionalSpecial } = createUuidSchemas({ formatErrorMessage: () => '' });
      const schema = zUuidOptionalSpecial();
      const withSpecialChars = [
        '123e4567-e89b-12d3-a456-426614174000!', // exclamation
        '123e4567-e89b-12d3-a456-426614174000?', // question mark
        '123e4567-e89b-12d3-a456-42661417400@', // at symbol
        '123e4567-e89b-12d3-a456-42661417400#', // hash
      ];
      withSpecialChars.forEach(uuid => {
        expect(() => schema.parse(uuid)).toThrow();
      });
    });
  });

  describe('invalidFormat message key support', () => {
    it('should provide UUID format error message utility', () => {
      const { handler, calls } = createMockHandler();
      const { getUuidFormatErrorMessage } = createUuidSchemas(handler);
      
      const errorMessage = getUuidFormatErrorMessage({ msg: 'User ID' });
      expect(errorMessage).toContain('invalidFormat');
      expect(calls).toHaveLength(1);
      expect(calls[0]).toMatchObject({
        group: 'uuid',
        messageKey: 'invalidFormat',
        msg: 'User ID',
        params: { expectedFormat: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }
      });
    });

    it('should use invalidFormat message in zUuidWithFormatError schema', () => {
      const { handler, calls } = createMockHandler();
      const { zUuidWithFormatError } = createUuidSchemas(handler);
      const schema = zUuidWithFormatError({ msg: 'Token' });

      // Test invalid format
      calls.length = 0;
      expect(() => schema.parse('not-a-uuid')).toThrow(/invalidFormat/);
      expect(calls[calls.length-1]).toMatchObject({
        group: 'uuid',
        messageKey: 'invalidFormat',
        msg: 'Token',
        params: { expectedFormat: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }
      });

      // Test required validation
      calls.length = 0;
      expect(() => schema.parse('')).toThrow(/required/);
      expect(calls[calls.length-1]).toMatchObject({
        group: 'uuid',
        messageKey: 'required',
        msg: 'Token'
      });

      // Test valid UUID
      calls.length = 0;
      const validUuid = '123e4567-e89b-42d3-a456-426614174000';
      expect(schema.parse(validUuid)).toBe(validUuid);
      expect(calls).toHaveLength(0); // No errors for valid input
    });

    it('should work with default options for invalidFormat utilities', () => {
      const { handler, calls } = createMockHandler();
      const { getUuidFormatErrorMessage, zUuidWithFormatError } = createUuidSchemas(handler);
      
      // Test default message
      calls.length = 0;
      getUuidFormatErrorMessage();
      expect(calls[0]).toMatchObject({
        msg: 'ID',
        msgType: MsgType.FieldName
      });

      // Test default options in schema
      calls.length = 0;
      const schema = zUuidWithFormatError();
      expect(() => schema.parse('invalid')).toThrow();
      expect(calls[calls.length-1]).toMatchObject({
        msg: 'ID',
        msgType: MsgType.FieldName
      });
    });
  });

  describe('Performance and reliability', () => {
    it('should handle large number of validations efficiently', () => {
      const { zUuidOptional: zUuidOptionalPerf } = createUuidSchemas({ formatErrorMessage: () => '' });
      const schema = zUuidOptionalPerf();
      const validUuid = '123e4567-e89b-42d3-a456-426614174000';
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        schema.parse(validUuid);
      }
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100);
    });

    it('should be consistent across multiple calls', () => {
      const { zUuidOptional: zUuidOptionalConsistent } = createUuidSchemas({ formatErrorMessage: () => '' });
      const schema = zUuidOptionalConsistent();
      const validUuid = '123e4567-e89b-42d3-a456-426614174000';
      for (let i = 0; i < 100; i++) {
        expect(schema.parse(validUuid)).toBe(validUuid);
        expect(schema.parse(undefined)).toBeUndefined();
      }
    });
  });
});
