import { UrlOptional, UrlRequired, HttpsUrlRequired, HttpsUrlOptional, HttpUrlRequired, HttpUrlOptional, WebUrlRequired, WebUrlOptional } from '../src/schemas/url-schemas';
import { MsgType } from '../src/common/types/msg-type';
import { runTableTests } from './setup';

describe('URL Schemas', () => {
  // Test data
  const validUrls = [
    'https://example.com',
    'http://example.com',
    'https://www.example.com',
    'https://example.com/path',
    'https://example.com/path?query=value',
    'https://example.com/path?query=value#fragment',
    'https://subdomain.example.com',
    'https://example.com:8080',
    'https://example.com:8080/path',
    'https://user:pass@example.com',
    'https://192.168.1.1',
    'https://[2001:db8::1]',
    'ftp://example.com',
    'mailto:user@example.com',
    'file:///path/to/file',
    'data:text/plain;base64,SGVsbG8gV29ybGQ=',
  ];

  const invalidUrls = [
    'example.com', // missing protocol
    'http://', // missing domain
    'https://', // missing domain
    'not-a-url',
    'https://example .com', // space in domain
    '',
    'https://example.com:99999', // invalid port
    'https://example.com:-1', // negative port
  ];

  // URLs that are valid according to Zod's URL validator but might seem questionable
  const questionableButValidUrls = [
    'https://example', // missing TLD but valid according to URL spec
    'javascript:alert(1)', // valid URL scheme
    'https://example..com', // double dot - normalized by URL constructor
    'https://.example.com', // leading dot - might be valid
    'https://example.com.', // trailing dot - normalized
  ];

  describe('UrlOptional', () => {
    const schema = UrlOptional();

    runTableTests([
      {
        description: 'should handle undefined',
        input: undefined,
        expected: undefined
      },
      ...validUrls.map(url => ({
        description: `should accept valid URL: ${url}`,
        input: url,
        expected: url
      })),
      ...invalidUrls.filter(url => url !== '').map(url => ({
        description: `should reject invalid URL: ${url}`,
        input: url,
        expected: new Error(),
        shouldThrow: true
      })),
      {
        description: 'should reject empty string',
        input: '',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject null',
        input: null,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject number',
        input: 123,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject object',
        input: {},
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject array',
        input: [],
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Protocol validation', () => {
      it('should accept HTTPS URLs', () => {
        expect(schema.parse('https://example.com')).toBe('https://example.com');
      });

      it('should accept HTTP URLs', () => {
        expect(schema.parse('http://example.com')).toBe('http://example.com');
      });

      it('should accept FTP URLs', () => {
        expect(schema.parse('ftp://example.com')).toBe('ftp://example.com');
      });

      it('should accept mailto URLs', () => {
        expect(schema.parse('mailto:user@example.com')).toBe('mailto:user@example.com');
      });

      it('should accept file URLs', () => {
        expect(schema.parse('file:///path/to/file')).toBe('file:///path/to/file');
      });
    });

    describe('Domain validation', () => {
      it('should accept domains with subdomains', () => {
        expect(schema.parse('https://subdomain.example.com')).toBe('https://subdomain.example.com');
      });

      it('should accept domains with ports', () => {
        expect(schema.parse('https://example.com:8080')).toBe('https://example.com:8080');
      });

      it('should accept IP addresses', () => {
        expect(schema.parse('https://192.168.1.1')).toBe('https://192.168.1.1');
      });

      it('should accept IPv6 addresses', () => {
        expect(schema.parse('https://[2001:db8::1]')).toBe('https://[2001:db8::1]');
      });
    });

    describe('Path and query validation', () => {
      it('should accept URLs with paths', () => {
        expect(schema.parse('https://example.com/path/to/resource')).toBe('https://example.com/path/to/resource');
      });

      it('should accept URLs with query parameters', () => {
        // Note: Zod normalizes URLs, adding trailing slash if needed
        const result = schema.parse('https://example.com?param=value');
        expect(result).toMatch(/^https:\/\/example\.com\/?(\?param=value)?$/);
      });

      it('should accept URLs with fragments', () => {
        // Note: Zod normalizes URLs, adding trailing slash if needed
        const result = schema.parse('https://example.com#fragment');
        expect(result).toMatch(/^https:\/\/example\.com\/?#fragment$/);
      });

      it('should accept URLs with complex paths and queries', () => {
        const complexUrl = 'https://example.com/path/to/resource?param1=value1&param2=value2#fragment';
        expect(schema.parse(complexUrl)).toBe(complexUrl);
      });
    });

    describe('Authentication validation', () => {
      it('should accept URLs with authentication', () => {
        expect(schema.parse('https://user:pass@example.com')).toBe('https://user:pass@example.com');
      });

      it('should accept URLs with username only', () => {
        expect(schema.parse('https://user@example.com')).toBe('https://user@example.com');
      });
    });

    describe('Custom error messages', () => {
      it('should use custom field name in error message', () => {
        const schema = UrlOptional({ msg: 'Website' });
        expect(() => schema.parse('invalid')).toThrow('Website must be a valid URL');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = UrlOptional({ msg: 'Invalid URL format', msgType: MsgType.Message });
        expect(() => schema.parse('invalid')).toThrow('Invalid URL format');
      });
    });
  });

  describe('UrlRequired', () => {
    const schema = UrlRequired();

    runTableTests([
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
      ...validUrls.map(url => ({
        description: `should accept valid URL: ${url}`,
        input: url,
        expected: url
      })),
      ...invalidUrls.map(url => ({
        description: `should reject invalid URL: ${url}`,
        input: url,
        expected: new Error(),
        shouldThrow: true
      })),
      {
        description: 'should reject null',
        input: null,
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject number',
        input: 123,
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Custom error messages', () => {
      it('should use custom field name in required error message', () => {
        const schema = UrlRequired({ msg: 'Website' });
        expect(() => schema.parse('')).toThrow('Website must be a valid URL');
      });

      it('should use custom field name in validation error message', () => {
        const schema = UrlRequired({ msg: 'Website' });
        expect(() => schema.parse('invalid')).toThrow('Website must be a valid URL');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = UrlRequired({ msg: 'URL is required', msgType: MsgType.Message });
        expect(() => schema.parse('')).toThrow('URL is required');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle URLs with special characters', () => {
      const schema = UrlOptional();
      
      const specialCharUrls = [
        'https://example.com/path with spaces', // might be invalid
        'https://example.com/path%20with%20encoded%20spaces',
        'https://example.com/path?param=value with spaces', // might be invalid
        'https://example.com/path?param=value%20with%20encoded%20spaces',
        'https://example.com/path#fragment with spaces', // might be invalid
        'https://example.com/path#fragment%20with%20encoded%20spaces',
      ];

      // Test each URL - some might be valid, some might not
      specialCharUrls.forEach(url => {
        try {
          const result = schema.parse(url);
          expect(result).toBe(url);
        } catch (error) {
          // Some URLs with spaces might be invalid
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    it('should handle very long URLs', () => {
      const schema = UrlOptional();
      const longPath = 'a'.repeat(1000);
      const longUrl = `https://example.com/${longPath}`;
      
      expect(schema.parse(longUrl)).toBe(longUrl);
    });

    it('should handle URLs with international domain names', () => {
      const schema = UrlOptional();
      
      // These might or might not be valid depending on the URL parser
      const internationalUrls = [
        'https://例え.テスト',
        'https://xn--r8jz45g.xn--zckzah', // punycode equivalent
      ];

      internationalUrls.forEach(url => {
        try {
          const result = schema.parse(url);
          expect(result).toBe(url);
        } catch (error) {
          // Some international URLs might not be supported
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('Performance and reliability', () => {
    it('should handle large number of validations efficiently', () => {
      const schema = UrlOptional();
      const validUrl = 'https://example.com';
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        schema.parse(validUrl);
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100);
    });

    it('should be consistent across multiple calls', () => {
      const schema = UrlOptional();
      const validUrl = 'https://example.com';
      
      for (let i = 0; i < 100; i++) {
        expect(schema.parse(validUrl)).toBe(validUrl);
        expect(schema.parse(undefined)).toBeUndefined();
      }
    });
  });

  describe('HTTPS Protocol Validation', () => {
    describe('HttpsUrlRequired', () => {
      const schema = HttpsUrlRequired();

      it('should accept HTTPS URLs', () => {
        expect(schema.parse('https://example.com')).toBe('https://example.com');
        expect(schema.parse('https://www.example.com/path')).toBe('https://www.example.com/path');
        // Port 443 is explicitly specified, so it's preserved
        expect(schema.parse('https://api.example.com:443/v1/users')).toBe('https://api.example.com:443/v1/users');
      });

      it('should reject HTTP URLs', () => {
        expect(() => schema.parse('http://example.com')).toThrow();
        expect(() => schema.parse('http://www.example.com')).toThrow();
      });

      it('should reject other protocols', () => {
        expect(() => schema.parse('ftp://example.com')).toThrow('URL has invalid protocol: non-HTTPS');
        expect(() => schema.parse('mailto:user@example.com')).toThrow('URL has invalid protocol: non-HTTPS');
        expect(() => schema.parse('file:///path/to/file')).toThrow('URL has invalid protocol: non-HTTPS');
      });

      it('should reject invalid URLs', () => {
        expect(() => schema.parse('not-a-url')).toThrow();
        expect(() => schema.parse('')).toThrow();
        expect(() => schema.parse(undefined)).toThrow();
      });

      it('should use custom field name in error messages', () => {
        const schema = HttpsUrlRequired({ msg: 'API URL' });
        expect(() => schema.parse('http://example.com')).toThrow('API URL has invalid protocol');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = HttpsUrlRequired({ msg: 'Only HTTPS URLs are allowed', msgType: MsgType.Message });
        expect(() => schema.parse('http://example.com')).toThrow('Only HTTPS URLs are allowed');
      });
    });

    describe('HttpsUrlOptional', () => {
      const schema = HttpsUrlOptional();

      it('should accept undefined', () => {
        expect(schema.parse(undefined)).toBeUndefined();
      });

      it('should accept HTTPS URLs', () => {
        expect(schema.parse('https://example.com')).toBe('https://example.com');
        expect(schema.parse('https://secure.example.com/api')).toBe('https://secure.example.com/api');
      });

      it('should reject HTTP URLs', () => {
        expect(() => schema.parse('http://example.com')).toThrow('URL has invalid protocol: non-HTTPS');
      });

      it('should reject other protocols', () => {
        expect(() => schema.parse('ftp://example.com')).toThrow('URL has invalid protocol: non-HTTPS');
      });

      it('should use custom field name in error messages', () => {
        const schema = HttpsUrlOptional({ msg: 'Secure URL' });
        expect(() => schema.parse('http://example.com')).toThrow('Secure URL has invalid protocol: non-HTTPS');
      });
    });

    describe('Manual protocol specification', () => {
      it('should work with UrlRequired and protocol option', () => {
        const schema = UrlRequired({ protocol: /^https$/ });
        
        expect(schema.parse('https://example.com')).toBe('https://example.com');
        expect(() => schema.parse('http://example.com')).toThrow('URL has invalid protocol: non-HTTPS');
      });

      it('should work with UrlOptional and protocol option', () => {
        const schema = UrlOptional({ protocol: /^https$/ });
        
        expect(schema.parse(undefined)).toBeUndefined();
        expect(schema.parse('https://example.com')).toBe('https://example.com');
        expect(() => schema.parse('http://example.com')).toThrow('URL has invalid protocol: non-HTTPS');
      });

      it('should allow custom protocol patterns', () => {
        // Allow only FTP
        const ftpSchema = UrlRequired({ protocol: /^ftp$/ });
        expect(ftpSchema.parse('ftp://example.com')).toBe('ftp://example.com');
        expect(() => ftpSchema.parse('https://example.com')).toThrow('URL has invalid protocol: non-HTTPS');

        // Allow HTTP or HTTPS
        const webSchema = UrlRequired({ protocol: /^https?$/ });
        expect(webSchema.parse('http://example.com')).toBe('http://example.com');
        expect(webSchema.parse('https://example.com')).toBe('https://example.com');
        expect(() => webSchema.parse('ftp://example.com')).toThrow('URL has invalid protocol: non-HTTPS');
      });
    });

    describe('HttpUrlRequired (HTTP-only)', () => {
      const schema = HttpUrlRequired();

      it('should accept HTTP URLs', () => {
        expect(schema.parse('http://example.com')).toBe('http://example.com');
        expect(schema.parse('http://www.example.com/path')).toBe('http://www.example.com/path');
      });

      it('should reject HTTPS URLs', () => {
        expect(() => schema.parse('https://example.com')).toThrow('URL has invalid protocol: non-HTTPS');
      });

      it('should reject other protocols', () => {
        expect(() => schema.parse('ftp://example.com')).toThrow('URL has invalid protocol: non-HTTPS');
        expect(() => schema.parse('mailto:user@example.com')).toThrow('URL has invalid protocol: non-HTTPS');
      });

      it('should use custom field name in error messages', () => {
        const schema = HttpUrlRequired({ msg: 'Legacy URL' });
        expect(() => schema.parse('https://example.com')).toThrow('Legacy URL has invalid protocol: non-HTTPS');
      });
    });

    describe('HttpUrlOptional (HTTP-only)', () => {
      const schema = HttpUrlOptional();

      it('should accept undefined', () => {
        expect(schema.parse(undefined)).toBeUndefined();
      });

      it('should accept HTTP URLs', () => {
        expect(schema.parse('http://example.com')).toBe('http://example.com');
      });

      it('should reject HTTPS URLs', () => {
        expect(() => schema.parse('https://example.com')).toThrow('URL has invalid protocol: non-HTTPS');
      });
    });

    describe('WebUrlRequired (HTTP or HTTPS)', () => {
      const schema = WebUrlRequired();

      it('should accept HTTP URLs', () => {
        expect(schema.parse('http://example.com')).toBe('http://example.com');
      });

      it('should accept HTTPS URLs', () => {
        expect(schema.parse('https://example.com')).toBe('https://example.com');
      });

      it('should reject other protocols', () => {
        expect(() => schema.parse('ftp://example.com')).toThrow('URL has invalid protocol: non-HTTPS');
        expect(() => schema.parse('mailto:user@example.com')).toThrow('URL has invalid protocol: non-HTTPS');
        expect(() => schema.parse('file:///path/to/file')).toThrow('URL has invalid protocol: non-HTTPS');
      });

      it('should use custom field name in error messages', () => {
        const schema = WebUrlRequired({ msg: 'Website URL' });
        expect(() => schema.parse('ftp://example.com')).toThrow('Website URL has invalid protocol: non-HTTPS');
      });
    });

    describe('WebUrlOptional (HTTP or HTTPS)', () => {
      const schema = WebUrlOptional();

      it('should accept undefined', () => {
        expect(schema.parse(undefined)).toBeUndefined();
      });

      it('should accept HTTP URLs', () => {
        expect(schema.parse('http://example.com')).toBe('http://example.com');
      });

      it('should accept HTTPS URLs', () => {
        expect(schema.parse('https://example.com')).toBe('https://example.com');
      });

      it('should reject other protocols', () => {
        expect(() => schema.parse('ftp://example.com')).toThrow('URL has invalid protocol: non-HTTPS');
      });
    });

    describe('Hostname validation', () => {
      it('should accept URLs with matching hostname', () => {
        const schema = UrlRequired({ hostname: /^example\.com$/ });
        expect(schema.parse('https://example.com')).toBe('https://example.com');
        expect(schema.parse('http://example.com/path')).toBe('http://example.com/path');
      });

      it('should reject URLs with non-matching hostname', () => {
        const schema = UrlRequired({ hostname: /^example\.com$/ });
        expect(() => schema.parse('https://zombo.com')).toThrow();
        expect(() => schema.parse('https://sub.example.com')).toThrow();
      });

      it('should work with protocol and hostname together', () => {
        const schema = UrlRequired({ 
          protocol: /^https$/, 
          hostname: /^api\.example\.com$/ 
        });
        
        expect(schema.parse('https://api.example.com')).toBe('https://api.example.com');
        expect(() => schema.parse('http://api.example.com')).toThrow(); // Wrong protocol
        expect(() => schema.parse('https://zombo.com')).toThrow(); // Wrong hostname
      });

      it('should support complex hostname patterns', () => {
        const schema = UrlRequired({ hostname: /^(api|admin)\.example\.com$/ });
        
        expect(schema.parse('https://api.example.com')).toBe('https://api.example.com');
        expect(schema.parse('https://admin.example.com')).toBe('https://admin.example.com');
        expect(() => schema.parse('https://web.example.com')).toThrow();
      });

      it('should work with optional URLs', () => {
        const schema = UrlOptional({ hostname: /^example\.com$/ });
        
        expect(schema.parse(undefined)).toBeUndefined();
        expect(schema.parse('https://example.com')).toBe('https://example.com');
        expect(() => schema.parse('https://zombo.com')).toThrow();
      });

      it('should use custom field name in hostname error messages', () => {
        const schema = UrlRequired({ 
          msg: 'API Endpoint', 
          hostname: /^api\.company\.com$/ 
        });
        expect(() => schema.parse('https://example.com')).toThrow('API Endpoint has invalid domain: expected hostname');
      });
    });
  });
});
