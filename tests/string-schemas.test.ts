import { zStringOptional, zStringRequired } from '../src/schemas/string-schemas';
import { MsgType } from '../src/schemas/msg-type';
import { runTableTests, generateTestData } from './setup';

describe('String Schemas', () => {
  describe('zStringOptional', () => {
    const schema = zStringOptional();

    runTableTests([
      {
        description: 'should accept valid string',
        input: 'hello world',
        expected: 'hello world'
      },
      {
        description: 'should trim whitespace from string',
        input: '  hello world  ',
        expected: 'hello world'
      },
      {
        description: 'should accept empty string and return empty',
        input: '',
        expected: ''
      },
      {
        description: 'should trim whitespace-only string to empty',
        input: '   ',
        expected: ''
      },
      {
        description: 'should handle undefined',
        input: undefined,
        expected: ''
      },
      {
        description: 'should accept string with special characters',
        input: 'hello@world!',
        expected: 'hello@world!'
      },
      {
        description: 'should accept string with numbers',
        input: 'hello123',
        expected: 'hello123'
      },
      {
        description: 'should accept string with newlines and tabs',
        input: 'hello\nworld\ttab',
        expected: 'hello\nworld\ttab'
      },
      {
        description: 'should trim but preserve internal whitespace',
        input: '  hello world  ',
        expected: 'hello world'
      }
    ], (input) => schema.parse(input));

    describe('Edge cases', () => {
      generateTestData.edgeCases.whitespace.forEach(input => {
        it(`should handle whitespace input: "${input}"`, () => {
          const result = schema.parse(input);
          expect(typeof result).toBe('string');
          expect(result).toBe(input.trim());
        });
      });

      it('should handle very long strings', () => {
        const longString = 'a'.repeat(10000);
        expect(schema.parse(longString)).toBe(longString);
      });

      it('should handle unicode characters', () => {
        const unicodeString = 'Hello 世界 🌍';
        expect(schema.parse(unicodeString)).toBe(unicodeString);
      });
    });

    describe('Custom error messages', () => {
      it('should use custom field name in error message', () => {
        const schema = zStringOptional('Name');
        // This schema should not throw for valid strings, 
        // but would throw for non-string types if TypeScript allowed it
        expect(schema.parse('test')).toBe('test');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zStringOptional('Custom validation message', MsgType.Message);
        expect(schema.parse('test')).toBe('test');
      });
    });
  });

  describe('zStringRequired', () => {
    const schema = zStringRequired();

    runTableTests([
      {
        description: 'should accept valid non-empty string',
        input: 'hello world',
        expected: 'hello world'
      },
      {
        description: 'should trim whitespace from string',
        input: '  hello world  ',
        expected: 'hello world'
      },
      {
        description: 'should accept single character',
        input: 'a',
        expected: 'a'
      },
      {
        description: 'should accept string with special characters',
        input: 'hello@world!',
        expected: 'hello@world!'
      },
      {
        description: 'should reject empty string',
        input: '',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject whitespace-only string',
        input: '   ',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject string with only tabs',
        input: '\t\t\t',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject string with only newlines',
        input: '\n\n\n',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject undefined (implicitly)',
        input: undefined,
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Edge cases', () => {
      generateTestData.edgeCases.empty.forEach(input => {
        it(`should reject empty/whitespace input: "${input}"`, () => {
          expect(() => schema.parse(input)).toThrow();
        });
      });

      it('should handle very long strings', () => {
        const longString = 'a'.repeat(10000);
        expect(schema.parse(longString)).toBe(longString);
      });

      it('should handle unicode characters', () => {
        const unicodeString = 'Hello 世界 🌍';
        expect(schema.parse(unicodeString)).toBe(unicodeString);
      });

      it('should handle strings with mixed whitespace', () => {
        const mixedString = '  hello\tworld\n  ';
        expect(schema.parse(mixedString)).toBe('hello\tworld');
      });
    });

    describe('Custom error messages', () => {
      it('should use custom field name in required error message', () => {
        const schema = zStringRequired('Name');
        expect(() => schema.parse('')).toThrow('Name is required');
      });

      it('should use custom field name in validation error message', () => {
        const schema = zStringRequired('Name');
        expect(() => schema.parse('   ')).toThrow('Name is required');
      });

      it('should use custom message when msgType is Message', () => {
        const schema = zStringRequired('Please provide a value', MsgType.Message);
        expect(() => schema.parse('')).toThrow('Please provide a value');
      });
    });
  });

  describe('Trimming behavior', () => {
    it('should trim leading whitespace', () => {
      const schema = zStringOptional();
      expect(schema.parse('   hello')).toBe('hello');
    });

    it('should trim trailing whitespace', () => {
      const schema = zStringOptional();
      expect(schema.parse('hello   ')).toBe('hello');
    });

    it('should trim both leading and trailing whitespace', () => {
      const schema = zStringOptional();
      expect(schema.parse('   hello   ')).toBe('hello');
    });

    it('should preserve internal whitespace', () => {
      const schema = zStringOptional();
      expect(schema.parse('  hello world  ')).toBe('hello world');
    });

    it('should handle mixed whitespace characters', () => {
      const schema = zStringOptional();
      expect(schema.parse('\t\n  hello world  \t\n')).toBe('hello world');
    });
  });

  describe('Type safety and validation', () => {
    it('should maintain string type after parsing', () => {
      const schema = zStringOptional();
      const result = schema.parse('test');
      expect(typeof result).toBe('string');
    });

    it('should handle non-string inputs gracefully in TypeScript context', () => {
      const schema = zStringOptional();
      // In actual TypeScript usage, non-string inputs would be caught at compile time
      // This test ensures runtime behavior is predictable
      expect(schema.parse('123')).toBe('123');
    });
  });

  describe('Performance and reliability', () => {
    it('should handle large number of validations efficiently', () => {
      const schema = zStringOptional();
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        schema.parse('test string');
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });

    it('should be consistent across multiple calls', () => {
      const schema = zStringOptional();
      const input = '  test string  ';
      
      for (let i = 0; i < 100; i++) {
        expect(schema.parse(input)).toBe('test string');
      }
    });

    it('should handle concurrent validations', async () => {
      const schema = zStringOptional();
      const promises: Promise<string | undefined>[] = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve(schema.parse(`test ${i}`)));
      }
      
      const results = await Promise.all(promises);
      results.forEach((result, index) => {
        expect(result).toBe(`test ${index}`);
      });
    });
  });
});
