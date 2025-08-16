# Enum Schemas

Enum schemas provide comprehensive validation for enumerated values, ensuring that input matches one of a predefined set of string literals with full TypeScript type safety and intellisense support.

## Overview

All enum schemas in Phantom Zod provide:

- **String literal validation** with exact matching
- **TypeScript type safety** with full intellisense support
- **Union type inference** for perfect type narrowing
- **Optional and required variants** for flexible validation
- **Clear error messages** showing all valid options
- **Consistent error handling** through localization
- **Compile-time safety** preventing invalid enum values

## Available Schemas

### EnumRequired

Creates a required enum schema that accepts only values from a predefined list of string literals.

```typescript
pz.EnumRequired<T>(values: T, options?: BaseSchemaOptions)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `msg` | `string` | `"Value"` | Field name or custom error message |
| `msgType` | `MsgType` | `MsgType.FieldName` | Message type for localization |

**Examples:**

```typescript
import { pz } from "phantom-zod";

// Basic enum validation
const statusSchema = pz.EnumRequired(["active", "inactive", "pending"], {
  msg: "Status"
});

// Valid inputs
statusSchema.parse("active");              // ✅ "active" 
statusSchema.parse("inactive");            // ✅ "inactive"
statusSchema.parse("pending");             // ✅ "pending"

// Invalid inputs
statusSchema.parse("unknown");             // ❌ Error: Status must be one of: active, inactive, pending
statusSchema.parse("");                    // ❌ Error: Status must be one of: active, inactive, pending
statusSchema.parse(null);                  // ❌ Error: Status must be one of: active, inactive, pending
statusSchema.parse(undefined);             // ❌ Error: Status is required

// TypeScript type inference
type Status = z.infer<typeof statusSchema>; // "active" | "inactive" | "pending"

// Role-based access control
const roleSchema = pz.EnumRequired(["admin", "user", "moderator"], {
  msg: "User Role"
});

roleSchema.parse("admin");                 // ✅ "admin"
roleSchema.parse("invalid-role");          // ❌ Error: User Role must be one of: admin, user, moderator

// HTTP methods
const methodSchema = pz.EnumRequired(["GET", "POST", "PUT", "DELETE"], {
  msg: "HTTP Method"
});

methodSchema.parse("GET");                 // ✅ "GET"
methodSchema.parse("PATCH");               // ❌ Error: HTTP Method must be one of: GET, POST, PUT, DELETE
```

### EnumOptional

Creates an optional enum schema that accepts values from a predefined list or undefined.

```typescript
pz.EnumOptional<T>(values: T, options?: BaseSchemaOptions)
```

**Examples:**

```typescript
// Optional priority levels
const prioritySchema = pz.EnumOptional(["low", "medium", "high", "critical"], {
  msg: "Priority"
});

// Valid inputs
prioritySchema.parse("high");              // ✅ "high"
prioritySchema.parse("low");               // ✅ "low"
prioritySchema.parse(undefined);           // ✅ undefined

// Invalid inputs
prioritySchema.parse("urgent");            // ❌ Error: Priority must be one of: low, medium, high, critical

// Optional theme selection
const themeSchema = pz.EnumOptional(["light", "dark", "auto"], {
  msg: "Theme Preference"
});

themeSchema.parse("dark");                 // ✅ "dark"
themeSchema.parse(undefined);              // ✅ undefined (uses default)

// TypeScript type inference
type Theme = z.infer<typeof themeSchema>;  // "light" | "dark" | "auto" | undefined
```

## Type Definitions

```typescript
// Input type constraint
type EnumValues<T extends readonly [string, ...string[]]> = T;

// Inferred types
type EnumRequired<T extends readonly [string, ...string[]]> = T[number];              // Union of enum values
type EnumOptional<T extends readonly [string, ...string[]]> = T[number] | undefined;  // Union of enum values or undefined

// Example with specific values
const colors = ["red", "green", "blue"] as const;
type Color = EnumRequired<typeof colors>; // "red" | "green" | "blue"
```

## TypeScript Integration

### Const Assertions

Use `as const` for maximum type safety:

```typescript
// ✅ Good: Using const assertion
const STATUS_VALUES = ["active", "inactive", "pending"] as const;
const statusSchema = pz.EnumRequired(STATUS_VALUES, { msg: "Status" });
type Status = z.infer<typeof statusSchema>; // "active" | "inactive" | "pending"

// ✅ Good: Direct const assertion
const roleSchema = pz.EnumRequired(["admin", "user", "moderator"] as const, {
  msg: "Role"
});
type Role = z.infer<typeof roleSchema>; // "admin" | "user" | "moderator"

// ❌ Less ideal: Without const assertion (still works but less type safe)
const priorities = ["low", "medium", "high"];
const prioritySchema = pz.EnumRequired(priorities, { msg: "Priority" });
```

### Enum Constants

Define reusable enum constants:

```typescript
// Define enum constants
export const USER_ROLES = ["admin", "user", "moderator", "guest"] as const;
export const ORDER_STATUS = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
export const LOG_LEVELS = ["error", "warn", "info", "debug"] as const;

// Use in schemas
export const userRoleSchema = pz.EnumRequired(USER_ROLES, { msg: "User Role" });
export const orderStatusSchema = pz.EnumRequired(ORDER_STATUS, { msg: "Order Status" });
export const logLevelSchema = pz.EnumOptional(LOG_LEVELS, { msg: "Log Level" });

// Export inferred types
export type UserRole = z.infer<typeof userRoleSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type LogLevel = z.infer<typeof logLevelSchema>;
```

### Discriminated Unions

Combine enums with discriminated unions:

```typescript
// Event type discrimination
const eventSchema = z.discriminatedUnion("type", [
  z.object({
    type: pz.EnumRequired(["click"], { msg: "Event Type" }),
    elementId: pz.StringRequired({ msg: "Element ID" }),
    timestamp: pz.DateTimeStringRequired({ msg: "Timestamp" })
  }),
  z.object({
    type: pz.EnumRequired(["view"], { msg: "Event Type" }),
    pageUrl: pz.UrlRequired({ msg: "Page URL" }),
    duration: pz.PositiveRequired({ msg: "Duration" })
  }),
  z.object({
    type: pz.EnumRequired(["submit"], { msg: "Event Type" }),
    formId: pz.StringRequired({ msg: "Form ID" }),
    data: z.record(z.any())
  })
]);

type Event = z.infer<typeof eventSchema>;
// TypeScript knows the shape based on the 'type' field
```

## Common Patterns

### User Management Schema

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

// Define enum constants
const USER_ROLES = ["admin", "user", "moderator", "guest"] as const;
const ACCOUNT_STATUS = ["active", "inactive", "suspended", "pending"] as const;
const NOTIFICATION_PREFERENCES = ["email", "sms", "push", "none"] as const;

const userSchema = z.object({
  id: pz.UuidRequired({ msg: "User ID" }),
  email: pz.EmailRequired({ msg: "Email" }),
  name: pz.StringRequired({ msg: "Name" }),
  
  // Required enums
  role: pz.EnumRequired(USER_ROLES, { msg: "User Role" }),
  status: pz.EnumRequired(ACCOUNT_STATUS, { msg: "Account Status" }),
  
  // Optional enums
  preferredNotification: pz.EnumOptional(NOTIFICATION_PREFERENCES, {
    msg: "Notification Preference"
  }),
  
  // Array of enum values
  permissions: pz.ArrayOptional(
    pz.EnumRequired(["read", "write", "delete", "admin"], { msg: "Permission" }),
    { msg: "Permissions", allowDuplicates: false }
  ),
  
  // Timestamps
  createdAt: pz.DateTimeStringRequired({ msg: "Created At" }),
  updatedAt: pz.DateTimeStringOptional({ msg: "Updated At" }),
});

type User = z.infer<typeof userSchema>;
```

### E-commerce Order Schema

```typescript
const ORDER_STATUS = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
const PAYMENT_STATUS = ["pending", "paid", "failed", "refunded"] as const;
const PAYMENT_METHODS = ["credit_card", "debit_card", "paypal", "stripe", "cash"] as const;
const SHIPPING_METHODS = ["standard", "express", "overnight", "pickup"] as const;

const orderSchema = z.object({
  id: pz.UuidRequired({ msg: "Order ID" }),
  customerId: pz.UuidRequired({ msg: "Customer ID" }),
  
  // Order status tracking
  orderStatus: pz.EnumRequired(ORDER_STATUS, { msg: "Order Status" }),
  paymentStatus: pz.EnumRequired(PAYMENT_STATUS, { msg: "Payment Status" }),
  
  // Payment and shipping
  paymentMethod: pz.EnumRequired(PAYMENT_METHODS, { msg: "Payment Method" }),
  shippingMethod: pz.EnumOptional(SHIPPING_METHODS, { msg: "Shipping Method" }),
  
  // Order details
  items: pz.ArrayRequired(
    z.object({
      productId: pz.UuidRequired({ msg: "Product ID" }),
      quantity: pz.PositiveRequired({ msg: "Quantity" }),
      price: pz.PositiveRequired({ msg: "Price" }),
      size: pz.EnumOptional(["XS", "S", "M", "L", "XL"], { msg: "Size" }),
      color: pz.EnumOptional(["red", "blue", "green", "black", "white"], { msg: "Color" })
    }),
    { msg: "Order Items", minItems: 1 }
  ),
  
  // Totals
  totalAmount: pz.PositiveRequired({ msg: "Total Amount" }),
  
  // Timestamps
  createdAt: pz.DateTimeStringRequired({ msg: "Created At" }),
  updatedAt: pz.DateTimeStringOptional({ msg: "Updated At" }),
});
```

### API Configuration Schema

```typescript
const ENVIRONMENT = ["development", "staging", "production"] as const;
const LOG_LEVELS = ["error", "warn", "info", "debug", "trace"] as const;
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"] as const;
const CACHE_STRATEGIES = ["none", "memory", "redis", "database"] as const;

const apiConfigSchema = z.object({
  // Environment settings
  environment: pz.EnumRequired(ENVIRONMENT, { msg: "Environment" }),
  logLevel: pz.EnumRequired(LOG_LEVELS, { msg: "Log Level" }),
  
  // Server configuration
  allowedMethods: pz.ArrayRequired(
    pz.EnumRequired(HTTP_METHODS, { msg: "HTTP Method" }),
    { msg: "Allowed Methods", minItems: 1, allowDuplicates: false }
  ),
  
  // Performance settings
  cacheStrategy: pz.EnumRequired(CACHE_STRATEGIES, { msg: "Cache Strategy" }),
  
  // Feature toggles using enums
  features: z.object({
    authentication: pz.EnumRequired(["enabled", "disabled"], { msg: "Authentication" }),
    rateLimit: pz.EnumRequired(["strict", "normal", "lenient", "disabled"], { msg: "Rate Limit" }),
    cors: pz.EnumRequired(["enabled", "disabled"], { msg: "CORS" }),
    compression: pz.EnumOptional(["gzip", "brotli", "none"], { msg: "Compression" }),
  }),
  
  // Security settings
  security: z.object({
    tlsVersion: pz.EnumRequired(["1.2", "1.3"], { msg: "TLS Version" }),
    csrfProtection: pz.EnumRequired(["enabled", "disabled"], { msg: "CSRF Protection" }),
    sessionStorage: pz.EnumRequired(["memory", "redis", "database"], { msg: "Session Storage" })
  })
});
```

### Content Management Schema

```typescript
const CONTENT_STATUS = ["draft", "review", "published", "archived"] as const;
const CONTENT_TYPE = ["article", "page", "blog", "news", "documentation"] as const;
const VISIBILITY = ["public", "private", "protected", "internal"] as const;
const CONTENT_FORMAT = ["markdown", "html", "plaintext", "rich"] as const;

const contentSchema = z.object({
  id: pz.UuidRequired({ msg: "Content ID" }),
  title: pz.StringRequired({ msg: "Title" }),
  content: pz.StringRequired({ msg: "Content" }),
  
  // Content classification
  type: pz.EnumRequired(CONTENT_TYPE, { msg: "Content Type" }),
  status: pz.EnumRequired(CONTENT_STATUS, { msg: "Content Status" }),
  visibility: pz.EnumRequired(VISIBILITY, { msg: "Visibility" }),
  format: pz.EnumRequired(CONTENT_FORMAT, { msg: "Content Format" }),
  
  // Optional categorization
  category: pz.EnumOptional(["technology", "business", "lifestyle", "education"], {
    msg: "Category"
  }),
  
  // Content metadata
  tags: pz.StringArrayOptional({ msg: "Tags", maxItems: 10 }),
  authorId: pz.UuidRequired({ msg: "Author ID" }),
  
  // Publishing
  publishedAt: pz.DateTimeStringOptional({ msg: "Published At" }),
  scheduledAt: pz.DateTimeStringOptional({ msg: "Scheduled At" }),
  
  // SEO
  seoSettings: z.object({
    indexable: pz.EnumRequired(["yes", "no"], { msg: "Indexable" }),
    priority: pz.EnumOptional(["low", "normal", "high"], { msg: "SEO Priority" })
  }).optional(),
});
```

### System Configuration with Validation

```typescript
const DATABASE_TYPE = ["postgresql", "mysql", "sqlite", "mongodb"] as const;
const CACHE_TYPE = ["memory", "redis", "memcached"] as const;
const QUEUE_TYPE = ["redis", "rabbitmq", "sqs", "memory"] as const;
const STORAGE_TYPE = ["local", "s3", "gcs", "azure"] as const;

const systemConfigSchema = z.object({
  // Database configuration
  database: z.object({
    type: pz.EnumRequired(DATABASE_TYPE, { msg: "Database Type" }),
    host: pz.StringRequired({ msg: "Database Host" }),
    port: pz.IntegerRequired({ msg: "Database Port", min: 1, max: 65535 }),
    ssl: pz.EnumRequired(["require", "prefer", "allow", "disable"], { msg: "SSL Mode" })
  }),
  
  // Cache configuration  
  cache: z.object({
    type: pz.EnumRequired(CACHE_TYPE, { msg: "Cache Type" }),
    ttl: pz.PositiveRequired({ msg: "Cache TTL" }),
    maxSize: pz.PositiveOptional({ msg: "Max Cache Size" })
  }),
  
  // Queue configuration
  queue: z.object({
    type: pz.EnumRequired(QUEUE_TYPE, { msg: "Queue Type" }),
    workers: pz.IntegerRequired({ msg: "Worker Count", min: 1, max: 20 })
  }),
  
  // Storage configuration
  storage: z.object({
    type: pz.EnumRequired(STORAGE_TYPE, { msg: "Storage Type" }),
    region: pz.EnumOptional(["us-east-1", "us-west-2", "eu-west-1"], { msg: "Region" }),
    encryption: pz.EnumRequired(["enabled", "disabled"], { msg: "Encryption" })
  })
}).refine(
  (config) => {
    // Business rule: Redis cache requires Redis queue for optimal performance
    if (config.cache.type === "redis" && config.queue.type !== "redis") {
      return false;
    }
    return true;
  },
  {
    message: "Redis cache should be paired with Redis queue for optimal performance",
    path: ["queue", "type"]
  }
);
```

## Error Messages

Enum schemas provide clear error messages showing all valid options:

### Default Messages (English)

- **Required:** `"[Field Name] is required"`
- **Invalid Value:** `"[Field Name] must be one of: [option1, option2, option3]"`

### Custom Error Messages

```typescript
import { MsgType } from "phantom-zod";

const schema = pz.EnumRequired(["active", "inactive"], {
  msg: "Please select either 'active' or 'inactive' status",
  msgType: MsgType.Message
});

// Error message will be: "Please select either 'active' or 'inactive' status"
```

## Best Practices

### 1. Use Const Assertions for Type Safety

```typescript
// ✅ Good: Const assertion preserves literal types
const PRIORITIES = ["low", "medium", "high"] as const;
const prioritySchema = pz.EnumRequired(PRIORITIES, { msg: "Priority" });

// ✅ Good: Inline const assertion
const statusSchema = pz.EnumRequired(["active", "inactive"] as const, { msg: "Status" });

// ❌ Avoid: Without const assertion
const badPriorities = ["low", "medium", "high"]; // Type is string[]
const badSchema = pz.EnumRequired(badPriorities, { msg: "Priority" }); // Less type safe
```

### 2. Define Reusable Enum Constants

```typescript
// ✅ Good: Centralized enum definitions
export const USER_ROLES = ["admin", "user", "moderator"] as const;
export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered"] as const;

// Use across multiple schemas
export const userSchema = z.object({
  role: pz.EnumRequired(USER_ROLES, { msg: "Role" })
});

export const orderSchema = z.object({
  status: pz.EnumRequired(ORDER_STATUSES, { msg: "Status" })
});
```

### 3. Choose Descriptive Values

```typescript
// ✅ Good: Clear, descriptive values
const userStatusSchema = pz.EnumRequired(["active", "inactive", "suspended"], { msg: "Status" });
const paymentMethodSchema = pz.EnumRequired(["credit_card", "debit_card", "paypal"], { msg: "Payment Method" });

// ❌ Avoid: Unclear abbreviations
const statusSchema = pz.EnumRequired(["A", "I", "S"], { msg: "Status" }); // Unclear what these mean
```

### 4. Use Optional Appropriately

```typescript
// ✅ Good: Required for essential categorization
const orderStatusSchema = pz.EnumRequired(["pending", "completed", "cancelled"], {
  msg: "Order Status"
});

// ✅ Good: Optional for user preferences
const themeSchema = pz.EnumOptional(["light", "dark", "auto"], {
  msg: "Theme Preference"
});

// ✅ Good: Optional with sensible defaults in business logic
const prioritySchema = pz.EnumOptional(["low", "medium", "high"], {
  msg: "Priority"
}); 
// Application can default to "medium" if undefined
```

### 5. Consider Future Extensibility

```typescript
// ✅ Good: Extensible status values
const TICKET_STATUSES = [
  "open", 
  "in_progress", 
  "waiting_for_response", 
  "resolved", 
  "closed"
] as const;

// ✅ Good: Generic success/failure states
const OPERATION_RESULTS = ["success", "failure", "pending", "cancelled"] as const;

// ❌ Avoid: Too specific, hard to extend
const VERY_SPECIFIC_STATES = ["monday_pending", "tuesday_processing"] as const;
```

## Integration Examples

### With React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const USER_ROLES = ["admin", "user", "moderator"] as const;
const ACCOUNT_TYPES = ["personal", "business"] as const;

const formSchema = z.object({
  name: pz.StringRequired({ msg: "Name" }),
  email: pz.EmailRequired({ msg: "Email" }),
  role: pz.EnumRequired(USER_ROLES, { msg: "Role" }),
  accountType: pz.EnumRequired(ACCOUNT_TYPES, { msg: "Account Type" }),
  theme: pz.EnumOptional(["light", "dark"], { msg: "Theme" })
});

const EnumForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema)
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register("name")} placeholder="Name" />
      {errors.name && <span>{errors.name.message}</span>}
      
      <select {...register("role")}>
        <option value="">Select Role</option>
        {USER_ROLES.map(role => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>
      {errors.role && <span>{errors.role.message}</span>}
      
      <select {...register("accountType")}>
        <option value="">Select Account Type</option>
        {ACCOUNT_TYPES.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      {errors.accountType && <span>{errors.accountType.message}</span>}
      
      <select {...register("theme")}>
        <option value="">Select Theme (Optional)</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

### With Express.js API

```typescript
import express from "express";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_METHODS = ["credit_card", "paypal", "stripe"] as const;

const createOrderSchema = z.object({
  customerId: pz.UuidRequired({ msg: "Customer ID" }),
  items: pz.ArrayRequired(
    z.object({
      productId: pz.UuidRequired({ msg: "Product ID" }),
      quantity: pz.PositiveRequired({ msg: "Quantity" }),
      size: pz.EnumOptional(["XS", "S", "M", "L", "XL"], { msg: "Size" })
    }),
    { msg: "Order Items", minItems: 1 }
  ),
  paymentMethod: pz.EnumRequired(PAYMENT_METHODS, { msg: "Payment Method" }),
  shippingMethod: pz.EnumOptional(["standard", "express", "overnight"], { msg: "Shipping Method" })
});

const updateOrderSchema = z.object({
  status: pz.EnumRequired(ORDER_STATUSES, { msg: "Order Status" }),
  notes: pz.StringOptional({ msg: "Notes" })
});

app.post("/orders", (req, res) => {
  try {
    const orderData = createOrderSchema.parse(req.body);
    
    // All enum values are validated and type-safe
    console.log("Payment method:", orderData.paymentMethod);     // Typed as union
    console.log("Shipping method:", orderData.shippingMethod);   // Typed as union | undefined
    
    const order = {
      ...orderData,
      id: generateId(),
      status: "pending" as const,  // Initial status
      createdAt: new Date().toISOString()
    };
    
    await Order.create(order);
    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ 
      error: "Validation failed",
      issues: error.issues 
    });
  }
});

app.put("/orders/:id/status", (req, res) => {
  const { status, notes } = updateOrderSchema.parse(req.body);
  
  // Status is validated against allowed enum values
  await Order.updateById(req.params.id, { status, notes, updatedAt: new Date() });
  
  res.json({ success: true });
});

// Query with enum filters
app.get("/orders", (req, res) => {
  const querySchema = z.object({
    status: pz.EnumOptional(ORDER_STATUSES, { msg: "Status Filter" }),
    paymentMethod: pz.EnumOptional(PAYMENT_METHODS, { msg: "Payment Method Filter" })
  });
  
  const filters = querySchema.parse(req.query);
  
  const query: any = {};
  if (filters.status) query.status = filters.status;
  if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
  
  const orders = await Order.find(query);
  res.json({ orders });
});
```

### Database Integration

```typescript
// Database model with enum constraints
interface UserModel {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "moderator";           // Enum type from schema
  status: "active" | "inactive" | "suspended";    // Enum type from schema
  theme?: "light" | "dark";                       // Optional enum
  createdAt: Date;
}

const USER_ROLES = ["admin", "user", "moderator"] as const;
const USER_STATUS = ["active", "inactive", "suspended"] as const;
const THEMES = ["light", "dark"] as const;

// Schema matching database constraints
const userCreateSchema = z.object({
  email: pz.EmailRequired({ msg: "Email" }),
  name: pz.StringRequired({ msg: "Name" }),
  role: pz.EnumRequired(USER_ROLES, { msg: "Role" }),
  status: pz.EnumRequired(USER_STATUS, { msg: "Status" }),
  theme: pz.EnumOptional(THEMES, { msg: "Theme" })
});

const userUpdateSchema = z.object({
  name: pz.StringOptional({ msg: "Name" }),
  role: pz.EnumOptional(USER_ROLES, { msg: "Role" }),
  status: pz.EnumOptional(USER_STATUS, { msg: "Status" }),
  theme: pz.EnumOptional(THEMES, { msg: "Theme" })
});

// API endpoints with enum validation
app.post("/users", async (req, res) => {
  const userData = userCreateSchema.parse(req.body);
  
  const user = await User.create({
    ...userData,
    id: generateId(),
    createdAt: new Date()
  });
  
  res.json({ user });
});

app.put("/users/:id", async (req, res) => {
  const updates = userUpdateSchema.parse(req.body);
  
  // Only defined enum values can be set
  const user = await User.updateById(req.params.id, {
    ...updates,
    updatedAt: new Date()
  });
  
  res.json({ user });
});

// Bulk operations with enum validation
const bulkUpdateSchema = z.object({
  userIds: pz.UuidArrayRequired({ 
    msg: "User IDs", 
    minItems: 1, 
    maxItems: 100 
  }),
  updates: z.object({
    status: pz.EnumOptional(USER_STATUS, { msg: "Status" }),
    role: pz.EnumOptional(USER_ROLES, { msg: "Role" })
  })
});

app.put("/users/bulk", async (req, res) => {
  const { userIds, updates } = bulkUpdateSchema.parse(req.body);
  
  const results = await User.updateMany(
    { id: { $in: userIds } },
    { ...updates, updatedAt: new Date() }
  );
  
  res.json({ updated: results.modifiedCount });
});
```

## See Also

- [String Schemas](string-schemas.md) - Basic string validation
- [Array Schemas](array-schemas.md) - Array validation with enum elements
- [Boolean Schemas](boolean-schemas.md) - Boolean validation (binary enum alternative)
- [User Schemas](user-schemas.md) - User role and status validation
- [Form Validation Examples](../examples/form-validation.md) - Practical form usage
- [API Validation Examples](../examples/api-validation.md) - API endpoint validation
