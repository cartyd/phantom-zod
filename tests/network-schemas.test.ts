import { createNetworkSchemas } from "../src/schemas/network-schemas";
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
  const schemas = createNetworkSchemas(messageHandler);
  const { 
    zIPv4Optional, 
    zIPv4Required, 
    zIPv6Optional, 
    zIPv6Required, 
    zIPv4CIDROptional,
    zIPv4CIDRRequired,
    zIPv6CIDROptional,
    zIPv6CIDRRequired,
    zCIDRGeneric,
    zMacAddressOptional, 
    zMacAddressRequired,
    zNetworkAddressGeneric,
    zIPAddressGeneric,
    getNetworkAddressExamples
  } = schemas;

  // MAC Address Tests
  testRequiredSchema("zMacAddressRequired", zMacAddressRequired, TEST_DATA.validMacAddresses, TEST_DATA.invalidMacAddresses);
  testOptionalSchema("zMacAddressOptional", zMacAddressOptional, TEST_DATA.validMacAddresses, TEST_DATA.invalidMacAddresses);

  // IPv4 Tests
  testRequiredSchema("zIPv4Required", zIPv4Required, TEST_DATA.validIPv4, TEST_DATA.invalidIPv4);
  testOptionalSchema("zIPv4Optional", zIPv4Optional, TEST_DATA.validIPv4, TEST_DATA.invalidIPv4);

  // IPv6 Tests
  testRequiredSchema("zIPv6Required", zIPv6Required, TEST_DATA.validIPv6, TEST_DATA.invalidIPv6);
  testOptionalSchema("zIPv6Optional", zIPv6Optional, TEST_DATA.validIPv6, TEST_DATA.invalidIPv6);

  // New Schema Tests
  describe('zNetworkAddressGeneric', () => {
    const schema = zNetworkAddressGeneric();
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
      const customSchema = zNetworkAddressGeneric({ msg: 'Custom network error', msgType: MsgType.Message });
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
        { schema: zIPv4Required, name: 'IPv4 Required', invalid: 'invalid-ipv4' },
        { schema: zIPv6Required, name: 'IPv6 Required', invalid: 'invalid-ipv6' },
        { schema: zMacAddressRequired, name: 'MAC Required', invalid: 'invalid-mac' },
        { schema: zNetworkAddressGeneric, name: 'Network Generic', invalid: 'invalid-network' },
        { schema: zIPAddressGeneric, name: 'IP Generic', invalid: 'invalid-ip' },
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
});
