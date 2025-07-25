import { createPostalCodeSchemas } from '../src/schemas/postal-code-schemas';
import { MsgType } from '../src/schemas/msg-type';
import { createTestMessageHandler } from '../src/common/message-handler.types';

// Create schemas using the factory with test message handler
const mockMessageHandler = createTestMessageHandler();
const {
  zPostalCodeOptional,
  zPostalCodeRequired,
} = createPostalCodeSchemas(mockMessageHandler);

describe('Postal Code Schemas', () => {
  describe('zPostalCodeOptional', () => {
    const schema = zPostalCodeOptional();

    it('should accept valid 5-digit ZIP codes', () => {
      expect(schema.parse('12345')).toBe('12345');
      expect(schema.parse('90210')).toBe('90210');
      expect(schema.parse('10001')).toBe('10001');
    });

    it('should accept valid ZIP+4 codes', () => {
      expect(schema.parse('12345-6789')).toBe('12345-6789');
      expect(schema.parse('90210-1234')).toBe('90210-1234');
      expect(schema.parse('10001-0000')).toBe('10001-0000');
    });

    it('should accept undefined as optional', () => {
      const result = schema.parse(undefined);
      expect(result).toBeUndefined();
    });

    it('should reject invalid ZIP code formats', () => {
      expect(() => schema.parse('1234')).toThrow(); // too short
      expect(() => schema.parse('123456')).toThrow(); // too long
      expect(() => schema.parse('12345-123')).toThrow(); // invalid ZIP+4
      expect(() => schema.parse('12345-12345')).toThrow(); // too long extension
      expect(() => schema.parse('abcde')).toThrow(); // letters
      expect(() => schema.parse('12a45')).toThrow(); // mixed alphanumeric
    });

    it('should reject the invalid 00000 ZIP code', () => {
      expect(() => schema.parse('00000')).toThrow('Postal Code is invalid');
    });

    it('should reject 00000-XXXX ZIP codes', () => {
      expect(() => schema.parse('00000-1234')).toThrow('Postal Code is invalid');
      expect(() => schema.parse('00000-0000')).toThrow('Postal Code is invalid');
    });

    it('should reject non-string values', () => {
      expect(() => schema.parse(12345)).toThrow();
      expect(() => schema.parse(true)).toThrow();
      expect(() => schema.parse({})).toThrow();
      expect(() => schema.parse([])).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it('should reject empty string', () => {
      expect(() => schema.parse('')).toThrow();
    });

    it('should reject whitespace-only strings', () => {
      expect(() => schema.parse('     ')).toThrow();
      expect(() => schema.parse('\t')).toThrow();
      expect(() => schema.parse('\n')).toThrow();
    });

    it('should reject ZIP codes with spaces', () => {
      expect(() => schema.parse('12 345')).toThrow();
      expect(() => schema.parse(' 12345')).toThrow();
      expect(() => schema.parse('12345 ')).toThrow();
      expect(() => schema.parse('12345 - 6789')).toThrow();
    });

    it('should use custom field name in error messages', () => {
      const customSchema = zPostalCodeOptional({ msg: 'ZIP Code' });
      expect(() => customSchema.parse('invalid')).toThrow('ZIP Code is invalid');
    });

    it('should use custom message when msgType is Message', () => {
      const customSchema = zPostalCodeOptional({ msg: 'Invalid ZIP format', msgType: MsgType.Message });
      expect(() => customSchema.parse('invalid')).toThrow('Invalid ZIP format');
    });
  });

  describe('zPostalCodeRequired', () => {
    const schema = zPostalCodeRequired();

    it('should accept valid 5-digit ZIP codes', () => {
      expect(schema.parse('12345')).toBe('12345');
      expect(schema.parse('90210')).toBe('90210');
      expect(schema.parse('10001')).toBe('10001');
    });

    it('should accept valid ZIP+4 codes', () => {
      expect(schema.parse('12345-6789')).toBe('12345-6789');
      expect(schema.parse('90210-1234')).toBe('90210-1234');
      expect(schema.parse('10001-0000')).toBe('10001-0000');
    });

    it('should reject undefined', () => {
      expect(() => schema.parse(undefined)).toThrow();
    });

    it('should reject empty string', () => {
      expect(() => schema.parse('')).toThrow('Postal Code is required');
    });

    it('should reject invalid ZIP code formats', () => {
      expect(() => schema.parse('1234')).toThrow(); // too short
      expect(() => schema.parse('123456')).toThrow(); // too long
      expect(() => schema.parse('12345-123')).toThrow(); // invalid ZIP+4
      expect(() => schema.parse('12345-12345')).toThrow(); // too long extension
      expect(() => schema.parse('abcde')).toThrow(); // letters
      expect(() => schema.parse('12a45')).toThrow(); // mixed alphanumeric
    });

    it('should reject the invalid 00000 ZIP code', () => {
      expect(() => schema.parse('00000')).toThrow('Postal Code is invalid');
    });

    it('should reject 00000-XXXX ZIP codes', () => {
      expect(() => schema.parse('00000-1234')).toThrow('Postal Code is invalid');
      expect(() => schema.parse('00000-0000')).toThrow('Postal Code is invalid');
    });

    it('should reject non-string values', () => {
      expect(() => schema.parse(12345)).toThrow();
      expect(() => schema.parse(true)).toThrow();
      expect(() => schema.parse({})).toThrow();
      expect(() => schema.parse([])).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it('should reject whitespace-only strings', () => {
      expect(() => schema.parse('     ')).toThrow();
      expect(() => schema.parse('\t')).toThrow();
      expect(() => schema.parse('\n')).toThrow();
    });

    it('should reject ZIP codes with spaces', () => {
      expect(() => schema.parse('12 345')).toThrow();
      expect(() => schema.parse(' 12345')).toThrow();
      expect(() => schema.parse('12345 ')).toThrow();
      expect(() => schema.parse('12345 - 6789')).toThrow();
    });

    it('should use custom field name in error messages', () => {
      const customSchema = zPostalCodeRequired({ msg: 'ZIP Code' });
      expect(() => customSchema.parse('')).toThrow('ZIP Code is required');
      expect(() => customSchema.parse('invalid')).toThrow('ZIP Code is invalid');
    });

    it('should use custom message when msgType is Message', () => {
      const customSchema = zPostalCodeRequired({ msg: 'ZIP code is mandatory', msgType: MsgType.Message });
      expect(() => customSchema.parse('')).toThrow('ZIP code is mandatory');
      expect(() => customSchema.parse('invalid')).toThrow('ZIP code is mandatory');
    });
  });

  describe('Real-world ZIP code examples', () => {
    const optionalSchema = zPostalCodeOptional();
    const requiredSchema = zPostalCodeRequired();

    it('should accept famous ZIP codes', () => {
      const famousZips = [
        '90210', // Beverly Hills
        '10001', // NYC
        '60601', // Chicago
        '02101', // Boston
        '33101', // Miami
        '94101', // San Francisco
        '20001', // Washington DC
      ];

      famousZips.forEach(zip => {
        expect(optionalSchema.parse(zip)).toBe(zip);
        expect(requiredSchema.parse(zip)).toBe(zip);
      });
    });

    it('should accept ZIP+4 codes for famous locations', () => {
      const zipPlus4Codes = [
        '90210-1234',
        '10001-0001',
        '60601-9999',
        '02101-2345',
        '33101-5678',
        '94101-1111',
        '20001-0000',
      ];

      zipPlus4Codes.forEach(zip => {
        expect(optionalSchema.parse(zip)).toBe(zip);
        expect(requiredSchema.parse(zip)).toBe(zip);
      });
    });

    it('should reject invalid real-world examples', () => {
      const invalidZips = [
        '00000',    // Invalid reserved code
        '00000-1234', // Invalid with extension
        '99999',    // Doesn't exist
        '12345-',   // Incomplete extension
        '-1234',    // Missing ZIP
        '1234-5678', // Too short ZIP
        '123456-7890', // Too long ZIP
      ];

      invalidZips.forEach(zip => {
        expect(() => optionalSchema.parse(zip)).toThrow();
        expect(() => requiredSchema.parse(zip)).toThrow();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle leading zeros correctly', () => {
      expect(zPostalCodeOptional().parse('01234')).toBe('01234');
      expect(zPostalCodeOptional().parse('00123')).toBe('00123');
      expect(zPostalCodeOptional().parse('00001')).toBe('00001');
      expect(zPostalCodeRequired().parse('00001')).toBe('00001');
    });

    it('should handle ZIP+4 with leading zeros', () => {
      expect(zPostalCodeOptional().parse('12345-0001')).toBe('12345-0001');
      expect(zPostalCodeOptional().parse('01234-0000')).toBe('01234-0000');
      expect(zPostalCodeRequired().parse('01234-0123')).toBe('01234-0123');
    });

    it('should reject ZIP codes with special characters', () => {
      const invalidChars = ['12345@', '12345#', '12345$', '12345%', '12345*'];
      
      invalidChars.forEach(zip => {
        expect(() => zPostalCodeOptional().parse(zip)).toThrow();
        expect(() => zPostalCodeRequired().parse(zip)).toThrow();
      });
    });

    it('should reject international postal codes', () => {
      const internationalCodes = [
        'K1A 0A6', // Canada
        'SW1A 1AA', // UK
        '75001', // France (too short for US)
        '10117', // Germany (valid format but not US)
        '100-0001', // Japan
      ];

      internationalCodes.forEach(code => {
        expect(() => zPostalCodeOptional().parse(code)).toThrow();
        expect(() => zPostalCodeRequired().parse(code)).toThrow();
      });
    });
  });
});
