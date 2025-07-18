import { zAddressOptional, zAddressRequired, zAddressSimple, zAddressUS } from '../src/schemas/address-schemas';
import { MsgType } from '../src/schemas/msg-type';

describe('Address Schemas', () => {
  describe('zAddressOptional', () => {
    const schema = zAddressOptional();

    it('should accept valid address object', () => {
      const validAddress = {
        street: '123 Main St',
        street2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };
      const result = schema.parse(validAddress);
      expect(result).toEqual(validAddress);
    });

    it('should accept valid address without street2', () => {
      const validAddress = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };
      const result = schema.parse(validAddress);
      expect(result).toEqual(validAddress);
    });

    it('should accept undefined as optional', () => {
      const result = schema.parse(undefined);
      expect(result).toBeUndefined();
    });

    it('should reject missing required fields', () => {
      const incompleteAddress = {
        street: '123 Main St',
        city: 'New York',
        // missing state, postalCode, country
      };
      expect(() => schema.parse(incompleteAddress)).toThrow();
    });

    it('should reject empty string required fields', () => {
      const invalidAddress = {
        street: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };
      expect(() => schema.parse(invalidAddress)).toThrow();
    });

    it('should reject non-object values', () => {
      expect(() => schema.parse('not an object')).toThrow();
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse([])).toThrow();
    });

    it('should use custom field name in error messages', () => {
      const customSchema = zAddressOptional('Shipping Address');
      expect(() => customSchema.parse('invalid')).toThrow('Shipping Address must be a valid address object');
    });

    it('should use custom message when msgType is Message', () => {
      const customSchema = zAddressOptional('Invalid address format', MsgType.Message);
      expect(() => customSchema.parse('invalid')).toThrow('Invalid address format');
    });
  });

  describe('zAddressRequired', () => {
    const schema = zAddressRequired();

    it('should accept valid address object', () => {
      const validAddress = {
        street: '123 Main St',
        street2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };
      const result = schema.parse(validAddress);
      expect(result).toEqual(validAddress);
    });

    it('should accept valid address without street2', () => {
      const validAddress = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };
      const result = schema.parse(validAddress);
      expect(result).toEqual(validAddress);
    });

    it('should reject undefined', () => {
      expect(() => schema.parse(undefined)).toThrow();
    });

    it('should reject missing required fields', () => {
      const incompleteAddress = {
        street: '123 Main St',
        city: 'New York',
        // missing state, postalCode, country
      };
      expect(() => schema.parse(incompleteAddress)).toThrow();
    });

    it('should reject empty string required fields', () => {
      const invalidAddress = {
        street: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };
      expect(() => schema.parse(invalidAddress)).toThrow();
    });

    it('should use custom field name in error messages', () => {
      const customSchema = zAddressRequired('Billing Address');
      expect(() => customSchema.parse(undefined)).toThrow('Billing Address is required');
    });

    it('should use custom message when msgType is Message', () => {
      const customSchema = zAddressRequired('Address is mandatory', MsgType.Message);
      expect(() => customSchema.parse(undefined)).toThrow('Address is mandatory');
    });
  });

  describe('zAddressSimple', () => {
    const schema = zAddressSimple();

    it('should accept valid simple address', () => {
      const validAddress = {
        street: '123 Main St',
        city: 'New York',
        country: 'US',
      };
      const result = schema.parse(validAddress);
      expect(result).toEqual(validAddress);
    });

    it('should not require state or postalCode', () => {
      const simpleAddress = {
        street: '123 Main St',
        city: 'Paris',
        country: 'France',
      };
      const result = schema.parse(simpleAddress);
      expect(result).toEqual(simpleAddress);
    });

    it('should reject missing required fields', () => {
      const incompleteAddress = {
        street: '123 Main St',
        // missing city and country
      };
      expect(() => schema.parse(incompleteAddress)).toThrow();
    });

    it('should reject empty string required fields', () => {
      const invalidAddress = {
        street: '',
        city: 'New York',
        country: 'US',
      };
      expect(() => schema.parse(invalidAddress)).toThrow();
    });

    it('should use custom field name in error messages', () => {
      const customSchema = zAddressSimple('Simple Address');
      expect(() => customSchema.parse(undefined)).toThrow('Simple Address is required');
    });
  });

  describe('zAddressUS', () => {
    const schema = zAddressUS();

    it('should accept valid US address', () => {
      const validAddress = {
        street: '123 Main St',
        street2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };
      const result = schema.parse(validAddress);
      expect(result).toEqual(validAddress);
    });

    it('should accept valid US address without street2', () => {
      const validAddress = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };
      const result = schema.parse(validAddress);
      expect(result).toEqual(validAddress);
    });

    it('should accept ZIP+4 format', () => {
      const validAddress = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001-1234',
        country: 'US',
      };
      const result = schema.parse(validAddress);
      expect(result).toEqual(validAddress);
    });

    it('should reject invalid state format', () => {
      const invalidAddress = {
        street: '123 Main St',
        city: 'New York',
        state: 'New York', // should be NY
        postalCode: '10001',
        country: 'US',
      };
      expect(() => schema.parse(invalidAddress)).toThrow('State must be a valid 2-letter US state code');
    });

    it('should reject lowercase state code', () => {
      const invalidAddress = {
        street: '123 Main St',
        city: 'New York',
        state: 'ny', // should be NY
        postalCode: '10001',
        country: 'US',
      };
      expect(() => schema.parse(invalidAddress)).toThrow();
    });

    it('should reject invalid ZIP code format', () => {
      const invalidAddress = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '100011', // too many digits
        country: 'US',
      };
      expect(() => schema.parse(invalidAddress)).toThrow('Postal code must be a valid US ZIP code');
    });

    it('should reject non-US country', () => {
      const invalidAddress = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'Canada', // must be US
      };
      expect(() => schema.parse(invalidAddress)).toThrow();
    });

    it('should reject missing required fields', () => {
      const incompleteAddress = {
        street: '123 Main St',
        city: 'New York',
        // missing state, postalCode, country
      };
      expect(() => schema.parse(incompleteAddress)).toThrow();
    });

    it('should use custom field name in error messages', () => {
      const customSchema = zAddressUS('US Address');
      expect(() => customSchema.parse(undefined)).toThrow('US Address is required');
    });
  });

  describe('Edge cases', () => {
    it('should handle unicode characters in addresses', () => {
      const unicodeAddress = {
        street: '123 Rue de la Paix',
        city: 'São Paulo',
        country: 'Brazil',
      };
      const result = zAddressSimple().parse(unicodeAddress);
      expect(result).toEqual(unicodeAddress);
    });

    it('should handle very long street names', () => {
      const longStreetAddress = {
        street: 'A'.repeat(255),
        city: 'New York',
        country: 'US',
      };
      const result = zAddressSimple().parse(longStreetAddress);
      expect(result.street).toBe('A'.repeat(255));
    });

    it('should trim whitespace from string fields', () => {
      const addressWithSpaces = {
        street: '  123 Main St  ',
        city: '  New York  ',
        state: '  NY  ',
        postalCode: '10001',
        country: '  US  ',
      };
      const result = zAddressRequired().parse(addressWithSpaces);
      expect(result.street).toBe('123 Main St');
      expect(result.city).toBe('New York');
      expect(result.state).toBe('NY');
      expect(result.country).toBe('US');
    });
  });
});
