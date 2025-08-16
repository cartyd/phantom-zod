# UUID Schemas

UUID schemas provide comprehensive validation for universally unique identifiers (UUIDs) and Nanoids, with support for specific UUID versions, format validation, and strict compliance with standards.

## Overview

All UUID schemas in Phantom Zod provide:

- **Universal UUID validation** for any UUID version (v1-v8)
- **Version-specific validation** for UUIDs v4, v6, and v7
- **Nanoid support** for URL-safe unique identifiers
- **Format validation** with detailed error messages
- **Optional and required variants** for flexible validation
- **Consistent error handling** through localization
- **Type safety** with TypeScript inference

## Available Schemas

### Universal UUID Schemas

#### UuidRequired

Creates a required UUID schema that accepts any valid UUID version.

```typescript
pz.UuidRequired(options?: BaseSchemaOptions)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `msg` | `string` | `"ID"` | Field name or custom error message |
| `msgType` | `MsgType` | `MsgType.FieldName` | Message type for localization |

**Examples:**

```typescript
import { pz } from "phantom-zod";

const schema = pz.UuidRequired({ msg: "User ID" });

// Valid inputs (any UUID version)
schema.parse("123e4567-e89b-12d3-a456-426614174000"); // ✅ UUID v1
schema.parse("f47ac10b-58cc-4372-a567-0e02b2c3d479"); // ✅ UUID v4
schema.parse("1ec9414c-232a-6b00-b3c8-9e6bdeced846"); // ✅ UUID v6
schema.parse("018f6d6e-f14d-7c2a-b732-c6d5730303e0"); // ✅ UUID v7

// Invalid inputs
schema.parse("invalid-uuid");                         // ❌ Error: User ID must be a valid UUID
schema.parse("123e4567-e89b-12d3-a456");              // ❌ Error: User ID must be a valid UUID
schema.parse("123e4567-e89b-12d3-a456-426614174000x"); // ❌ Error: User ID must be a valid UUID
schema.parse("");                                     // ❌ Error: User ID must be a valid UUID
schema.parse(null);                                   // ❌ Error: User ID must be a valid UUID
schema.parse(undefined);                              // ❌ Error: User ID is required
```

#### UuidOptional

Creates an optional UUID schema that accepts valid UUIDs or undefined.

```typescript
pz.UuidOptional(options?: BaseSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.UuidOptional({ msg: "Parent ID" });

// Valid inputs
schema.parse("123e4567-e89b-12d3-a456-426614174000"); // ✅ Valid UUID
schema.parse(undefined);                              // ✅ undefined
schema.parse("");                                     // ✅ undefined (empty converted)

// Invalid inputs
schema.parse("invalid-uuid");                         // ❌ Error: Parent ID must be a valid UUID
```

### Version-Specific UUID Schemas

#### UuidV4Required / UuidV4Optional

Creates schemas that specifically validate UUID version 4 (random UUIDs).

```typescript
pz.UuidV4Required(options?: BaseSchemaOptions)
pz.UuidV4Optional(options?: BaseSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.UuidV4Required({ msg: "Session ID" });

// Valid UUID v4 inputs
schema.parse("f47ac10b-58cc-4372-a567-0e02b2c3d479"); // ✅ Valid UUID v4
schema.parse("6ba7b810-9dad-11d1-80b4-00c04fd430c8"); // ❌ Error: Session ID must be a valid UUID v4 (this is v1)

const optionalSchema = pz.UuidV4Optional({ msg: "Trace ID" });
optionalSchema.parse("f47ac10b-58cc-4372-a567-0e02b2c3d479"); // ✅ Valid UUID v4
optionalSchema.parse(undefined);                              // ✅ undefined
```

**UUID v4 Characteristics:**
- Random or pseudo-random generation
- Version field is `4`
- Most commonly used UUID version
- Format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` where `y` is one of `8`, `9`, `A`, `B`

#### UuidV6Required / UuidV6Optional

Creates schemas that specifically validate UUID version 6 (reordered time-based).

```typescript
pz.UuidV6Required(options?: BaseSchemaOptions)
pz.UuidV6Optional(options?: BaseSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.UuidV6Required({ msg: "Event ID" });

// Valid UUID v6 inputs
schema.parse("1ec9414c-232a-6b00-b3c8-9e6bdeced846"); // ✅ Valid UUID v6

const optionalSchema = pz.UuidV6Optional({ msg: "Correlation ID" });
optionalSchema.parse("1ec9414c-232a-6b00-b3c8-9e6bdeced846"); // ✅ Valid UUID v6
optionalSchema.parse(undefined);                              // ✅ undefined
```

**UUID v6 Characteristics:**
- Reordered time-based UUID (improvement over v1)
- Version field is `6`
- Better for database indexing than v4
- Lexicographically sortable by time

#### UuidV7Required / UuidV7Optional

Creates schemas that specifically validate UUID version 7 (Unix timestamp-based).

```typescript
pz.UuidV7Required(options?: BaseSchemaOptions)
pz.UuidV7Optional(options?: BaseSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.UuidV7Required({ msg: "Record ID" });

// Valid UUID v7 inputs
schema.parse("018f6d6e-f14d-7c2a-b732-c6d5730303e0"); // ✅ Valid UUID v7

const optionalSchema = pz.UuidV7Optional({ msg: "Reference ID" });
optionalSchema.parse("018f6d6e-f14d-7c2a-b732-c6d5730303e0"); // ✅ Valid UUID v7
optionalSchema.parse(undefined);                              // ✅ undefined
```

**UUID v7 Characteristics:**
- Unix timestamp-based (48-bit millisecond precision)
- Version field is `7`
- Naturally sortable by creation time
- Excellent for database primary keys
- Format includes timestamp in first 48 bits

### Nanoid Schemas

#### NanoidRequired / NanoidOptional

Creates schemas that validate Nanoids - URL-safe, compact unique identifiers.

```typescript
pz.NanoidRequired(options?: BaseSchemaOptions)
pz.NanoidOptional(options?: BaseSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.NanoidRequired({ msg: "Short ID" });

// Valid Nanoid inputs
schema.parse("V1StGXR8_Z5jdHi6B-myT");                // ✅ Valid Nanoid
schema.parse("FyIlKZJ_7rN5jdHi6B-myT");                // ✅ Valid Nanoid

// Invalid inputs
schema.parse("invalid+nanoid");                        // ❌ Error: Short ID must be a valid nanoid
schema.parse("too-short");                            // ❌ Error: Short ID must be a valid nanoid
schema.parse("");                                     // ❌ Error: Short ID must be a valid nanoid

const optionalSchema = pz.NanoidOptional({ msg: "Token" });
optionalSchema.parse("V1StGXR8_Z5jdHi6B-myT");        // ✅ Valid Nanoid
optionalSchema.parse(undefined);                      // ✅ undefined
```

**Nanoid Characteristics:**
- 21 characters long by default
- URL-safe alphabet: `A-Za-z0-9_-`
- More compact than UUIDs
- Collision-resistant
- No hyphens (unlike UUIDs)

## Type Definitions

```typescript
interface BaseSchemaOptions {
  msg?: string;           // Field name or custom message
  msgType?: MsgType;      // Message formatting type
}

// Inferred types
type UuidRequired = string;              // Always a valid UUID string
type UuidOptional = string | undefined;  // Valid UUID or undefined
type NanoidRequired = string;            // Always a valid Nanoid string
type NanoidOptional = string | undefined; // Valid Nanoid or undefined
```

## UUID Version Comparison

| Version | Primary Use Case | Characteristics | Database Performance | Sortability |
|---------|-----------------|-----------------|---------------------|-------------|
| **v4** | General purpose | Random generation | Moderate | No |
| **v6** | Time-based with better ordering | Reordered timestamp | Good | Yes (by time) |
| **v7** | Modern timestamp-based | Unix timestamp | Excellent | Yes (natural) |
| **Nanoid** | Compact URLs, tokens | URL-safe, shorter | Good | No |

### When to Use Each Type

```typescript
// Use UUID v4 for general unique identifiers
const userId = pz.UuidV4Required({ msg: "User ID" });

// Use UUID v7 for time-ordered records (best for databases)
const recordId = pz.UuidV7Required({ msg: "Record ID" });

// Use UUID v6 for time-based with backward compatibility
const eventId = pz.UuidV6Required({ msg: "Event ID" });

// Use Nanoids for URLs, tokens, and compact identifiers
const shortUrl = pz.NanoidRequired({ msg: "Short URL Token" });

// Use universal UUID when accepting any version
const externalId = pz.UuidRequired({ msg: "External ID" });
```

## Common Patterns

### Database Entity Schema

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

const userSchema = z.object({
  // Primary key - use UUID v7 for natural ordering
  id: pz.UuidV7Required({ msg: "User ID" }),
  
  // Foreign keys - accept any UUID version for compatibility
  organizationId: pz.UuidRequired({ msg: "Organization ID" }),
  parentId: pz.UuidOptional({ msg: "Parent User ID" }),
  
  // User data
  email: pz.EmailRequired({ msg: "Email" }),
  name: pz.StringRequired({ msg: "Name" }),
  
  // Optional external references
  externalId: pz.UuidOptional({ msg: "External System ID" }),
  legacyId: pz.UuidOptional({ msg: "Legacy System ID" }),
  
  // Timestamps
  createdAt: pz.DateTimeStringRequired({ msg: "Created At" }),
  updatedAt: pz.DateTimeStringOptional({ msg: "Updated At" }),
});

type User = z.infer<typeof userSchema>;
```

### API Integration Schema

```typescript
const apiRequestSchema = z.object({
  // Request tracking
  requestId: pz.UuidV4Required({ msg: "Request ID" }),
  correlationId: pz.UuidOptional({ msg: "Correlation ID" }),
  
  // Client information
  clientId: pz.UuidRequired({ msg: "Client ID" }),
  sessionId: pz.UuidV4Optional({ msg: "Session ID" }),
  
  // Resource identifiers
  resourceId: pz.UuidRequired({ msg: "Resource ID" }),
  parentResourceId: pz.UuidOptional({ msg: "Parent Resource ID" }),
  
  // Compact tokens for URLs
  shareToken: pz.NanoidOptional({ msg: "Share Token" }),
  accessToken: pz.NanoidOptional({ msg: "Access Token" }),
});
```

### Event Sourcing Schema

```typescript
const eventSchema = z.object({
  // Event identification - UUID v7 for chronological ordering
  eventId: pz.UuidV7Required({ msg: "Event ID" }),
  
  // Aggregate identification
  aggregateId: pz.UuidRequired({ msg: "Aggregate ID" }),
  aggregateType: pz.StringRequired({ msg: "Aggregate Type" }),
  
  // Event metadata
  eventType: pz.StringRequired({ msg: "Event Type" }),
  eventVersion: pz.IntegerRequired({ msg: "Event Version" }),
  
  // Correlation
  correlationId: pz.UuidOptional({ msg: "Correlation ID" }),
  causationId: pz.UuidOptional({ msg: "Causation ID" }),
  
  // Timestamp
  timestamp: pz.DateTimeStringRequired({ msg: "Event Timestamp" }),
  
  // Event data
  data: z.record(z.any()),
  metadata: z.record(z.any()).optional(),
});
```

### URL and Token Schema

```typescript
const urlSharingSchema = z.object({
  // Original resource
  resourceId: pz.UuidRequired({ msg: "Resource ID" }),
  
  // Short, shareable tokens
  shareToken: pz.NanoidRequired({ msg: "Share Token" }),
  accessToken: pz.NanoidOptional({ msg: "Access Token" }),
  
  // Expiration tracking
  expiresAt: pz.DateTimeStringOptional({ msg: "Expires At" }),
  
  // Usage tracking
  usageTrackingId: pz.UuidV7Optional({ msg: "Usage Tracking ID" }),
});
```

### Microservice Communication Schema

```typescript
const serviceMessageSchema = z.object({
  // Message identification
  messageId: pz.UuidV7Required({ msg: "Message ID" }),
  
  // Correlation for distributed tracing
  traceId: pz.UuidV4Required({ msg: "Trace ID" }),
  spanId: pz.UuidV4Optional({ msg: "Span ID" }),
  parentSpanId: pz.UuidV4Optional({ msg: "Parent Span ID" }),
  
  // Service identification
  sourceServiceId: pz.UuidRequired({ msg: "Source Service ID" }),
  targetServiceId: pz.UuidRequired({ msg: "Target Service ID" }),
  
  // Message content
  messageType: pz.StringRequired({ msg: "Message Type" }),
  payload: z.record(z.any()),
  
  // Timing
  timestamp: pz.DateTimeStringRequired({ msg: "Timestamp" }),
  ttl: pz.IntegerOptional({ msg: "Time To Live" }),
});
```

### File and Media Schema

```typescript
const mediaFileSchema = z.object({
  // File identification
  fileId: pz.UuidV7Required({ msg: "File ID" }),
  
  // File metadata
  filename: pz.StringRequired({ msg: "Filename" }),
  mimeType: pz.StringRequired({ msg: "MIME Type" }),
  size: pz.PositiveRequired({ msg: "File Size" }),
  
  // Storage references
  storageId: pz.UuidRequired({ msg: "Storage ID" }),
  bucketId: pz.UuidOptional({ msg: "Bucket ID" }),
  
  // Processing
  processingJobId: pz.UuidV4Optional({ msg: "Processing Job ID" }),
  thumbnailId: pz.UuidOptional({ msg: "Thumbnail ID" }),
  
  // Sharing and access
  publicToken: pz.NanoidOptional({ msg: "Public Access Token" }),
  downloadToken: pz.NanoidOptional({ msg: "Download Token" }),
  
  // Ownership
  ownerId: pz.UuidRequired({ msg: "Owner ID" }),
  uploadedAt: pz.DateTimeStringRequired({ msg: "Uploaded At" }),
});
```

## Error Messages

UUID schemas provide specific error messages based on validation type:

### Default Messages (English)

- **Required:** `"[Field Name] is required"`
- **General UUID:** `"[Field Name] must be a valid UUID"`
- **UUID v4:** `"[Field Name] must be a valid UUID v4"`
- **UUID v6:** `"[Field Name] must be a valid UUID v6"`
- **UUID v7:** `"[Field Name] must be a valid UUID v7"`
- **Nanoid:** `"[Field Name] must be a valid nanoid"`
- **Format:** `"[Field Name] has invalid format: expected xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"`

### Custom Error Messages

```typescript
import { MsgType } from "phantom-zod";

const schema = pz.UuidV7Required({
  msg: "Please provide a valid time-based UUID (version 7)",
  msgType: MsgType.Message
});

const nanoidSchema = pz.NanoidRequired({
  msg: "Token must be a valid 21-character URL-safe identifier",
  msgType: MsgType.Message
});
```

## Best Practices

### 1. Choose the Right UUID Version

```typescript
// Use UUID v7 for new systems (best database performance)
const newRecordId = pz.UuidV7Required({ msg: "Record ID" });

// Use UUID v4 for general-purpose unique identifiers
const sessionId = pz.UuidV4Required({ msg: "Session ID" });

// Use universal UUID when accepting external identifiers
const externalId = pz.UuidRequired({ msg: "External ID" });

// Use Nanoids for compact, URL-safe identifiers
const shareLink = pz.NanoidRequired({ msg: "Share Link" });
```

### 2. Database Design Considerations

```typescript
// Good: UUID v7 for primary keys (naturally ordered)
const entitySchema = z.object({
  id: pz.UuidV7Required({ msg: "ID" }),
  parentId: pz.UuidV7Optional({ msg: "Parent ID" }),
  createdAt: pz.DateTimeStringRequired({ msg: "Created At" }),
});

// Consider: Use consistent UUID version within related entities
const consistentSchema = z.object({
  orderId: pz.UuidV7Required({ msg: "Order ID" }),
  customerId: pz.UuidV7Required({ msg: "Customer ID" }),
  productId: pz.UuidV7Required({ msg: "Product ID" }),
});
```

### 3. API Design

```typescript
// Accept flexible UUID formats from external systems
const apiSchema = z.object({
  id: pz.UuidRequired({ msg: "ID" }), // Any UUID version
  externalId: pz.UuidOptional({ msg: "External ID" }),
});

// Generate consistent UUIDs for internal systems
const internalSchema = z.object({
  id: pz.UuidV7Required({ msg: "ID" }), // Specific version
  traceId: pz.UuidV4Required({ msg: "Trace ID" }),
});
```

### 4. URL and Token Design

```typescript
// Use Nanoids for user-facing tokens (shorter, URL-safe)
const publicTokenSchema = z.object({
  shareToken: pz.NanoidRequired({ msg: "Share Token" }),
  accessToken: pz.NanoidOptional({ msg: "Access Token" }),
});

// Use UUIDs for internal tracking
const trackingSchema = z.object({
  sessionId: pz.UuidV4Required({ msg: "Session ID" }),
  requestId: pz.UuidV7Required({ msg: "Request ID" }),
});
```

## Integration Examples

### With React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  userId: pz.UuidRequired({ msg: "User ID" }),
  organizationId: pz.UuidRequired({ msg: "Organization ID" }),
  parentResourceId: pz.UuidOptional({ msg: "Parent Resource ID" }),
  externalSystemId: pz.UuidOptional({ msg: "External System ID" }),
});

const UuidForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema)
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input 
        {...register("userId")} 
        placeholder="User ID (UUID)" 
        pattern="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
      />
      {errors.userId && <span>{errors.userId.message}</span>}
      
      <input 
        {...register("organizationId")} 
        placeholder="Organization ID (UUID)" 
        pattern="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
      />
      {errors.organizationId && <span>{errors.organizationId.message}</span>}
      
      <input 
        {...register("parentResourceId")} 
        placeholder="Parent Resource ID (optional)" 
        pattern="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
      />
      {errors.parentResourceId && <span>{errors.parentResourceId.message}</span>}
    </form>
  );
};
```

### With Express.js API

```typescript
import express from "express";
import { v4 as uuidv4, v7 as uuidv7 } from "uuid";
import { nanoid } from "nanoid";

const createResourceSchema = z.object({
  name: pz.StringRequired({ msg: "Resource Name" }),
  ownerId: pz.UuidRequired({ msg: "Owner ID" }),
  parentId: pz.UuidOptional({ msg: "Parent Resource ID" }),
  externalId: pz.UuidOptional({ msg: "External System ID" }),
});

app.post("/resources", (req, res) => {
  try {
    const resourceData = createResourceSchema.parse(req.body);
    
    // Generate IDs using appropriate versions
    const resource = {
      id: uuidv7(), // Time-ordered for database
      ...resourceData,
      shareToken: nanoid(), // Compact for URLs
      createdAt: new Date().toISOString(),
    };
    
    // All UUIDs are validated at this point
    console.log("Creating resource:", resource.id);
    console.log("Owner:", resourceData.ownerId);
    console.log("Share token:", resource.shareToken);
    
    await Resource.create(resource);
    res.json({ success: true, resource });
  } catch (error) {
    res.status(400).json({ 
      error: "Validation failed",
      issues: error.issues 
    });
  }
});

// Get resource by different ID types
app.get("/resources/:id", (req, res) => {
  const idSchema = z.union([
    pz.UuidRequired({ msg: "Resource ID" }),
    pz.NanoidRequired({ msg: "Share Token" }),
  ]);
  
  try {
    const id = idSchema.parse(req.params.id);
    // Handle both UUID and Nanoid lookups
    const resource = await Resource.findByIdOrToken(id);
    res.json({ resource });
  } catch (error) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});
```

### Database Integration with Time-Ordered UUIDs

```typescript
// Database model optimized for UUID v7
interface ResourceModel {
  id: string;           // UUID v7 primary key
  ownerId: string;      // UUID foreign key
  parentId?: string;    // UUID optional foreign key
  shareToken: string;   // Nanoid for public URLs
  name: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Schema ensuring proper UUID types for database
const resourceCreateSchema = z.object({
  ownerId: pz.UuidRequired({ msg: "Owner ID" }),
  parentId: pz.UuidOptional({ msg: "Parent ID" }),
  name: pz.StringRequired({ msg: "Name" }),
});

app.post("/resources", async (req, res) => {
  const resourceData = resourceCreateSchema.parse(req.body);
  
  const resource = await Resource.create({
    id: uuidv7(), // Time-ordered UUID for efficient indexing
    ...resourceData,
    shareToken: nanoid(), // Short token for public sharing
    createdAt: new Date(),
  });
  
  res.json({ resource });
});

// Efficient queries using time-ordered UUIDs
app.get("/resources/recent", async (req, res) => {
  const timeBasedQuery = z.object({
    afterId: pz.UuidV7Optional({ msg: "After ID" }),
    limit: pz.IntegerOptional({ msg: "Limit", min: 1, max: 100 }),
  });
  
  const { afterId, limit = 20 } = timeBasedQuery.parse(req.query);
  
  // UUID v7 allows efficient chronological queries
  const resources = await Resource.findMany({
    where: afterId ? { id: { gt: afterId } } : {},
    orderBy: { id: 'asc' }, // Natural chronological order
    limit,
  });
  
  res.json({ resources });
});
```

### Microservice Event Schema

```typescript
// Event sourcing with proper UUID usage
const domainEventSchema = z.object({
  // Event identification - UUID v7 for chronological ordering
  eventId: pz.UuidV7Required({ msg: "Event ID" }),
  
  // Aggregate identification
  aggregateId: pz.UuidRequired({ msg: "Aggregate ID" }),
  aggregateType: pz.EnumRequired(["User", "Order", "Product"], { 
    msg: "Aggregate Type" 
  }),
  
  // Event metadata
  eventType: pz.StringRequired({ msg: "Event Type" }),
  eventVersion: pz.IntegerRequired({ msg: "Event Version", min: 1 }),
  
  // Distributed tracing
  traceId: pz.UuidV4Required({ msg: "Trace ID" }),
  correlationId: pz.UuidOptional({ msg: "Correlation ID" }),
  causationId: pz.UuidOptional({ msg: "Causation ID" }),
  
  // Timestamp and data
  occurredAt: pz.DateTimeStringRequired({ msg: "Occurred At" }),
  data: z.record(z.any()),
});

// Process events with validated UUIDs
const processEvent = async (eventData: any) => {
  const event = domainEventSchema.parse(eventData);
  
  // All UUIDs are validated and properly typed
  console.log(`Processing event ${event.eventId}`);
  console.log(`Trace: ${event.traceId}`);
  console.log(`Aggregate: ${event.aggregateId}`);
  
  await EventStore.append(event);
};
```

## Utility Functions

### ID Generation Helpers

```typescript
import { v4 as uuidv4, v7 as uuidv7 } from "uuid";
import { nanoid } from "nanoid";

// Helper functions for generating different ID types
export const generateIds = {
  // Time-ordered UUID for database records
  timeId: () => uuidv7(),
  
  // Random UUID for sessions, tokens
  randomId: () => uuidv4(),
  
  // Short URL-safe ID for sharing
  shortId: () => nanoid(),
  
  // Custom length Nanoid
  customId: (length: number) => nanoid(length),
};

// Validation helpers
export const validateId = {
  isUuid: (id: string) => pz.UuidRequired().safeParse(id).success,
  isUuidV4: (id: string) => pz.UuidV4Required().safeParse(id).success,
  isUuidV7: (id: string) => pz.UuidV7Required().safeParse(id).success,
  isNanoid: (id: string) => pz.NanoidRequired().safeParse(id).success,
};

// Usage in application
const createUser = async (userData: any) => {
  const user = {
    id: generateIds.timeId(),        // UUID v7 for database
    sessionId: generateIds.randomId(), // UUID v4 for session
    shareToken: generateIds.shortId(), // Nanoid for sharing
    ...userData,
  };
  
  return await User.create(user);
};
```

## See Also

- [String Schemas](string-schemas.md) - Text validation
- [Array Schemas](array-schemas.md) - Array validation with UUID items
- [ID List Schemas](id-list-schemas.md) - Collections of UUIDs
- [User Schemas](user-schemas.md) - User identification with UUIDs
- [Form Validation Examples](../examples/form-validation.md) - Practical form usage
- [API Validation Examples](../examples/api-validation.md) - API endpoint validation
