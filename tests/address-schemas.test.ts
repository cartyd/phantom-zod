import { US_STATE_CODES } from '../src/schemas/address-schemas';
describe('US_STATE_CODES', () => {
  it('should contain 50 unique state codes', () => {
    expect(US_STATE_CODES.length).toBe(50);
    const uniqueCodes = new Set(US_STATE_CODES);
    expect(uniqueCodes.size).toBe(50);
  });

  it('should only contain uppercase 2-letter codes', () => {
    for (const code of US_STATE_CODES) {
      expect(code).toMatch(/^[A-Z]{2}$/);
    }
  });

  it('should include NY, CA, TX, FL, and IL', () => {
    const requiredStates = ['NY', 'CA', 'TX', 'FL', 'IL'];
    for (const state of requiredStates) {
      expect(US_STATE_CODES).toContain(state);
    }
  });

  it('should not include lowercase or invalid codes', () => {
    expect(US_STATE_CODES).not.toContain('ny');
    expect(US_STATE_CODES).not.toContain('XX');
    expect(US_STATE_CODES).not.toContain('');
    expect(US_STATE_CODES).not.toContain('USA');
  });
});
import { createAddressSchemas } from '../src/schemas/address-schemas';
import { MsgType } from '../src/common/types/msg-type';
import { createTestMessageHandler } from '../src/localization/types/message-handler.types';

describe('Address Schemas', () => {
  const messageHandler = createTestMessageHandler();
  const schemas = createAddressSchemas(messageHandler);
  const { AddressOptional, AddressRequired, AddressSimple, AddressUS } = schemas;

  describe('AddressOptional', () => {
    const schema = AddressOptional();

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
      const customSchema = AddressOptional('Shipping Address');
      expect(() => customSchema.parse('invalid')).toThrow('Shipping Address is invalid');
    });

    it('should use custom message when msgType is Message', () => {
      const customSchema = AddressOptional('Invalid address format', MsgType.Message);
      expect(() => customSchema.parse('invalid')).toThrow('Invalid address format');
    });

    it('should remove empty string street2 field', () => {
      const addressWithEmptyStreet2 = {
        street: '123 Main St',
        street2: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };
      const result = schema.parse(addressWithEmptyStreet2);
      expect(result).not.toHaveProperty('street2');
      expect(result).toEqual({
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      });
    });
  });

  describe('AddressRequired', () => {
    const schema = AddressRequired();

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
      const customSchema = AddressRequired('Billing Address');
      expect(() => customSchema.parse(undefined)).toThrow('Billing Address is required');
    });

    it('should use custom message when msgType is Message', () => {
      const customSchema = AddressRequired('Address is mandatory', MsgType.Message);
      expect(() => customSchema.parse(undefined)).toThrow('Address is mandatory');
    });

    it('should remove empty string street2 field', () => {
      const addressWithEmptyStreet2 = {
        street: '123 Main St',
        street2: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };
      const result = schema.parse(addressWithEmptyStreet2);
      expect(result).not.toHaveProperty('street2');
      expect(result).toEqual({
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      });
    });
  });

  describe('AddressSimple', () => {
    const schema = AddressSimple();

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
      const customSchema = AddressSimple('Simple Address');
      expect(() => customSchema.parse(undefined)).toThrow('Simple Address is required');
    });
  });

  describe('AddressUS', () => {
  it('should default country to US when omitted', () => {
    const addressWithoutCountry = {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
    };
    const result = AddressUS().parse(addressWithoutCountry);
    expect(result.country).toBe('US');
    expect(result).toEqual({ ...addressWithoutCountry, country: 'US' });
  });
    const schema = AddressUS();

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
      expect(() => schema.parse(invalidAddress)).toThrow('Postal Code is invalid');
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
      const customSchema = AddressUS('US Address');
      expect(() => customSchema.parse(undefined)).toThrow('US Address is required');
    });

    it('should remove empty string street2 field', () => {
      const addressWithEmptyStreet2 = {
        street: '123 Main St',
        street2: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };
      const result = schema.parse(addressWithEmptyStreet2);
      expect(result).not.toHaveProperty('street2');
      expect(result).toEqual({
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle unicode characters in addresses', () => {
      const unicodeAddress = {
        street: '123 Rue de la Paix',
        city: 'São Paulo',
        country: 'Brazil',
      };
      const result = AddressSimple().parse(unicodeAddress);
      expect(result).toEqual(unicodeAddress);
    });

    it('should handle very long street names', () => {
      const longStreetAddress = {
        street: 'A'.repeat(255),
        city: 'New York',
        country: 'US',
      };
      const result = AddressSimple().parse(longStreetAddress);
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
      const result = AddressRequired().parse(addressWithSpaces);
      expect(result.street).toBe('123 Main St');
      expect(result.city).toBe('New York');
      expect(result.state).toBe('NY');
      expect(result.country).toBe('US');
    });
  });
});
