import { 
  createNetworkSchemas, 
  IPv4Optional, 
  IPv4Required, 
  IPv6Optional, 
  IPv6Required, 
  IPv4CIDROptional,
  IPv4CIDRRequired,
  IPv6CIDROptional,
  IPv6CIDRRequired,
  CIDRGeneric,
  MacAddressOptional, 
  MacAddressRequired,
  NetworkAddressGeneric,
  IPAddressGeneric,
  IPAddressGenericOptional,
  getNetworkAddressExamples
} from "../src/schemas/network-schemas";
import { INVALID_HEX_CHAR_PATTERN, IPV4_INVALID_OCTETS, LETTER_CASE_PATTERN, IPV4_INVALID_CHAR_PATTERN, IPV6_MULTIPLE_DOUBLE_COLON_PATTERN, MAC_SEPARATOR_PATTERN, VALID_MAC_FORMAT_PATTERN } from "../src/common/regex-patterns";
import { MsgType } from "../src/common/types/msg-type";
import { createTestMessageHandler } from '../src/localization/types/message-handler.types';
// Test Data Constants
const TEST_DATA = {
  // MAC Address Test Data
  validMacAddresses: [
    "00:1A:2B:3C:4D:5E",
    "00-1A-2B-3C-4D-5E",
    "001A2B3C4D5E",
    "aa:bb:cc:dd:ee:ff",
    "AA-BB-CC-DD-EE-FF",
    "AABBCCDDEEFF",
  ],
  invalidMacAddresses: [
    "00:1A:2B:3C:4D", // too short
    "00:1A:2B:3C:4D:5E:7F", // too long
    "00:1A:2B:3C:4D:5G", // invalid hex
    "GG:HH:II:JJ:KK:LL", // invalid hex
    "001A2B3C4D5", // too short
    "001A2B3C4D5E7F", // too long
    "", // empty string
    "not-a-mac",
    "00:1A:2B:3C:4D:5E:7F:8G",
  ],
  
  // IPv4 Test Data
  validIPv4: [
    "192.168.1.1",
    "127.0.0.1",
    "255.255.255.255",
    "0.0.0.0",
    "10.0.0.1",
  ],
  invalidIPv4: [
    "192.168.1", // too few octets
    "192.168.1.1.1", // too many octets
    "localhost",
    "not.an.ip.address",
    "",
    "1234.5678.90.12",
    "-120.-140.-150.-160",
    "(1.1.1.1)",
    "256.256.256.256",
    "999.999.999.999",
    "256.255.255.255",
    "255.256.255.255",
    "255.255.256.255",
    "255.255.255.256",
  ],
  
  // IPv6 Test Data
  validIPv6: [
    "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
    "2001:db8:1234:ffff:ffff:ffff:ffff:ffff",
    "fe80:0000:0000:0000:0202:b3ff:fe1e:8329",
    "2001:db8::1",
    "fe80::1ff:fe23:4567:890a",
    "::1",
    "::ffff:c000:0280",
    "::ffff:192.0.2.128",
    "2001:db8::192.0.2.128",
    "fc00::1234",
    "fd12:3456:789a:1::1",
    "ff02::1",
    "ff05::2",
  ],
  invalidIPv6: [
    "2001:db8:85a3:0000:0000:8a2e:0370:7334:1234",
    "2001:db8:85a3::8a2e::7334",
    "2001:db8:85a3:0000:0000:8a2e:0370",
    "2001:db8:85a3:0000:0000:8a2e:0370:7334:",
    "2001::db8::1",
    ":::",
    "::g",
    "2001:db8::1::",
    "::ffff:999.0.2.128",
    "::ffff:192.0.2.256",
    "::ffff:192.0.2",
    "2001:db8::192.0.2.128.1",
    "fe80::1%",
    "fe80::1%$",
    "fe80::1%eth0%extra",
    "fc00:::1234",
    "fd12:3456:789a:1::1::",
    "fd12:3456:789a:1::1:xyz",
    "ff02::1::2",
    "ff05::zz",
    "ff02:1",
    "12345::",
    "::12345",
    ":::",
    "::ffff:192.0.2.128:1234",
    "",
    "2001-0db8-85a3-0000-0000-8a2e-0370-7334",
    "2001.0db8.85a3.0000.0000.8a2e.0370.7334",
  ],
};

// Test Helper Functions
const getDescriptiveTestName = (schemaName: string, data: string, isValid: boolean): string => {
  const schemaType = schemaName.replace(/^z|Required$|Optional$/g, '');
  const prefix = isValid ? 'accepts valid' : 'rejects invalid';
  
  // Handle empty strings specifically
  if (data === '') {
    return `${prefix} ${schemaType}: empty string`;
  }
  
  // Add context for specific invalid patterns
  if (!isValid) {
    if (schemaType === 'MacAddress') {
      if (data.length < 12) return `${prefix} ${schemaType}: too short (${data})`;
      if (data.length > 17) return `${prefix} ${schemaType}: too long (${data})`;
      // Use centralized regex constant for invalid hex characters
      if (INVALID_HEX_CHAR_PATTERN.test(data)) return `${prefix} ${schemaType}: invalid hex characters (${data})`;
      // Use centralized regex constant for valid MAC address format
      if (!VALID_MAC_FORMAT_PATTERN.test(data)) return `${prefix} ${schemaType}: invalid format (${data})`;
    }
    
    if (schemaType === 'IPv4') {
      if (data.split('.').length < 4) return `${prefix} ${schemaType}: too few octets (${data})`;
      if (data.split('.').length > 4) return `${prefix} ${schemaType}: too many octets (${data})`;
      // Use centralized regex constant for octet out of range
      if (IPV4_INVALID_OCTETS.test(data)) return `${prefix} ${schemaType}: octet out of range (${data})`;
      // Use centralized regex constant for letters
      if (LETTER_CASE_PATTERN.test(data)) return `${prefix} ${schemaType}: contains letters (${data})`;
      // Use centralized regex constant for invalid characters
      if (IPV4_INVALID_CHAR_PATTERN.test(data)) return `${prefix} ${schemaType}: invalid characters (${data})`;
    }
    
    if (schemaType === 'IPv6') {
      if (data.split(':').length > 8) return `${prefix} ${schemaType}: too many groups (${data})`;
      if (data.includes(':::')) return `${prefix} ${schemaType}: triple colon (${data})`;
      // Use centralized regex constant for multiple double colons
      if (IPV6_MULTIPLE_DOUBLE_COLON_PATTERN.test(data)) return `${prefix} ${schemaType}: multiple double colons (${data})`;
      // Use centralized regex constant for invalid hex characters
      if (INVALID_HEX_CHAR_PATTERN.test(data)) return `${prefix} ${schemaType}: invalid hex characters (${data})`;
      // Use centralized regex constant for trailing colon (not present, so keep inline for now)
      if (data.endsWith(':') && !data.endsWith('::')) return `${prefix} ${schemaType}: trailing colon (${data})`;
      // Use centralized regex constant for invalid zone identifier (not present, so keep inline for now)
      if (data.includes('%') && (data.endsWith('%') || data.includes('%$'))) return `${prefix} ${schemaType}: invalid zone identifier (${data})`;
    }
  }
  
  // Add context for valid patterns
  if (isValid && schemaType === 'MacAddress') {
    if (data.includes(':')) return `${prefix} ${schemaType}: colon-separated format (${data})`;
    if (data.includes('-')) return `${prefix} ${schemaType}: dash-separated format (${data})`;
    if (!MAC_SEPARATOR_PATTERN.test(data)) return `${prefix} ${schemaType}: no separators format (${data})`;
  }
  
  if (isValid && schemaType === 'IPv6') {
    if (data.includes('::')) return `${prefix} ${schemaType}: compressed format (${data})`;
    if (data.includes('%')) return `${prefix} ${schemaType}: with zone identifier (${data})`;
    if (data.includes('.')) return `${prefix} ${schemaType}: embedded IPv4 (${data})`;
  }
  
  // Default fallback
  return `${prefix} ${schemaType}: ${data}`;
};

const testRequiredSchema = (schemaName: string, createSchema: (...args: any[]) => any, validData: string[], invalidData: string[]) => {
  describe(schemaName, () => {
    // Test valid data with descriptive names
    validData.forEach(data => {
      test(getDescriptiveTestName(schemaName, data, true), () => {
        const schema = createSchema({ msg: "Test", msgType: MsgType.FieldName });
        expect(schema.parse(data)).toBe(data);
      });
    });

    // Test invalid data with descriptive names
    invalidData.forEach(data => {
      test(getDescriptiveTestName(schemaName, data, false), () => {
        const schema = createSchema({ msg: "Test", msgType: MsgType.FieldName });
        expect(() => schema.parse(data)).toThrow();
      });
    });

    // Edge case tests with specific descriptions
    test('rejects empty string as invalid input', () => {
      const schema = createSchema({ msg: "Test", msgType: MsgType.FieldName });
      expect(() => schema.parse('')).toThrow();
    });

    test('rejects undefined as invalid input', () => {
      const schema = createSchema({ msg: "Test", msgType: MsgType.FieldName });
      expect(() => schema.parse(undefined)).toThrow();
    });

    test('rejects null as invalid input', () => {
      const schema = createSchema({ msg: "Test", msgType: MsgType.FieldName });
      expect(() => schema.parse(null)).toThrow();
    });
  });
};

const testOptionalSchema = (schemaName: string, createSchema: (...args: any[]) => any, validData: string[], invalidData: string[]) => {
  describe(schemaName, () => {
    // Test valid data with descriptive names
    validData.forEach(data => {
      test(getDescriptiveTestName(schemaName, data, true), () => {
        const schema = createSchema({ msg: "Test", msgType: MsgType.FieldName });
        expect(schema.parse(data)).toBe(data);
      });
    });

    // Test invalid data with descriptive names
    invalidData.forEach(data => {
      test(getDescriptiveTestName(schemaName, data, false), () => {
        const schema = createSchema({ msg: "Test", msgType: MsgType.FieldName });
        expect(() => schema.parse(data)).toThrow();
      });
    });

    // Edge case tests with specific descriptions
    test('accepts undefined and returns undefined (optional behavior)', () => {
      const schema = createSchema({ msg: "Test", msgType: MsgType.FieldName });
      expect(schema.parse(undefined)).toBeUndefined();
    });

    test('accepts null and returns undefined (optional behavior)', () => {
      const schema = createSchema({ msg: "Test", msgType: MsgType.FieldName });
      expect(schema.parse(null)).toBeUndefined();
    });

    test('rejects empty string even in optional schema', () => {
      const schema = createSchema({ msg: "Test", msgType: MsgType.FieldName });
      expect(() => schema.parse('')).toThrow();
    });
  });
};

describe("Network Schemas", () => {
  const messageHandler = createTestMessageHandler();
  const factorySchemas = createNetworkSchemas(messageHandler);
  // Use factory schemas for the basic tests that expect options object format

  // MAC Address Tests (using factory functions for consistent options object testing)
  testRequiredSchema("MacAddressRequired", factorySchemas.MacAddressRequired, TEST_DATA.validMacAddresses, TEST_DATA.invalidMacAddresses);
  testOptionalSchema("MacAddressOptional", factorySchemas.MacAddressOptional, TEST_DATA.validMacAddresses, TEST_DATA.invalidMacAddresses);

  // IPv4 Tests (using factory functions for consistent options object testing)
  testRequiredSchema("IPv4Required", factorySchemas.IPv4Required, TEST_DATA.validIPv4, TEST_DATA.invalidIPv4);
  testOptionalSchema("IPv4Optional", factorySchemas.IPv4Optional, TEST_DATA.validIPv4, TEST_DATA.invalidIPv4);

  // IPv6 Tests (using factory functions for consistent options object testing)
  testRequiredSchema("IPv6Required", factorySchemas.IPv6Required, TEST_DATA.validIPv6, TEST_DATA.invalidIPv6);
  testOptionalSchema("IPv6Optional", factorySchemas.IPv6Optional, TEST_DATA.validIPv6, TEST_DATA.invalidIPv6);

  // IP Address Generic Tests (using factory functions for consistent options object testing)
  const validIPAddresses = [...TEST_DATA.validIPv4, ...TEST_DATA.validIPv6];
  const invalidIPAddresses = [
    ...TEST_DATA.invalidIPv4,
    ...TEST_DATA.invalidIPv6,
    ...TEST_DATA.validMacAddresses, // MAC addresses should be invalid for IP-only schemas
    'not-an-ip',
    'invalid.ip.address',
    '999.999.999.999',
    'xyz::invalid'
  ];
  testRequiredSchema("IPAddressGeneric", factorySchemas.IPAddressGeneric, validIPAddresses, invalidIPAddresses);
  testOptionalSchema("IPAddressGenericOptional", factorySchemas.IPAddressGenericOptional, validIPAddresses, invalidIPAddresses);

  // New Schema Tests
  describe('NetworkAddressGeneric', () => {
    const schema = NetworkAddressGeneric();
    const allValidData = [...TEST_DATA.validIPv4, ...TEST_DATA.validIPv6, ...TEST_DATA.validMacAddresses];
    const invalidData = ['invalid-address', 'not.a.network.address', '192.168.1', '00:1A:2B', 'xyz::abc:invalid'];

    allValidData.forEach(data => {
      test(`accepts valid network address: ${data}`, () => {
        expect(schema.parse(data)).toBe(data);
      });
    });

    invalidData.forEach(data => {
      test(`rejects invalid network address: ${data}`, () => {
        expect(() => schema.parse(data)).toThrow('Network Address is invalid');
      });
    });

    test('rejects empty string', () => {
      expect(() => schema.parse('')).toThrow();
    });

    test('uses custom message with msgType Message', () => {
      const customSchema = NetworkAddressGeneric({ msg: 'Custom network error', msgType: MsgType.Message });
      expect(() => customSchema.parse('invalid')).toThrow('Custom network error');
    });
  });


  describe('getNetworkAddressExamples', () => {
    test('returns examples object with all network address formats', () => {
      const examples = getNetworkAddressExamples();
      expect(examples).toEqual({
        ipv4: '192.168.1.1',
        ipv6: '2001:db8::1',
        mac: '00:1A:2B:3C:4D:5E',
        ipv4Cidr: '192.168.1.0/24',
        ipv6Cidr: '2001:db8::/32'
      });
    });

    test('provides consistent examples across different instances', () => {
      const examples1 = getNetworkAddressExamples();
      const examples2 = getNetworkAddressExamples();
      expect(examples1).toEqual(examples2);
    });
  });

  describe('Message customization tests', () => {
    test('all schemas support custom field names and message types', () => {
      const testCases = [
        { schema: IPv4Required, name: 'IPv4 Required', invalid: 'invalid-ipv4' },
        { schema: IPv6Required, name: 'IPv6 Required', invalid: 'invalid-ipv6' },
        { schema: MacAddressRequired, name: 'MAC Required', invalid: 'invalid-mac' },
        { schema: NetworkAddressGeneric, name: 'Network Generic', invalid: 'invalid-network' },
        { schema: IPAddressGeneric, name: 'IP Generic', invalid: 'invalid-ip' },
      ];

      testCases.forEach(({ schema, name, invalid }) => {
        // Test custom field name
        const fieldNameSchema = schema({ msg: `Custom ${name}` });
        expect(() => fieldNameSchema.parse(invalid)).toThrow(`Custom ${name}`);

        // Test custom message
        const messageSchema = schema({ msg: `Custom error for ${name}`, msgType: MsgType.Message });
        expect(() => messageSchema.parse(invalid)).toThrow(`Custom error for ${name}`);
      });
    });
  });

  // Tests for Network Schema String Parameter Overloads
  describe('Network Schema String Parameter Overloads', () => {
    describe('IPv4Required overloads', () => {
      it('should work with string parameter (new simple syntax)', () => {
        const schema = IPv4Required('Server IP');
        
        // Should work with valid values
        expect(schema.parse('192.168.1.1')).toBe('192.168.1.1');
        expect(schema.parse('10.0.0.1')).toBe('10.0.0.1');
        expect(schema.parse('172.16.0.1')).toBe('172.16.0.1');
        
        // Should use the string as field name in error messages
        try {
          schema.parse('999.999.999.999');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Server IP');
        }
      });

      it('should still work with options object (backward compatibility)', () => {
        const schema = IPv4Required({ msg: 'Gateway Address', msgType: MsgType.FieldName });
        
        expect(schema.parse('192.168.1.1')).toBe('192.168.1.1');
        try {
          schema.parse('invalid-ip');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Gateway Address');
        }
      });

      it('should work with no parameters (default usage)', () => {
        const schema = IPv4Required();
        
        expect(schema.parse('127.0.0.1')).toBe('127.0.0.1');
        try {
          schema.parse('300.300.300.300');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Network Address');
        }
      });
    });

    describe('IPv4Optional overloads', () => {
      it('should work with string parameter', () => {
        const schema = IPv4Optional('Optional Server IP');
        
        expect(schema.parse('192.168.1.1')).toBe('192.168.1.1');
        expect(schema.parse(undefined)).toBeUndefined();
        
        try {
          schema.parse('invalid-ipv4');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Optional Server IP');
        }
      });

      it('should still work with options object', () => {
        const schema = IPv4Optional({ msg: 'Backup Server IP', msgType: MsgType.FieldName });
        
        expect(schema.parse('10.0.0.1')).toBe('10.0.0.1');
        expect(schema.parse(undefined)).toBeUndefined();
      });
    });

    describe('IPv6Required overloads', () => {
      it('should work with string parameter', () => {
        const schema = IPv6Required('IPv6 Address');
        
        expect(schema.parse('2001:db8::1')).toBe('2001:db8::1');
        expect(schema.parse('::1')).toBe('::1');
        expect(schema.parse('fe80::1')).toBe('fe80::1');
        
        try {
          schema.parse('invalid-ipv6');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('IPv6 Address');
        }
      });

      it('should still work with options object', () => {
        const schema = IPv6Required({ msg: 'Server IPv6', msgType: MsgType.FieldName });
        
        expect(schema.parse('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
        try {
          schema.parse('xyz::invalid');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Server IPv6');
        }
      });
    });

    describe('IPv6Optional overloads', () => {
      it('should work with string parameter', () => {
        const schema = IPv6Optional('Optional IPv6');
        
        expect(schema.parse('2001:db8::1')).toBe('2001:db8::1');
        expect(schema.parse(undefined)).toBeUndefined();
        
        try {
          schema.parse('not-ipv6');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Optional IPv6');
        }
      });
    });

    describe('MacAddressRequired overloads', () => {
      it('should work with string parameter', () => {
        const schema = MacAddressRequired('Network Interface');
        
        expect(schema.parse('00:1A:2B:3C:4D:5E')).toBe('00:1A:2B:3C:4D:5E');
        expect(schema.parse('00-1A-2B-3C-4D-5E')).toBe('00-1A-2B-3C-4D-5E');
        expect(schema.parse('001A2B3C4D5E')).toBe('001A2B3C4D5E');
        
        try {
          schema.parse('invalid-mac');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Network Interface');
        }
      });

      it('should still work with options object', () => {
        const schema = MacAddressRequired({ msg: 'Ethernet MAC', msgType: MsgType.FieldName });
        
        expect(schema.parse('AA:BB:CC:DD:EE:FF')).toBe('AA:BB:CC:DD:EE:FF');
        try {
          schema.parse('GG:HH:II:JJ:KK:LL');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Ethernet MAC');
        }
      });
    });

    describe('MacAddressOptional overloads', () => {
      it('should work with string parameter', () => {
        const schema = MacAddressOptional('Optional MAC');
        
        expect(schema.parse('00:1A:2B:3C:4D:5E')).toBe('00:1A:2B:3C:4D:5E');
        expect(schema.parse(undefined)).toBeUndefined();
        
        try {
          schema.parse('invalid-mac-addr');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Optional MAC');
        }
      });
    });

    describe('NetworkAddressGeneric overloads', () => {
      it('should work with string parameter', () => {
        const schema = NetworkAddressGeneric('Network Address');
        
        // Should work with all valid network address types
        expect(schema.parse('192.168.1.1')).toBe('192.168.1.1');
        expect(schema.parse('2001:db8::1')).toBe('2001:db8::1');
        expect(schema.parse('00:1A:2B:3C:4D:5E')).toBe('00:1A:2B:3C:4D:5E');
        
        try {
          schema.parse('not-a-network-address');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Network Address');
        }
      });

      it('should still work with options object', () => {
        const schema = NetworkAddressGeneric({ msg: 'Device Address', msgType: MsgType.FieldName });
        
        expect(schema.parse('fe80::1')).toBe('fe80::1');
        expect(schema.parse('AABBCCDDEEFF')).toBe('AABBCCDDEEFF');
      });
    });

    describe('IPAddressGeneric overloads', () => {
      it('should work with string parameter', () => {
        const schema = IPAddressGeneric('IP Address');
        
        // Should work with IPv4 and IPv6 but not MAC
        expect(schema.parse('10.0.0.1')).toBe('10.0.0.1');
        expect(schema.parse('::1')).toBe('::1');
        
        try {
          schema.parse('00:1A:2B:3C:4D:5E');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('IP Address');
        }
        
        try {
          schema.parse('not-an-ip');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('IP Address');
        }
      });
    });

    describe('IPAddressGenericOptional overloads', () => {
      it('should work with string parameter', () => {
        const schema = IPAddressGenericOptional('Optional IP Address');
        
        // Should work with IPv4 and IPv6 but not MAC
        expect(schema.parse('192.168.1.1')).toBe('192.168.1.1');
        expect(schema.parse('2001:db8::1')).toBe('2001:db8::1');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(schema.parse(null)).toBeUndefined();
        
        try {
          schema.parse('00:1A:2B:3C:4D:5E');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Optional IP Address');
        }
        
        try {
          schema.parse('not-an-ip');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Optional IP Address');
        }
        
        try {
          schema.parse('');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Optional IP Address');
        }
      });

      it('should still work with options object', () => {
        const schema = IPAddressGenericOptional({ msg: 'Server IP', msgType: MsgType.FieldName });
        
        expect(schema.parse('172.16.0.1')).toBe('172.16.0.1');
        expect(schema.parse('::1')).toBe('::1');
        expect(schema.parse(undefined)).toBeUndefined();
      });

      it('should work with no parameters (default usage)', () => {
        const schema = IPAddressGenericOptional();
        
        expect(schema.parse('127.0.0.1')).toBe('127.0.0.1');
        expect(schema.parse('fe80::1')).toBe('fe80::1');
        expect(schema.parse(undefined)).toBeUndefined();
      });
    });

    describe('IPv4CIDRRequired overloads', () => {
      it('should work with string parameter', () => {
        const schema = IPv4CIDRRequired('Network Subnet');
        
        expect(schema.parse('192.168.1.0/24')).toBe('192.168.1.0/24');
        expect(schema.parse('10.0.0.0/8')).toBe('10.0.0.0/8');
        expect(schema.parse('172.16.0.0/12')).toBe('172.16.0.0/12');
        
        try {
          schema.parse('192.168.1.1');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Network Subnet');
        }
      });

      it('should still work with options object', () => {
        const schema = IPv4CIDRRequired({ msg: 'Subnet Range', msgType: MsgType.FieldName });
        
        expect(schema.parse('0.0.0.0/0')).toBe('0.0.0.0/0');
        try {
          schema.parse('192.168.1.0/33');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Subnet Range');
        }
      });
    });

    describe('IPv4CIDROptional overloads', () => {
      it('should work with string parameter', () => {
        const schema = IPv4CIDROptional('Optional Subnet');
        
        expect(schema.parse('192.168.0.0/16')).toBe('192.168.0.0/16');
        expect(schema.parse(undefined)).toBeUndefined();
        
        try {
          schema.parse('invalid-cidr');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Optional Subnet');
        }
      });
    });

    describe('IPv6CIDRRequired overloads', () => {
      it('should work with string parameter', () => {
        const schema = IPv6CIDRRequired('IPv6 Subnet');
        
        expect(schema.parse('2001:db8::/32')).toBe('2001:db8::/32');
        expect(schema.parse('fe80::/10')).toBe('fe80::/10');
        expect(schema.parse('::1/128')).toBe('::1/128');
        
        try {
          schema.parse('2001:db8::1');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('IPv6 Subnet');
        }
      });
    });

    describe('IPv6CIDROptional overloads', () => {
      it('should work with string parameter', () => {
        const schema = IPv6CIDROptional('Optional IPv6 Subnet');
        
        expect(schema.parse('2001:db8::/64')).toBe('2001:db8::/64');
        expect(schema.parse(undefined)).toBeUndefined();
        
        try {
          schema.parse('invalid-ipv6-cidr');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Optional IPv6 Subnet');
        }
      });
    });

    describe('CIDRGeneric overloads', () => {
      it('should work with string parameter', () => {
        const schema = CIDRGeneric('CIDR Block');
        
        // Should work with both IPv4 and IPv6 CIDR
        expect(schema.parse('192.168.1.0/24')).toBe('192.168.1.0/24');
        expect(schema.parse('2001:db8::/32')).toBe('2001:db8::/32');
        
        try {
          schema.parse('not-a-cidr-block');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('CIDR Block');
        }
      });
    });

    describe('Real-world usage examples', () => {
      it('should handle network infrastructure configuration with overloaded schemas', () => {
        const gatewaySchema = IPv4Required('Gateway IP');
        const subnetSchema = IPv4CIDRRequired('Network Subnet');
        const serverIPv6Schema = IPv6Optional('Server IPv6');
        const switchMACSchema = MacAddressRequired('Switch MAC');
        
        // Valid usage
        expect(gatewaySchema.parse('192.168.1.1')).toBe('192.168.1.1');
        expect(subnetSchema.parse('10.0.0.0/8')).toBe('10.0.0.0/8');
        expect(serverIPv6Schema.parse('fe80::1')).toBe('fe80::1');
        expect(switchMACSchema.parse('00:1A:2B:3C:4D:5E')).toBe('00:1A:2B:3C:4D:5E');
        
        // Invalid usage with proper error messages
        try {
          gatewaySchema.parse('999.999.999.999');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Gateway IP');
        }
        
        try {
          subnetSchema.parse('192.168.1.1');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Network Subnet');
        }
        
        try {
          switchMACSchema.parse('GG:HH:II:JJ:KK:LL');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Switch MAC');
        }
      });

      it('should handle multi-protocol network validation', () => {
        const networkAddrSchema = NetworkAddressGeneric('Device Address');
        const ipOnlySchema = IPAddressGeneric('Router IP');
        const anySubnetSchema = CIDRGeneric('Routing Table Entry');
        
        // Valid mixed protocol usage
        expect(networkAddrSchema.parse('192.168.1.100')).toBe('192.168.1.100');
        expect(networkAddrSchema.parse('2001:db8::42')).toBe('2001:db8::42');
        expect(networkAddrSchema.parse('AA:BB:CC:DD:EE:FF')).toBe('AA:BB:CC:DD:EE:FF');
        
        expect(ipOnlySchema.parse('172.16.0.1')).toBe('172.16.0.1');
        expect(ipOnlySchema.parse('::1')).toBe('::1');
        
        expect(anySubnetSchema.parse('10.0.0.0/16')).toBe('10.0.0.0/16');
        expect(anySubnetSchema.parse('2001:db8::/64')).toBe('2001:db8::/64');
        
        // Invalid cases
        try {
          ipOnlySchema.parse('00:11:22:33:44:55');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Router IP');
        }
        
        try {
          anySubnetSchema.parse('192.168.1.1');
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.issues[0].message).toContain('Routing Table Entry');
        }
      });

      it('should maintain type safety across all overloaded network schemas', () => {
        // Compile-time test to ensure all schemas work with both syntax types
        const ipv4Schema1 = IPv4Required('Primary DNS');
        const ipv4Schema2 = IPv4Required({ msg: 'Secondary DNS', msgType: MsgType.FieldName });
        const ipv6Schema1 = IPv6Optional('IPv6 DNS');
        const ipv6Schema2 = IPv6Optional({ msg: 'Backup IPv6 DNS', msgType: MsgType.FieldName });
        const macSchema1 = MacAddressRequired('NIC MAC');
        const macSchema2 = MacAddressRequired({ msg: 'WiFi MAC', msgType: MsgType.FieldName });
        
        // All should return the same schema type and work correctly
        expect(typeof ipv4Schema1.parse).toBe('function');
        expect(typeof ipv4Schema2.parse).toBe('function');
        expect(typeof ipv6Schema1.parse).toBe('function');
        expect(typeof ipv6Schema2.parse).toBe('function');
        expect(typeof macSchema1.parse).toBe('function');
        expect(typeof macSchema2.parse).toBe('function');
        
        expect(ipv4Schema1.parse('8.8.8.8')).toBe('8.8.8.8');
        expect(ipv4Schema2.parse('8.8.4.4')).toBe('8.8.4.4');
        expect(ipv6Schema1.parse('2001:4860:4860::8888')).toBe('2001:4860:4860::8888');
        expect(ipv6Schema2.parse('2001:4860:4860::8844')).toBe('2001:4860:4860::8844');
        expect(macSchema1.parse('00:50:56:C0:00:08')).toBe('00:50:56:C0:00:08');
        expect(macSchema2.parse('02:42:AC:11:00:02')).toBe('02:42:AC:11:00:02');
      });
    });
  });
});
