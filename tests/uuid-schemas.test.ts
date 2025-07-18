import { 
  zUuidOptional, 
  zUuidRequired, 
  zUuidV4Optional, 
  zUuidV4Required 
} from '../src/schemas/uuid-schemas';
import { MsgType } from '../src/schemas/msg-type';
import { runTableTests } from './setup';

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
    const schema = zUuidOptional();

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
    ], (input) => schema.parse(input));

    describe('Custom error messages', () => {
      it('should use custom field name in error message', () => {
        const schema = zUuidOptional('User ID');
        expect(() => schema.parse('invalid')).toThrow('User ID must be a valid UUID');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zUuidOptional('Invalid UUID format', MsgType.Message);
        expect(() => schema.parse('invalid')).toThrow('Invalid UUID format');
      });
    });
  });

  describe('zUuidRequired', () => {
    const schema = zUuidRequired();

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
    ], (input) => schema.parse(input));

    describe('Custom error messages', () => {
      it('should use custom field name in required error message', () => {
        const schema = zUuidRequired('User ID');
        expect(() => schema.parse('')).toThrow('User ID is required');
      });

      it('should use custom field name in validation error message', () => {
        const schema = zUuidRequired('User ID');
        expect(() => schema.parse('invalid')).toThrow('User ID must be a valid UUID');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zUuidRequired('UUID is required', MsgType.Message);
        expect(() => schema.parse('')).toThrow('UUID is required');
      });
    });
  });

  describe('zUuidV4Optional', () => {
    const schema = zUuidV4Optional();

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
    ], (input) => schema.parse(input));

    describe('Custom error messages', () => {
      it('should use custom field name in error message', () => {
        const schema = zUuidV4Optional('Session ID');
        expect(() => schema.parse('invalid')).toThrow('Session ID must be a valid UUIDv4');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zUuidV4Optional('Invalid UUIDv4 format', MsgType.Message);
        expect(() => schema.parse('invalid')).toThrow('Invalid UUIDv4 format');
      });
    });
  });

  describe('zUuidV4Required', () => {
    const schema = zUuidV4Required();

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
    ], (input) => schema.parse(input));

    describe('Custom error messages', () => {
      it('should use custom field name in required error message', () => {
        const schema = zUuidV4Required('Session ID');
        expect(() => schema.parse('')).toThrow('Session ID is required');
      });

      it('should use custom field name in validation error message', () => {
        const schema = zUuidV4Required('Session ID');
        expect(() => schema.parse('invalid')).toThrow('Session ID must be a valid UUIDv4');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zUuidV4Required('UUIDv4 is required', MsgType.Message);
        expect(() => schema.parse('')).toThrow('UUIDv4 is required');
      });
    });
  });

  describe('UUID version validation', () => {
    it('should distinguish between UUID versions correctly', () => {
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

      const schema = zUuidV4Optional();
      
      expect(schema.parse(upperCaseUuid)).toBe(upperCaseUuid);
      expect(schema.parse(lowerCaseUuid)).toBe(lowerCaseUuid);
      expect(schema.parse(mixedCaseUuid)).toBe(mixedCaseUuid);
    });
  });

  describe('Edge cases', () => {
    it('should handle borderline invalid UUIDs', () => {
      const schema = zUuidOptional();
      
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
      const schema = zUuidOptional();
      
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

  describe('Performance and reliability', () => {
    it('should handle large number of validations efficiently', () => {
      const schema = zUuidOptional();
      const validUuid = '123e4567-e89b-42d3-a456-426614174000';
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        schema.parse(validUuid);
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100);
    });

    it('should be consistent across multiple calls', () => {
      const schema = zUuidOptional();
      const validUuid = '123e4567-e89b-42d3-a456-426614174000';
      
      for (let i = 0; i < 100; i++) {
        expect(schema.parse(validUuid)).toBe(validUuid);
        expect(schema.parse(undefined)).toBeUndefined();
      }
    });
  });
});
