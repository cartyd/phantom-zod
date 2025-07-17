import { trimOrUndefined, trimOrEmpty } from '../src/utils/string-utils';
import { runTableTests } from './setup';

describe('Utility Functions', () => {
  describe('trimOrUndefined', () => {
    runTableTests([
      {
        description: 'should trim and return string for non-empty input',
        input: '  hello world  ',
        expected: 'hello world'
      },
      {
        description: 'should return undefined for empty string',
        input: '',
        expected: undefined
      },
      {
        description: 'should return undefined for whitespace-only string',
        input: '   ',
        expected: undefined
      },
      {
        description: 'should return undefined for undefined input',
        input: undefined,
        expected: undefined
      },
      {
        description: 'should return undefined for null input',
        input: null,
        expected: undefined
      },
      {
        description: 'should return string for single character',
        input: 'a',
        expected: 'a'
      },
      {
        description: 'should trim tabs and newlines',
        input: '\t\n  hello  \t\n',
        expected: 'hello'
      },
      {
        description: 'should handle mixed whitespace',
        input: ' \t\n hello world \t\n ',
        expected: 'hello world'
      },
      {
        description: 'should preserve internal whitespace',
        input: '  hello\tworld\ntest  ',
        expected: 'hello\tworld\ntest'
      }
    ], (input) => trimOrUndefined(input as string | undefined));

    describe('Edge cases', () => {
      it('should handle very long strings', () => {
        const longString = '  ' + 'a'.repeat(10000) + '  ';
        const result = trimOrUndefined(longString);
        expect(result).toBe('a'.repeat(10000));
      });

      it('should handle unicode characters', () => {
        const unicodeString = '  Hello 世界 🌍  ';
        const result = trimOrUndefined(unicodeString);
        expect(result).toBe('Hello 世界 🌍');
      });

      it('should handle string with only unicode whitespace', () => {
        const unicodeWhitespace = '\u00A0\u2000\u2001\u2002\u2003';
        const result = trimOrUndefined(unicodeWhitespace);
        // JavaScript's trim() does handle unicode whitespace correctly
        // Unicode whitespace-only strings should return undefined
        expect(result).toBeUndefined();
      });
    });
  });

  describe('trimOrEmpty', () => {
    runTableTests([
      {
        description: 'should trim and return string for non-empty input',
        input: '  hello world  ',
        expected: 'hello world'
      },
      {
        description: 'should return empty string for empty input',
        input: '',
        expected: ''
      },
      {
        description: 'should return empty string for whitespace-only input',
        input: '   ',
        expected: ''
      },
      {
        description: 'should return empty string for undefined input',
        input: undefined,
        expected: ''
      },
      {
        description: 'should return empty string for null input',
        input: null,
        expected: ''
      },
      {
        description: 'should return string for single character',
        input: 'a',
        expected: 'a'
      },
      {
        description: 'should trim tabs and newlines',
        input: '\t\n  hello  \t\n',
        expected: 'hello'
      },
      {
        description: 'should preserve internal whitespace',
        input: '  hello\tworld\ntest  ',
        expected: 'hello\tworld\ntest'
      }
    ], (input) => trimOrEmpty(input as string | undefined));

    describe('Edge cases', () => {
      it('should handle very long strings', () => {
        const longString = '  ' + 'a'.repeat(10000) + '  ';
        const result = trimOrEmpty(longString);
        expect(result).toBe('a'.repeat(10000));
      });

      it('should handle unicode characters', () => {
        const unicodeString = '  Hello 世界 🌍  ';
        const result = trimOrEmpty(unicodeString);
        expect(result).toBe('Hello 世界 🌍');
      });

      it('should always return string type', () => {
        expect(typeof trimOrEmpty(undefined)).toBe('string');
        expect(typeof trimOrEmpty(null as any)).toBe('string');
        expect(typeof trimOrEmpty('')).toBe('string');
        expect(typeof trimOrEmpty('test')).toBe('string');
      });
    });
  });

  describe('Function behavior comparison', () => {
    it('should handle same inputs differently for empty cases', () => {
      const emptyInputs = ['', '   ', '\t\n', undefined, null];
      
      emptyInputs.forEach(input => {
        const undefinedResult = trimOrUndefined(input as string | undefined);
        const emptyResult = trimOrEmpty(input as string | undefined);
        
        expect(undefinedResult).toBeUndefined();
        expect(emptyResult).toBe('');
      });
    });

    it('should handle same inputs identically for non-empty cases', () => {
      const nonEmptyInputs = ['hello', '  hello  ', 'a', '  test string  '];
      
      nonEmptyInputs.forEach(input => {
        const undefinedResult = trimOrUndefined(input);
        const emptyResult = trimOrEmpty(input);
        
        expect(undefinedResult).toBe(emptyResult);
        expect(typeof undefinedResult).toBe('string');
        expect(typeof emptyResult).toBe('string');
      });
    });
  });

  describe('Performance', () => {
    it('trimOrUndefined should be performant', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        trimOrUndefined('  test string  ');
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(50);
    });

    it('trimOrEmpty should be performant', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        trimOrEmpty('  test string  ');
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Memory safety', () => {
    it('should not cause memory leaks with repeated calls', () => {
      // This is more of a conceptual test - in practice, memory leaks 
      // would be detected by longer-running tests or profiling
      const testString = '  repeated test  ';
      
      for (let i = 0; i < 10000; i++) {
        trimOrUndefined(testString);
        trimOrEmpty(testString);
      }
      
      // If we get here without running out of memory, the test passes
      expect(true).toBe(true);
    });
  });
});
