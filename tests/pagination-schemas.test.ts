import { z } from 'zod';
import { zPagination, zPaginationQuery, zCursorPagination, zOffsetPagination, zPaginationResponse, zPaginatedData } from '../src/schemas/pagination-schemas';
import { MsgType } from '../src/schemas/msg-type';

// Tests for Pagination Schemas
describe('Pagination Schemas', () => {
  describe('zPagination', () => {
    const schema = zPagination();

    it('should accept valid pagination with all fields', () => {
      const result = schema.parse({ page: 1, limit: 10, sort: 'name', order: 'asc' });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.sort).toBe('name');
      expect(result.order).toBe('asc');
    });

    it('should accept default values', () => {
      const result = schema.parse({});
      expect(result.page).toBe(0);
      expect(result.limit).toBe(10);
    });

    it('should reject negative page', () => {
      expect(() => schema.parse({ page: -1 })).toThrow();
    });

    it('should reject zero limit', () => {
      expect(() => schema.parse({ limit: 0 })).toThrow();
    });

    it('should reject invalid order', () => {
      expect(() => schema.parse({ order: 'invalid' })).toThrow();
    });

    it('should use custom configurations', () => {
      const customSchema = zPagination('Pagination', MsgType.FieldName, 25, 50);
      const result = customSchema.parse({});
      expect(result.limit).toBe(25);
      expect(() => customSchema.parse({ limit: 60 })).toThrow();
    });
  });

  describe('zPaginationQuery', () => {
    const schema = zPaginationQuery();

    it('should parse string values to numbers', () => {
      const result = schema.parse({ page: '1', limit: '20' });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should handle defaults', () => {
      const result = schema.parse({});
      expect(result.page).toBe(0);
      expect(result.limit).toBe(10);
    });

    it('should reject invalid strings', () => {
      expect(() => schema.parse({ page: 'invalid' })).toThrow();
      expect(() => schema.parse({ limit: 'invalid' })).toThrow();
    });
  });

  describe('zCursorPagination', () => {
    const schema = zCursorPagination();

    it('should accept cursor pagination', () => {
      const result = schema.parse({ cursor: 'abc123', limit: 10 });
      expect(result.cursor).toBe('abc123');
      expect(result.limit).toBe(10);
    });

    it('should work without cursor', () => {
      const result = schema.parse({ limit: 15 });
      expect(result.limit).toBe(15);
    });

    it('should reject invalid limit', () => {
      expect(() => schema.parse({ limit: 0 })).toThrow();
    });
  });

  describe('zOffsetPagination', () => {
    const schema = zOffsetPagination();

    it('should accept offset pagination', () => {
      const result = schema.parse({ offset: 50, limit: 25 });
      expect(result.offset).toBe(50);
      expect(result.limit).toBe(25);
    });

    it('should accept defaults', () => {
      const result = schema.parse({});
      expect(result.offset).toBe(0);
      expect(result.limit).toBe(10);
    });

    it('should reject negative offset', () => {
      expect(() => schema.parse({ offset: -5 })).toThrow();
    });
  });

  describe('zPaginationResponse', () => {
    const schema = zPaginationResponse();

    it('should accept valid pagination response', () => {
      const result = schema.parse({
        page: 1,
        limit: 10,
        total: 100,
        pages: 10,
        hasNext: true,
        hasPrev: false,
      });
      expect(result.page).toBe(1);
      expect(result.total).toBe(100);
      expect(result.hasNext).toBe(true);
    });

    it('should reject missing required fields', () => {
      expect(() => schema.parse({ page: 1, limit: 10 })).toThrow();
    });

    it('should reject invalid types', () => {
      expect(() => schema.parse({
        page: 1,
        limit: 10,
        total: 100,
        pages: 10,
        hasNext: 'true',
        hasPrev: false,
      })).toThrow();
    });
  });

  describe('zPaginatedData', () => {
    const userSchema = z.object({ id: z.string(), name: z.string() });
    const schema = zPaginatedData(z.array(userSchema));

    it('should accept valid paginated data', () => {
      const result = schema.parse({
        data: [{ id: '1', name: 'John' }],
        pagination: {
          page: 1,
          limit: 10,
          total: 100,
          pages: 10,
          hasNext: true,
          hasPrev: false,
        },
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('John');
    });

    it('should work with different data types', () => {
      const stringSchema = zPaginatedData(z.array(z.string()));
      const result = stringSchema.parse({
        data: ['apple', 'banana'],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
      expect(result.data).toEqual(['apple', 'banana']);
    });

    it('should reject invalid data', () => {
      expect(() => schema.parse({
        data: [{ id: 123, name: 'John' }],
        pagination: {
          page: 1,
          limit: 10,
          total: 100,
          pages: 10,
          hasNext: true,
          hasPrev: false,
        },
      })).toThrow();
    });

    it('should reject missing fields', () => {
      expect(() => schema.parse({ data: [] })).toThrow();
    });
  });
});

