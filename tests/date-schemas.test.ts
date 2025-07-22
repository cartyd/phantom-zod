import {
  zDateOptional,
  zDateRequired,
  zDateStringOptional,
  zDateStringRequired,
  zDateTimeOptional,
  zDateTimeRequired,
  zDateTimeStringOptional,
  zDateTimeStringRequired,
  zDateCustom,
  zDateSchema,
  DateFormat,
  FieldRequirement,
  ReturnType
} from '../src/schemas/date-schemas';
import { MsgType } from '../src/schemas/msg-type';
import { runTableTests } from './setup';

describe('Date Schemas', () => {
  describe('zDateOptional', () => {
    const schema = zDateOptional();

    runTableTests([
      {
        description: 'should accept valid date string and return Date object',
        input: '2023-10-01',
        expected: new Date('2023-10-01T00:00:00Z')
      },
      {
        description: 'should accept Date object and return Date object',
        input: new Date('2023-10-01'),
        expected: expect.any(Date)
      },
      {
        description: 'should accept undefined and return undefined',
        input: undefined,
        expected: undefined
      },
      {
        description: 'should reject invalid date string',
        input: '2023-13-01',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject invalid date format',
        input: '01/10/2023',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject empty string',
        input: '',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject malformed date',
        input: '2023-10-32',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Custom field name', () => {
      it('should use custom field name in error message', () => {
        const customSchema = zDateOptional('Birth Date');
        expect(() => customSchema.parse('invalid-date')).toThrow('Birth Date has invalid format (expected: YYYY-MM-DD)');
      });

      it('should use custom message when msgType is Message', () => {
        const customSchema = zDateOptional('Invalid birth date format', MsgType.Message);
        expect(() => customSchema.parse('invalid-date')).toThrow('Invalid birth date format');
      });
    });
  });

  describe('zDateRequired', () => {
    const schema = zDateRequired();

    runTableTests([
      {
        description: 'should accept valid date string and return Date object',
        input: '2023-10-01',
        expected: new Date('2023-10-01T00:00:00Z')
      },
      {
        description: 'should accept Date object and return Date object',
        input: new Date('2023-10-01'),
        expected: expect.any(Date)
      },
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
      {
        description: 'should reject whitespace string',
        input: '   ',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject invalid date string',
        input: '2023-13-01',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Edge cases', () => {
      it('should handle leap year dates', () => {
        const result = schema.parse('2024-02-29');
        expect(result).toEqual(new Date('2024-02-29T00:00:00Z'));
      });

      it('should handle invalid leap year dates by adjusting to next valid date', () => {
        // Note: JavaScript Date constructor automatically adjusts invalid dates
        // So 2023-02-29 becomes 2023-03-01
        const result = schema.parse('2023-02-29');
        expect(result).toEqual(new Date('2023-03-01T00:00:00Z'));
      });

      it('should handle year boundaries', () => {
        const result = schema.parse('2023-12-31');
        expect(result).toEqual(new Date('2023-12-31T00:00:00Z'));
      });
    });
  });

  describe('zDateStringOptional', () => {
    const schema = zDateStringOptional();

    runTableTests([
      {
        description: 'should accept valid date string and return string',
        input: '2023-10-01',
        expected: '2023-10-01'
      },
      {
        description: 'should accept Date object and return string',
        input: new Date('2023-10-01'),
        expected: '2023-10-01'
      },
      {
        description: 'should accept undefined and return undefined',
        input: undefined,
        expected: undefined
      },
      {
        description: 'should reject invalid date string',
        input: '2023-13-01',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject invalid date format',
        input: '01/10/2023',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('zDateStringRequired', () => {
    const schema = zDateStringRequired();

    runTableTests([
      {
        description: 'should accept valid date string and return string',
        input: '2023-10-01',
        expected: '2023-10-01'
      },
      {
        description: 'should accept Date object and return string',
        input: new Date('2023-10-01'),
        expected: '2023-10-01'
      },
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
      {
        description: 'should reject invalid date string',
        input: '2023-13-01',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('zDateTimeOptional', () => {
    const schema = zDateTimeOptional();

    runTableTests([
      {
        description: 'should accept valid datetime string and return Date object',
        input: '2023-10-01T14:30:00Z',
        expected: new Date('2023-10-01T14:30:00Z')
      },
      {
        description: 'should accept Date object and return Date object',
        input: new Date('2023-10-01T14:30:00Z'),
        expected: expect.any(Date)
      },
      {
        description: 'should accept undefined and return undefined',
        input: undefined,
        expected: undefined
      },
      {
        description: 'should reject invalid datetime string',
        input: '2023-10-01T25:30:00Z',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should accept date-only format and parse as datetime',
        input: '2023-10-01',
        expected: new Date('2023-10-01T00:00:00.000Z')
      },
      {
        description: 'should accept datetime without timezone',
        input: '2023-10-01T14:30:00',
        expected: expect.any(Date)
      }
    ], (input) => schema.parse(input));

    describe('Timezone handling', () => {
      it('should handle different timezone formats', () => {
        const result = schema.parse('2023-10-01T14:30:00Z');
        expect(result).toEqual(new Date('2023-10-01T14:30:00Z'));
      });

      it('should handle milliseconds', () => {
        const result = schema.parse('2023-10-01T14:30:00.123Z');
        expect(result).toEqual(new Date('2023-10-01T14:30:00.123Z'));
      });
    });
  });

  describe('zDateTimeRequired', () => {
    const schema = zDateTimeRequired();

    runTableTests([
      {
        description: 'should accept valid datetime string and return Date object',
        input: '2023-10-01T14:30:00Z',
        expected: new Date('2023-10-01T14:30:00Z')
      },
      {
        description: 'should accept Date object and return Date object',
        input: new Date('2023-10-01T14:30:00Z'),
        expected: expect.any(Date)
      },
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
      {
        description: 'should reject invalid datetime string',
        input: '2023-10-01T25:30:00Z',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('zDateTimeStringOptional', () => {
    const schema = zDateTimeStringOptional();

    runTableTests([
      {
        description: 'should accept valid datetime string and return string',
        input: '2023-10-01T14:30:00Z',
        expected: '2023-10-01T14:30:00Z'
      },
      {
        description: 'should accept Date object and return string',
        input: new Date('2023-10-01T14:30:00Z'),
        expected: '2023-10-01T14:30:00.000Z'
      },
      {
        description: 'should accept undefined and return undefined',
        input: undefined,
        expected: undefined
      },
      {
        description: 'should reject invalid datetime string',
        input: '2023-10-01T25:30:00Z',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('zDateTimeStringRequired', () => {
    const schema = zDateTimeStringRequired();

    runTableTests([
      {
        description: 'should accept valid datetime string and return string',
        input: '2023-10-01T14:30:00Z',
        expected: '2023-10-01T14:30:00Z'
      },
      {
        description: 'should accept Date object and return string',
        input: new Date('2023-10-01T14:30:00Z'),
        expected: '2023-10-01T14:30:00.000Z'
      },
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
      {
        description: 'should reject invalid datetime string',
        input: '2023-10-01T25:30:00Z',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('zDateCustom', () => {
    describe('US date format (MM/DD/YYYY)', () => {
      const customParse = (str: string) => {
        const [m, d, y] = str.split('/');
        const dt = new Date(`${y}-${m}-${d}`);
        return isNaN(dt.getTime()) ? null : dt;
      };

      const schema = zDateCustom(
        'US Date',
        FieldRequirement.Required,
        ReturnType.DateObject,
        /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/,
        customParse
      );

      runTableTests([
        {
          description: 'should accept valid US date format',
          input: '12/31/2023',
          expected: new Date('2023-12-31T00:00:00.000Z')
        },
        {
          description: 'should accept valid US date format with leading zeros',
          input: '01/01/2023',
          expected: new Date('2023-01-01T00:00:00.000Z')
        },
        {
          description: 'should reject invalid US date format',
          input: '13/01/2023',
          expected: new Error(),
          shouldThrow: true
        },
        {
          description: 'should reject wrong date format',
          input: '2023-12-31',
          expected: new Error(),
          shouldThrow: true
        },
        {
          description: 'should reject invalid day',
          input: '12/32/2023',
          expected: new Error(),
          shouldThrow: true
        }
      ], (input) => schema.parse(input));
    });

    describe('Custom validation function', () => {
      const customValidation = (str: string) => {
        return str.startsWith('VALID_');
      };

      const schema = zDateCustom(
        'Custom Format',
        FieldRequirement.Required,
        ReturnType.String,
        customValidation
      );

      runTableTests([
        {
          description: 'should accept string matching custom validation',
          input: 'VALID_2023-10-01',
          expected: 'VALID_2023-10-01'
        },
        {
          description: 'should reject string not matching custom validation',
          input: 'INVALID_2023-10-01',
          expected: new Error(),
          shouldThrow: true
        }
      ], (input) => schema.parse(input));
    });
  });

  describe('zDateSchema (advanced)', () => {
    it('should create optional date schema returning string', () => {
      const schema = zDateSchema(
        'Date Field',
        FieldRequirement.Optional,
        DateFormat.DateOnly,
        ReturnType.String
      );

      expect(schema.parse('2023-10-01')).toBe('2023-10-01');
      expect(schema.parse(undefined)).toBeUndefined();
    });

    it('should create required datetime schema returning Date object', () => {
      const schema = zDateSchema(
        'DateTime Field',
        FieldRequirement.Required,
        DateFormat.DateTime,
        ReturnType.DateObject
      );

      const result = schema.parse('2023-10-01T14:30:00Z');
      expect(result).toEqual(new Date('2023-10-01T14:30:00Z'));
    });

    it('should create custom format schema', () => {
      const schema = zDateSchema(
        'Custom Date',
        FieldRequirement.Required,
        DateFormat.Custom,
        ReturnType.String,
        MsgType.FieldName,
        /^\d{4}-\d{2}-\d{2}$/
      );

      expect(schema.parse('2023-10-01')).toBe('2023-10-01');
      expect(() => schema.parse('invalid')).toThrow();
    });
  });

  describe('Error messages', () => {
    it('should provide helpful error messages for date format', () => {
      const schema = zDateRequired('Birth Date');
      expect(() => schema.parse('invalid-date')).toThrow('Birth Date has invalid format (expected: YYYY-MM-DD)');
    });

    it('should provide helpful error messages for datetime format', () => {
      const schema = zDateTimeRequired('Created At');
      expect(() => schema.parse('invalid-datetime')).toThrow('Created At has invalid format (expected: YYYY-MM-DDTHH:mm:ssZ)');
    });

    it('should use custom message when msgType is Message', () => {
      const schema = zDateRequired('Please provide a valid date', MsgType.Message);
      expect(() => schema.parse('invalid-date')).toThrow('Please provide a valid date');
    });
  });

  describe('Type consistency', () => {
    it('should handle Date objects consistently', () => {
      const dateObj = new Date('2023-10-01T14:30:00Z');
      
      // Date schemas should return Date objects
      // Note: zDateRequired converts to date-only format, losing time component
      expect(zDateRequired().parse(dateObj)).toEqual(new Date('2023-10-01T00:00:00Z'));
      expect(zDateTimeRequired().parse(dateObj)).toEqual(dateObj);
      
      // String schemas should return strings
      expect(zDateStringRequired().parse(dateObj)).toBe('2023-10-01');
      expect(zDateTimeStringRequired().parse(dateObj)).toBe('2023-10-01T14:30:00.000Z');
    });

    it('should handle string inputs consistently', () => {
      // Date schemas should return Date objects
      expect(zDateRequired().parse('2023-10-01')).toEqual(new Date('2023-10-01T00:00:00Z'));
      expect(zDateTimeRequired().parse('2023-10-01T14:30:00Z')).toEqual(new Date('2023-10-01T14:30:00Z'));
      
      // String schemas should return strings
      expect(zDateStringRequired().parse('2023-10-01')).toBe('2023-10-01');
      expect(zDateTimeStringRequired().parse('2023-10-01T14:30:00Z')).toBe('2023-10-01T14:30:00Z');
    });
  });

  describe('Whitespace handling', () => {
    it('should trim whitespace from string inputs', () => {
      expect(zDateRequired().parse('  2023-10-01  ')).toEqual(new Date('2023-10-01T00:00:00Z'));
      expect(zDateTimeRequired().parse('  2023-10-01T14:30:00Z  ')).toEqual(new Date('2023-10-01T14:30:00Z'));
    });

    it('should reject whitespace-only strings', () => {
      expect(() => zDateRequired().parse('   ')).toThrow();
      expect(() => zDateTimeRequired().parse('   ')).toThrow();
    });
  });
});
