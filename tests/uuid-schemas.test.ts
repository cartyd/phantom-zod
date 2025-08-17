
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
    '123e4567-e89b-02d3-a456-426614174000', // invalid version (0)
    '123e4567-e89b-92d3-a456-426614174000', // invalid version (9)
  ];

  const invalidUuidV4s = [
    ...invalidUuids,
    '123e4567-e89b-12d3-a456-426614174000', // v1 (not v4)
    '123e4567-e89b-22d3-a456-426614174000', // v2 (not v4)
    '123e4567-e89b-32d3-a456-426614174000', // v3 (not v4)
    '123e4567-e89b-52d3-a456-426614174000', // v5 (not v4)
  ];

  describe('UuidOptional', () => {
    const { UuidOptional } = createUuidSchemas({ formatErrorMessage: () => '' });
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
    ], (input) => UuidOptional({}).parse(input));

    it('should call message handler for invalid values', () => {
      const { handler, calls } = createMockHandler();
      const { UuidOptional } = createUuidSchemas(handler);
      
      // Message handler is called during schema creation
      calls.length = 0;
      const schema = UuidOptional();
      expect(calls.length).toBeGreaterThan(0);
      
      // Find the mustBeValidUuid call in the calls made during schema creation
      const mustBeValidUuidCall = calls.find(call => call.messageKey === 'mustBeValidUuid');
      expect(mustBeValidUuidCall).toBeDefined();
      expect(mustBeValidUuidCall.messageKey).toBe('mustBeValidUuid');
      
      // Test that invalid string throws with the correct message
      expect(() => schema.parse('not-a-uuid')).toThrow(/mustBeValidUuid/);
      
      // Non-string values are rejected by Zod's union type checking, not our custom validation
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse({})).toThrow();
      expect(() => schema.parse([])).toThrow();
    });
  });

  describe('UuidRequired', () => {
    const { UuidRequired } = createUuidSchemas({ formatErrorMessage: () => '' });
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
    ], (input) => UuidRequired({}).parse(input));

    it('should call message handler for invalid values', () => {
      const { handler, calls } = createMockHandler();
      const { UuidRequired } = createUuidSchemas(handler);
      
      // Message handler is called during schema creation
      calls.length = 0;
      const schema = UuidRequired();
      expect(calls.length).toBeGreaterThan(0);
      
      // Find the mustBeValidUuid call in the calls made during schema creation
      const mustBeValidUuidCall = calls.find(call => call.messageKey === 'mustBeValidUuid');
      expect(mustBeValidUuidCall).toBeDefined();
      expect(mustBeValidUuidCall.messageKey).toBe('mustBeValidUuid');
      
      // Test that invalid string throws with the correct message
      expect(() => schema.parse('not-a-uuid')).toThrow(/mustBeValidUuid/);
      
      // Non-string values are rejected by Zod's built-in type checking
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse({})).toThrow();
      expect(() => schema.parse([])).toThrow();
    });
  });

  describe('UuidV4Optional', () => {
    const { UuidV4Optional } = createUuidSchemas({ formatErrorMessage: () => '' });
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
    ], (input) => UuidV4Optional().parse(input));

    it('should call message handler for invalid values', () => {
      const { handler, calls } = createMockHandler();
      const { UuidV4Optional } = createUuidSchemas(handler);
      
      // Message handler is called during schema creation
      calls.length = 0;
      const schema = UuidV4Optional();
      expect(calls.length).toBeGreaterThan(0);
      
      // Find the mustBeValidUuidV4 call in the calls made during schema creation
      const mustBeValidUuidV4Call = calls.find(call => call.messageKey === 'mustBeValidUuidV4');
      expect(mustBeValidUuidV4Call).toBeDefined();
      expect(mustBeValidUuidV4Call.messageKey).toBe('mustBeValidUuidV4');
      
      // Non-string values are rejected by Zod's union type checking
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse({})).toThrow();
      expect(() => schema.parse([])).toThrow();
      
      // Valid UUID but not v4
      expect(() => schema.parse('123e4567-e89b-12d3-a456-426614174000')).toThrow(/mustBeValidUuidV4/);
      
      // Completely invalid
      expect(() => schema.parse('not-a-uuid')).toThrow(/mustBeValidUuidV4/);
    });
  });

  describe('UuidV4Required', () => {
    const { UuidV4Required } = createUuidSchemas({ formatErrorMessage: () => '' });
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
    ], (input) => UuidV4Required().parse(input));

    it('should call message handler for invalid values', () => {
      const { handler, calls } = createMockHandler();
      const { UuidV4Required } = createUuidSchemas(handler);
      
      // Message handler is called during schema creation
      calls.length = 0;
      const schema = UuidV4Required();
      expect(calls.length).toBeGreaterThan(0);
      
      // Find the mustBeValidUuidV4 call in the calls made during schema creation
      const mustBeValidUuidV4Call = calls.find(call => call.messageKey === 'mustBeValidUuidV4');
      expect(mustBeValidUuidV4Call).toBeDefined();
      expect(mustBeValidUuidV4Call.messageKey).toBe('mustBeValidUuidV4');
      
      // Not a string - should be handled by Zod's type checking
      expect(() => schema.parse(123)).toThrow();
      
      // Valid UUID but not v4
      expect(() => schema.parse('123e4567-e89b-12d3-a456-426614174000')).toThrow(/mustBeValidUuidV4/);
      
      // Completely invalid
      expect(() => schema.parse('not-a-uuid')).toThrow(/mustBeValidUuidV4/);
    });
  });

  describe('UUID version validation', () => {
    it('should distinguish between UUID versions correctly', () => {
      const { UuidOptional, UuidV4Optional } = createUuidSchemas({ formatErrorMessage: () => '' });
      const generalSchema = UuidOptional();
      const v4Schema = UuidV4Optional();

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

      const { UuidV4Optional } = createUuidSchemas({ formatErrorMessage: () => '' });
      const schema = UuidV4Optional();
      
      expect(schema.parse(upperCaseUuid)).toBe(upperCaseUuid);
      expect(schema.parse(lowerCaseUuid)).toBe(lowerCaseUuid);
      expect(schema.parse(mixedCaseUuid)).toBe(mixedCaseUuid);
    });
  });

  describe('Edge cases', () => {
    it('should handle borderline invalid UUIDs', () => {
      const { UuidOptional: UuidOptionalEdge } = createUuidSchemas({ formatErrorMessage: () => '' });
      const schema = UuidOptionalEdge();
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
      const { UuidOptional: UuidOptionalSpecial } = createUuidSchemas({ formatErrorMessage: () => '' });
      const schema = UuidOptionalSpecial();
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

    it('should use invalidFormat message in UuidWithFormatError schema', () => {
      const { handler, calls } = createMockHandler();
      const { UuidWithFormatError } = createUuidSchemas(handler);
      
      // The message handler is called during schema creation
      calls.length = 0;
      const schema = UuidWithFormatError({ msg: 'Token' });
      expect(calls.length).toBeGreaterThan(0);
      
      // Find the invalidFormat call in the calls made during schema creation
      const invalidFormatCall = calls.find(call => call.messageKey === 'invalidFormat');
      expect(invalidFormatCall).toMatchObject({
        group: 'uuid',
        messageKey: 'invalidFormat',
        msg: 'Token',
        params: { expectedFormat: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }
      });

      // Test that invalid format throws with the correct message
      expect(() => schema.parse('not-a-uuid')).toThrow(/invalidFormat/);

      // Test valid UUID
      const validUuid = '123e4567-e89b-42d3-a456-426614174000';
      expect(schema.parse(validUuid)).toBe(validUuid);
    });

    it('should work with default options for invalidFormat utilities', () => {
      const { handler, calls } = createMockHandler();
      const { getUuidFormatErrorMessage, UuidWithFormatError } = createUuidSchemas(handler);
      
      // Test default message
      calls.length = 0;
      getUuidFormatErrorMessage();
      expect(calls[0]).toMatchObject({
        msg: 'ID',
        msgType: MsgType.FieldName
      });

      // Test default options in schema
      calls.length = 0;
      const schema = UuidWithFormatError();
      expect(() => schema.parse('invalid')).toThrow();
      expect(calls[calls.length-1]).toMatchObject({
        msg: 'ID',
        msgType: MsgType.FieldName
      });
    });
  });

  describe('Performance and reliability', () => {
    it('should handle large number of validations efficiently', () => {
      const { UuidOptional: UuidOptionalPerf } = createUuidSchemas({ formatErrorMessage: () => '' });
      const schema = UuidOptionalPerf();
      const validUuid = '123e4567-e89b-42d3-a456-426614174000';
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        schema.parse(validUuid);
      }
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100);
    });

    it('should be consistent across multiple calls', () => {
      const { UuidOptional: UuidOptionalConsistent } = createUuidSchemas({ formatErrorMessage: () => '' });
      const schema = UuidOptionalConsistent();
      const validUuid = '123e4567-e89b-42d3-a456-426614174000';
      for (let i = 0; i < 100; i++) {
        expect(schema.parse(validUuid)).toBe(validUuid);
        expect(schema.parse(undefined)).toBeUndefined();
      }
    });
  });

  describe('Exported Schema Overloads', () => {
    // Import the exported schemas
    const {
      UuidOptional,
      UuidRequired,
      UuidV4Optional,
      UuidV4Required,
      NanoidOptional,
      NanoidRequired
    } = require('../src/schemas/uuid-schemas');

    describe('UuidOptional overloads', () => {
      it('should work with no parameters', () => {
        const schema = UuidOptional();
        expect(schema.parse(undefined)).toBeUndefined();
        expect(schema.parse('123e4567-e89b-42d3-a456-426614174000')).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(() => schema.parse('invalid')).toThrow(/must be a valid UUID/);
      });

      it('should work with string parameter', () => {
        const schema = UuidOptional('Entity ID');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(schema.parse('123e4567-e89b-42d3-a456-426614174000')).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(() => schema.parse('invalid')).toThrow(/Entity ID must be a valid UUID/);
      });

      it('should work with options object', () => {
        const schema = UuidOptional({ msg: 'User ID' });
        expect(schema.parse(undefined)).toBeUndefined();
        expect(schema.parse('123e4567-e89b-42d3-a456-426614174000')).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(() => schema.parse('invalid')).toThrow(/User ID must be a valid UUID/);
      });
    });

    describe('UuidRequired overloads', () => {
      it('should work with no parameters', () => {
        const schema = UuidRequired();
        expect(() => schema.parse(undefined)).toThrow();
        expect(schema.parse('123e4567-e89b-42d3-a456-426614174000')).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(() => schema.parse('invalid')).toThrow(/must be a valid UUID/);
      });

      it('should work with string parameter', () => {
        const schema = UuidRequired('Entity ID');
        expect(() => schema.parse(undefined)).toThrow();
        expect(schema.parse('123e4567-e89b-42d3-a456-426614174000')).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(() => schema.parse('invalid')).toThrow(/Entity ID must be a valid UUID/);
      });

      it('should work with options object', () => {
        const schema = UuidRequired({ msg: 'User ID' });
        expect(() => schema.parse(undefined)).toThrow();
        expect(schema.parse('123e4567-e89b-42d3-a456-426614174000')).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(() => schema.parse('invalid')).toThrow(/User ID must be a valid UUID/);
      });
    });

    describe('UuidV4Optional overloads', () => {
      it('should work with no parameters', () => {
        const schema = UuidV4Optional();
        expect(schema.parse(undefined)).toBeUndefined();
        expect(schema.parse('123e4567-e89b-42d3-a456-426614174000')).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(() => schema.parse('invalid')).toThrow(/must be a valid UUIDv4/);
        expect(() => schema.parse('123e4567-e89b-12d3-a456-426614174000')).toThrow(/must be a valid UUIDv4/); // v1 UUID
      });

      it('should work with string parameter', () => {
        const schema = UuidV4Optional('Token');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(schema.parse('123e4567-e89b-42d3-a456-426614174000')).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(() => schema.parse('invalid')).toThrow(/Token must be a valid UUIDv4/);
        expect(() => schema.parse('123e4567-e89b-12d3-a456-426614174000')).toThrow(/Token must be a valid UUIDv4/); // v1 UUID
      });

      it('should work with options object', () => {
        const schema = UuidV4Optional({ msg: 'Session ID' });
        expect(schema.parse(undefined)).toBeUndefined();
        expect(schema.parse('123e4567-e89b-42d3-a456-426614174000')).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(() => schema.parse('invalid')).toThrow(/Session ID must be a valid UUIDv4/);
        expect(() => schema.parse('123e4567-e89b-12d3-a456-426614174000')).toThrow(/Session ID must be a valid UUIDv4/); // v1 UUID
      });
    });

    describe('UuidV4Required overloads', () => {
      it('should work with no parameters', () => {
        const schema = UuidV4Required();
        expect(() => schema.parse(undefined)).toThrow();
        expect(schema.parse('123e4567-e89b-42d3-a456-426614174000')).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(() => schema.parse('invalid')).toThrow(/must be a valid UUIDv4/);
        expect(() => schema.parse('123e4567-e89b-12d3-a456-426614174000')).toThrow(/must be a valid UUIDv4/); // v1 UUID
      });

      it('should work with string parameter', () => {
        const schema = UuidV4Required('Token');
        expect(() => schema.parse(undefined)).toThrow();
        expect(schema.parse('123e4567-e89b-42d3-a456-426614174000')).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(() => schema.parse('invalid')).toThrow(/Token must be a valid UUIDv4/);
        expect(() => schema.parse('123e4567-e89b-12d3-a456-426614174000')).toThrow(/Token must be a valid UUIDv4/); // v1 UUID
      });

      it('should work with options object', () => {
        const schema = UuidV4Required({ msg: 'Session ID' });
        expect(() => schema.parse(undefined)).toThrow();
        expect(schema.parse('123e4567-e89b-42d3-a456-426614174000')).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(() => schema.parse('invalid')).toThrow(/Session ID must be a valid UUIDv4/);
        expect(() => schema.parse('123e4567-e89b-12d3-a456-426614174000')).toThrow(/Session ID must be a valid UUIDv4/); // v1 UUID
      });
    });

    describe('NanoidOptional overloads', () => {
      it('should work with no parameters', () => {
        const schema = NanoidOptional();
        expect(schema.parse(undefined)).toBeUndefined();
        expect(schema.parse('V1StGXR8_Z5jdHi6B-myT')).toBe('V1StGXR8_Z5jdHi6B-myT'); // Example nanoid
        expect(() => schema.parse('invalid-nanoid!')).toThrow(/must be a valid nanoid/);
      });

      it('should work with string parameter', () => {
        const schema = NanoidOptional('Item ID');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(schema.parse('V1StGXR8_Z5jdHi6B-myT')).toBe('V1StGXR8_Z5jdHi6B-myT');
        expect(() => schema.parse('invalid-nanoid!')).toThrow(/Item ID must be a valid nanoid/);
      });

      it('should work with options object', () => {
        const schema = NanoidOptional({ msg: 'Record ID' });
        expect(schema.parse(undefined)).toBeUndefined();
        expect(schema.parse('V1StGXR8_Z5jdHi6B-myT')).toBe('V1StGXR8_Z5jdHi6B-myT');
        expect(() => schema.parse('invalid-nanoid!')).toThrow(/Record ID must be a valid nanoid/);
      });
    });

    describe('NanoidRequired overloads', () => {
      it('should work with no parameters', () => {
        const schema = NanoidRequired();
        expect(() => schema.parse(undefined)).toThrow();
        expect(schema.parse('V1StGXR8_Z5jdHi6B-myT')).toBe('V1StGXR8_Z5jdHi6B-myT');
        expect(() => schema.parse('invalid-nanoid!')).toThrow(/must be a valid nanoid/);
      });

      it('should work with string parameter', () => {
        const schema = NanoidRequired('Item ID');
        expect(() => schema.parse(undefined)).toThrow();
        expect(schema.parse('V1StGXR8_Z5jdHi6B-myT')).toBe('V1StGXR8_Z5jdHi6B-myT');
        expect(() => schema.parse('invalid-nanoid!')).toThrow(/Item ID must be a valid nanoid/);
      });

      it('should work with options object', () => {
        const schema = NanoidRequired({ msg: 'Record ID' });
        expect(() => schema.parse(undefined)).toThrow();
        expect(schema.parse('V1StGXR8_Z5jdHi6B-myT')).toBe('V1StGXR8_Z5jdHi6B-myT');
        expect(() => schema.parse('invalid-nanoid!')).toThrow(/Record ID must be a valid nanoid/);
      });
    });
  });
});
