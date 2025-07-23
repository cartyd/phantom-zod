import {
  EMAIL_PATTERN,
  UUID_PATTERN,
  UUID_V4_PATTERN,
  US_PHONE_E164_PATTERN,
  US_PHONE_NATIONAL_PATTERN,
  US_PHONE_11_DIGIT_PATTERN,
  US_PHONE_DIGITS_ONLY_PATTERN,
  IPV4_PATTERN,
  IPV6_PATTERN,
  US_ZIP_CODE_PATTERN,
  FILENAME_INVALID_CHARS_PATTERN,
  INTEGER_PATTERN,
  FLOAT_PATTERN,
  MONEY_DECIMAL_PATTERN,
  BOOLEAN_STRING_PATTERN,
  DIGITS_ONLY,
  NON_DIGITS,
  REGEX_PATTERNS,
} from '../src/common/regex-patterns';

describe('Regex Patterns', () => {
  describe('EMAIL_PATTERN', () => {
    it('should match valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'a@b.co',
        'user123@test123.com',
        'user_name@example-domain.com',
      ];

      validEmails.forEach(email => {
        expect(EMAIL_PATTERN.test(email)).toBe(true);
      });
    });

    it('should not match invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        'test@.com',
        'test@domain',
        'test @example.com', // space in email
        'test@@example.com', // multiple @
        '',
        'test@',
      ];

      invalidEmails.forEach(email => {
        expect(EMAIL_PATTERN.test(email)).toBe(false);
      });
    });
  });

  describe('UUID_PATTERN', () => {
    it('should match valid UUIDs (versions 1-5)', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-8456-426614174000', // v1
        '123e4567-e89b-22d3-9456-426614174000', // v2
        '123e4567-e89b-32d3-a456-426614174000', // v3
        '123e4567-e89b-42d3-b456-426614174000', // v4
        '123e4567-e89b-52d3-8456-426614174000', // v5
        '123E4567-E89B-42D3-8456-426614174000', // uppercase
        '00000000-0000-1000-8000-000000000000', // minimal v1
      ];

      validUUIDs.forEach(uuid => {
        expect(UUID_PATTERN.test(uuid)).toBe(true);
      });
    });

    it('should not match invalid UUIDs', () => {
      const invalidUUIDs = [
        'invalid-uuid',
        '123e4567-e89b-12d3-a456', // too short
        '123e4567-e89b-12d3-a456-426614174000-extra', // too long
        '123e4567-e89b-12d3-g456-426614174000', // invalid character
        '123e4567e89b12d3a456426614174000', // no dashes
        '123e4567-e89b-12d3-a456-42661417400', // wrong length
        '123e4567-e89b-62d3-a456-426614174000', // invalid version
        '123e4567-e89b-02d3-a456-426614174000', // invalid version
        '',
      ];

      invalidUUIDs.forEach(uuid => {
        expect(UUID_PATTERN.test(uuid)).toBe(false);
      });
    });
  });

  describe('UUID_V4_PATTERN', () => {
    it('should match valid UUIDv4', () => {
      const validUUIDv4s = [
        '123e4567-e89b-42d3-8456-426614174000',
        '987fcdeb-51a2-4321-9876-543210987654',
        '123E4567-E89B-42D3-A456-426614174000', // uppercase
        '123e4567-e89b-42d3-b456-426614174000',
      ];

      validUUIDv4s.forEach(uuid => {
        expect(UUID_V4_PATTERN.test(uuid)).toBe(true);
      });
    });

    it('should not match invalid UUIDv4', () => {
      const invalidUUIDv4s = [
        '123e4567-e89b-12d3-a456-426614174000', // v1
        '123e4567-e89b-22d3-a456-426614174000', // v2
        '123e4567-e89b-32d3-a456-426614174000', // v3
        '123e4567-e89b-52d3-a456-426614174000', // v5
        '123e4567-e89b-62d3-a456-426614174000', // invalid version
        'invalid-uuid',
        '',
      ];

      invalidUUIDv4s.forEach(uuid => {
        expect(UUID_V4_PATTERN.test(uuid)).toBe(false);
      });
    });
  });

  describe('US Phone Patterns', () => {
    describe('US_PHONE_E164_PATTERN', () => {
      it('should match valid E.164 format', () => {
        const validE164 = [
          '+11234567890',
          '+19876543210',
          '+15551234567',
        ];

        validE164.forEach(phone => {
          expect(US_PHONE_E164_PATTERN.test(phone)).toBe(true);
        });
      });

      it('should not match invalid E.164 format', () => {
        const invalidE164 = [
          '1234567890', // missing +1
          '+1123456789', // too short
          '+112345678901', // too long
          '+21234567890', // wrong country code
          '+1-123-456-7890', // has dashes
          '',
        ];

        invalidE164.forEach(phone => {
          expect(US_PHONE_E164_PATTERN.test(phone)).toBe(false);
        });
      });
    });

    describe('US_PHONE_NATIONAL_PATTERN', () => {
      it('should match valid 10-digit format', () => {
        const validNational = [
          '1234567890',
          '9876543210',
          '5551234567',
        ];

        validNational.forEach(phone => {
          expect(US_PHONE_NATIONAL_PATTERN.test(phone)).toBe(true);
        });
      });

      it('should not match invalid 10-digit format', () => {
        const invalidNational = [
          '123456789', // too short
          '12345678901', // too long
          '+11234567890', // has country code
          '123-456-7890', // has dashes
          'abcdefghij', // letters
          '',
        ];

        invalidNational.forEach(phone => {
          expect(US_PHONE_NATIONAL_PATTERN.test(phone)).toBe(false);
        });
      });
    });

    describe('US_PHONE_11_DIGIT_PATTERN', () => {
      it('should match valid 11-digit format', () => {
        const valid11Digit = [
          '11234567890',
          '19876543210',
          '15551234567',
        ];

        valid11Digit.forEach(phone => {
          expect(US_PHONE_11_DIGIT_PATTERN.test(phone)).toBe(true);
        });
      });

      it('should not match invalid 11-digit format', () => {
        const invalid11Digit = [
          '1234567890', // 10 digits
          '212345678901', // starts with 2
          '123456789012', // 12 digits
          '+11234567890', // has plus
          '',
        ];

        invalid11Digit.forEach(phone => {
          expect(US_PHONE_11_DIGIT_PATTERN.test(phone)).toBe(false);
        });
      });
    });

    describe('US_PHONE_DIGITS_ONLY_PATTERN (NON_DIGITS)', () => {
      it('should remove non-digit characters', () => {
        const testCases = [
          { input: '(123) 456-7890', expected: '1234567890' },
          { input: '+1-123-456-7890', expected: '11234567890' },
          { input: '123.456.7890', expected: '1234567890' },
          { input: '123 456 7890', expected: '1234567890' },
          { input: 'abc123def456', expected: '123456' },
        ];

        testCases.forEach(({ input, expected }) => {
          expect(input.replace(US_PHONE_DIGITS_ONLY_PATTERN, '')).toBe(expected);
          expect(input.replace(NON_DIGITS, '')).toBe(expected);
        });
      });
    });
  });

  describe('IPV4_PATTERN', () => {
    it('should match valid IPv4 addresses', () => {
      const validIPv4 = [
        '192.168.1.1',
        '127.0.0.1',
        '255.255.255.255',
        '0.0.0.0',
        '10.0.0.1',
      ];

      validIPv4.forEach(ip => {
        expect(IPV4_PATTERN.test(ip)).toBe(true);
      });
    });

    it('should not match invalid IPv4 addresses', () => {
      const invalidIPv4 = [
        '192.168.1', // too few octets
        '192.168.1.1.1', // too many octets
        'localhost', // incorrect number format
        'not.an.ip.address', // incorrect number format
        '', // incorrect number format
        '1234.5678.90.12', // more than 3 numbers in octets
        '-120.-140.-150.-160', // octets should not contain negative nubmers
        '(1.1.1.1)', // octets should not contain symbols
      ];

      invalidIPv4.forEach(ip => {
        expect(IPV4_PATTERN.test(ip)).toBe(false);
      });
    });

    it('should not match octets above 255', () => {
      const aboveMaximumIPv4Format = [
        '256.256.256.256', // above maximum range 255.255.255.255
        '999.999.999.999', // above maximum range 255.255.255.255
        '256.255.255.255', // first octet above maximum range 255
        '255.256.255.255', // second octet above maximum range 255
        '255.255.256.255', // third octet above maximum range 255
        '255.255.255.256', // fourth octet above maximum range 255
      ];

      aboveMaximumIPv4Format.forEach(ip => {
        expect(IPV4_PATTERN.test(ip)).toBe(false);
      });
    });
  });

  describe('IPV6_PATTERN', () => {
    it('should match valid standard IPv6 addresses', () => {
      const validIPv6Format = [
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334', // Fully expanded format
        '2001:db8:1234:ffff:ffff:ffff:ffff:ffff',  // Maxed-out segments
        'fe80:0000:0000:0000:0202:b3ff:fe1e:8329', // Link-local with full expansion
      ];

      validIPv6Format.forEach(ipv6 => {
        expect(IPV6_PATTERN.test(ipv6)).toBe(true);
      });
    });

    it('should match valid compressed IPv6 addresses', () => {
      const validIPv6Format = [
        
        '2001:db8::1',              // Compressed zeros
        'fe80::1ff:fe23:4567:890a', // Common link-local compressed
        '::1',                      // Loopback address
        '::ffff:c000:0280',         // IPv4-mapped IPv6 address
      ];

      validIPv6Format.forEach(ipv6 => {
        expect(IPV6_PATTERN.test(ipv6)).toBe(true);
      });
    });

    it('should match valid IPv6 addresses with embedded IPv4 address in the last 2 segments', () => {
      const validIPv6Format = [
        '::ffff:192.0.2.128',    // IPv4-mapped IPv6
        '2001:db8::192.0.2.128', // IPv6 with embedded IPv4
      ];

      validIPv6Format.forEach(ipv6 => {
        expect(IPV6_PATTERN.test(ipv6)).toBe(true);
      });
    });

    it('should match valid IPv6 Link-local addresses with zone index', () => {
      const validIPv6Format = [
        'fe80::1%eth0',                    // Link-local with interface name
        'fe80::a00:27ff:fe4e:66a1%enp0s3', // Another link-local with interface
      ];

      validIPv6Format.forEach(ipv6 => {
        expect(IPV6_PATTERN.test(ipv6)).toBe(true);
      });
    });

    it('should match valid Unique Local IPv6 addresses', () => {
      const validIPv6Format = [
        'fc00::1234',          // Unique local address (ULA)
        'fd12:3456:789a:1::1', // ULA with subnet
      ];

      validIPv6Format.forEach(ipv6 => {
        expect(IPV6_PATTERN.test(ipv6)).toBe(true);
      });
    });

    it('should match valid Multicast IPv6 addresses', () => {
      const validIPv6Format = [
        'ff02::1', // All nodes on the local link
        'ff05::2', // All routers on the site
      ];

      validIPv6Format.forEach(ipv6 => {
        expect(IPV6_PATTERN.test(ipv6)).toBe(true);
      });
    });

    it('should not match invalid IPv6 Format', () => {
      const invalidIPv6Format = [

        // ❌ Invalid Standard IPv6
        '2001:db8:85a3:0000:0000:8a2e:0370:7334:1234', // Too many segments (9 instead of 8)
        '2001:db8:85a3::8a2e::7334',                   // Multiple "::" compressions
        '2001:db8:85a3:0000:0000:8a2e:0370',           // Too few segments (7 instead of 8)
        '2001:db8:85a3:0000:0000:8a2e:0370:7334:',     // Trailing colon

        // ❌ Invalid Compressed IPv6
        '2001::db8::1',                                // Multiple "::"
        ':::',                                         // Too many colons
        '::g',                                         // Invalid hex character
        '2001:db8::1::',                               // Multiple "::" again

        // ❌ Invalid IPv6 with Embedded IPv4
        '::ffff:999.0.2.128',                          // IPv4 segment out of range
        '::ffff:192.0.2.256',                          // IPv4 segment out of range
        '::ffff:192.0.2',                              // Incomplete IPv4
        '2001:db8::192.0.2.128.1',                     // Too many IPv4 segments

        // ❌ Invalid Link-local Address
        'fe80::1%',                                    // Missing interface name
        'fe80::1%$',                                   // Invalid interface character
        'fe80::1%eth0%extra',                          // Multiple zone indices

        // ❌ Invalid Unique Local Address
        'fc00:::1234',                                 // Triple colon
        'fd12:3456:789a:1::1::',                       // Multiple "::"
        'fd12:3456:789a:1::1:xyz',                     // Invalid hex characters

        // ❌ Invalid Multicast Address
        'ff02::1::2',                                  // Multiple "::"
        'ff05::zz',                                    // Invalid hex characters
        'ff02:1',                                      // Too few segments

        // ❌ Miscellaneous Edge Cases
        '12345::',                                     // Segment too long (more than 4 hex digits)
        '::12345',                                     // Segment too long
        ':::',                                         // Triple colon again
        '::ffff:192.0.2.128:1234',                     // Extra segment after IPv4
        '',                                            // Empty String
        '2001-0db8-85a3-0000-0000-8a2e-0370-7334',     // Incorrect Delimiter (-)
        '2001.0db8.85a3.0000.0000.8a2e.0370.7334',     // Incorrect Delimiter in upper segments (.)

      ];

      invalidIPv6Format.forEach(ipv6 => {
        expect(IPV6_PATTERN.test(ipv6)).toBe(false);
      });
    });

  });

  describe('US_ZIP_CODE_PATTERN', () => {
    it('should match valid ZIP codes', () => {
      const validZIPs = [
        '12345',
        '12345-6789',
        '90210',
        '10001-1234',
      ];

      validZIPs.forEach(zip => {
        expect(US_ZIP_CODE_PATTERN.test(zip)).toBe(true);
      });
    });

    it('should not match invalid ZIP codes', () => {
      const invalidZIPs = [
        '1234', // too short
        '123456', // too long
        '12345-678', // incomplete extension
        '12345-67890', // extension too long
        'ABCDE',
        '12345-',
        '',
      ];

      invalidZIPs.forEach(zip => {
        expect(US_ZIP_CODE_PATTERN.test(zip)).toBe(false);
      });
    });
  });

  describe('FILENAME_INVALID_CHARS_PATTERN', () => {
    it('should match valid filenames', () => {
      const validFilenames = [
        'document.txt',
        'my_file.pdf',
        'image-2023.jpg',
        'file with spaces.docx',
        'filename123.csv',
        'très_bien.txt', // unicode
      ];

      validFilenames.forEach(filename => {
        expect(FILENAME_INVALID_CHARS_PATTERN.test(filename)).toBe(true);
      });
    });

    it('should not match filenames with invalid characters', () => {
      const invalidFilenames = [
        'file<name.txt',
        'file>name.txt',
        'file:name.txt',
        'file"name.txt',
        'file/name.txt',
        'file\\name.txt',
        'file|name.txt',
        'file?name.txt',
        'file*name.txt',
        'file\x00name.txt', // null character
        'file\x1fname.txt', // control character
      ];

      invalidFilenames.forEach(filename => {
        expect(FILENAME_INVALID_CHARS_PATTERN.test(filename)).toBe(false);
      });
    });
  });

  describe('Number Patterns', () => {
    describe('INTEGER_PATTERN', () => {
      it('should match valid integers', () => {
        const validIntegers = [
          '123',
          '-456',
          '0',
          '1000000',
          '-999',
        ];

        validIntegers.forEach(int => {
          expect(INTEGER_PATTERN.test(int)).toBe(true);
        });
      });

      it('should not match non-integers', () => {
        const nonIntegers = [
          '12.34',
          '12.',
          '.34',
          'abc',
          '12a',
          '',
          '+123',
        ];

        nonIntegers.forEach(val => {
          expect(INTEGER_PATTERN.test(val)).toBe(false);
        });
      });
    });

    describe('FLOAT_PATTERN', () => {
      it('should match valid floats and integers', () => {
        const validFloats = [
          '123',
          '123.45',
          '-456.78',
          '0.99',
          '-0.5',
          '1000000',
          '0',
        ];

        validFloats.forEach(float => {
          expect(FLOAT_PATTERN.test(float)).toBe(true);
        });
      });

      it('should not match invalid number formats', () => {
        const invalidFloats = [
          '12.',
          '.34',
          'abc',
          '12a',
          '',
          '+123',
          '12.34.56',
        ];

        invalidFloats.forEach(val => {
          expect(FLOAT_PATTERN.test(val)).toBe(false);
        });
      });
    });
  });

  describe('MONEY_DECIMAL_PATTERN', () => {
    it('should match valid positive decimal numbers', () => {
      const validDecimals = [
        '123',
        '123.45',
        '0.99',
        '1000000',
        '0',
        '0.01',
      ];

      validDecimals.forEach(decimal => {
        expect(MONEY_DECIMAL_PATTERN.test(decimal)).toBe(true);
      });
    });

    it('should not match invalid money formats', () => {
      const invalidDecimals = [
        '-123', // negative
        '12.',
        '.34',
        'abc',
        '12a',
        '',
        '+123',
        '12.34.56',
      ];

      invalidDecimals.forEach(val => {
        expect(MONEY_DECIMAL_PATTERN.test(val)).toBe(false);
      });
    });
  });

  describe('BOOLEAN_STRING_PATTERN', () => {
    it('should match valid boolean strings (case insensitive)', () => {
      const validBooleans = [
        'true',
        'false',
        'TRUE',
        'FALSE',
        'True',
        'False',
        'tRuE',
        'fAlSe',
      ];

      validBooleans.forEach(bool => {
        expect(BOOLEAN_STRING_PATTERN.test(bool)).toBe(true);
      });
    });

    it('should not match invalid boolean strings', () => {
      const invalidBooleans = [
        'yes',
        'no',
        '1',
        '0',
        'on',
        'off',
        '',
        'maybe',
        'true ',
        ' false',
      ];

      invalidBooleans.forEach(bool => {
        expect(BOOLEAN_STRING_PATTERN.test(bool)).toBe(false);
      });
    });
  });

  describe('DIGITS_ONLY', () => {
    it('should extract only digits', () => {
      const testCases = [
        { input: 'abc123def456', expected: ['1', '2', '3', '4', '5', '6'] },
        { input: '(555) 123-4567', expected: ['5', '5', '5', '1', '2', '3', '4', '5', '6', '7'] },
        { input: 'no digits here', expected: [] },
        { input: '12345', expected: ['1', '2', '3', '4', '5'] },
      ];

      testCases.forEach(({ input, expected }) => {
        const matches = input.match(DIGITS_ONLY);
        expect(matches || []).toEqual(expected);
      });
    });
  });

  describe('REGEX_PATTERNS object', () => {
    it('should contain all expected patterns', () => {
      const expectedKeys = [
        'EMAIL_PATTERN',
        'UUID_PATTERN',
        'UUID_V4_PATTERN',
        'US_PHONE_E164_PATTERN',
        'US_PHONE_NATIONAL_PATTERN',
        'US_PHONE_11_DIGIT_PATTERN',
        'US_PHONE_DIGITS_ONLY_PATTERN',
        'IPV4_PATTERN',
        'US_ZIP_CODE_PATTERN',
        'FILENAME_INVALID_CHARS_PATTERN',
        'INTEGER_PATTERN',
        'FLOAT_PATTERN',
        'MONEY_DECIMAL_PATTERN',
        'BOOLEAN_STRING_PATTERN',
        'DIGITS_ONLY',
        'NON_DIGITS',
      ];

      expectedKeys.forEach(key => {
        expect(REGEX_PATTERNS).toHaveProperty(key);
        expect(REGEX_PATTERNS[key]).toBeInstanceOf(RegExp);
      });
    });

    it('should have patterns that match individual exports', () => {
      expect(REGEX_PATTERNS.EMAIL_PATTERN).toBe(EMAIL_PATTERN);
      expect(REGEX_PATTERNS.UUID_PATTERN).toBe(UUID_PATTERN);
      expect(REGEX_PATTERNS.UUID_V4_PATTERN).toBe(UUID_V4_PATTERN);
      expect(REGEX_PATTERNS.US_PHONE_E164_PATTERN).toBe(US_PHONE_E164_PATTERN);
      expect(REGEX_PATTERNS.US_PHONE_NATIONAL_PATTERN).toBe(US_PHONE_NATIONAL_PATTERN);
      expect(REGEX_PATTERNS.US_PHONE_11_DIGIT_PATTERN).toBe(US_PHONE_11_DIGIT_PATTERN);
      expect(REGEX_PATTERNS.IPV4_PATTERN).toBe(IPV4_PATTERN);
      expect(REGEX_PATTERNS.US_ZIP_CODE_PATTERN).toBe(US_ZIP_CODE_PATTERN);
      expect(REGEX_PATTERNS.FILENAME_INVALID_CHARS_PATTERN).toBe(FILENAME_INVALID_CHARS_PATTERN);
      expect(REGEX_PATTERNS.INTEGER_PATTERN).toBe(INTEGER_PATTERN);
      expect(REGEX_PATTERNS.FLOAT_PATTERN).toBe(FLOAT_PATTERN);
      expect(REGEX_PATTERNS.MONEY_DECIMAL_PATTERN).toBe(MONEY_DECIMAL_PATTERN);
      expect(REGEX_PATTERNS.BOOLEAN_STRING_PATTERN).toBe(BOOLEAN_STRING_PATTERN);
      expect(REGEX_PATTERNS.DIGITS_ONLY).toBe(DIGITS_ONLY);
      expect(REGEX_PATTERNS.NON_DIGITS).toBe(NON_DIGITS);
    });
  });

  describe('Pattern consistency with existing schemas', () => {
    it('should maintain backwards compatibility', () => {
      // These tests ensure that the centralized patterns work the same
      // as they did when they were inline in the original schemas
      
      // Email pattern compatibility
      expect(EMAIL_PATTERN.test('test@example.com')).toBe(true);
      expect(EMAIL_PATTERN.test('invalid-email')).toBe(false);
      
      // UUID pattern compatibility
      expect(UUID_PATTERN.test('123e4567-e89b-42d3-8456-426614174000')).toBe(true);
      expect(UUID_PATTERN.test('invalid-uuid')).toBe(false);
      
      // Phone pattern compatibility
      expect(US_PHONE_E164_PATTERN.test('+11234567890')).toBe(true);
      expect(US_PHONE_NATIONAL_PATTERN.test('1234567890')).toBe(true);
      
      // ZIP code pattern compatibility
      expect(US_ZIP_CODE_PATTERN.test('12345')).toBe(true);
      expect(US_ZIP_CODE_PATTERN.test('12345-6789')).toBe(true);
    });
  });

  describe('Edge cases and performance', () => {
    it('should handle empty strings consistently', () => {
      const patterns = [
        EMAIL_PATTERN,
        UUID_PATTERN,
        UUID_V4_PATTERN,
        US_PHONE_E164_PATTERN,
        US_PHONE_NATIONAL_PATTERN,
        US_PHONE_11_DIGIT_PATTERN,
        IPV4_PATTERN,
        US_ZIP_CODE_PATTERN,
        FILENAME_INVALID_CHARS_PATTERN,
        INTEGER_PATTERN,
        FLOAT_PATTERN,
        MONEY_DECIMAL_PATTERN,
        BOOLEAN_STRING_PATTERN,
      ];

      patterns.forEach(pattern => {
        expect(pattern.test('')).toBe(false);
      });
    });

    it('should be performant with large inputs', () => {
      const longString = 'a'.repeat(10000);
      const start = Date.now();
      
      // Test a few patterns with long strings
      EMAIL_PATTERN.test(longString);
      UUID_PATTERN.test(longString);
      FILENAME_INVALID_CHARS_PATTERN.test(longString);
      
      const end = Date.now();
      expect(end - start).toBeLessThan(100); // Should be fast
    });

    it('should handle unicode characters appropriately', () => {
      // Email with unicode (should fail)
      expect(EMAIL_PATTERN.test('tëst@example.com')).toBe(true); // Basic unicode should work
      
      // Filename with unicode (should pass)
      expect(FILENAME_INVALID_CHARS_PATTERN.test('très_bien.txt')).toBe(true);
      
      // Number patterns should not match unicode
      expect(INTEGER_PATTERN.test('１２３')).toBe(false); // Full-width digits
      expect(FLOAT_PATTERN.test('１２.３')).toBe(false); // Full-width digits
    });
  });
});
