# String Schemas

String schemas provide validation for text data with automatic trimming, length constraints, and customizable error messages.

## Overview

All string schemas in Phantom Zod automatically trim whitespace and provide consistent error handling through the localization system. They support both required and optional validation patterns.

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, all string schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const nameTraditional = pz.StringRequired({ msg: "Full Name" });

// Simplified string parameter (equivalent)
const nameSimple = pz.StringRequired("Full Name");

// Both produce the same validation behavior
nameTraditional.parse("John Doe"); // ✅ "John Doe"
nameSimple.parse("John Doe");      // ✅ "John Doe"

// Error messages are identical
nameTraditional.parse("");        // ❌ "Full Name is required"
nameSimple.parse("");             // ❌ "Full Name is required"
```

**When to use string parameters:**
- Basic field name specification only
- Cleaner, more concise code
- Default constraints are sufficient

**When to use options objects:**
- Length constraints needed (`minLength`, `maxLength`)
- Custom message types (`MsgType.Message`)
- Locale-specific configurations

## Available Schemas

### StringRequired

Creates a required string schema that trims whitespace and validates non-empty content.

```typescript
pz.StringRequired(options?: StringSchemaOptions)
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `msg` | `string` | `"Value"` | Field name or custom error message |
| `msgType` | `MsgType` | `MsgType.FieldName` | Message type for localization |
| `minLength` | `number` | `1` | Minimum string length after trimming |
| `maxLength` | `number` | `undefined` | Maximum string length after trimming |

#### Examples

**Basic Usage:**
```typescript
import { pz } from "phantom-zod";

// Options object approach
const schema = pz.StringRequired({ msg: "Full Name" });

// String parameter approach (v1.5+)
const schemaSimple = pz.StringRequired("Full Name");

// Valid inputs (both schemas work identically)
schema.parse("John Doe");        // ✅ "John Doe"
schema.parse("  Alice  ");       // ✅ "Alice" (trimmed)
schema.parse("X");               // ✅ "X"

// Invalid inputs
schema.parse("");                // ❌ Error: Full Name is required
schema.parse("   ");             // ❌ Error: Full Name is required
schema.parse(null);              // ❌ Error: Full Name must be a string
schema.parse(undefined);         // ❌ Error: Full Name is required
```

**With Length Constraints:**
```typescript
const usernameSchema = pz.StringRequired({ 
  msg: "Username", 
  minLength: 3, 
  maxLength: 20 
});

// Valid inputs
usernameSchema.parse("alice");            // ✅ "alice"
usernameSchema.parse("  bob123  ");       // ✅ "bob123"
usernameSchema.parse("a".repeat(20));     // ✅ Valid (exactly 20 chars)

// Invalid inputs
usernameSchema.parse("ab");               // ❌ Error: Username must be at least 3 characters
usernameSchema.parse("a".repeat(21));     // ❌ Error: Username must be at most 20 characters
```

**Custom Error Message:**
```typescript
import { MsgType } from "phantom-zod";

const schema = pz.StringRequired({
  msg: "Please enter your full name",
  msgType: MsgType.Message
});

schema.parse("");  // ❌ Error: Please enter your full name
```

### StringOptional

Creates an optional string schema that allows undefined values and converts them to empty strings.

```typescript
pz.StringOptional(options?: StringSchemaOptions)
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `msg` | `string` | `"Value"` | Field name or custom error message |
| `msgType` | `MsgType` | `MsgType.FieldName` | Message type for localization |
| `minLength` | `number` | `undefined` | Minimum string length after trimming |
| `maxLength` | `number` | `undefined` | Maximum string length after trimming |

#### Examples

**Basic Usage:**
```typescript
const schema = pz.StringOptional({ msg: "Middle Name" });

// Valid inputs
schema.parse("James");           // ✅ "James"
schema.parse("  Mary  ");        // ✅ "Mary" (trimmed)
schema.parse("");                // ✅ ""
schema.parse("   ");             // ✅ "" (trimmed to empty)
schema.parse(undefined);         // ✅ ""
schema.parse(null);              // ❌ Error: Middle Name must be a string
```

**With Length Constraints:**
```typescript
const nicknameSchema = pz.StringOptional({ 
  msg: "Nickname", 
  maxLength: 15 
});

// Valid inputs
nicknameSchema.parse("Bob");               // ✅ "Bob"
nicknameSchema.parse("");                  // ✅ ""
nicknameSchema.parse(undefined);           // ✅ ""

// Invalid inputs
nicknameSchema.parse("VeryLongNickname123"); // ❌ Error: Nickname must be at most 15 characters
```

## Type Definitions

```typescript
interface StringSchemaOptions {
  msg?: string;           // Field name or custom message
  msgType?: MsgType;      // Message formatting type
  minLength?: number;     // Minimum length constraint
  maxLength?: number;     // Maximum length constraint
}

// Inferred types
type StringRequired = string;      // Always a string
type StringOptional = string;      // Always a string (undefined converted to "")
```

## Common Patterns

### Form Field Validation

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

const userProfileSchema = z.object({
  firstName: pz.StringRequired({ 
    msg: "First Name", 
    maxLength: 50 
  }),
  lastName: pz.StringRequired({ 
    msg: "Last Name", 
    maxLength: 50 
  }),
  middleName: pz.StringOptional({ 
    msg: "Middle Name", 
    maxLength: 50 
  }),
  displayName: pz.StringOptional({ 
    msg: "Display Name", 
    minLength: 2,
    maxLength: 30 
  }),
});

type UserProfile = z.infer<typeof userProfileSchema>;
```

### Username Validation

```typescript
const usernameSchema = pz.StringRequired({
  msg: "Username",
  minLength: 3,
  maxLength: 20
});

// Usage in registration form
const registrationSchema = z.object({
  username: usernameSchema,
  email: pz.EmailRequired({ msg: "Email Address" }),
  password: pz.StringRequired({ 
    msg: "Password", 
    minLength: 8 
  }),
});
```

### Content Validation

```typescript
const articleSchema = z.object({
  title: pz.StringRequired({ 
    msg: "Article Title", 
    minLength: 5,
    maxLength: 200 
  }),
  subtitle: pz.StringOptional({ 
    msg: "Subtitle", 
    maxLength: 300 
  }),
  content: pz.StringRequired({ 
    msg: "Article Content", 
    minLength: 100 
  }),
  tags: pz.StringOptional({ 
    msg: "Tags" 
  }),
});
```

## Error Messages

String schemas generate localized error messages based on the validation failure:

### Default Messages (English)

- **Required validation:** `"[Field Name] is required"`
- **Type validation:** `"[Field Name] must be a string"`
- **Empty validation:** `"[Field Name] cannot be empty"`
- **Minimum length:** `"[Field Name] must be at least [min] characters"`
- **Maximum length:** `"[Field Name] must be at most [max] characters"`

### Custom Messages

Use `MsgType.Message` to provide complete custom error messages:

```typescript
const schema = pz.StringRequired({
  msg: "Please provide a valid name between 2-50 characters",
  msgType: MsgType.Message,
  minLength: 2,
  maxLength: 50
});
```

## Best Practices

### 1. Use Descriptive Field Names

```typescript
// Good
const schema = pz.StringRequired({ msg: "Customer Name" });

// Avoid
const schema = pz.StringRequired({ msg: "name" });
```

### 2. Set Appropriate Length Constraints

```typescript
// Database-aware constraints
const emailSchema = pz.StringRequired({ 
  msg: "Email", 
  maxLength: 255  // Common email column limit
});

const nameSchema = pz.StringRequired({ 
  msg: "Full Name", 
  minLength: 2,
  maxLength: 100 
});
```

### 3. Consider User Experience

```typescript
// Allow reasonable flexibility for names
const nameSchema = pz.StringRequired({ 
  msg: "Name", 
  minLength: 1,     // Single character names exist
  maxLength: 100    // Accommodate long names
});

// Be restrictive for usernames
const usernameSchema = pz.StringRequired({ 
  msg: "Username", 
  minLength: 3,     // Prevent very short usernames
  maxLength: 20     // Keep it reasonable
});
```

### 4. Use Optional Appropriately

```typescript
const contactSchema = z.object({
  firstName: pz.StringRequired({ msg: "First Name" }),     // Always required
  middleName: pz.StringOptional({ msg: "Middle Name" }),   // Commonly optional
  lastName: pz.StringRequired({ msg: "Last Name" }),       // Always required
  nickname: pz.StringOptional({ msg: "Nickname" }),        // Optional
});
```

## Integration Examples

### With React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: pz.StringRequired({ msg: "Full Name", maxLength: 100 }),
  bio: pz.StringOptional({ msg: "Biography", maxLength: 500 }),
});

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema)
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register("name")} placeholder="Full Name" />
      {errors.name && <span>{errors.name.message}</span>}
      
      <textarea {...register("bio")} placeholder="Biography" />
      {errors.bio && <span>{errors.bio.message}</span>}
    </form>
  );
};
```

### With Express.js API

```typescript
import express from "express";

const createUserSchema = z.object({
  name: pz.StringRequired({ msg: "Name", maxLength: 100 }),
  email: pz.EmailRequired({ msg: "Email" }),
  company: pz.StringOptional({ msg: "Company", maxLength: 200 }),
});

app.post("/users", (req, res) => {
  try {
    const userData = createUserSchema.parse(req.body);
    // Process validated and trimmed data
    console.log(userData); // All strings are trimmed automatically
  } catch (error) {
    res.status(400).json({ errors: error.issues });
  }
});
```

## See Also

- [Email Schemas](email-schemas.md) - Email-specific string validation
- [URL Schemas](url-schemas.md) - URL string validation  
- [Form Validation Examples](../examples/form-validation.md) - Practical form examples
- [Error Handling](../api/error-handling.md) - Custom error messages
