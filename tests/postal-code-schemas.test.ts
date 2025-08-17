import { pz } from '../src/pz';
import { MsgType } from '../src/common/types/msg-type';

const { PostalCodeOptional, PostalCodeRequired } = pz;

describe('Postal Code Schemas', () => {
  describe('PostalCodeOptional', () => {
    const schema = PostalCodeOptional();

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
      const customSchema = PostalCodeOptional({ msg: 'ZIP Code' });
      expect(() => customSchema.parse('invalid')).toThrow('ZIP Code is invalid');
    });

    it('should use custom message when msgType is Message', () => {
      const customSchema = PostalCodeOptional({ msg: 'Invalid ZIP format', msgType: MsgType.Message });
      expect(() => customSchema.parse('invalid')).toThrow('Invalid ZIP format');
    });
  });

  describe('PostalCodeRequired', () => {
    const schema = PostalCodeRequired();

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
      const customSchema = PostalCodeRequired({ msg: 'ZIP Code' });
      expect(() => customSchema.parse('')).toThrow('ZIP Code is required');
      expect(() => customSchema.parse('invalid')).toThrow('ZIP Code is invalid');
    });

    it('should use custom message when msgType is Message', () => {
      const customSchema = PostalCodeRequired({ msg: 'ZIP code is mandatory', msgType: MsgType.Message });
      expect(() => customSchema.parse('')).toThrow('ZIP code is mandatory');
      expect(() => customSchema.parse('invalid')).toThrow('ZIP code is mandatory');
    });
  });

  describe('Real-world ZIP code examples', () => {
    const optionalSchema = PostalCodeOptional();
    const requiredSchema = PostalCodeRequired();

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
      expect(PostalCodeOptional().parse('01234')).toBe('01234');
      expect(PostalCodeOptional().parse('00123')).toBe('00123');
      expect(PostalCodeOptional().parse('00001')).toBe('00001');
      expect(PostalCodeRequired().parse('00001')).toBe('00001');
    });

    it('should handle ZIP+4 with leading zeros', () => {
      expect(PostalCodeOptional().parse('12345-0001')).toBe('12345-0001');
      expect(PostalCodeOptional().parse('01234-0000')).toBe('01234-0000');
      expect(PostalCodeRequired().parse('01234-0123')).toBe('01234-0123');
    });

    it('should reject ZIP codes with special characters', () => {
      const invalidChars = ['12345@', '12345#', '12345$', '12345%', '12345*'];
      
      invalidChars.forEach(zip => {
        expect(() => PostalCodeOptional().parse(zip)).toThrow();
        expect(() => PostalCodeRequired().parse(zip)).toThrow();
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
        expect(() => PostalCodeOptional().parse(code)).toThrow();
        expect(() => PostalCodeRequired().parse(code)).toThrow();
      });
    });
  });

  describe('Postal Code Schema String Parameter Overloads', () => {
    describe('PostalCodeOptional overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema1 = PostalCodeOptional('ZIP Code');
        const schema2 = PostalCodeOptional({ msg: 'ZIP Code' });
        
        const validZip = '12345';
        const validZipPlus4 = '12345-6789';
        
        expect(schema1.parse(validZip)).toBe(validZip);
        expect(schema2.parse(validZip)).toBe(validZip);
        expect(schema1.parse(validZipPlus4)).toBe(validZipPlus4);
        expect(schema2.parse(validZipPlus4)).toBe(validZipPlus4);
        expect(schema1.parse(undefined)).toBeUndefined();
        expect(schema2.parse(undefined)).toBeUndefined();
        
        // Test error message consistency
        try {
          schema1.parse('00000');
        } catch (error1) {
          try {
            schema2.parse('00000');
          } catch (error2) {
            expect((error1 as Error).message).toEqual((error2 as Error).message);
          }
        }
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = PostalCodeOptional({ msg: 'Shipping ZIP', msgType: MsgType.FieldName });
        expect(schema.parse('90210')).toBe('90210');
        expect(schema.parse('90210-1234')).toBe('90210-1234');
        expect(schema.parse(undefined)).toBeUndefined();
      });

      it('should work with no parameters (default usage)', () => {
        const schema = PostalCodeOptional();
        expect(schema.parse('12345')).toBe('12345');
        expect(schema.parse(undefined)).toBeUndefined();
      });
    });

    describe('PostalCodeRequired overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema1 = PostalCodeRequired('ZIP Code');
        const schema2 = PostalCodeRequired({ msg: 'ZIP Code' });
        
        const validZip = '12345';
        const validZipPlus4 = '12345-6789';
        
        expect(schema1.parse(validZip)).toBe(validZip);
        expect(schema2.parse(validZip)).toBe(validZip);
        expect(schema1.parse(validZipPlus4)).toBe(validZipPlus4);
        expect(schema2.parse(validZipPlus4)).toBe(validZipPlus4);
        
        // Test error message consistency
        try {
          schema1.parse('00000');
        } catch (error1) {
          try {
            schema2.parse('00000');
          } catch (error2) {
            expect((error1 as Error).message).toEqual((error2 as Error).message);
          }
        }
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = PostalCodeRequired({ msg: 'Billing ZIP', msgType: MsgType.FieldName });
        expect(schema.parse('10001')).toBe('10001');
        expect(schema.parse('10001-1234')).toBe('10001-1234');
      });

      it('should work with no parameters (default usage)', () => {
        const schema = PostalCodeRequired();
        expect(schema.parse('12345')).toBe('12345');
      });
    });

    describe('Real-world usage examples', () => {
      it('should handle address form with overloaded schemas', () => {
        const billingZipSchema = PostalCodeRequired('Billing ZIP Code');
        const shippingZipSchema = PostalCodeOptional('Shipping ZIP Code');
        
        const addressData = {
          billingZip: '90210',
          shippingZip: undefined, // Same as billing
        };
        
        expect(billingZipSchema.parse(addressData.billingZip)).toBe('90210');
        expect(shippingZipSchema.parse(addressData.shippingZip)).toBeUndefined();
      });

      it('should handle business address validation', () => {
        const businessZipSchema = PostalCodeRequired('Business ZIP Code');
        const mailingZipSchema = PostalCodeOptional('Mailing ZIP Code');
        
        const businessData = {
          businessZip: '10001-1234',
          mailingZip: '10002',
        };
        
        expect(businessZipSchema.parse(businessData.businessZip)).toBe('10001-1234');
        expect(mailingZipSchema.parse(businessData.mailingZip)).toBe('10002');
      });

      it('should handle user profile with optional ZIP codes', () => {
        const homeZipSchema = PostalCodeOptional('Home ZIP Code');
        const workZipSchema = PostalCodeOptional('Work ZIP Code');
        
        const profileData = {
          homeZip: '94102',
          workZip: undefined,
        };
        
        expect(homeZipSchema.parse(profileData.homeZip)).toBe('94102');
        expect(workZipSchema.parse(profileData.workZip)).toBeUndefined();
      });

      it('should maintain type safety across all overloaded postal code schemas', () => {
        const schemas = {
          required: PostalCodeRequired('Required ZIP'),
          optional: PostalCodeOptional('Optional ZIP'),
        };
        
        const testZips = {
          basic: '12345',
          plus4: '12345-6789',
          leadingZero: '01234',
        };
        
        // Test all valid ZIP formats
        Object.values(testZips).forEach(zip => {
          expect(schemas.required.parse(zip)).toBe(zip);
          expect(schemas.optional.parse(zip)).toBe(zip);
        });
        
        // Test optional behavior
        expect(schemas.optional.parse(undefined)).toBeUndefined();
        
        // Test invalid ZIP rejection
        const invalidZips = ['00000', '99999', '12345-', 'invalid'];
        invalidZips.forEach(invalidZip => {
          expect(() => schemas.required.parse(invalidZip)).toThrow();
          expect(() => schemas.optional.parse(invalidZip)).toThrow();
        });
      });

      it('should handle regional delivery services', () => {
        const deliveryZipSchema = PostalCodeRequired('Delivery ZIP Code');
        const returnZipSchema = PostalCodeOptional('Return ZIP Code');
        
        const deliveryData = {
          deliveryZip: '33101',
          returnZip: '33101-4567',
        };
        
        expect(deliveryZipSchema.parse(deliveryData.deliveryZip)).toBe('33101');
        expect(returnZipSchema.parse(deliveryData.returnZip)).toBe('33101-4567');
        
        // Test various regional ZIP codes
        const regionalZips = {
          california: '90210',
          newyork: '10001',
          florida: '33101',
          texas: '75201',
          illinois: '60601',
        };
        
        Object.values(regionalZips).forEach(zip => {
          expect(deliveryZipSchema.parse(zip)).toBe(zip);
          expect(returnZipSchema.parse(zip)).toBe(zip);
        });
      });
    });
  });
});
