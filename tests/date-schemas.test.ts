import {
  createDateSchemas,
  DateOptional,
  DateRequired,
  DateStringOptional,
  DateStringRequired,
  DateTimeOptional,
  DateTimeRequired,
  DateTimeStringOptional,
  DateTimeStringRequired,
  TimeStringOptional,
  TimeStringRequired,
  getDateExamples,
} from '../src/schemas/date-schemas';
import { MsgType } from '../src/common/types/msg-type';
import { createTestMessageHandler } from '../src/localization/types/message-handler.types';
import { runTableTests } from './setup';

describe('Date Schemas', () => {
  const messageHandler = createTestMessageHandler();
  const schemas = createDateSchemas(messageHandler);
  describe('DateOptional', () => {
    const schema = DateOptional();

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
        const customSchema = DateOptional({ msg: 'Birth Date' });
        expect(() => customSchema.parse('invalid-date')).toThrow('Birth Date must be a valid date');
      });

      it('should use custom message when msgType is Message', () => {
        const customSchema = DateOptional({ msg: 'Invalid birth date format', msgType: MsgType.Message });
        expect(() => customSchema.parse('invalid-date')).toThrow('Invalid birth date format');
      });
    });
  });

  describe('DateRequired', () => {
    const schema = DateRequired();

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

  describe('DateStringOptional', () => {
    const schema = DateStringOptional();

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

  describe('DateStringRequired', () => {
    const schema = DateStringRequired();

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

  describe('DateTimeOptional', () => {
    const schema = DateTimeOptional();

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

  describe('DateTimeRequired', () => {
    const schema = DateTimeRequired();

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

  describe('DateTimeStringOptional', () => {
    const schema = DateTimeStringOptional();

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

  describe('DateTimeStringRequired', () => {
    const schema = DateTimeStringRequired();

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

  describe('TimeStringOptional', () => {
    const schema = TimeStringOptional();

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

  describe('TimeStringRequired', () => {
    const schema = TimeStringRequired();

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
        timezoneDateTime: "2023-01-01T10:30:00Z",
        time: "10:30:00"
      });
    });
  });

  describe('Date constraints', () => {
    it('should enforce minimum date constraint', () => {
      const minDate = new Date('2023-01-01');
      const schema = DateRequired({ min: minDate });
      
      expect(() => schema.parse(new Date('2022-12-31'))).toThrow();
      expect(schema.parse(new Date('2023-01-01'))).toEqual(expect.any(Date));
      expect(schema.parse(new Date('2023-01-02'))).toEqual(expect.any(Date));
    });

    it('should enforce maximum date constraint', () => {
      const maxDate = new Date('2023-12-31');
      const schema = DateRequired({ max: maxDate });
      
      expect(schema.parse(new Date('2023-12-30'))).toEqual(expect.any(Date));
      expect(schema.parse(new Date('2023-12-31'))).toEqual(expect.any(Date));
      expect(() => schema.parse(new Date('2024-01-01'))).toThrow();
    });

    it('should enforce both min and max constraints', () => {
      const minDate = new Date('2023-01-01');
      const maxDate = new Date('2023-12-31');
      const schema = DateRequired({ min: minDate, max: maxDate });
      
      expect(() => schema.parse(new Date('2022-12-31'))).toThrow();
      expect(schema.parse(new Date('2023-06-15'))).toEqual(expect.any(Date));
      expect(() => schema.parse(new Date('2024-01-01'))).toThrow();
    });
  });

  describe('Date Schema String Parameter Overloads', () => {
    describe('DateOptional overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema1 = DateOptional('Birth Date');
        const schema2 = DateOptional({ msg: 'Birth Date' });
        
        const testDate = new Date('2023-10-01');
        const dateString = '2023-10-01';
        
        expect(schema1.parse(testDate)).toEqual(expect.any(Date));
        expect(schema2.parse(testDate)).toEqual(expect.any(Date));
        expect(schema1.parse(dateString)).toEqual(expect.any(Date));
        expect(schema2.parse(dateString)).toEqual(expect.any(Date));
        expect(schema1.parse(undefined)).toBeUndefined();
        expect(schema2.parse(undefined)).toBeUndefined();
        
        // Test error message consistency
        try {
          schema1.parse('invalid-date');
        } catch (error1) {
          try {
            schema2.parse('invalid-date');
          } catch (error2) {
            expect((error1 as Error).message).toEqual((error2 as Error).message);
          }
        }
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = DateOptional({ msg: 'Event Date', msgType: MsgType.FieldName });
        expect(schema.parse(new Date('2023-10-01'))).toEqual(expect.any(Date));
        expect(schema.parse('2023-10-01')).toEqual(expect.any(Date));
        expect(schema.parse(undefined)).toBeUndefined();
      });

      it('should work with no parameters (default usage)', () => {
        const schema = DateOptional();
        expect(schema.parse(new Date('2023-10-01'))).toEqual(expect.any(Date));
        expect(schema.parse(undefined)).toBeUndefined();
      });

      it('should work with date constraints and string parameter', () => {
        const minDate = new Date('2023-01-01');
        const maxDate = new Date('2023-12-31');
        const schema = DateOptional({ msg: 'Valid Date', min: minDate, max: maxDate });
        
        expect(schema.parse(new Date('2023-06-15'))).toEqual(expect.any(Date));
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse(new Date('2024-01-01'))).toThrow();
      });
    });

    describe('DateRequired overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema1 = DateRequired('Birth Date');
        const schema2 = DateRequired({ msg: 'Birth Date' });
        
        const testDate = new Date('2023-10-01');
        const dateString = '2023-10-01';
        
        expect(schema1.parse(testDate)).toEqual(expect.any(Date));
        expect(schema2.parse(testDate)).toEqual(expect.any(Date));
        expect(schema1.parse(dateString)).toEqual(expect.any(Date));
        expect(schema2.parse(dateString)).toEqual(expect.any(Date));
        
        // Test error message consistency
        try {
          schema1.parse('invalid-date');
        } catch (error1) {
          try {
            schema2.parse('invalid-date');
          } catch (error2) {
            expect((error1 as Error).message).toEqual((error2 as Error).message);
          }
        }
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = DateRequired({ msg: 'Due Date', msgType: MsgType.FieldName });
        expect(schema.parse(new Date('2023-10-01'))).toEqual(expect.any(Date));
        expect(schema.parse('2023-10-01')).toEqual(expect.any(Date));
      });

      it('should work with no parameters (default usage)', () => {
        const schema = DateRequired();
        expect(schema.parse(new Date('2023-10-01'))).toEqual(expect.any(Date));
      });
    });

    describe('DateStringOptional overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema1 = DateStringOptional('Event Date');
        const schema2 = DateStringOptional({ msg: 'Event Date' });
        
        expect(schema1.parse('2023-10-01')).toBe('2023-10-01');
        expect(schema2.parse('2023-10-01')).toBe('2023-10-01');
        expect(schema1.parse(new Date('2023-10-01'))).toBe('2023-10-01');
        expect(schema2.parse(new Date('2023-10-01'))).toBe('2023-10-01');
        expect(schema1.parse(undefined)).toBeUndefined();
        expect(schema2.parse(undefined)).toBeUndefined();
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = DateStringOptional({ msg: 'Start Date', msgType: MsgType.FieldName });
        expect(schema.parse('2023-10-01')).toBe('2023-10-01');
        expect(schema.parse(undefined)).toBeUndefined();
      });
    });

    describe('DateStringRequired overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema1 = DateStringRequired('Event Date');
        const schema2 = DateStringRequired({ msg: 'Event Date' });
        
        expect(schema1.parse('2023-10-01')).toBe('2023-10-01');
        expect(schema2.parse('2023-10-01')).toBe('2023-10-01');
        expect(schema1.parse(new Date('2023-10-01'))).toBe('2023-10-01');
        expect(schema2.parse(new Date('2023-10-01'))).toBe('2023-10-01');
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = DateStringRequired({ msg: 'End Date', msgType: MsgType.FieldName });
        expect(schema.parse('2023-10-01')).toBe('2023-10-01');
      });
    });

    describe('DateTime schema overloads', () => {
      it('DateTimeOptional should work with string parameter', () => {
        const schema1 = DateTimeOptional('Event DateTime');
        const schema2 = DateTimeOptional({ msg: 'Event DateTime' });
        
        const testDateTime = new Date('2023-10-01T12:00:00Z');
        
        expect(schema1.parse(testDateTime)).toEqual(expect.any(Date));
        expect(schema2.parse(testDateTime)).toEqual(expect.any(Date));
        expect(schema1.parse(undefined)).toBeUndefined();
      });

      it('DateTimeRequired should work with string parameter', () => {
        const schema1 = DateTimeRequired('Meeting DateTime');
        const schema2 = DateTimeRequired({ msg: 'Meeting DateTime' });
        
        const testDateTime = new Date('2023-10-01T12:00:00Z');
        
        expect(schema1.parse(testDateTime)).toEqual(expect.any(Date));
        expect(schema2.parse(testDateTime)).toEqual(expect.any(Date));
      });

      it('DateTimeStringOptional should work with string parameter', () => {
        const schema1 = DateTimeStringOptional('Event DateTime');
        const schema2 = DateTimeStringOptional({ msg: 'Event DateTime' });
        
        expect(schema1.parse('2023-10-01T12:00:00Z')).toBe('2023-10-01T12:00:00Z');
        expect(schema2.parse('2023-10-01T12:00:00Z')).toBe('2023-10-01T12:00:00Z');
        expect(schema1.parse(undefined)).toBeUndefined();
      });

      it('DateTimeStringRequired should work with string parameter', () => {
        const schema1 = DateTimeStringRequired('Meeting DateTime');
        const schema2 = DateTimeStringRequired({ msg: 'Meeting DateTime' });
        
        expect(schema1.parse('2023-10-01T12:00:00Z')).toBe('2023-10-01T12:00:00Z');
        expect(schema2.parse('2023-10-01T12:00:00Z')).toBe('2023-10-01T12:00:00Z');
      });
    });

    describe('Time schema overloads', () => {
      it('TimeStringOptional should work with string parameter', () => {
        const schema1 = TimeStringOptional('Meeting Time');
        const schema2 = TimeStringOptional({ msg: 'Meeting Time' });
        
        expect(schema1.parse('12:00:00')).toBe('12:00:00');
        expect(schema2.parse('12:00:00')).toBe('12:00:00');
        expect(schema1.parse(undefined)).toBeUndefined();
      });

      it('TimeStringRequired should work with string parameter', () => {
        const schema1 = TimeStringRequired('Appointment Time');
        const schema2 = TimeStringRequired({ msg: 'Appointment Time' });
        
        expect(schema1.parse('12:00:00')).toBe('12:00:00');
        expect(schema2.parse('12:00:00')).toBe('12:00:00');
      });
    });

    describe('Real-world usage examples', () => {
      it('should handle event scheduling form with overloaded schemas', () => {
        const eventDateSchema = DateRequired('Event Date');
        const eventTimeSchema = TimeStringRequired('Event Time');
        const registrationDeadlineSchema = DateTimeOptional('Registration Deadline');
        
        const eventData = {
          eventDate: '2023-12-01',
          eventTime: '14:30:00',
          registrationDeadline: undefined,
        };
        
        expect(eventDateSchema.parse(eventData.eventDate)).toEqual(expect.any(Date));
        expect(eventTimeSchema.parse(eventData.eventTime)).toBe('14:30:00');
        expect(registrationDeadlineSchema.parse(eventData.registrationDeadline)).toBeUndefined();
      });

      it('should handle user profile form with different date formats', () => {
        const birthDateSchema = DateOptional('Birth Date');
        const memberSinceSchema = DateStringRequired('Member Since');
        const lastLoginSchema = DateTimeStringOptional('Last Login');
        
        const profileData = {
          birthDate: new Date('1990-05-15'),
          memberSince: '2020-01-01',
          lastLogin: '2023-10-01T08:30:00Z',
        };
        
        expect(birthDateSchema.parse(profileData.birthDate)).toEqual(expect.any(Date));
        expect(memberSinceSchema.parse(profileData.memberSince)).toBe('2020-01-01');
        expect(lastLoginSchema.parse(profileData.lastLogin)).toBe('2023-10-01T08:30:00Z');
      });

      it('should maintain type safety across all overloaded date schemas', () => {
        const schemas = {
          dateOptional: DateOptional('Date Optional'),
          dateRequired: DateRequired('Date Required'),
          dateStringOptional: DateStringOptional('Date String Optional'),
          dateStringRequired: DateStringRequired('Date String Required'),
          dateTimeOptional: DateTimeOptional('DateTime Optional'),
          timeStringOptional: TimeStringOptional('Time String Optional'),
        };
        
        const testDate = new Date('2023-10-01');
        const testDateString = '2023-10-01';
        const testTimeString = '12:00:00';
        
        expect(schemas.dateOptional.parse(testDate)).toEqual(expect.any(Date));
        expect(schemas.dateRequired.parse(testDateString)).toEqual(expect.any(Date));
        expect(schemas.dateStringOptional.parse(testDate)).toBe('2023-10-01');
        expect(schemas.dateStringRequired.parse(testDateString)).toBe('2023-10-01');
        expect(schemas.dateTimeOptional.parse(testDate)).toEqual(expect.any(Date));
        expect(schemas.timeStringOptional.parse(testTimeString)).toBe('12:00:00');
        
        // Test optional behavior
        expect(schemas.dateOptional.parse(undefined)).toBeUndefined();
        expect(schemas.dateStringOptional.parse(undefined)).toBeUndefined();
        expect(schemas.dateTimeOptional.parse(undefined)).toBeUndefined();
        expect(schemas.timeStringOptional.parse(undefined)).toBeUndefined();
      });
    });
  });

});
