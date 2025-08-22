# ID List Schemas

The ID list schemas module provides comprehensive validation for collections of identifiers, supporting UUIDs, MongoDB ObjectIds, and custom ID formats with batch operation features and uniqueness constraints.

## Overview

This module offers robust ID collection validation including UUID arrays, MongoDB ObjectId collections, unique ID lists, paginated ID processing, and batch operation response handling. It's designed for APIs that need to process multiple records, perform batch operations, or handle ID-based queries.

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, ID list schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const userIdsTraditional = pz.IdListRequired({ msg: "User IDs" });

// Simplified string parameter (equivalent)
const userIdsSimple = pz.IdListRequired("User IDs");

// Both produce the same validation behavior
const idsInput = ["550e8400-e29b-41d4-a716-446655440000", "6ba7b810-9dad-11d1-80b4-00c04fd430c8"];
userIdsTraditional.parse(idsInput); // ✅ Array of valid UUIDs
userIdsSimple.parse(idsInput);      // ✅ Array of valid UUIDs

// Error messages are identical
userIdsTraditional.parse([]); // ❌ "User IDs must not be empty"
userIdsSimple.parse([]);      // ❌ "User IDs must not be empty"
```

**When to use string parameters:**
- Basic field name specification only
- Default array size constraints are sufficient
- Cleaner, more concise code

**When to use options objects:**
- Array size constraints needed (`minItems`, `maxItems`)
- Custom message types (`MsgType.Message`)
- Advanced localization configurations

**Note:** Specialized schemas like `PaginatedIdList` and `BatchOperationResponse` have complex parameters and may not support string overloads in the same way as basic ID list schemas.

## Available Schemas

### Core ID List Schemas

- **`IdListRequired(msg?, msgType?, minItems?, maxItems?)`** - Validates required arrays of UUIDs
- **`IdListOptional(msg?, msgType?, minItems?, maxItems?)`** - Validates optional arrays of UUIDs
- **`UniqueIdList(msg?, msgType?, minItems?, maxItems?)`** - Validates arrays of unique UUIDs (no duplicates)

### Individual ID Schemas

- **`Id(msg?, msgType?)`** - Validates single UUID (wrapper for UUID validation)
- **`FlexibleId(msg?, msgType?)`** - Validates UUID or MongoDB ObjectId
- **`CustomId(validateFn, msg?, msgType?)`** - Validates custom ID formats

### MongoDB Schemas

- **`MongoId(msg?, msgType?)`** - Validates MongoDB ObjectId strings
- **`MongoIdList(msg?, msgType?, minItems?, maxItems?)`** - Validates arrays of MongoDB ObjectIds

### Batch Operation Schemas

- **`PaginatedIdList(msg?, msgType?, minItems?, maxItems?)`** - Validates paginated ID requests
- **`BatchOperationResponse(msg?, msgType?)`** - Validates batch operation results

## Examples

### Basic ID List Validation

```typescript
import { pz } from 'phantom-zod';

// Required ID list
const requiredIdsSchema = pz.IdListRequired();
const validIds = requiredIdsSchema.parse([
  "550e8400-e29b-41d4-a716-446655440000",
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "6ba7b811-9dad-11d1-80b4-00c04fd430c8"
]); // ✓ Valid

// Optional ID list
const optionalIdsSchema = pz.IdListOptional();
optionalIdsSchema.parse(undefined); // ✓ Valid
optionalIdsSchema.parse([
  "550e8400-e29b-41d4-a716-446655440000"
]); // ✓ Valid
```

### ID List Size Constraints

```typescript
import { pz } from 'phantom-zod';

// Custom size constraints (min: 2, max: 10)
const batchIdsSchema = pz.IdListRequired({ msg: "Batch IDs", minItems: 2, maxItems: 10 });

batchIdsSchema.parse([
  "550e8400-e29b-41d4-a716-446655440000",
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
]); // ✓ Valid (2 items)

batchIdsSchema.parse([
  "550e8400-e29b-41d4-a716-446655440000"
]); // ✗ Error: Must have at least 2 items

// Array with 11 items would cause ✗ Error: Must have at most 10 items
```

### Unique ID Lists

```typescript
import { UniqueIdList } from 'phantom-zod';

const uniqueIdsSchema = UniqueIdList("Unique Resource IDs");

// Valid unique list
uniqueIdsSchema.parse([
  "550e8400-e29b-41d4-a716-446655440000",
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "6ba7b811-9dad-11d1-80b4-00c04fd430c8"
]); // ✓ Valid

// Invalid - contains duplicates
uniqueIdsSchema.parse([
  "550e8400-e29b-41d4-a716-446655440000",
  "550e8400-e29b-41d4-a716-446655440000", // Duplicate
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
]); // ✗ Error: List contains duplicate items
```

### MongoDB ObjectId Validation

```typescript
import { MongoId, MongoIdList } from 'phantom-zod';

// Single MongoDB ObjectId
const mongoIdSchema = MongoId();
mongoIdSchema.parse("507f1f77bcf86cd799439011"); // ✓ Valid
mongoIdSchema.parse("invalid-object-id");        // ✗ Error: Invalid format

// MongoDB ObjectId list
const mongoIdListSchema = MongoIdList("Document IDs", MsgType.FieldName, 1, 100);
mongoIdListSchema.parse([
  "507f1f77bcf86cd799439011",
  "507f191e810c19729de860ea",
  "507f191e810c19729de860eb"
]); // ✓ Valid
```

### Flexible ID Validation

```typescript
import { FlexibleId } from 'phantom-zod';

const flexibleIdSchema = FlexibleId("Resource ID");

// Accepts UUIDs
flexibleIdSchema.parse("550e8400-e29b-41d4-a716-446655440000"); // ✓ Valid

// Accepts MongoDB ObjectIds
flexibleIdSchema.parse("507f1f77bcf86cd799439011"); // ✓ Valid

// Rejects invalid formats
flexibleIdSchema.parse("invalid-id-format"); // ✗ Error: Invalid ID format
```

### Custom ID Validation

```typescript
import { CustomId } from 'phantom-zod';

// Custom numeric ID validation
const numericIdSchema = CustomId(
  (val) => /^\d{6,10}$/.test(val), // 6-10 digits
  "Numeric ID"
);

numericIdSchema.parse("1234567"); // ✓ Valid
numericIdSchema.parse("123");     // ✗ Error: Too short
numericIdSchema.parse("abc123");  // ✗ Error: Non-numeric

// Custom prefixed ID validation
const prefixedIdSchema = CustomId(
  (val) => /^USER_[A-Z0-9]{8}$/.test(val),
  "User ID"
);

prefixedIdSchema.parse("USER_ABC12345"); // ✓ Valid
prefixedIdSchema.parse("ADMIN_12345");   // ✗ Error: Wrong prefix
```

### Paginated ID Lists

```typescript
import { PaginatedIdList } from 'phantom-zod';

const paginatedSchema = PaginatedIdList("Paginated Request", MsgType.FieldName, 1, 50);

const validRequest = paginatedSchema.parse({
  ids: [
    "550e8400-e29b-41d4-a716-446655440000",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
  ],
  page: 0,    // Zero-based page index
  limit: 25   // Results per page
}); // ✓ Valid

// Invalid pagination parameters
paginatedSchema.parse({
  ids: ["550e8400-e29b-41d4-a716-446655440000"],
  page: -1,   // ✗ Error: Page must be non-negative
  limit: 0    // ✗ Error: Limit must be positive
});
```

### Batch Operation Response

```typescript
import { BatchOperationResponse } from 'phantom-zod';

const batchResponseSchema = BatchOperationResponse("Batch Update Response");

const validResponse = batchResponseSchema.parse({
  successIds: [
    "550e8400-e29b-41d4-a716-446655440000",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
  ],
  failedIds: [
    "6ba7b811-9dad-11d1-80b4-00c04fd430c8"
  ],
  errors: [
    "Record not found: 6ba7b811-9dad-11d1-80b4-00c04fd430c8"
  ]
}); // ✓ Valid

// Response with only successful operations
const successOnlyResponse = batchResponseSchema.parse({
  successIds: [
    "550e8400-e29b-41d4-a716-446655440000"
  ]
  // failedIds and errors are optional
}); // ✓ Valid
```

### Form Integration Examples

```typescript
import { z } from 'zod';
import { IdListRequired, UniqueIdList, MongoIdList } from 'phantom-zod';

// Bulk delete form
const bulkDeleteSchema = z.object({
  action: z.literal("delete"),
  resourceIds: UniqueIdList("Resource IDs", MsgType.FieldName, 1, 100),
  confirmDeletion: z.boolean().refine(val => val === true, {
    message: "Must confirm deletion"
  })
});

// Permission assignment form
const permissionAssignmentSchema = z.object({
  userId: z.string().uuid(),
  roleIds: pz.IdListRequired("Role IDs", MsgType.FieldName, 1, 10),
  permissionIds: pz.IdListOptional("Additional Permission IDs", MsgType.FieldName, 0, 50)
});

// Document collection form (MongoDB)
const documentCollectionSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  documentIds: MongoIdList("Document IDs", MsgType.FieldName, 1, 1000),
  isPublic: z.boolean().default(false)
});
```

## Error Messages

The ID list schemas provide specific error messages for validation failures:

- **Invalid ID format**: "ID is invalid"
- **Too few items**: "ID List must have at least {min} items"
- **Too many items**: "ID List must have at most {max} items"
- **Duplicate items**: "ID List contains duplicate items"
- **Required field**: "ID List is required"
- **Invalid MongoDB ObjectId**: "MongoDB ObjectId is invalid"

## TypeScript Types

```typescript
// Basic ID types
type Id = string; // UUID string
type MongoId = string; // MongoDB ObjectId string
type FlexibleId = string; // UUID or MongoDB ObjectId

// ID collection types
type IdList = string[]; // Array of UUIDs
type MongoIdList = string[]; // Array of MongoDB ObjectIds

// Paginated request type
type PaginatedIdList = {
  ids: string[];
  page: number;
  limit: number;
};

// Batch operation response type
type BatchOperationResponse = {
  successIds: string[];
  failedIds?: string[];
  errors?: string[];
};

// Usage with schemas
const schema = pz.IdListRequired();
type InferredType = z.infer<typeof schema>; // string[]

const paginatedSchema = PaginatedIdList();
type PaginatedType = z.infer<typeof paginatedSchema>; // PaginatedIdList
```

## Best Practices

### Batch Operations

```typescript
import { IdListRequired, BatchOperationResponse } from 'phantom-zod';

// Batch update request
const batchUpdateRequestSchema = z.object({
  ids: pz.IdListRequired("Update IDs", MsgType.FieldName, 1, 100),
  updates: z.record(z.any()), // Updates to apply
  options: z.object({
    skipNotFound: z.boolean().default(false),
    validateBeforeUpdate: z.boolean().default(true)
  }).optional()
});

// Batch operation with size limits
const batchDeleteRequestSchema = z.object({
  ids: pz.IdListRequired("Delete IDs", MsgType.FieldName, 1, 50), // Smaller limit for deletions
  force: z.boolean().default(false),
  reason: z.string().min(1).optional()
});
```

### Data Relationships

```typescript
import { IdListRequired, UniqueIdList } from 'phantom-zod';

// Many-to-many relationship
const userRoleAssignmentSchema = z.object({
  userId: Id("User ID"),
  roleIds: UniqueIdList("Role IDs", MsgType.FieldName, 1, 20),
  assignedBy: Id("Assigned By"),
  assignedAt: z.date().default(() => new Date())
});

// Hierarchical relationships
const categoryHierarchySchema = z.object({
  categoryId: Id("Category ID"),
  parentIds: pz.IdListOptional("Parent Category IDs", MsgType.FieldName, 0, 10),
  childIds: pz.IdListOptional("Child Category IDs", MsgType.FieldName, 0, 100)
});
```

### API Query Parameters

```typescript
import { IdListOptional, FlexibleId } from 'phantom-zod';

// Search/filter parameters
const searchParamsSchema = z.object({
  ids: pz.IdListOptional("Filter by IDs", MsgType.FieldName, 1, 100),
  excludeIds: pz.IdListOptional("Exclude IDs", MsgType.FieldName, 1, 100),
  categoryId: FlexibleId("Category ID").optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0)
});

// Advanced filtering
const advancedFilterSchema = z.object({
  includeIds: pz.IdListOptional("Include IDs"),
  excludeIds: pz.IdListOptional("Exclude IDs"), 
  relatedIds: pz.IdListOptional("Related IDs"),
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }).optional()
}).refine(data => {
  // At least one filter must be specified
  return data.includeIds?.length || data.excludeIds?.length || 
         data.relatedIds?.length || data.dateRange;
}, {
  message: "At least one filter criterion must be specified"
});
```

### Database Query Optimization

```typescript
import { IdListRequired, MongoIdList } from 'phantom-zod';

// Chunked processing for large ID lists
const chunkedProcessingSchema = pz.IdListRequired("Processing IDs", MsgType.FieldName, 1, 10000)
  .transform(ids => {
    // Split into chunks for database processing
    const chunkSize = 100;
    const chunks = [];
    for (let i = 0; i < ids.length; i += chunkSize) {
      chunks.push(ids.slice(i, i + chunkSize));
    }
    return chunks;
  });

// MongoDB-specific bulk operations
const mongoBulkOpSchema = z.object({
  operation: z.enum(['insert', 'update', 'delete']),
  documentIds: MongoIdList("Document IDs", MsgType.FieldName, 1, 1000),
  ordered: z.boolean().default(true),
  bypassDocumentValidation: z.boolean().default(false)
});
```

## Integration Examples

### React Hook Form

```typescript
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IdListRequired, UniqueIdList } from 'phantom-zod';

const bulkOperationSchema = z.object({
  operation: z.enum(['update', 'delete', 'archive']),
  resourceIds: UniqueIdList("Resource IDs", MsgType.FieldName, 1, 50),
  options: z.object({
    notifyUsers: z.boolean().default(false),
    reason: z.string().optional()
  })
});

function BulkOperationForm() {
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(bulkOperationSchema)
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "resourceIds"
  });

  const addId = () => {
    append("");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <select {...register('operation')}>
        <option value="update">Update</option>
        <option value="delete">Delete</option>
        <option value="archive">Archive</option>
      </select>

      <div>
        <h3>Resource IDs</h3>
        {fields.map((field, index) => (
          <div key={field.id}>
            <input
              {...register(`resourceIds.${index}` as const)}
              placeholder="Enter UUID"
              pattern="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
            />
            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addId}>
          Add ID
        </button>
      </div>

      <div>
        <label>
          <input type="checkbox" {...register('options.notifyUsers')} />
          Notify affected users
        </label>
        <input
          {...register('options.reason')}
          placeholder="Reason (optional)"
        />
      </div>

      {errors.resourceIds && <span>{errors.resourceIds.message}</span>}

      <button type="submit">Execute Bulk Operation</button>
    </form>
  );
}
```

### Express.js API

```typescript
import express from 'express';
import { z } from 'zod';
import { IdListRequired, UniqueIdList, BatchOperationResponse, PaginatedIdList } from 'phantom-zod';

const app = express();

// Bulk update endpoint
const bulkUpdateSchema = z.object({
  ids: UniqueIdList("Update IDs", MsgType.FieldName, 1, 100),
  updates: z.record(z.any()),
  options: z.object({
    upsert: z.boolean().default(false),
    validateFirst: z.boolean().default(true)
  }).optional()
});

app.put('/api/resources/bulk', async (req, res) => {
  try {
    const { ids, updates, options } = bulkUpdateSchema.parse(req.body);
    
    const results = await processBulkUpdate(ids, updates, options);
    
    const response = BatchOperationResponse().parse({
      successIds: results.successful,
      failedIds: results.failed,
      errors: results.errors
    });
    
    res.json(response);
  } catch (error) {
    res.status(400).json({ 
      error: 'Bulk update validation failed',
      details: error.errors 
    });
  }
});

// Batch delete endpoint
const bulkDeleteSchema = z.object({
  ids: pz.IdListRequired("Delete IDs", MsgType.FieldName, 1, 50),
  force: z.boolean().default(false),
  reason: z.string().min(1, "Reason required for bulk deletion")
});

app.delete('/api/resources/bulk', async (req, res) => {
  try {
    const { ids, force, reason } = bulkDeleteSchema.parse(req.body);
    
    // Log bulk deletion for audit
    await logBulkOperation('delete', req.user.id, ids, reason);
    
    const results = await processBulkDelete(ids, force);
    
    res.json({
      successIds: results.deleted,
      failedIds: results.notFound,
      message: `Successfully deleted ${results.deleted.length} resources`
    });
  } catch (error) {
    res.status(400).json({ 
      error: 'Bulk delete validation failed',
      details: error.errors 
    });
  }
});

// Paginated batch processing endpoint
const paginatedBatchSchema = PaginatedIdList("Batch Processing", MsgType.FieldName, 1, 100);

app.post('/api/resources/process-batch', async (req, res) => {
  try {
    const { ids, page, limit } = paginatedBatchSchema.parse(req.body);
    
    // Process IDs in chunks
    const startIndex = page * limit;
    const endIndex = Math.min(startIndex + limit, ids.length);
    const currentBatch = ids.slice(startIndex, endIndex);
    
    const results = await processResourceBatch(currentBatch);
    
    res.json({
      page,
      limit,
      totalIds: ids.length,
      processedIds: currentBatch.length,
      results,
      hasMore: endIndex < ids.length
    });
  } catch (error) {
    res.status(400).json({ 
      error: 'Batch processing validation failed',
      details: error.errors 
    });
  }
});

// Multi-resource operation endpoint
const multiResourceSchema = z.object({
  userIds: pz.IdListRequired("User IDs", MsgType.FieldName, 1, 20),
  roleIds: pz.IdListRequired("Role IDs", MsgType.FieldName, 1, 10),
  operation: z.enum(['assign', 'revoke']),
  effective: z.date().default(() => new Date())
});

app.post('/api/permissions/bulk-assign', async (req, res) => {
  try {
    const data = multiResourceSchema.parse(req.body);
    
    const assignments = [];
    for (const userId of data.userIds) {
      for (const roleId of data.roleIds) {
        assignments.push({
          userId,
          roleId,
          operation: data.operation,
          effective: data.effective,
          assignedBy: req.user.id
        });
      }
    }
    
    const results = await processBulkPermissionAssignment(assignments);
    
    res.json({
      totalAssignments: assignments.length,
      successful: results.successful,
      failed: results.failed
    });
  } catch (error) {
    res.status(400).json({ 
      error: 'Permission assignment validation failed',
      details: error.errors 
    });
  }
});
```

### Database Models

```typescript
import { z } from 'zod';
import { Id, IdListRequired, MongoIdList } from 'phantom-zod';

// User role assignments
export const UserRoleModel = z.object({
  id: Id("Assignment ID"),
  userId: Id("User ID"),
  roleIds: pz.IdListRequired("Role IDs", MsgType.FieldName, 1, 20),
  assignedBy: Id("Assigned By User ID"),
  assignedAt: z.date(),
  expiresAt: z.date().optional(),
  isActive: z.boolean().default(true)
});

// Content collection (MongoDB)
export const ContentCollectionModel = z.object({
  _id: MongoId("Collection ID"),
  name: z.string(),
  description: z.string(),
  contentIds: MongoIdList("Content IDs", MsgType.FieldName, 0, 10000),
  ownerIds: MongoIdList("Owner IDs", MsgType.FieldName, 1, 10),
  collaboratorIds: MongoIdList("Collaborator IDs", MsgType.FieldName, 0, 100),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Batch operation log
export const BatchOperationLogModel = z.object({
  id: Id("Log ID"),
  operationType: z.enum(['create', 'update', 'delete', 'archive']),
  resourceType: z.string(),
  targetIds: pz.IdListRequired("Target IDs"),
  initiatedBy: Id("User ID"),
  initiatedAt: z.date(),
  completedAt: z.date().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  successCount: z.number().int().nonnegative(),
  failureCount: z.number().int().nonnegative(),
  errors: z.array(z.string()).optional()
});

// Relationship mapping
export const RelationshipMappingModel = z.object({
  id: Id("Mapping ID"),
  sourceId: Id("Source ID"),
  targetIds: pz.IdListRequired("Target IDs", MsgType.FieldName, 1, 1000),
  relationshipType: z.string(),
  bidirectional: z.boolean().default(false),
  strength: z.number().min(0).max(1).optional(),
  createdAt: z.date(),
  lastUpdated: z.date()
});
```

### Batch Processing Service

```typescript
import { IdListRequired, BatchOperationResponse, UniqueIdList } from 'phantom-zod';

class BatchProcessingService {
  private maxBatchSize = 100;
  private defaultChunkSize = 25;

  // Process IDs in batches
  async processBatch<T>(
    ids: unknown,
    processor: (chunk: string[]) => Promise<T[]>,
    options: {
      chunkSize?: number;
      parallel?: boolean;
      stopOnError?: boolean;
    } = {}
  ) {
    const idsSchema = pz.IdListRequired("Processing IDs", MsgType.FieldName, 1, this.maxBatchSize);
    const validIds = idsSchema.parse(ids);
    
    const {
      chunkSize = this.defaultChunkSize,
      parallel = false,
      stopOnError = false
    } = options;
    
    // Split into chunks
    const chunks = this.chunkArray(validIds, chunkSize);
    const results: T[] = [];
    const errors: string[] = [];
    
    if (parallel) {
      // Process chunks in parallel
      const promises = chunks.map(async (chunk, index) => {
        try {
          return await processor(chunk);
        } catch (error) {
          const errorMsg = `Chunk ${index} failed: ${error.message}`;
          errors.push(errorMsg);
          if (stopOnError) {
            throw new Error(errorMsg);
          }
          return [];
        }
      });
      
      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults.flat());
    } else {
      // Process chunks sequentially
      for (let i = 0; i < chunks.length; i++) {
        try {
          const chunkResult = await processor(chunks[i]);
          results.push(...chunkResult);
        } catch (error) {
          const errorMsg = `Chunk ${i} failed: ${error.message}`;
          errors.push(errorMsg);
          if (stopOnError) {
            throw new Error(errorMsg);
          }
        }
      }
    }
    
    return {
      results,
      errors,
      processedChunks: chunks.length,
      totalItems: validIds.length
    };
  }
  
  // Validate and deduplicate ID list
  validateAndCleanIds(ids: unknown) {
    const uniqueIdsSchema = UniqueIdList("Clean IDs");
    return uniqueIdsSchema.parse(ids);
  }
  
  // Create batch operation response
  createBatchResponse(
    successIds: string[],
    failedIds: string[] = [],
    errors: string[] = []
  ) {
    const responseSchema = BatchOperationResponse();
    return responseSchema.parse({
      successIds,
      failedIds: failedIds.length > 0 ? failedIds : undefined,
      errors: errors.length > 0 ? errors : undefined
    });
  }
  
  // Bulk validation of IDs against database
  async validateIdsExist(
    ids: unknown,
    validator: (id: string) => Promise<boolean>
  ) {
    const idsSchema = pz.IdListRequired("Validation IDs");
    const validIds = idsSchema.parse(ids);
    
    const existingIds: string[] = [];
    const missingIds: string[] = [];
    
    // Process in chunks to avoid overwhelming the database
    const chunks = this.chunkArray(validIds, 50);
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (id) => {
        const exists = await validator(id);
        return { id, exists };
      });
      
      const results = await Promise.all(promises);
      
      for (const { id, exists } of results) {
        if (exists) {
          existingIds.push(id);
        } else {
          missingIds.push(id);
        }
      }
    }
    
    return { existingIds, missingIds };
  }
  
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

const batchProcessingService = new BatchProcessingService();
export { batchProcessingService };
```

### Query Builder Service

```typescript
import { IdListOptional, FlexibleId } from 'phantom-zod';

class QueryBuilderService {
  // Build complex queries with ID filtering
  buildFilterQuery(filters: unknown) {
    const filterSchema = z.object({
      includeIds: pz.IdListOptional("Include IDs"),
      excludeIds: pz.IdListOptional("Exclude IDs"),
      categoryId: FlexibleId("Category ID").optional(),
      parentId: FlexibleId("Parent ID").optional(),
      status: z.enum(['active', 'inactive', 'archived']).optional(),
      dateRange: z.object({
        start: z.date(),
        end: z.date()
      }).optional()
    });
    
    const validFilters = filterSchema.parse(filters);
    
    // Build query conditions
    const conditions: any[] = [];
    
    if (validFilters.includeIds?.length) {
      conditions.push({ _id: { $in: validFilters.includeIds } });
    }
    
    if (validFilters.excludeIds?.length) {
      conditions.push({ _id: { $nin: validFilters.excludeIds } });
    }
    
    if (validFilters.categoryId) {
      conditions.push({ categoryId: validFilters.categoryId });
    }
    
    if (validFilters.parentId) {
      conditions.push({ parentId: validFilters.parentId });
    }
    
    if (validFilters.status) {
      conditions.push({ status: validFilters.status });
    }
    
    if (validFilters.dateRange) {
      conditions.push({
        createdAt: {
          $gte: validFilters.dateRange.start,
          $lte: validFilters.dateRange.end
        }
      });
    }
    
    return conditions.length > 0 ? { $and: conditions } : {};
  }
  
  // Build aggregation pipeline with ID matching
  buildAggregationPipeline(config: {
    matchIds?: string[];
    lookupIds?: { from: string; localField: string; foreignField: string; as: string }[];
    groupBy?: string;
    sortBy?: { field: string; direction: 1 | -1 };
    limit?: number;
  }) {
    const pipeline: any[] = [];
    
    // Match stage
    if (config.matchIds?.length) {
      const idsSchema = IdListOptional("Match IDs");
      const validIds = idsSchema.parse(config.matchIds);
      if (validIds?.length) {
        pipeline.push({ $match: { _id: { $in: validIds } } });
      }
    }
    
    // Lookup stages
    if (config.lookupIds) {
      for (const lookup of config.lookupIds) {
        pipeline.push({
          $lookup: {
            from: lookup.from,
            localField: lookup.localField,
            foreignField: lookup.foreignField,
            as: lookup.as
          }
        });
      }
    }
    
    // Group stage
    if (config.groupBy) {
      pipeline.push({
        $group: {
          _id: `$${config.groupBy}`,
          count: { $sum: 1 },
          items: { $push: "$$ROOT" }
        }
      });
    }
    
    // Sort stage
    if (config.sortBy) {
      pipeline.push({
        $sort: { [config.sortBy.field]: config.sortBy.direction }
      });
    }
    
    // Limit stage
    if (config.limit) {
      pipeline.push({ $limit: config.limit });
    }
    
    return pipeline;
  }
}

const queryBuilderService = new QueryBuilderService();
export { queryBuilderService };
```

## Advanced Use Cases

### Hierarchical Data Processing

```typescript
import { IdListRequired, FlexibleId } from 'phantom-zod';

// Tree structure with parent-child relationships
const hierarchySchema = z.object({
  nodeId: FlexibleId("Node ID"),
  parentIds: pz.IdListOptional("Parent IDs", MsgType.FieldName, 0, 10),
  childIds: pz.IdListOptional("Child IDs", MsgType.FieldName, 0, 1000),
  ancestorIds: pz.IdListOptional("Ancestor IDs", MsgType.FieldName, 0, 100),
  level: z.number().int().nonnegative()
});

// Bulk hierarchy operations
const hierarchyBulkOpSchema = z.object({
  operation: z.enum(['move', 'copy', 'link', 'unlink']),
  sourceIds: pz.IdListRequired("Source Node IDs", MsgType.FieldName, 1, 100),
  targetParentId: FlexibleId("Target Parent ID").optional(),
  preserveStructure: z.boolean().default(true)
});
```

### Graph Relationship Management

```typescript
import { UniqueIdList, IdListRequired } from 'phantom-zod';

// Graph edge definition
const graphEdgeSchema = z.object({
  edgeId: Id("Edge ID"),
  fromNodeId: FlexibleId("From Node"),
  toNodeId: FlexibleId("To Node"),
  edgeType: z.string(),
  weight: z.number().optional(),
  properties: z.record(z.any()).optional()
});

// Bulk graph operations
const graphBulkOpSchema = z.object({
  operation: z.enum(['create_edges', 'delete_edges', 'update_weights']),
  nodeIds: UniqueIdList("Node IDs", MsgType.FieldName, 2, 10000),
  edgeType: z.string(),
  bidirectional: z.boolean().default(false),
  defaultWeight: z.number().optional()
});
```

### Multi-Tenant ID Management

```typescript
import { IdListRequired, CustomId } from 'phantom-zod';

// Tenant-scoped ID validation
const tenantScopedIdSchema = CustomId(
  (val) => /^[A-Z0-9]{8}_[a-f0-9-]{36}$/.test(val), // TENANT_UUID format
  "Tenant-Scoped ID"
);

// Multi-tenant batch operation
const multiTenantBatchSchema = z.object({
  tenantId: z.string(),
  resourceIds: pz.IdListRequired("Resource IDs", MsgType.FieldName, 1, 100),
  crossTenantIds: pz.IdListOptional("Cross-Tenant Resource IDs"),
  operation: z.enum(['clone', 'share', 'migrate']),
  targetTenant: z.string().optional()
});
```

## See Also

- [UUID Schemas](./uuid-schemas.md) - For individual UUID validation
- [String Schemas](./string-schemas.md) - For custom ID format validation
- [Array Schemas](./array-schemas.md) - For general array validation patterns
- [Number Schemas](./number-schemas.md) - For pagination parameters
- [Object Validation Guide](../guides/object-validation.md) - Complex object validation patterns
