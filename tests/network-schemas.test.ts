import { zIPv4Required, zIPv4Optional, zIPv6Required, zIPv6Optional } from "../src/schemas/network-schemas";

describe("Network Schemas", () => {
  const validIPv4 = [
    "192.168.1.1",
    "127.0.0.1",
    "255.255.255.255",
    "0.0.0.0",
    "10.0.0.1",
  ];
  const invalidIPv4 = [
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
  ];

  const validIPv6 = [
    "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
    "2001:db8:1234:ffff:ffff:ffff:ffff:ffff",
    "fe80:0000:0000:0000:0202:b3ff:fe1e:8329",
    "2001:db8::1",
    "fe80::1ff:fe23:4567:890a",
    "::1",
    "::ffff:c000:0280",
    "::ffff:192.0.2.128",
    "2001:db8::192.0.2.128",
    "fe80::1%eth0",
    "fe80::a00:27ff:fe4e:66a1%enp0s3",
    "fc00::1234",
    "fd12:3456:789a:1::1",
    "ff02::1",
    "ff05::2",
  ];
  const invalidIPv6 = [
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
  ];

  describe("zIPv4Required", () => {
    test.each(validIPv4)("valid IPv4: %s", (ip) => {
      expect(zIPv4Required().parse(ip)).toBe(ip);
    });
    test.each(invalidIPv4)("invalid IPv4: %s", (ip) => {
      expect(() => zIPv4Required().parse(ip)).toThrow();
    });
    test("empty string throws", () => {
      expect(() => zIPv4Required().parse("")).toThrow();
    });
  });

  describe("zIPv4Optional", () => {
    test.each(validIPv4)("valid IPv4: %s", (ip) => {
      expect(zIPv4Optional().parse(ip)).toBe(ip);
    });
    test.each(invalidIPv4)("invalid IPv4: %s", (ip) => {
      expect(() => zIPv4Optional().parse(ip)).toThrow();
    });
    test("returns undefined for undefined input", () => {
      expect(zIPv4Optional().parse(undefined)).toBeUndefined();
    });
    test("returns undefined for null input", () => {
      expect(zIPv4Optional().parse(null)).toBeUndefined();
    });
    test("empty string throws", () => {
      expect(() => zIPv4Optional().parse("")).toThrow();
    });
  });

  describe("zIPv6Required", () => {
    test.each(validIPv6)("valid IPv6: %s", (ip) => {
      expect(zIPv6Required().parse(ip)).toBe(ip);
    });
    test.each(invalidIPv6)("invalid IPv6: %s", (ip) => {
      expect(() => zIPv6Required().parse(ip)).toThrow();
    });
    test("empty string throws", () => {
      expect(() => zIPv6Required().parse("")).toThrow();
    });
  });

  describe("zIPv6Optional", () => {
    test.each(validIPv6)("valid IPv6: %s", (ip) => {
      expect(zIPv6Optional().parse(ip)).toBe(ip);
    });
    test.each(invalidIPv6)("invalid IPv6: %s", (ip) => {
      expect(() => zIPv6Optional().parse(ip)).toThrow();
    });
    test("returns undefined for undefined input", () => {
      expect(zIPv6Optional().parse(undefined)).toBeUndefined();
    });
    test("returns undefined for null input", () => {
      expect(zIPv6Optional().parse(null)).toBeUndefined();
    });
    test("empty string throws", () => {
      expect(() => zIPv6Optional().parse("")).toThrow();
    });
  });
});
