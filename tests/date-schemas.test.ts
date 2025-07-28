import {
  createDateSchemas,
  zDateOptional,
  zDateRequired,
  zDateStringOptional,
  zDateStringRequired,
  zDateTimeOptional,
  zDateTimeRequired,
  zDateTimeStringOptional,
  zDateTimeStringRequired,
  zTimeStringOptional,
  zTimeStringRequired,
  getDateExamples,
} from '../src/schemas/date-schemas';
import { MsgType } from '../src/common/types/msg-type';
import { createTestMessageHandler } from '../src/localization/types/message-handler.types';
import { runTableTests } from './setup';

describe('Date Schemas', () => {
  const messageHandler = createTestMessageHandler();
  const schemas = createDateSchemas(messageHandler);
  describe('zDateOptional', () => {
    const schema = zDateOptional();

    runTableTests([
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
        description: 'should accept string input and convert to Date object',
        input: '2023-10-01',
        expected: expect.any(Date)
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
        const customSchema = zDateOptional({ msg: 'Birth Date' });
        expect(() => customSchema.parse('invalid-date')).toThrow('Birth Date must be a valid date');
      });

      it('should use custom message when msgType is Message', () => {
        const customSchema = zDateOptional({ msg: 'Invalid birth date format', msgType: MsgType.Message });
        expect(() => customSchema.parse('invalid-date')).toThrow('Invalid birth date format');
      });
    });
  });

  describe('zDateRequired', () => {
    const schema = zDateRequired();

    runTableTests([
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
        description: 'should accept string input and convert to Date object',
        input: '2023-10-01',
        expected: expect.any(Date)
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
        const result = schema.parse(new Date('2024-02-29'));
        expect(result).toEqual(expect.any(Date));
      });

      it('should handle invalid leap year dates by adjusting to next valid date', () => {
        // Note: JavaScript Date constructor automatically adjusts invalid dates
        // So 2023-02-29 becomes 2023-03-01
        const result = schema.parse(new Date('2023-02-29'));
        expect(result).toEqual(expect.any(Date));
      });

      it('should handle year boundaries', () => {
        const result = schema.parse(new Date('2023-12-31'));
        expect(result).toEqual(expect.any(Date));
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
        description: 'should accept undefined and return undefined',
        input: undefined,
        expected: undefined
      },
      {
        description: 'should accept Date object and convert to string',
        input: new Date('2023-10-01'),
        expected: '2023-10-01'
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
        description: 'should accept Date object and convert to string',
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
        description: 'should reject datetime without timezone (strict ISO format required)',
        input: '2023-10-01T14:30:00',
        expected: new Error(),
        shouldThrow: true
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

  describe('zTimeStringOptional', () => {
    const schema = zTimeStringOptional();

    runTableTests([
      {
        description: 'should accept valid time string',
        input: '10:30:00',
        expected: '10:30:00'
      },
      {
        description: 'should accept time with milliseconds',
        input: '10:30:00.123',
        expected: '10:30:00.123'
      },
      {
        description: 'should accept undefined',
        input: undefined,
        expected: undefined
      },
      {
        description: 'should reject invalid time',
        input: '25:30:00',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('zTimeStringRequired', () => {
    const schema = zTimeStringRequired();

    runTableTests([
      {
        description: 'should accept valid time string',
        input: '10:30:00',
        expected: '10:30:00'
      },
      {
        description: 'should accept time with milliseconds',
        input: '10:30:00.123',
        expected: '10:30:00.123'
      },
      {
        description: 'should reject undefined',
        input: undefined,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject invalid time',
        input: '25:30:00',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('getDateExamples', () => {
    it('should return example date formats', () => {
      const examples = getDateExamples();
      expect(examples).toEqual({
        date: "2023-01-01",
        dateTime: "2023-01-01T10:30:00Z",
        time: "10:30:00"
      });
    });
  });

  describe('Date constraints', () => {
    it('should enforce minimum date constraint', () => {
      const minDate = new Date('2023-01-01');
      const schema = zDateRequired({ min: minDate });
      
      expect(() => schema.parse(new Date('2022-12-31'))).toThrow();
      expect(schema.parse(new Date('2023-01-01'))).toEqual(expect.any(Date));
      expect(schema.parse(new Date('2023-01-02'))).toEqual(expect.any(Date));
    });

    it('should enforce maximum date constraint', () => {
      const maxDate = new Date('2023-12-31');
      const schema = zDateRequired({ max: maxDate });
      
      expect(schema.parse(new Date('2023-12-30'))).toEqual(expect.any(Date));
      expect(schema.parse(new Date('2023-12-31'))).toEqual(expect.any(Date));
      expect(() => schema.parse(new Date('2024-01-01'))).toThrow();
    });

    it('should enforce both min and max constraints', () => {
      const minDate = new Date('2023-01-01');
      const maxDate = new Date('2023-12-31');
      const schema = zDateRequired({ min: minDate, max: maxDate });
      
      expect(() => schema.parse(new Date('2022-12-31'))).toThrow();
      expect(schema.parse(new Date('2023-06-15'))).toEqual(expect.any(Date));
      expect(() => schema.parse(new Date('2024-01-01'))).toThrow();
    });
  });

});
