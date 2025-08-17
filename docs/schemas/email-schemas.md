# Email Schemas

Email schemas provide comprehensive email address validation using Zod's built-in email validation with automatic trimming, custom patterns, and multiple validation standards.

## Overview

All email schemas in Phantom Zod use Zod's robust email validation engine with additional features:

- **Automatic trimming** of whitespace
- **Multiple validation patterns** (HTML5, RFC 5322, Unicode)
- **Custom pattern support** for domain-specific validation
- **Consistent error handling** through localization
- **Type safety** with TypeScript inference

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, all email schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const emailTraditional = pz.EmailRequired({ msg: "Email Address" });

// Simplified string parameter (equivalent)
const emailSimple = pz.EmailRequired("Email Address");

// Both produce the same validation behavior
emailTraditional.parse("user@example.com"); // ✅ "user@example.com"
emailSimple.parse("user@example.com");      // ✅ "user@example.com"

// Error messages are identical
emailTraditional.parse("invalid");         // ❌ "Email Address must be a valid email address"
emailSimple.parse("invalid");              // ❌ "Email Address must be a valid email address"
```

**When to use string parameters:**
- Basic field name specification only
- Default validation patterns are sufficient
- Cleaner, more concise code

**When to use options objects:**
- Custom validation patterns needed (`pattern`)
- Custom message types (`MsgType.Message`)
- Advanced localization configurations

## Available Schemas

### Core Email Schemas

#### EmailRequired

Creates a required email schema that validates email format and trims whitespace.

```typescript
pz.EmailRequired(options?: EmailSchemaOptions)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `msg` | `string` | `"Email Address"` | Field name or custom error message |
| `msgType` | `MsgType` | `MsgType.FieldName` | Message type for localization |
| `pattern` | `RegExp` | `undefined` | Custom regex pattern for validation |

**Examples:**

```typescript
import { pz } from "phantom-zod";

const schema = pz.EmailRequired({ msg: "Email Address" });

// Valid inputs
schema.parse("user@example.com");         // ✅ "user@example.com"
schema.parse("  test@domain.org  ");      // ✅ "test@domain.org" (trimmed)
schema.parse("name+tag@company.co.uk");   // ✅ Valid international domain

// Invalid inputs
schema.parse("");                         // ❌ Error: Email Address is required
schema.parse("invalid-email");            // ❌ Error: Email Address must be a valid email address
schema.parse("@domain.com");              // ❌ Error: Email Address must be a valid email address
schema.parse("user@");                    // ❌ Error: Email Address must be a valid email address
```

**With Custom Pattern:**

```typescript
const companyEmailSchema = pz.EmailRequired({
  msg: "Company Email",
  pattern: /^[a-z0-9._%+-]+@company\.com$/i
});

companyEmailSchema.parse("john@company.com");     // ✅ Valid
companyEmailSchema.parse("user@otherdomain.com"); // ❌ Error: Company Email must be a valid email address
```

#### EmailOptional

Creates an optional email schema that accepts valid emails or undefined values.

```typescript
pz.EmailOptional(options?: EmailSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.EmailOptional({ msg: "Secondary Email" });

// Valid inputs
schema.parse("user@example.com");    // ✅ "user@example.com"
schema.parse(undefined);             // ✅ undefined
schema.parse("");                    // ✅ "" (empty after trim)
schema.parse("   ");                 // ✅ "" (trimmed to empty)

// Invalid inputs
schema.parse("invalid-email");       // ❌ Error: Secondary Email must be a valid email address
```

### Specialized Email Schemas

#### HTML5 Email Validation

Uses the same validation pattern that browsers use for `input[type=email]` fields.

##### Html5EmailRequired

```typescript
pz.Html5EmailRequired(options?: Omit<EmailSchemaOptions, 'pattern'>)
```

**Examples:**

```typescript
const schema = pz.Html5EmailRequired({ msg: "Registration Email" });

schema.parse("user@example.com");           // ✅ Valid
schema.parse("test+tag@domain.co.uk");      // ✅ Valid (supports plus addressing)
schema.parse("user.name@subdomain.org");    // ✅ Valid
```

##### Html5EmailOptional

```typescript
pz.Html5EmailOptional(options?: Omit<EmailSchemaOptions, 'pattern'>)
```

#### RFC 5322 Email Validation

Provides the most comprehensive email validation following the full RFC 5322 specification.

##### Rfc5322EmailRequired

```typescript
pz.Rfc5322EmailRequired(options?: Omit<EmailSchemaOptions, 'pattern'>)
```

**Examples:**

```typescript
const schema = pz.Rfc5322EmailRequired({ msg: "Business Email" });

schema.parse("user@example.com");                    // ✅ Valid
schema.parse("very.long.address@example.com");       // ✅ Valid
schema.parse("user+tag+more@subdomain.domain.com");  // ✅ Valid
```

**Use Cases:**
- API endpoints requiring strict email compliance
- Business applications with rigorous validation requirements
- Systems integrating with email service providers

##### Rfc5322EmailOptional

```typescript
pz.Rfc5322EmailOptional(options?: Omit<EmailSchemaOptions, 'pattern'>)
```

#### Unicode Email Validation

Supports international domain names and Unicode characters for global applications.

##### UnicodeEmailRequired

```typescript
pz.UnicodeEmailRequired(options?: Omit<EmailSchemaOptions, 'pattern'>)
```

**Examples:**

```typescript
const schema = pz.UnicodeEmailRequired({ msg: "International Email" });

schema.parse("user@example.com");        // ✅ Valid
schema.parse("用户@例え.テスト");          // ✅ Valid (international characters)
schema.parse("müller@österreich.at");    // ✅ Valid (accented characters)
```

**Use Cases:**
- International applications
- Multi-language platforms
- Global e-commerce systems

##### UnicodeEmailOptional

```typescript
pz.UnicodeEmailOptional(options?: Omit<EmailSchemaOptions, 'pattern'>)
```

## Type Definitions

```typescript
interface EmailSchemaOptions {
  msg?: string;           // Field name or custom message
  msgType?: MsgType;      // Message formatting type
  pattern?: RegExp;       // Custom email validation pattern
}

// Inferred types
type EmailRequired = string;        // Always a valid email string
type EmailOptional = string | undefined;  // Valid email or undefined
```

## Validation Standards Comparison

| Schema | Standard | Use Case | Strictness | International |
|--------|----------|----------|------------|---------------|
| `EmailRequired` | Zod Default | General purpose | Medium | Partial |
| `Html5EmailRequired` | HTML5 Spec | Web forms | Medium | Partial |
| `Rfc5322EmailRequired` | RFC 5322 | Business/API | High | Limited |
| `UnicodeEmailRequired` | Unicode-friendly | Global apps | Medium | Full |

## Common Patterns

### User Registration

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

const registrationSchema = z.object({
  email: pz.EmailRequired({ msg: "Email Address" }),
  confirmEmail: pz.EmailRequired({ msg: "Confirm Email" }),
  alternateEmail: pz.EmailOptional({ msg: "Alternate Email" }),
}).refine(data => data.email === data.confirmEmail, {
  message: "Email addresses must match",
  path: ["confirmEmail"]
});
```

### Business Contact Form

```typescript
const contactSchema = z.object({
  name: pz.StringRequired({ msg: "Full Name" }),
  companyEmail: pz.Rfc5322EmailRequired({ msg: "Business Email" }),
  personalEmail: pz.EmailOptional({ msg: "Personal Email" }),
  company: pz.StringRequired({ msg: "Company Name" }),
});
```

### International User Profile

```typescript
const profileSchema = z.object({
  displayName: pz.StringRequired({ msg: "Display Name" }),
  email: pz.UnicodeEmailRequired({ msg: "Email Address" }),
  backupEmail: pz.UnicodeEmailOptional({ msg: "Backup Email" }),
  country: pz.StringRequired({ msg: "Country" }),
});
```

### Domain-Specific Validation

```typescript
// Company-only email validation
const internalUserSchema = z.object({
  employeeId: pz.StringRequired({ msg: "Employee ID" }),
  email: pz.EmailRequired({ 
    msg: "Corporate Email",
    pattern: /^[a-zA-Z0-9._%+-]+@(company\.com|subsidiary\.co)$/
  }),
});

// Educational institution emails
const studentSchema = z.object({
  studentId: pz.StringRequired({ msg: "Student ID" }),
  email: pz.EmailRequired({
    msg: "University Email", 
    pattern: /^[a-zA-Z0-9._%+-]+@.*\.(edu|ac\.[a-z]{2})$/
  }),
});
```

## Error Messages

Email schemas provide specific error messages based on validation failures:

### Default Messages (English)

- **Required:** `"[Field Name] is required"`
- **Format:** `"[Field Name] must be a valid email address"`
- **Custom Pattern:** `"[Field Name] must be a valid email address"` (uses the same message)

### Custom Error Messages

```typescript
import { MsgType } from "phantom-zod";

const schema = pz.EmailRequired({
  msg: "Please enter a valid email address in the format: user@domain.com",
  msgType: MsgType.Message
});
```

## Best Practices

### 1. Choose the Right Validation Level

```typescript
// For web forms - use HTML5 validation
const webFormEmail = pz.Html5EmailRequired({ msg: "Email" });

// For APIs - use RFC 5322 for strictness
const apiEmail = pz.Rfc5322EmailRequired({ msg: "Email" });

// For global apps - use Unicode support
const globalEmail = pz.UnicodeEmailRequired({ msg: "Email" });
```

### 2. Use Domain Restrictions Carefully

```typescript
// Good: Clear business requirement
const corporateEmail = pz.EmailRequired({
  msg: "Corporate Email",
  pattern: /^[a-zA-Z0-9._%+-]+@company\.com$/i
});

// Consider: May exclude valid use cases
const restrictedEmail = pz.EmailRequired({
  msg: "Email",
  pattern: /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/  // Too restrictive
});
```

### 3. Handle Optional Emails Appropriately

```typescript
const userPreferencesSchema = z.object({
  primaryEmail: pz.EmailRequired({ msg: "Primary Email" }),    // Always required
  backupEmail: pz.EmailOptional({ msg: "Backup Email" }),      // Optional for recovery
  marketingEmail: pz.EmailOptional({ msg: "Marketing Email" }), // Optional for promotions
});
```

### 4. Consider Internationalization Early

```typescript
// If you might expand internationally, start with Unicode support
const futureProofSchema = z.object({
  email: pz.UnicodeEmailRequired({ msg: "Email Address" }),
});
```

## Integration Examples

### With React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  email: pz.EmailRequired({ msg: "Email Address" }),
  confirmEmail: pz.EmailRequired({ msg: "Confirm Email" }),
}).refine(data => data.email === data.confirmEmail, {
  message: "Emails must match",
  path: ["confirmEmail"]
});

const EmailForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema)
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input 
        {...register("email")} 
        type="email" 
        placeholder="Email Address" 
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input 
        {...register("confirmEmail")} 
        type="email" 
        placeholder="Confirm Email" 
      />
      {errors.confirmEmail && <span>{errors.confirmEmail.message}</span>}
    </form>
  );
};
```

### With Express.js API

```typescript
import express from "express";

const newsletterSignupSchema = z.object({
  email: pz.Html5EmailRequired({ msg: "Email Address" }),
  preferences: z.object({
    frequency: pz.EnumRequired(["daily", "weekly", "monthly"], { 
      msg: "Email Frequency" 
    }),
    categories: pz.StringArrayOptional({ msg: "Categories" }),
  }),
});

app.post("/newsletter/signup", (req, res) => {
  try {
    const signupData = newsletterSignupSchema.parse(req.body);
    // Email is automatically trimmed and validated
    console.log("Valid email:", signupData.email);
  } catch (error) {
    res.status(400).json({ 
      error: "Validation failed", 
      issues: error.issues 
    });
  }
});
```

## Utility Function

### Email Validation Helper

The email schemas also export a utility function for programmatic validation:

```typescript
import { isEmail } from "phantom-zod";

// Basic validation
const isValidEmail = isEmail("user@example.com"); // true
const isInvalidEmail = isEmail("invalid-email");  // false

// With custom pattern
const isCompanyEmail = isEmail("user@company.com", /^.+@company\.com$/); // true
```

## See Also

- [String Schemas](string-schemas.md) - Basic string validation
- [URL Schemas](url-schemas.md) - URL validation
- [User Schemas](user-schemas.md) - User credential validation
- [Form Validation Examples](../examples/form-validation.md) - Practical form usage
- [API Validation Examples](../examples/api-validation.md) - API endpoint validation
