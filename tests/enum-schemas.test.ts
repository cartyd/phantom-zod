import { z } from 'zod';
import { createEnumSchemas } from '../src/schemas/enum-schemas';
import { MsgType } from '../src/common/types/msg-type';
import { createTestMessageHandler } from '../src/localization/types/message-handler.types';

// Create a type-safe mock using the test helper
const mockMessageHandler = createTestMessageHandler(
  // Custom mock implementation (optional)
  (options) => {
    if (options.msgType === MsgType.Message) {
      return options.msg;
    }
    
    // Simple mock implementation for field name formatting
    switch (options.messageKey) {
      case "mustBeOneOf":
        return `${options.msg} must be one of: ${options.params?.options?.join(', ')}`;
      default:
        return `${options.msg} is invalid`;
    }
  }
);

// Create schema functions with injected message handler
const { EnumOptional, EnumRequired } = createEnumSchemas(mockMessageHandler);

describe('Enum Schemas', () => {
  describe('EnumOptional', () => {
    const statusValues = ['active', 'inactive', 'pending'] as const;
    const schema = EnumOptional(statusValues);

    it('should accept valid enum values', () => {
      expect(schema.parse('active')).toBe('active');
      expect(schema.parse('inactive')).toBe('inactive');
      expect(schema.parse('pending')).toBe('pending');
    });

    it('should accept undefined as optional', () => {
      const result = schema.parse(undefined);
      expect(result).toBeUndefined();
    });

    it('should reject invalid enum values', () => {
      expect(() => schema.parse('invalid')).toThrow();
      expect(() => schema.parse('Active')).toThrow(); // case sensitive
      expect(() => schema.parse('ACTIVE')).toThrow(); // case sensitive
    });

    it('should reject non-string values', () => {
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse(true)).toThrow();
      expect(() => schema.parse({})).toThrow();
      expect(() => schema.parse([])).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it('should use default field name in error messages', () => {
      expect(() => schema.parse('invalid')).toThrow('Value must be one of: active, inactive, pending');
    });

    it('should use custom field name in error messages', () => {
      const customSchema = EnumOptional(statusValues, { msg: 'Status' });
      expect(() => customSchema.parse('invalid')).toThrow('Status must be one of: active, inactive, pending');
    });

    it('should use custom message when msgType is Message', () => {
      const customSchema = EnumOptional(statusValues, { msg: 'Invalid status value', msgType: MsgType.Message });
      expect(() => customSchema.parse('invalid')).toThrow('Invalid status value');
    });

    it('should work with single value enum', () => {
      const singleValueSchema = EnumOptional(['only']);
      expect(singleValueSchema.parse('only')).toBe('only');
      expect(() => singleValueSchema.parse('other')).toThrow();
    });

    it('should work with many enum values', () => {
      const manyValues = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
      const manySchema = EnumOptional(manyValues);
      expect(manySchema.parse('a')).toBe('a');
      expect(manySchema.parse('h')).toBe('h');
      expect(() => manySchema.parse('i')).toThrow();
    });
  });

  describe('EnumRequired', () => {
    const statusValues = ['active', 'inactive', 'pending'] as const;
    const schema = EnumRequired(statusValues);

    it('should accept valid enum values', () => {
      expect(schema.parse('active')).toBe('active');
      expect(schema.parse('inactive')).toBe('inactive');
      expect(schema.parse('pending')).toBe('pending');
    });

    it('should reject undefined', () => {
      expect(() => schema.parse(undefined)).toThrow();
    });

    it('should reject invalid enum values', () => {
      expect(() => schema.parse('invalid')).toThrow();
      expect(() => schema.parse('Active')).toThrow(); // case sensitive
      expect(() => schema.parse('ACTIVE')).toThrow(); // case sensitive
    });

    it('should reject non-string values', () => {
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse(true)).toThrow();
      expect(() => schema.parse({})).toThrow();
      expect(() => schema.parse([])).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it('should use default field name in error messages', () => {
      expect(() => schema.parse('invalid')).toThrow('Value must be one of: active, inactive, pending');
    });

    it('should use custom field name in error messages', () => {
      const customSchema = EnumRequired(statusValues, { msg: 'Status' });
      expect(() => customSchema.parse('invalid')).toThrow('Status must be one of: active, inactive, pending');
    });

    it('should use custom message when msgType is Message', () => {
      const customSchema = EnumRequired(statusValues, { msg: 'Invalid status value', msgType: MsgType.Message });
      expect(() => customSchema.parse('invalid')).toThrow('Invalid status value');
    });

    it('should work with single value enum', () => {
      const singleValueSchema = EnumRequired(['only']);
      expect(singleValueSchema.parse('only')).toBe('only');
      expect(() => singleValueSchema.parse('other')).toThrow();
    });

    it('should work with many enum values', () => {
      const manyValues = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
      const manySchema = EnumRequired(manyValues);
      expect(manySchema.parse('a')).toBe('a');
      expect(manySchema.parse('h')).toBe('h');
      expect(() => manySchema.parse('i')).toThrow();
    });
  });

  describe('Common enum use cases', () => {
    it('should work with priority levels', () => {
      const priorityValues = ['low', 'medium', 'high', 'urgent'] as const;
      const schema = EnumRequired(priorityValues, { msg: 'Priority' });
      
      expect(schema.parse('low')).toBe('low');
      expect(schema.parse('urgent')).toBe('urgent');
      expect(() => schema.parse('critical')).toThrow('Priority must be one of: low, medium, high, urgent');
    });

    it('should work with user roles', () => {
      const roleValues = ['admin', 'user', 'guest'] as const;
      const schema = EnumOptional(roleValues, { msg: 'Role' });
      
      expect(schema.parse('admin')).toBe('admin');
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse('superuser')).toThrow('Role must be one of: admin, user, guest');
    });

    it('should work with color schemes', () => {
      const colorValues = ['light', 'dark', 'auto'] as const;
      const schema = EnumRequired(colorValues, { msg: 'Theme' });
      
      expect(schema.parse('light')).toBe('light');
      expect(schema.parse('dark')).toBe('dark');
      expect(schema.parse('auto')).toBe('auto');
      expect(() => schema.parse('sepia')).toThrow('Theme must be one of: light, dark, auto');
    });

    it('should work with HTTP methods', () => {
      const methodValues = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
      const schema = EnumRequired(methodValues, { msg: 'HTTP Method' });
      
      expect(schema.parse('GET')).toBe('GET');
      expect(schema.parse('POST')).toBe('POST');
      expect(() => schema.parse('get')).toThrow(); // case sensitive
      expect(() => schema.parse('OPTIONS')).toThrow('HTTP Method must be one of: GET, POST, PUT, DELETE, PATCH');
    });

    it('should work with file formats', () => {
      const formatValues = ['json', 'xml', 'csv', 'txt'] as const;
      const schema = EnumOptional(formatValues, { msg: 'File Format' });
      
      expect(schema.parse('json')).toBe('json');
      expect(schema.parse('csv')).toBe('csv');
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse('yaml')).toThrow('File Format must be one of: json, xml, csv, txt');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string as valid enum value', () => {
      const schemaWithEmpty = EnumRequired(['', 'value']);
      expect(schemaWithEmpty.parse('')).toBe('');
      expect(schemaWithEmpty.parse('value')).toBe('value');
    });

    it('should handle special characters in enum values', () => {
      const specialValues = ['@special', '#hash', 'with-dash', 'with_underscore'] as const;
      const schema = EnumRequired(specialValues);
      
      expect(schema.parse('@special')).toBe('@special');
      expect(schema.parse('#hash')).toBe('#hash');
      expect(schema.parse('with-dash')).toBe('with-dash');
      expect(schema.parse('with_underscore')).toBe('with_underscore');
    });

    it('should handle unicode characters in enum values', () => {
      const unicodeValues = ['🚀', '💯', '🎉'] as const;
      const schema = EnumRequired(unicodeValues, { msg: 'Emoji' });
      
      expect(schema.parse('🚀')).toBe('🚀');
      expect(schema.parse('💯')).toBe('💯');
      expect(() => schema.parse('🔥')).toThrow('Emoji must be one of: 🚀, 💯, 🎉');
    });

    it('should handle long enum values', () => {
      const longValue = 'a'.repeat(1000);
      const schema = EnumRequired([longValue, 'short']);
      
      expect(schema.parse(longValue)).toBe(longValue);
      expect(schema.parse('short')).toBe('short');
    });
  });

  describe('String Parameter Overloads', () => {
    // Import the exported overloaded schemas for this test section  
    const { EnumOptional: ExportedEnumOptional, EnumRequired: ExportedEnumRequired } = require('../src/schemas/enum-schemas');
    
    const statusValues = ['active', 'inactive', 'pending'] as const;
    const roleValues = ['admin', 'user', 'guest'] as const;

    describe('EnumOptional overloads', () => {
      it('should work with string parameter', () => {
        const schema = ExportedEnumOptional(statusValues, 'User Status');
        expect(schema.parse('active')).toBe('active');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse('invalid')).toThrow(/User Status must be one of: active, inactive, pending/);
      });

      it('should work with options object', () => {
        const schema = ExportedEnumOptional(statusValues, { msg: 'Account Status' });
        expect(schema.parse('inactive')).toBe('inactive');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse('invalid')).toThrow(/Account Status must be one of: active, inactive, pending/);
      });

      it('should work with no second parameter (default)', () => {
        const schema = ExportedEnumOptional(statusValues);
        expect(schema.parse('pending')).toBe('pending');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse('invalid')).toThrow(/Value must be one of: active, inactive, pending/);
      });

      it('should work with message type override', () => {
        const schema = ExportedEnumOptional(statusValues, { msg: 'Custom error message', msgType: MsgType.Message });
        expect(schema.parse('active')).toBe('active');
        expect(() => schema.parse('invalid')).toThrow(/Custom error message/);
      });
    });

    describe('EnumRequired overloads', () => {
      it('should work with string parameter', () => {
        const schema = ExportedEnumRequired(roleValues, 'User Role');
        expect(schema.parse('admin')).toBe('admin');
        expect(() => schema.parse(undefined)).toThrow();
        expect(() => schema.parse('invalid')).toThrow(/User Role must be one of: admin, user, guest/);
      });

      it('should work with options object', () => {
        const schema = ExportedEnumRequired(roleValues, { msg: 'Permission Level' });
        expect(schema.parse('user')).toBe('user');
        expect(() => schema.parse(undefined)).toThrow();
        expect(() => schema.parse('invalid')).toThrow(/Permission Level must be one of: admin, user, guest/);
      });

      it('should work with no second parameter (default)', () => {
        const schema = ExportedEnumRequired(roleValues);
        expect(schema.parse('guest')).toBe('guest');
        expect(() => schema.parse(undefined)).toThrow();
        expect(() => schema.parse('invalid')).toThrow(/Value must be one of: admin, user, guest/);
      });

      it('should work with message type override', () => {
        const schema = ExportedEnumRequired(roleValues, { msg: 'Invalid role provided', msgType: MsgType.Message });
        expect(schema.parse('admin')).toBe('admin');
        expect(() => schema.parse('invalid')).toThrow(/Invalid role provided/);
      });
    });

    describe('Type safety', () => {
      it('should maintain proper TypeScript types with string parameter', () => {
        const schema = ExportedEnumRequired(['a', 'b', 'c'] as const, 'Letter');
        const result = schema.parse('a');
        // TypeScript should infer result as 'a' | 'b' | 'c'
        expect(result).toBe('a');
      });

      it('should maintain proper TypeScript types with options object', () => {
        const schema = ExportedEnumOptional(['x', 'y', 'z'] as const, { msg: 'Coordinate' });
        const result = schema.parse('x');
        // TypeScript should infer result as 'x' | 'y' | 'z' | undefined
        expect(result).toBe('x');
      });
    });

    describe('Real-world usage patterns', () => {
      it('should work with HTTP status categories', () => {
        const categories = ['1xx', '2xx', '3xx', '4xx', '5xx'] as const;
        const schema = ExportedEnumRequired(categories, 'Status Category');
        
        expect(schema.parse('2xx')).toBe('2xx');
        expect(schema.parse('4xx')).toBe('4xx');
        expect(() => schema.parse('6xx')).toThrow(/Status Category must be one of: 1xx, 2xx, 3xx, 4xx, 5xx/);
      });

      it('should work with environment types', () => {
        const environments = ['development', 'staging', 'production'] as const;
        const schema = ExportedEnumOptional(environments, 'Environment');
        
        expect(schema.parse('development')).toBe('development');
        expect(schema.parse('production')).toBe('production');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse('test')).toThrow(/Environment must be one of: development, staging, production/);
      });
    });
  });

  describe('Exported Schema Overloads', () => {
    // Import the exported overloaded schemas
    const { EnumOptional: ExportedEnumOptional, EnumRequired: ExportedEnumRequired } = require('../src/schemas/enum-schemas');

    const statusValues = ['active', 'inactive', 'pending'] as const;
    const priorityValues = ['low', 'medium', 'high'] as const;

    describe('ExportedEnumOptional overloads', () => {
      it('should work with no parameters (default message)', () => {
        const schema = ExportedEnumOptional(statusValues);
        expect(schema.parse('active')).toBe('active');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse('invalid')).toThrow(/Value must be one of: active, inactive, pending/);
      });

      it('should work with string parameter', () => {
        const schema = ExportedEnumOptional(statusValues, 'Order Status');
        expect(schema.parse('inactive')).toBe('inactive');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse('invalid')).toThrow(/Order Status must be one of: active, inactive, pending/);
      });

      it('should work with options object', () => {
        const schema = ExportedEnumOptional(statusValues, { msg: 'Task Status' });
        expect(schema.parse('pending')).toBe('pending');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse('invalid')).toThrow(/Task Status must be one of: active, inactive, pending/);
      });

      it('should work with message type override', () => {
        const schema = ExportedEnumOptional(statusValues, { msg: 'Status validation failed', msgType: MsgType.Message });
        expect(schema.parse('active')).toBe('active');
        expect(() => schema.parse('invalid')).toThrow(/Status validation failed/);
      });
    });

    describe('ExportedEnumRequired overloads', () => {
      it('should work with no parameters (default message)', () => {
        const schema = ExportedEnumRequired(priorityValues);
        expect(schema.parse('low')).toBe('low');
        expect(() => schema.parse(undefined)).toThrow();
        expect(() => schema.parse('invalid')).toThrow(/Value must be one of: low, medium, high/);
      });

      it('should work with string parameter', () => {
        const schema = ExportedEnumRequired(priorityValues, 'Task Priority');
        expect(schema.parse('medium')).toBe('medium');
        expect(() => schema.parse(undefined)).toThrow();
        expect(() => schema.parse('invalid')).toThrow(/Task Priority must be one of: low, medium, high/);
      });

      it('should work with options object', () => {
        const schema = ExportedEnumRequired(priorityValues, { msg: 'Ticket Priority' });
        expect(schema.parse('high')).toBe('high');
        expect(() => schema.parse(undefined)).toThrow();
        expect(() => schema.parse('invalid')).toThrow(/Ticket Priority must be one of: low, medium, high/);
      });

      it('should work with message type override', () => {
        const schema = ExportedEnumRequired(priorityValues, { msg: 'Priority validation failed', msgType: MsgType.Message });
        expect(schema.parse('low')).toBe('low');
        expect(() => schema.parse('invalid')).toThrow(/Priority validation failed/);
      });
    });

    describe('Complex enum scenarios', () => {
      it('should work with single-value enum', () => {
        const schema = ExportedEnumRequired(['only'], 'Single Value');
        expect(schema.parse('only')).toBe('only');
        expect(() => schema.parse('other')).toThrow(/Single Value must be one of: only/);
      });

      it('should work with many values', () => {
        const manyValues = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as const;
        const schema = ExportedEnumOptional(manyValues, 'Letter');
        expect(schema.parse('a')).toBe('a');
        expect(schema.parse('j')).toBe('j');
        expect(schema.parse(undefined)).toBeUndefined();
        expect(() => schema.parse('k')).toThrow(/Letter must be one of: a, b, c, d, e, f, g, h, i, j/);
      });

      it('should work with special characters', () => {
        const specialValues = ['@', '#', '$', '%'] as const;
        const schema = ExportedEnumRequired(specialValues, 'Symbol');
        expect(schema.parse('@')).toBe('@');
        expect(schema.parse('#')).toBe('#');
        expect(() => schema.parse('&')).toThrow(/Symbol must be one of: @, #, \$, %/);
      });
    });
  });
});

  describe('Type Safety and Literal Type Preservation', () => {
    // Import the exported overloaded schemas for this test section  
    const { EnumOptional: ExportedEnumOptional, EnumRequired: ExportedEnumRequired } = require('../src/schemas/enum-schemas');
    
    const statusValues = ['active', 'inactive', 'pending'] as const;
    const logLevels = ['INFO', 'WARNING', 'ERROR'] as const;
    const priorities = ['low', 'medium', 'high'] as const;

    describe('EnumOptional type inference', () => {
      it('should maintain literal types for parsed values', () => {
        const schema = ExportedEnumOptional(statusValues, 'Status');
        
        // Test that parsed values maintain their literal types
        const activeResult = schema.parse('active');
        const inactiveResult = schema.parse('inactive');
        const undefinedResult = schema.parse(undefined);
        
        // These should work without casting if types are precise
        const testActive: 'active' | 'inactive' | 'pending' | undefined = activeResult;
        const testInactive: 'active' | 'inactive' | 'pending' | undefined = inactiveResult;
        const testUndefined: 'active' | 'inactive' | 'pending' | undefined = undefinedResult;
        
        expect(activeResult).toBe('active');
        expect(inactiveResult).toBe('inactive');
        expect(undefinedResult).toBeUndefined();
        
        // Verify we can assign to specific literal types
        expect(testActive).toBe('active');
        expect(testInactive).toBe('inactive');
        expect(testUndefined).toBeUndefined();
      });

      it('should work with default values and maintain types', () => {
        const schema = ExportedEnumOptional(logLevels, 'Log Level').default('INFO');
        
        const infoResult = schema.parse(undefined); // Should get 'INFO' from default
        const warningResult = schema.parse('WARNING');
        
        // These should work without casting if types are precise
        const testInfo: 'INFO' | 'WARNING' | 'ERROR' = infoResult;
        const testWarning: 'INFO' | 'WARNING' | 'ERROR' = warningResult;
        
        expect(infoResult).toBe('INFO');
        expect(warningResult).toBe('WARNING');
        expect(testInfo).toBe('INFO');
        expect(testWarning).toBe('WARNING');
      });

      it('should work with functions expecting literal union types', () => {
        const schema = ExportedEnumOptional(priorities, 'Priority');
        
        // Function that expects precise literal types
        function handlePriority(priority: 'low' | 'medium' | 'high' | undefined) {
          return priority ? `Priority: ${priority}` : 'No priority set';
        }
        
        const lowResult = schema.parse('low');
        const undefinedResult = schema.parse(undefined);
        
        // These should work without casting if types are preserved
        expect(handlePriority(lowResult)).toBe('Priority: low');
        expect(handlePriority(undefinedResult)).toBe('No priority set');
      });

      it('should support exhaustive switch statements', () => {
        const schema = ExportedEnumOptional(statusValues, 'Status');
        const result = schema.parse('active');
        
        function categorizeStatus(status: typeof result): string {
          if (status === undefined) return 'No status';
          
          // Exhaustive switch should work with literal types
          switch (status) {
            case 'active':
              return 'Currently active';
            case 'inactive':
              return 'Currently inactive';
            case 'pending':
              return 'Awaiting activation';
            default:
              // This should never be reached if types are preserved correctly
              throw new Error(`Unexpected status: ${status}`);
          }
        }
        
        expect(categorizeStatus(result)).toBe('Currently active');
        expect(categorizeStatus(undefined)).toBe('No status');
      });
    });

    describe('EnumRequired type inference', () => {
      it('should maintain literal types for parsed values', () => {
        const schema = ExportedEnumRequired(statusValues, 'Status');
        
        const activeResult = schema.parse('active');
        const pendingResult = schema.parse('pending');
        
        // These should work without casting if types are precise
        const testActive: 'active' | 'inactive' | 'pending' = activeResult;
        const testPending: 'active' | 'inactive' | 'pending' = pendingResult;
        
        expect(activeResult).toBe('active');
        expect(pendingResult).toBe('pending');
        expect(testActive).toBe('active');
        expect(testPending).toBe('pending');
      });

      it('should work with default values and maintain types', () => {
        const schema = ExportedEnumRequired(logLevels, 'Log Level').default('WARNING');
        
        const warningResult = schema.parse(undefined); // Should get 'WARNING' from default
        const errorResult = schema.parse('ERROR');
        
        // These should work without casting if types are precise
        const testWarning: 'INFO' | 'WARNING' | 'ERROR' = warningResult;
        const testError: 'INFO' | 'WARNING' | 'ERROR' = errorResult;
        
        expect(warningResult).toBe('WARNING');
        expect(errorResult).toBe('ERROR');
        expect(testWarning).toBe('WARNING');
        expect(testError).toBe('ERROR');
      });

      it('should work with functions expecting literal union types', () => {
        const schema = ExportedEnumRequired(priorities, 'Priority');
        
        // Function that expects precise literal types (no undefined)
        function formatPriority(priority: 'low' | 'medium' | 'high'): string {
          return `Priority level: ${priority.toUpperCase()}`;
        }
        
        const mediumResult = schema.parse('medium');
        const highResult = schema.parse('high');
        
        // These should work without casting if types are preserved
        expect(formatPriority(mediumResult)).toBe('Priority level: MEDIUM');
        expect(formatPriority(highResult)).toBe('Priority level: HIGH');
      });

      it('should support exhaustive switch statements', () => {
        const schema = ExportedEnumRequired(logLevels, 'Log Level');
        const result = schema.parse('ERROR');
        
        function getLogColor(level: typeof result): string {
          // Exhaustive switch should work with literal types
          switch (level) {
            case 'INFO':
              return 'blue';
            case 'WARNING':
              return 'yellow';
            case 'ERROR':
              return 'red';
            default:
              // This should never be reached if types are preserved correctly
              throw new Error(`Unexpected log level: ${level}`);
          }
        }
        
        expect(getLogColor(result)).toBe('red');
        expect(getLogColor(schema.parse('INFO'))).toBe('blue');
        expect(getLogColor(schema.parse('WARNING'))).toBe('yellow');
      });
    });

    describe('Comparison with native Zod enum behavior', () => {
      it('should behave identically to native Zod enum for required schemas', () => {
        // Native Zod enum
        const nativeSchema = z.enum(['red', 'green', 'blue'] as const);
        
        // Phantom-zod enum
        const phantomSchema = ExportedEnumRequired(['red', 'green', 'blue'] as const, 'Color');
        
        const nativeResult = nativeSchema.parse('red');
        const phantomResult = phantomSchema.parse('red');
        
        // Both should work with literal type assignments
        const nativeColor: 'red' | 'green' | 'blue' = nativeResult;
        const phantomColor: 'red' | 'green' | 'blue' = phantomResult;
        
        expect(nativeResult).toBe('red');
        expect(phantomResult).toBe('red');
        expect(nativeColor).toBe('red');
        expect(phantomColor).toBe('red');
      });

      it('should behave identically to native Zod enum for optional schemas', () => {
        // Native Zod enum with optional
        const nativeSchema = z.enum(['xs', 's', 'm', 'l', 'xl'] as const).optional();
        
        // Phantom-zod enum
        const phantomSchema = ExportedEnumOptional(['xs', 's', 'm', 'l', 'xl'] as const, 'Size');
        
        const nativeResult = nativeSchema.parse('m');
        const phantomResult = phantomSchema.parse('m');
        const nativeUndefined = nativeSchema.parse(undefined);
        const phantomUndefined = phantomSchema.parse(undefined);
        
        // Both should work with literal type assignments
        const nativeSize: 'xs' | 's' | 'm' | 'l' | 'xl' | undefined = nativeResult;
        const phantomSize: 'xs' | 's' | 'm' | 'l' | 'xl' | undefined = phantomResult;
        const nativeUndefSize: 'xs' | 's' | 'm' | 'l' | 'xl' | undefined = nativeUndefined;
        const phantomUndefSize: 'xs' | 's' | 'm' | 'l' | 'xl' | undefined = phantomUndefined;
        
        expect(nativeResult).toBe('m');
        expect(phantomResult).toBe('m');
        expect(nativeUndefined).toBeUndefined();
        expect(phantomUndefined).toBeUndefined();
        expect(nativeSize).toBe('m');
        expect(phantomSize).toBe('m');
        expect(nativeUndefSize).toBeUndefined();
        expect(phantomUndefSize).toBeUndefined();
      });

      it('should behave identically to native Zod enum with defaults', () => {
        // Native Zod enum with default
        const nativeSchema = z.enum(['draft', 'published', 'archived'] as const).optional().default('draft');
        
        // Phantom-zod enum with default
        const phantomSchema = ExportedEnumOptional(['draft', 'published', 'archived'] as const, 'Status').default('draft');
        
        const nativeResult = nativeSchema.parse(undefined);
        const phantomResult = phantomSchema.parse(undefined);
        const nativePublished = nativeSchema.parse('published');
        const phantomPublished = phantomSchema.parse('published');
        
        // Both should work with literal type assignments
        const nativeStatus: 'draft' | 'published' | 'archived' = nativeResult;
        const phantomStatus: 'draft' | 'published' | 'archived' = phantomResult;
        const nativePub: 'draft' | 'published' | 'archived' = nativePublished;
        const phantomPub: 'draft' | 'published' | 'archived' = phantomPublished;
        
        expect(nativeResult).toBe('draft');
        expect(phantomResult).toBe('draft');
        expect(nativePublished).toBe('published');
        expect(phantomPublished).toBe('published');
        expect(nativeStatus).toBe('draft');
        expect(phantomStatus).toBe('draft');
        expect(nativePub).toBe('published');
        expect(phantomPub).toBe('published');
      });
    });
  });
