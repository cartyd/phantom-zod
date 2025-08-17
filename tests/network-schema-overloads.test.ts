import { describe, expect, test } from "@jest/globals";
import {
  IPv4Optional,
  IPv4Required,
  IPv6Optional,
  IPv6Required,
  MacAddressOptional,
  MacAddressRequired,
  NetworkAddressGeneric,
  IPAddressGeneric,
  IPv4CIDROptional,
  IPv4CIDRRequired,
  IPv6CIDROptional,
  IPv6CIDRRequired,
  CIDRGeneric,
} from "../src/schemas/network-schemas";

describe("Network schema overloads", () => {
  const validIPv4 = "192.168.0.1";
  const invalidIPv4 = "300.168.0.1";

  describe("IPv4Optional overloads", () => {
    test("should work with string parameter", () => {
      const schema = IPv4Optional("IP Address");
      expect(schema.parse(validIPv4)).toBe(validIPv4);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidIPv4)).toThrow("IP Address must be a valid IPv4 address");
    });

    test("should work with options object", () => {
      const schema = IPv4Optional({ msg: "IPv4" });
      expect(schema.parse(validIPv4)).toBe(validIPv4);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidIPv4)).toThrow("IPv4 must be a valid IPv4 address");
    });

    test("should work with no parameters", () => {
      const schema = IPv4Optional();
      expect(schema.parse(validIPv4)).toBe(validIPv4);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidIPv4)).toThrow("Network Address must be a valid IPv4 address");
    });
  });

  describe("IPv4Required overloads", () => {
    test("should work with string parameter", () => {
      const schema = IPv4Required("IPv4");
      expect(schema.parse(validIPv4)).toBe(validIPv4);
      expect(() => schema.parse(undefined)).toThrow("IPv4 must be a valid IPv4 address");
      expect(() => schema.parse(invalidIPv4)).toThrow("IPv4 must be a valid IPv4 address");
    });

    test("should work with options object", () => {
      const schema = IPv4Required({ msg: "Gateway Address" });
      expect(schema.parse(validIPv4)).toBe(validIPv4);
      expect(() => schema.parse(undefined)).toThrow("Gateway Address must be a valid IPv4 address");
      expect(() => schema.parse(invalidIPv4)).toThrow("Gateway Address must be a valid IPv4 address");
    });

    test("should work with no parameters", () => {
      const schema = IPv4Required();
      expect(schema.parse(validIPv4)).toBe(validIPv4);
      expect(() => schema.parse(undefined)).toThrow("Network Address must be a valid IPv4 address");
      expect(() => schema.parse(invalidIPv4)).toThrow("Network Address must be a valid IPv4 address");
    });
  });

  describe("IPv6Optional overloads", () => {
    const validIPv6 = "2001:db8::1";
    const invalidIPv6 = "2001:db8:::1";

    test("should work with string parameter", () => {
      const schema = IPv6Optional("IPv6 Address");
      expect(schema.parse(validIPv6)).toBe(validIPv6);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidIPv6)).toThrow("IPv6 Address must be a valid IPv6 address");
    });

    test("should work with options object", () => {
      const schema = IPv6Optional({ msg: "IPv6" });
      expect(schema.parse(validIPv6)).toBe(validIPv6);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidIPv6)).toThrow("IPv6 must be a valid IPv6 address");
    });

    test("should work with no parameters", () => {
      const schema = IPv6Optional();
      expect(schema.parse(validIPv6)).toBe(validIPv6);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidIPv6)).toThrow("Network Address must be a valid IPv6 address");
    });
  });

  describe("IPv6Required overloads", () => {
    const validIPv6 = "2001:db8::1";
    const invalidIPv6 = "invalid-ipv6";

    test("should work with string parameter", () => {
      const schema = IPv6Required("IPv6");
      expect(schema.parse(validIPv6)).toBe(validIPv6);
      expect(() => schema.parse(undefined)).toThrow("IPv6 must be a valid IPv6 address");
      expect(() => schema.parse(invalidIPv6)).toThrow("IPv6 must be a valid IPv6 address");
    });

    test("should work with options object", () => {
      const schema = IPv6Required({ msg: "Server IPv6" });
      expect(schema.parse(validIPv6)).toBe(validIPv6);
      expect(() => schema.parse(undefined)).toThrow("Server IPv6 must be a valid IPv6 address");
      expect(() => schema.parse(invalidIPv6)).toThrow("Server IPv6 must be a valid IPv6 address");
    });

    test("should work with no parameters", () => {
      const schema = IPv6Required();
      expect(schema.parse(validIPv6)).toBe(validIPv6);
      expect(() => schema.parse(undefined)).toThrow("Network Address must be a valid IPv6 address");
      expect(() => schema.parse(invalidIPv6)).toThrow("Network Address must be a valid IPv6 address");
    });
  });

  describe("MacAddressOptional overloads", () => {
    const validMac = "00:1A:2B:3C:4D:5E";
    const invalidMac = "00:1A:2B:3C:4D";

    test("should work with string parameter", () => {
      const schema = MacAddressOptional("MAC Address");
      expect(schema.parse(validMac)).toBe(validMac);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidMac)).toThrow("MAC Address must be a valid MAC address");
    });

    test("should work with options object", () => {
      const schema = MacAddressOptional({ msg: "NIC MAC" });
      expect(schema.parse(validMac)).toBe(validMac);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidMac)).toThrow("NIC MAC must be a valid MAC address");
    });

    test("should work with no parameters", () => {
      const schema = MacAddressOptional();
      expect(schema.parse(validMac)).toBe(validMac);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidMac)).toThrow("Network Address must be a valid MAC address");
    });

    test("should support different MAC formats", () => {
      const schema = MacAddressOptional("Interface MAC");
      expect(schema.parse("00:1A:2B:3C:4D:5E")).toBe("00:1A:2B:3C:4D:5E");
      expect(schema.parse("00-1A-2B-3C-4D-5E")).toBe("00-1A-2B-3C-4D-5E");
      expect(schema.parse("001A2B3C4D5E")).toBe("001A2B3C4D5E");
    });
  });

  describe("MacAddressRequired overloads", () => {
    const validMac = "00:1A:2B:3C:4D:5E";
    const invalidMac = "invalid-mac";

    test("should work with string parameter", () => {
      const schema = MacAddressRequired("MAC");
      expect(schema.parse(validMac)).toBe(validMac);
      expect(() => schema.parse(undefined)).toThrow("expected string, received undefined");
      expect(() => schema.parse(invalidMac)).toThrow("MAC must be a valid MAC address");
    });

    test("should work with options object", () => {
      const schema = MacAddressRequired({ msg: "Ethernet MAC" });
      expect(schema.parse(validMac)).toBe(validMac);
      expect(() => schema.parse(undefined)).toThrow("expected string, received undefined");
      expect(() => schema.parse(invalidMac)).toThrow("Ethernet MAC must be a valid MAC address");
    });

    test("should work with no parameters", () => {
      const schema = MacAddressRequired();
      expect(schema.parse(validMac)).toBe(validMac);
      expect(() => schema.parse(undefined)).toThrow("expected string, received undefined");
      expect(() => schema.parse(invalidMac)).toThrow("Network Address must be a valid MAC address");
    });

    test("should support different MAC formats", () => {
      const schema = MacAddressRequired("Network Interface");
      expect(schema.parse("AA:BB:CC:DD:EE:FF")).toBe("AA:BB:CC:DD:EE:FF");
      expect(schema.parse("aa:bb:cc:dd:ee:ff")).toBe("aa:bb:cc:dd:ee:ff");
      expect(schema.parse("AABBCCDDEEFF")).toBe("AABBCCDDEEFF");
    });
  });

  describe("NetworkAddressGeneric overloads", () => {
    const validMac = "00:1A:2B:3C:4D:5E";
    const validIPv4 = "192.168.0.1";
    const validIPv6 = "2001:db8::1";
    const invalidAddr = "invalid-addr";

    test("should work with string parameter", () => {
      const schema = NetworkAddressGeneric("Network Address");
      expect(schema.parse(validMac)).toBe(validMac);
      expect(schema.parse(validIPv4)).toBe(validIPv4);
      expect(schema.parse(validIPv6)).toBe(validIPv6);
      expect(() => schema.parse(invalidAddr)).toThrow("Network Address is invalid");
    });

    test("should work with options object", () => {
      const schema = NetworkAddressGeneric({ msg: "Device Address" });
      expect(schema.parse(validMac)).toBe(validMac);
      expect(schema.parse(validIPv4)).toBe(validIPv4);
      expect(schema.parse(validIPv6)).toBe(validIPv6);
      expect(() => schema.parse(invalidAddr)).toThrow("Device Address is invalid");
    });

    test("should work with no parameters", () => {
      const schema = NetworkAddressGeneric();
      expect(schema.parse(validMac)).toBe(validMac);
      expect(schema.parse(validIPv4)).toBe(validIPv4);
      expect(schema.parse(validIPv6)).toBe(validIPv6);
      expect(() => schema.parse(invalidAddr)).toThrow("Network Address is invalid");
    });

    test("should accept all valid network address types", () => {
      const schema = NetworkAddressGeneric("Device Address");
      // IPv4 addresses
      expect(schema.parse("127.0.0.1")).toBe("127.0.0.1");
      expect(schema.parse("255.255.255.255")).toBe("255.255.255.255");
      // IPv6 addresses
      expect(schema.parse("::1")).toBe("::1");
      expect(schema.parse("fe80::1")).toBe("fe80::1");
      // MAC addresses
      expect(schema.parse("00-11-22-33-44-55")).toBe("00-11-22-33-44-55");
      expect(schema.parse("AABBCCDDEEFF")).toBe("AABBCCDDEEFF");
    });
  });

  describe("IPAddressGeneric overloads", () => {
    const validIPv4 = "192.168.0.1";
    const validIPv6 = "2001:db8::1";
    const invalidMac = "00:1A:2B:3C:4D:5E";
    const invalidAddr = "invalid-ip";

    test("should work with string parameter", () => {
      const schema = IPAddressGeneric("IP Address");
      expect(schema.parse(validIPv4)).toBe(validIPv4);
      expect(schema.parse(validIPv6)).toBe(validIPv6);
      expect(() => schema.parse(invalidMac)).toThrow("IP Address is invalid");
      expect(() => schema.parse(invalidAddr)).toThrow("IP Address is invalid");
    });

    test("should work with options object", () => {
      const schema = IPAddressGeneric({ msg: "Router IP" });
      expect(schema.parse(validIPv4)).toBe(validIPv4);
      expect(schema.parse(validIPv6)).toBe(validIPv6);
      expect(() => schema.parse(invalidMac)).toThrow("Router IP is invalid");
      expect(() => schema.parse(invalidAddr)).toThrow("Router IP is invalid");
    });

    test("should work with no parameters", () => {
      const schema = IPAddressGeneric();
      expect(schema.parse(validIPv4)).toBe(validIPv4);
      expect(schema.parse(validIPv6)).toBe(validIPv6);
      expect(() => schema.parse(invalidMac)).toThrow("Network Address is invalid");
      expect(() => schema.parse(invalidAddr)).toThrow("Network Address is invalid");
    });

    test("should accept both IPv4 and IPv6 but not MAC", () => {
      const schema = IPAddressGeneric("Server IP");
      // Valid IP addresses
      expect(schema.parse("10.0.0.1")).toBe("10.0.0.1");
      expect(schema.parse("::1")).toBe("::1");
      expect(schema.parse("2001:4860:4860::8888")).toBe("2001:4860:4860::8888");
      // Invalid: MAC addresses should be rejected
      expect(() => schema.parse("00:11:22:33:44:55")).toThrow("Server IP is invalid");
    });
  });

  describe("IPv4CIDROptional overloads", () => {
    const validCIDR = "192.168.0.0/24";
    const invalidCIDR = "192.168.0.1";

    test("should work with string parameter", () => {
      const schema = IPv4CIDROptional("IPv4 CIDR");
      expect(schema.parse(validCIDR)).toBe(validCIDR);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidCIDR)).toThrow("IPv4 CIDR must be a valid IPv4 address");
    });

    test("should work with options object", () => {
      const schema = IPv4CIDROptional({ msg: "Optional Subnet" });
      expect(schema.parse(validCIDR)).toBe(validCIDR);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidCIDR)).toThrow("Optional Subnet must be a valid IPv4 address");
    });

    test("should work with no parameters", () => {
      const schema = IPv4CIDROptional();
      expect(schema.parse(validCIDR)).toBe(validCIDR);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidCIDR)).toThrow("Network Address must be a valid IPv4 address");
    });

    test("should accept various valid IPv4 CIDR blocks", () => {
      const schema = IPv4CIDROptional("Network");
      expect(schema.parse("10.0.0.0/8")).toBe("10.0.0.0/8");
      expect(schema.parse("172.16.0.0/12")).toBe("172.16.0.0/12");
      expect(schema.parse("0.0.0.0/0")).toBe("0.0.0.0/0");
    });
  });

  describe("IPv4CIDRRequired overloads", () => {
    const validCIDR = "192.168.0.0/24";
    const invalidCIDR = "invalid-cidr";

    test("should work with string parameter", () => {
      const schema = IPv4CIDRRequired("CIDR");
      expect(schema.parse(validCIDR)).toBe(validCIDR);
      expect(() => schema.parse(undefined)).toThrow("CIDR must be a valid IPv4 address");
      expect(() => schema.parse(invalidCIDR)).toThrow("CIDR must be a valid IPv4 address");
    });

    test("should work with options object", () => {
      const schema = IPv4CIDRRequired({ msg: "Subnet Range" });
      expect(schema.parse(validCIDR)).toBe(validCIDR);
      expect(() => schema.parse(undefined)).toThrow("Subnet Range must be a valid IPv4 address");
      expect(() => schema.parse(invalidCIDR)).toThrow("Subnet Range must be a valid IPv4 address");
    });

    test("should work with no parameters", () => {
      const schema = IPv4CIDRRequired();
      expect(schema.parse(validCIDR)).toBe(validCIDR);
      expect(() => schema.parse(undefined)).toThrow("Network Address must be a valid IPv4 address");
      expect(() => schema.parse(invalidCIDR)).toThrow("Network Address must be a valid IPv4 address");
    });

    test("should validate CIDR prefix length", () => {
      const schema = IPv4CIDRRequired("Network Subnet");
      expect(schema.parse("192.168.1.0/24")).toBe("192.168.1.0/24");
      expect(() => schema.parse("192.168.1.0/33")).toThrow("Network Subnet must be a valid IPv4 address");
      expect(() => schema.parse("192.168.1.1")).toThrow("Network Subnet must be a valid IPv4 address");
    });
  });

  describe("IPv6CIDROptional overloads", () => {
    const validCIDR = "2001:db8::/32";
    const invalidCIDR = "2001:db8::1";

    test("should work with string parameter", () => {
      const schema = IPv6CIDROptional("IPv6 CIDR");
      expect(schema.parse(validCIDR)).toBe(validCIDR);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidCIDR)).toThrow("IPv6 CIDR must be a valid IPv6 address");
    });

    test("should work with options object", () => {
      const schema = IPv6CIDROptional({ msg: "Optional IPv6 Subnet" });
      expect(schema.parse(validCIDR)).toBe(validCIDR);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidCIDR)).toThrow("Optional IPv6 Subnet must be a valid IPv6 address");
    });

    test("should work with no parameters", () => {
      const schema = IPv6CIDROptional();
      expect(schema.parse(validCIDR)).toBe(validCIDR);
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse(invalidCIDR)).toThrow("Network Address must be a valid IPv6 address");
    });

    test("should accept various valid IPv6 CIDR blocks", () => {
      const schema = IPv6CIDROptional("IPv6 Network");
      expect(schema.parse("fe80::/10")).toBe("fe80::/10");
      expect(schema.parse("::1/128")).toBe("::1/128");
      expect(schema.parse("::/0")).toBe("::/0");
    });
  });

  describe("IPv6CIDRRequired overloads", () => {
    const validCIDR = "2001:db8::/32";
    const invalidCIDR = "invalid";

    test("should work with string parameter", () => {
      const schema = IPv6CIDRRequired("IPv6 CIDR");
      expect(schema.parse(validCIDR)).toBe(validCIDR);
      expect(() => schema.parse(undefined)).toThrow("IPv6 CIDR must be a valid IPv6 address");
      expect(() => schema.parse(invalidCIDR)).toThrow("IPv6 CIDR must be a valid IPv6 address");
    });

    test("should work with options object", () => {
      const schema = IPv6CIDRRequired({ msg: "IPv6 Subnet" });
      expect(schema.parse(validCIDR)).toBe(validCIDR);
      expect(() => schema.parse(undefined)).toThrow("IPv6 Subnet must be a valid IPv6 address");
      expect(() => schema.parse(invalidCIDR)).toThrow("IPv6 Subnet must be a valid IPv6 address");
    });

    test("should work with no parameters", () => {
      const schema = IPv6CIDRRequired();
      expect(schema.parse(validCIDR)).toBe(validCIDR);
      expect(() => schema.parse(undefined)).toThrow("Network Address must be a valid IPv6 address");
      expect(() => schema.parse(invalidCIDR)).toThrow("Network Address must be a valid IPv6 address");
    });

    test("should validate IPv6 CIDR prefix length", () => {
      const schema = IPv6CIDRRequired("IPv6 Prefix");
      expect(schema.parse("2001:db8::/64")).toBe("2001:db8::/64");
      expect(() => schema.parse("2001:db8::/129")).toThrow("IPv6 Prefix must be a valid IPv6 address");
      expect(() => schema.parse("2001:db8::1")).toThrow("IPv6 Prefix must be a valid IPv6 address");
    });
  });

  describe("CIDRGeneric overloads", () => {
    const validIPv4CIDR = "192.168.0.0/24";
    const validIPv6CIDR = "2001:db8::/32";
    const invalidCIDR = "invalid";

    test("should work with string parameter", () => {
      const schema = CIDRGeneric("CIDR");
      expect(schema.parse(validIPv4CIDR)).toBe(validIPv4CIDR);
      expect(schema.parse(validIPv6CIDR)).toBe(validIPv6CIDR);
      expect(() => schema.parse(invalidCIDR)).toThrow("CIDR is invalid");
    });

    test("should work with options object", () => {
      const schema = CIDRGeneric({ msg: "CIDR Block" });
      expect(schema.parse(validIPv4CIDR)).toBe(validIPv4CIDR);
      expect(schema.parse(validIPv6CIDR)).toBe(validIPv6CIDR);
      expect(() => schema.parse(invalidCIDR)).toThrow("CIDR Block is invalid");
    });

    test("should work with no parameters", () => {
      const schema = CIDRGeneric();
      expect(schema.parse(validIPv4CIDR)).toBe(validIPv4CIDR);
      expect(schema.parse(validIPv6CIDR)).toBe(validIPv6CIDR);
      expect(() => schema.parse(invalidCIDR)).toThrow("Network Address is invalid");
    });

    test("should accept both IPv4 and IPv6 CIDR blocks", () => {
      const schema = CIDRGeneric("Route Destination");
      // IPv4 CIDR blocks
      expect(schema.parse("10.0.0.0/8")).toBe("10.0.0.0/8");
      expect(schema.parse("172.16.0.0/12")).toBe("172.16.0.0/12");
      // IPv6 CIDR blocks
      expect(schema.parse("fe80::/10")).toBe("fe80::/10");
      expect(schema.parse("2001:4860:4860::/48")).toBe("2001:4860:4860::/48");
      // Invalid cases
      expect(() => schema.parse("192.168.1.1")).toThrow("Route Destination is invalid");
      expect(() => schema.parse("2001:db8::1")).toThrow("Route Destination is invalid");
    });
  });

  describe("Real-world usage examples", () => {
    test("should handle network infrastructure configuration", () => {
      const gatewaySchema = IPv4Required("Gateway IP");
      const subnetSchema = IPv4CIDRRequired("Network Subnet");
      const serverIPv6Schema = IPv6Optional("Server IPv6");
      const switchMACSchema = MacAddressRequired("Switch MAC");
      
      // Valid usage
      expect(gatewaySchema.parse("192.168.1.1")).toBe("192.168.1.1");
      expect(subnetSchema.parse("10.0.0.0/8")).toBe("10.0.0.0/8");
      expect(serverIPv6Schema.parse("fe80::1")).toBe("fe80::1");
      expect(switchMACSchema.parse("00:1A:2B:3C:4D:5E")).toBe("00:1A:2B:3C:4D:5E");
      
      // Invalid usage with proper error messages
      expect(() => gatewaySchema.parse("999.999.999.999")).toThrow("Gateway IP must be a valid IPv4 address");
      expect(() => subnetSchema.parse("192.168.1.1")).toThrow("Network Subnet must be a valid IPv4 address");
      expect(() => switchMACSchema.parse("GG:HH:II:JJ:KK:LL")).toThrow("Switch MAC must be a valid MAC address");
    });

    test("should handle multi-protocol network validation", () => {
      const networkAddrSchema = NetworkAddressGeneric("Device Address");
      const ipOnlySchema = IPAddressGeneric("Router IP");
      const anySubnetSchema = CIDRGeneric("Routing Table Entry");
      
      // Valid mixed protocol usage
      expect(networkAddrSchema.parse("192.168.1.100")).toBe("192.168.1.100");
      expect(networkAddrSchema.parse("2001:db8::42")).toBe("2001:db8::42");
      expect(networkAddrSchema.parse("AA:BB:CC:DD:EE:FF")).toBe("AA:BB:CC:DD:EE:FF");
      
      expect(ipOnlySchema.parse("172.16.0.1")).toBe("172.16.0.1");
      expect(ipOnlySchema.parse("::1")).toBe("::1");
      
      expect(anySubnetSchema.parse("10.0.0.0/16")).toBe("10.0.0.0/16");
      expect(anySubnetSchema.parse("2001:db8::/64")).toBe("2001:db8::/64");
      
      // Invalid cases
      expect(() => ipOnlySchema.parse("00:11:22:33:44:55")).toThrow("Router IP is invalid");
      expect(() => anySubnetSchema.parse("192.168.1.1")).toThrow("Routing Table Entry is invalid");
    });

    test("should maintain type safety across all overloaded network schemas", () => {
      // Compile-time test to ensure all schemas work with both syntax types
      const ipv4Schema1 = IPv4Required("Primary DNS");
      const ipv4Schema2 = IPv4Required({ msg: "Secondary DNS" });
      const ipv6Schema1 = IPv6Optional("IPv6 DNS");
      const ipv6Schema2 = IPv6Optional({ msg: "Backup IPv6 DNS" });
      const macSchema1 = MacAddressRequired("NIC MAC");
      const macSchema2 = MacAddressRequired({ msg: "WiFi MAC" });
      
      // All should return the same schema type and work correctly
      expect(typeof ipv4Schema1.parse).toBe("function");
      expect(typeof ipv4Schema2.parse).toBe("function");
      expect(typeof ipv6Schema1.parse).toBe("function");
      expect(typeof ipv6Schema2.parse).toBe("function");
      expect(typeof macSchema1.parse).toBe("function");
      expect(typeof macSchema2.parse).toBe("function");
      
      expect(ipv4Schema1.parse("8.8.8.8")).toBe("8.8.8.8");
      expect(ipv4Schema2.parse("8.8.4.4")).toBe("8.8.4.4");
      expect(ipv6Schema1.parse("2001:4860:4860::8888")).toBe("2001:4860:4860::8888");
      expect(ipv6Schema2.parse("2001:4860:4860::8844")).toBe("2001:4860:4860::8844");
      expect(macSchema1.parse("00:50:56:C0:00:08")).toBe("00:50:56:C0:00:08");
      expect(macSchema2.parse("02:42:AC:11:00:02")).toBe("02:42:AC:11:00:02");
    });
  });

  describe("Edge cases and error handling", () => {
    test("should handle empty strings appropriately", () => {
      expect(() => IPv4Required("Test").parse("")).toThrow("Test must be a valid IPv4 address");
      expect(() => IPv6Required("Test").parse("")).toThrow("Test must be a valid IPv6 address");
      expect(() => MacAddressRequired("Test").parse("")).toThrow("Test must be a valid MAC address");
      expect(() => NetworkAddressGeneric("Test").parse("")).toThrow("Test is invalid");
      expect(() => IPAddressGeneric("Test").parse("")).toThrow("Test is invalid");
    });

    test("should handle null values appropriately", () => {
      expect(() => IPv4Required("Test").parse(null)).toThrow("Test must be a valid IPv4 address");
      expect(() => IPv6Required("Test").parse(null)).toThrow("Test must be a valid IPv6 address");
      expect(() => MacAddressRequired("Test").parse(null)).toThrow("expected string, received null");
      
      expect(IPv4Optional("Test").parse(null)).toBeUndefined();
      expect(IPv6Optional("Test").parse(null)).toBeUndefined();
      expect(MacAddressOptional("Test").parse(null)).toBeUndefined();
    });

    test("should preserve exact return types for both overload syntaxes", () => {
      const stringSchema = IPv4Required("Server IP");
      const objectSchema = IPv4Required({ msg: "Server IP" });
      const defaultSchema = IPv4Required();
      
      // All schemas should return the same type and value
      const testValue = "192.168.1.1";
      expect(stringSchema.parse(testValue)).toBe(testValue);
      expect(objectSchema.parse(testValue)).toBe(testValue);
      expect(defaultSchema.parse(testValue)).toBe(testValue);
      
      // Type checking - all should have the same interface
      expect(stringSchema._def).toBeDefined();
      expect(objectSchema._def).toBeDefined();
      expect(defaultSchema._def).toBeDefined();
    });
  });
});
