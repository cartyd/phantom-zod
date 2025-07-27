import { createEnumSchemas } from '../src/schemas/enum-schemas';
import { MsgType } from '../src/common/types/msg-type';
import { createTestMessageHandler } from '../src/localization/message-handler.types';

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
const { zEnumOptional, zEnumRequired } = createEnumSchemas(mockMessageHandler);

describe('Enum Schemas', () => {
  describe('zEnumOptional', () => {
    const statusValues = ['active', 'inactive', 'pending'] as const;
    const schema = zEnumOptional(statusValues);

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
      const customSchema = zEnumOptional(statusValues, { msg: 'Status' });
      expect(() => customSchema.parse('invalid')).toThrow('Status must be one of: active, inactive, pending');
    });

    it('should use custom message when msgType is Message', () => {
      const customSchema = zEnumOptional(statusValues, { msg: 'Invalid status value', msgType: MsgType.Message });
      expect(() => customSchema.parse('invalid')).toThrow('Invalid status value');
    });

    it('should work with single value enum', () => {
      const singleValueSchema = zEnumOptional(['only']);
      expect(singleValueSchema.parse('only')).toBe('only');
      expect(() => singleValueSchema.parse('other')).toThrow();
    });

    it('should work with many enum values', () => {
      const manyValues = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
      const manySchema = zEnumOptional(manyValues);
      expect(manySchema.parse('a')).toBe('a');
      expect(manySchema.parse('h')).toBe('h');
      expect(() => manySchema.parse('i')).toThrow();
    });
  });

  describe('zEnumRequired', () => {
    const statusValues = ['active', 'inactive', 'pending'] as const;
    const schema = zEnumRequired(statusValues);

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
      const customSchema = zEnumRequired(statusValues, { msg: 'Status' });
      expect(() => customSchema.parse('invalid')).toThrow('Status must be one of: active, inactive, pending');
    });

    it('should use custom message when msgType is Message', () => {
      const customSchema = zEnumRequired(statusValues, { msg: 'Invalid status value', msgType: MsgType.Message });
      expect(() => customSchema.parse('invalid')).toThrow('Invalid status value');
    });

    it('should work with single value enum', () => {
      const singleValueSchema = zEnumRequired(['only']);
      expect(singleValueSchema.parse('only')).toBe('only');
      expect(() => singleValueSchema.parse('other')).toThrow();
    });

    it('should work with many enum values', () => {
      const manyValues = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
      const manySchema = zEnumRequired(manyValues);
      expect(manySchema.parse('a')).toBe('a');
      expect(manySchema.parse('h')).toBe('h');
      expect(() => manySchema.parse('i')).toThrow();
    });
  });

  describe('Common enum use cases', () => {
    it('should work with priority levels', () => {
      const priorityValues = ['low', 'medium', 'high', 'urgent'] as const;
      const schema = zEnumRequired(priorityValues, { msg: 'Priority' });
      
      expect(schema.parse('low')).toBe('low');
      expect(schema.parse('urgent')).toBe('urgent');
      expect(() => schema.parse('critical')).toThrow('Priority must be one of: low, medium, high, urgent');
    });

    it('should work with user roles', () => {
      const roleValues = ['admin', 'user', 'guest'] as const;
      const schema = zEnumOptional(roleValues, { msg: 'Role' });
      
      expect(schema.parse('admin')).toBe('admin');
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse('superuser')).toThrow('Role must be one of: admin, user, guest');
    });

    it('should work with color schemes', () => {
      const colorValues = ['light', 'dark', 'auto'] as const;
      const schema = zEnumRequired(colorValues, { msg: 'Theme' });
      
      expect(schema.parse('light')).toBe('light');
      expect(schema.parse('dark')).toBe('dark');
      expect(schema.parse('auto')).toBe('auto');
      expect(() => schema.parse('sepia')).toThrow('Theme must be one of: light, dark, auto');
    });

    it('should work with HTTP methods', () => {
      const methodValues = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
      const schema = zEnumRequired(methodValues, { msg: 'HTTP Method' });
      
      expect(schema.parse('GET')).toBe('GET');
      expect(schema.parse('POST')).toBe('POST');
      expect(() => schema.parse('get')).toThrow(); // case sensitive
      expect(() => schema.parse('OPTIONS')).toThrow('HTTP Method must be one of: GET, POST, PUT, DELETE, PATCH');
    });

    it('should work with file formats', () => {
      const formatValues = ['json', 'xml', 'csv', 'txt'] as const;
      const schema = zEnumOptional(formatValues, { msg: 'File Format' });
      
      expect(schema.parse('json')).toBe('json');
      expect(schema.parse('csv')).toBe('csv');
      expect(schema.parse(undefined)).toBeUndefined();
      expect(() => schema.parse('yaml')).toThrow('File Format must be one of: json, xml, csv, txt');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string as valid enum value', () => {
      const schemaWithEmpty = zEnumRequired(['', 'value']);
      expect(schemaWithEmpty.parse('')).toBe('');
      expect(schemaWithEmpty.parse('value')).toBe('value');
    });

    it('should handle special characters in enum values', () => {
      const specialValues = ['@special', '#hash', 'with-dash', 'with_underscore'] as const;
      const schema = zEnumRequired(specialValues);
      
      expect(schema.parse('@special')).toBe('@special');
      expect(schema.parse('#hash')).toBe('#hash');
      expect(schema.parse('with-dash')).toBe('with-dash');
      expect(schema.parse('with_underscore')).toBe('with_underscore');
    });

    it('should handle unicode characters in enum values', () => {
      const unicodeValues = ['🚀', '💯', '🎉'] as const;
      const schema = zEnumRequired(unicodeValues, { msg: 'Emoji' });
      
      expect(schema.parse('🚀')).toBe('🚀');
      expect(schema.parse('💯')).toBe('💯');
      expect(() => schema.parse('🔥')).toThrow('Emoji must be one of: 🚀, 💯, 🎉');
    });

    it('should handle long enum values', () => {
      const longValue = 'a'.repeat(1000);
      const schema = zEnumRequired([longValue, 'short']);
      
      expect(schema.parse(longValue)).toBe(longValue);
      expect(schema.parse('short')).toBe('short');
    });
  });
});
