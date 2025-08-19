# Record Schemas

Record schemas provide validation for key-value objects (records) with comprehensive constraint options and localized error messages. They are perfect for validating configuration objects, metadata, feature flags, and any other scenarios where you need to validate dynamic key-value mappings.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Available Schemas](#available-schemas)
- [String Parameter Overloads](#string-parameter-overloads)
- [Configuration Options](#configuration-options)
- [Common Use Cases](#common-use-cases)
- [Advanced Examples](#advanced-examples)
- [Integration with pz Schemas](#integration-with-pz-schemas)
- [Error Handling](#error-handling)

## Basic Usage

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

// Simple string record
const settingsSchema = pz.RecordOptional(z.string(), "User Settings");
settingsSchema.parse({ theme: "dark", lang: "en" }); // ✅ { theme: "dark", lang: "en" }
settingsSchema.parse(undefined); // ✅ undefined

// Required record with number values
const countersSchema = pz.RecordRequired(z.number(), "Counters");
countersSchema.parse({ views: 100, clicks: 25 }); // ✅ { views: 100, clicks: 25 }
```

## Available Schemas

### RecordOptional

Creates an optional record schema that accepts `undefined` or a valid record object.

```typescript
pz.RecordOptional(valueSchema: z.ZodType, options?: RecordSchemaOptions)
pz.RecordOptional(valueSchema: z.ZodType, msg: string)
```

### RecordRequired

Creates a required record schema that must contain at least one entry by default.

```typescript
pz.RecordRequired(valueSchema: z.ZodType, options?: RecordSchemaOptions)
pz.RecordRequired(valueSchema: z.ZodType, msg: string)
```

## String Parameter Overloads

Both record schemas support simplified string parameter syntax for basic validation:

```typescript
// Traditional options object approach
const settingsTraditional = pz.RecordOptional(z.string(), { msg: "User Settings" });

// Simplified string parameter approach (equivalent)
const settingsSimple = pz.RecordOptional(z.string(), "User Settings");

// Both produce the same validation behavior
settingsTraditional.parse({ theme: "dark" }); // ✅ { theme: "dark" }
settingsSimple.parse({ theme: "dark" });      // ✅ { theme: "dark" }
```

**When to use each approach:**

- **Use string parameters when:** You only need to set the field name/message
- **Use options objects when:** You need additional constraints (minEntries, allowedKeys, etc.)

## Configuration Options

```typescript
interface RecordSchemaOptions {
  msg?: string;                    // Field name or custom message
  msgType?: MsgType;              // Message formatting type
  minEntries?: number;            // Minimum number of entries
  maxEntries?: number;            // Maximum number of entries
  allowedKeys?: string[];         // Allowed keys (whitelist)
  requiredKeys?: string[];        // Required keys that must be present
  keyPattern?: RegExp;            // Regex pattern for key validation
}
```

### Entry Count Constraints

```typescript
// Minimum and maximum entry constraints
const limitedConfig = pz.RecordRequired(z.string(), {
  msg: "Configuration",
  minEntries: 1,    // At least 1 entry required
  maxEntries: 10,   // At most 10 entries allowed
});
```

### Key Constraints

```typescript
// Allowed keys (whitelist approach)
const restrictedSettings = pz.RecordOptional(z.string(), {
  msg: "Settings",
  allowedKeys: ["theme", "language", "timezone"],
});

// Required keys
const serverConfig = pz.RecordRequired(z.string(), {
  msg: "Server Config",
  requiredKeys: ["host", "port"],
});

// Key pattern validation
const identifierMap = pz.RecordOptional(z.string(), {
  msg: "Identifiers",
  keyPattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, // Valid JavaScript identifiers
});
```

## Common Use Cases

### 1. Configuration Objects

```typescript
const appConfigSchema = pz.RecordRequired(z.string(), {
  msg: "Application Configuration",
  requiredKeys: ["apiUrl", "environment"],
  allowedKeys: ["apiUrl", "environment", "debug", "timeout"],
});

appConfigSchema.parse({
  apiUrl: "https://api.example.com",
  environment: "production",
  debug: "false",
}); // ✅ Valid
```

### 2. Feature Flags

```typescript
const featureFlagsSchema = pz.RecordOptional(pz.BooleanRequired(), "Feature Flags");

featureFlagsSchema.parse({
  darkMode: true,
  newDashboard: false,
  betaFeatures: true,
}); // ✅ Valid
```

### 3. Metadata and Tags

```typescript
const metadataSchema = pz.RecordOptional(z.string(), {
  msg: "Metadata",
  maxEntries: 20,
  keyPattern: /^[a-z][a-z0-9_]*$/, // lowercase with underscores
});

metadataSchema.parse({
  author: "John Doe",
  version: "1.0.0",
  category: "utility",
}); // ✅ Valid
```

### 4. Complex Object Records (Your Use Case)

```typescript
// Define the value schema for course information
const courseInfoSchema = z.object({
  professor: z.string(),
  cfu: z.number(),
});

// Create a record schema with specific course constraints
const coursesSchema = pz.RecordRequired(courseInfoSchema, {
  msg: "Courses",
  allowedKeys: ["Computer Science", "Mathematics", "Literature"],
  requiredKeys: ["Computer Science", "Mathematics", "Literature"],
});

// Your original TypeScript type is fully supported
type Course = "Computer Science" | "Mathematics" | "Literature";
interface CourseInfo {
  professor: string;
  cfu: number;
}

const courses: Record<Course, CourseInfo> = {
  "Computer Science": { professor: "Mary Jane", cfu: 12 },
  "Mathematics": { professor: "John Doe", cfu: 12 },
  "Literature": { professor: "Frank Purple", cfu: 12 }
};

coursesSchema.parse(courses); // ✅ Valid
```

## Advanced Examples

### 1. Multi-level Validation

```typescript
const serviceConfigSchema = z.object({
  name: z.string(),
  config: z.object({
    enabled: z.boolean(),
    port: z.number(),
  }),
});

const servicesSchema = pz.RecordRequired(serviceConfigSchema, {
  msg: "Services Configuration",
  minEntries: 1,
  keyPattern: /^[a-z][a-z0-9-]*$/, // kebab-case service names
});

servicesSchema.parse({
  "web-server": {
    name: "Web Server",
    config: { enabled: true, port: 3000 },
  },
  "api-gateway": {
    name: "API Gateway", 
    config: { enabled: true, port: 8080 },
  },
}); // ✅ Valid
```

### 2. Dynamic Form Validation

```typescript
const formFieldSchema = z.union([z.string(), z.number(), z.boolean()]);

const dynamicFormSchema = pz.RecordOptional(formFieldSchema, {
  msg: "Form Data",
  maxEntries: 50,
});

dynamicFormSchema.parse({
  firstName: "John",
  lastName: "Doe", 
  age: 30,
  newsletter: true,
}); // ✅ Valid
```

### 3. Constraint Precedence

```typescript
// allowedKeys takes precedence over keyPattern
const precedenceSchema = pz.RecordOptional(z.string(), {
  msg: "Settings",
  allowedKeys: ["validKey"], // This constraint is applied
  keyPattern: /^invalid_pattern$/, // This is ignored when allowedKeys is present
});

precedenceSchema.parse({ validKey: "value" }); // ✅ Valid
precedenceSchema.parse({ invalidKey: "value" }); // ❌ Invalid (not in allowedKeys)
```

## Integration with pz Schemas

Record schemas work seamlessly with all other Phantom Zod schemas:

```typescript
// Using pz schemas as values
const userPreferencesSchema = pz.RecordOptional(pz.StringOptional(), "User Preferences");

// Complex integration
const applicationStateSchema = pz.RecordRequired(
  z.union([
    pz.StringRequired(),
    pz.NumberRequired(), 
    pz.BooleanRequired(),
    z.object({
      id: pz.UuidV4Required(),
      timestamp: pz.DateStringRequired(),
    }),
  ]),
  "Application State"
);
```

## Error Handling

Record schemas provide detailed, localized error messages:

```typescript
const schema = pz.RecordRequired(z.string(), {
  msg: "Configuration",
  allowedKeys: ["host", "port"],
  requiredKeys: ["host"],
});

// Various error scenarios
schema.parse({}); 
// ❌ "Configuration must have at least 1 entries"

schema.parse({ port: "3000" }); 
// ❌ "Configuration is missing required keys: host"

schema.parse({ host: "localhost", invalidKey: "value" }); 
// ❌ "Configuration contains invalid keys (allowed: host, port)"

schema.parse({ host: "localhost", port: 123 }); 
// ❌ "Configuration must be a valid record (key-value object)"
```

### Chainable .default() Support

Record schemas fully support Zod's `.default()` chaining:

```typescript
const configWithDefaults = pz.RecordOptional(z.string(), "Configuration")
  .default({ theme: "light", lang: "en" });

configWithDefaults.parse(undefined); 
// ✅ { theme: "light", lang: "en" }
```

## Performance Notes

- Record validation scales well with the number of entries
- Key constraint validation is optimized for common patterns
- Value schema validation is delegated to the provided Zod schema

## TypeScript Integration

Record schemas provide full TypeScript type inference:

```typescript
const schema = pz.RecordRequired(z.number(), "Counters");
type CounterType = z.infer<typeof schema>; // Record<string, number>

// With complex value types
const complexSchema = pz.RecordOptional(
  z.object({ count: z.number(), active: z.boolean() }),
  "Complex Record"
);
type ComplexType = z.infer<typeof complexSchema>; 
// Record<string, { count: number; active: boolean }> | undefined
```

Record schemas complete Phantom Zod's comprehensive validation library, providing the missing piece for dynamic key-value object validation with the same consistent API, localization support, and error handling quality you expect from all Phantom Zod schemas.
