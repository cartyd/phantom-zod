# Phone Schemas

Phone schemas provide comprehensive phone number validation with automatic normalization, format conversion, and support for both E.164 international format and national US format.

## Overview

All phone schemas in Phantom Zod provide:

- **Automatic normalization** to E.164 (`+11234567890`) or National (`1234567890`) format
- **Flexible input parsing** - accepts various common phone formats
- **Format validation** - ensures output matches the specified format
- **Consistent error handling** through localization
- **Type safety** with TypeScript inference

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, all phone schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const phoneTraditional = pz.PhoneRequired({ msg: "Phone Number" });

// Simplified string parameter (equivalent)
const phoneSimple = pz.PhoneRequired("Phone Number");

// Both produce the same validation behavior
const phoneInput = "(555) 123-4567";
phoneTraditional.parse(phoneInput); // ✅ "+15551234567"
phoneSimple.parse(phoneInput);      // ✅ "+15551234567"

// Error messages are identical
phoneTraditional.parse("invalid"); // ❌ "Phone Number must be a valid phone number"
phoneSimple.parse("invalid");      // ❌ "Phone Number must be a valid phone number"
```

**When to use string parameters:**
- Basic field name specification only
- Default E.164 format is sufficient
- Cleaner, more concise code

**When to use options objects:**
- Need National format (`PhoneFormat.National`)
- Custom message types (`MsgType.Message`)
- Advanced localization configurations

## Available Schemas

### PhoneRequired

Creates a required phone schema that validates and normalizes phone numbers to the specified format.

```typescript
pz.PhoneRequired(options?: PhoneSchemaOptions)
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `msg` | `string` | `"Phone"` | Field name or custom error message |
| `msgType` | `MsgType` | `MsgType.FieldName` | Message type for localization |
| `format` | `PhoneFormat` | `PhoneFormat.E164` | Output format (E164 or National) |

#### Examples

**Basic Usage (E.164 Format):**
```typescript
import { pz } from "phantom-zod";

const schema = pz.PhoneRequired({ msg: "Contact Phone" });

// Valid inputs - all normalized to E.164
schema.parse("(555) 123-4567");    // ✅ "+15551234567"
schema.parse("555-123-4567");      // ✅ "+15551234567"
schema.parse("555.123.4567");      // ✅ "+15551234567"
schema.parse("5551234567");        // ✅ "+15551234567"
schema.parse("1-555-123-4567");    // ✅ "+15551234567"
schema.parse("+1 555 123 4567");   // ✅ "+15551234567"

// Invalid inputs
schema.parse("");                   // ❌ Error: Contact Phone is required
schema.parse("123");                // ❌ Error: Contact Phone must be a valid phone number
schema.parse("abc-def-ghij");       // ❌ Error: Contact Phone must be a valid phone number
```

**National Format:**
```typescript
import { pz, PhoneFormat } from "phantom-zod";

const schema = pz.PhoneRequired({ 
  msg: "Business Phone", 
  format: PhoneFormat.National 
});

// Valid inputs - all normalized to National
schema.parse("(555) 123-4567");    // ✅ "5551234567"
schema.parse("555-123-4567");      // ✅ "5551234567"
schema.parse("+1 555 123 4567");   // ✅ "5551234567"
schema.parse("15551234567");       // ✅ "5551234567"

// Invalid inputs
schema.parse("");                   // ❌ Error: Business Phone is required
schema.parse("555-123");            // ❌ Error: Business Phone must be a valid phone number
```

**Custom Error Message:**
```typescript
import { pz, MsgType } from "phantom-zod";

const schema = pz.PhoneRequired({
  msg: "Please enter a valid US phone number",
  msgType: MsgType.Message
});

schema.parse("invalid");  // ❌ Error: Please enter a valid US phone number
```

### PhoneOptional

Creates an optional phone schema that accepts valid phone numbers or undefined values.

```typescript
pz.PhoneOptional(options?: PhoneSchemaOptions)
```

#### Examples

**Basic Usage:**
```typescript
const schema = pz.PhoneOptional({ msg: "Mobile Phone" });

// Valid inputs
schema.parse("(555) 123-4567");    // ✅ "+15551234567"
schema.parse("555.123.4567");      // ✅ "+15551234567"
schema.parse(undefined);           // ✅ undefined
schema.parse("");                  // ✅ undefined (empty after trim)
schema.parse("   ");               // ✅ undefined (trimmed to empty)

// Invalid inputs
schema.parse("123");               // ❌ Error: Mobile Phone must be a valid phone number
schema.parse("invalid-phone");     // ❌ Error: Mobile Phone must be a valid phone number
```

**National Format:**
```typescript
const schema = pz.PhoneOptional({ 
  msg: "Secondary Phone", 
  format: PhoneFormat.National 
});

schema.parse("(555) 123-4567");    // ✅ "5551234567"
schema.parse(undefined);           // ✅ undefined
schema.parse("");                  // ✅ undefined
```

## Phone Format Options

### PhoneFormat Enum

```typescript
import { PhoneFormat } from "phantom-zod";

enum PhoneFormat {
  E164 = "e164",      // International format: +15551234567
  National = "national" // US national format: 5551234567
}
```

### E.164 Format (Default)

International standard format with country code.

```typescript
const schema = pz.PhoneRequired({ format: PhoneFormat.E164 });
// or simply (E164 is default):
const schema = pz.PhoneRequired({ msg: "Phone" });

// All inputs normalize to: "+15551234567"
```

**Characteristics:**
- Always includes country code (`+1` for US)
- Length: 12 characters (including +)
- Format: `+1XXXXXXXXXX`
- Best for: International systems, APIs, databases

### National Format

US domestic format without country code.

```typescript
const schema = pz.PhoneRequired({ format: PhoneFormat.National });

// All inputs normalize to: "5551234567"
```

**Characteristics:**
- No country code prefix
- Length: 10 characters
- Format: `XXXXXXXXXX`
- Best for: US-only applications, display purposes

## Type Definitions

```typescript
interface PhoneSchemaOptions {
  msg?: string;           // Field name or custom message
  msgType?: MsgType;      // Message formatting type
  format?: PhoneFormat;   // Output format (E164 or National)
}

enum PhoneFormat {
  E164 = "e164",
  National = "national"
}

// Inferred types
type PhoneRequired = string;              // Always a valid phone string
type PhoneOptional = string | undefined;  // Valid phone or undefined
```

## Input Format Support

The schemas accept various common phone number input formats:

| Input Format | Example | Normalized (E164) | Normalized (National) |
|-------------|---------|-------------------|----------------------|
| Parentheses | `(555) 123-4567` | `+15551234567` | `5551234567` |
| Hyphens | `555-123-4567` | `+15551234567` | `5551234567` |
| Dots | `555.123.4567` | `+15551234567` | `5551234567` |
| Spaces | `555 123 4567` | `+15551234567` | `5551234567` |
| Plain digits | `5551234567` | `+15551234567` | `5551234567` |
| With country | `1-555-123-4567` | `+15551234567` | `5551234567` |
| E164 format | `+1 555 123 4567` | `+15551234567` | `5551234567` |
| International | `+15551234567` | `+15551234567` | `5551234567` |

## Common Patterns

### User Profile

```typescript
import { z } from "zod";
import { pz, PhoneFormat } from "phantom-zod";

const userProfileSchema = z.object({
  name: pz.StringRequired({ msg: "Full Name" }),
  email: pz.EmailRequired({ msg: "Email Address" }),
  primaryPhone: pz.PhoneRequired({ 
    msg: "Primary Phone",
    format: PhoneFormat.E164  // Store in international format
  }),
  secondaryPhone: pz.PhoneOptional({ 
    msg: "Secondary Phone",
    format: PhoneFormat.E164
  }),
  workPhone: pz.PhoneOptional({ 
    msg: "Work Phone",
    format: PhoneFormat.National  // Display format for US users
  }),
});

type UserProfile = z.infer<typeof userProfileSchema>;
```

### Contact Form

```typescript
const contactFormSchema = z.object({
  firstName: pz.StringRequired({ msg: "First Name" }),
  lastName: pz.StringRequired({ msg: "Last Name" }),
  email: pz.EmailRequired({ msg: "Email Address" }),
  phone: pz.PhoneRequired({ 
    msg: "Phone Number",
    format: PhoneFormat.E164
  }),
  preferredContactMethod: pz.EnumRequired(["email", "phone"], {
    msg: "Preferred Contact Method"
  }),
});
```

### Business Registration

```typescript
const businessSchema = z.object({
  companyName: pz.StringRequired({ msg: "Company Name" }),
  mainPhone: pz.PhoneRequired({ 
    msg: "Main Phone Number",
    format: PhoneFormat.E164
  }),
  faxNumber: pz.PhoneOptional({ 
    msg: "Fax Number",
    format: PhoneFormat.National
  }),
  emergencyContact: z.object({
    name: pz.StringRequired({ msg: "Emergency Contact Name" }),
    phone: pz.PhoneRequired({ 
      msg: "Emergency Phone",
      format: PhoneFormat.E164
    }),
  }),
});
```

### Multi-format Support

```typescript
// Store in E164 for database, display in National for UI
const userPreferencesSchema = z.object({
  // Database storage - use E164
  phoneForStorage: pz.PhoneRequired({ 
    msg: "Phone Number",
    format: PhoneFormat.E164
  }),
  
  // UI display - use National  
  phoneForDisplay: pz.PhoneOptional({ 
    msg: "Display Phone",
    format: PhoneFormat.National
  }),
});
```

## Error Messages

Phone schemas provide specific error messages for different validation failures:

### Default Messages (English)

- **Required:** `"[Field Name] is required"`
- **Invalid:** `"[Field Name] must be a valid phone number"`
- **Format-specific E164:** `"[Field Name] must be in E.164 format (e.g., +15551234567)"`
- **Format-specific National:** `"[Field Name] must be in national format (e.g., 5551234567)"`

### Custom Error Messages

```typescript
import { MsgType } from "phantom-zod";

const schema = pz.PhoneRequired({
  msg: "Please enter a valid US phone number (e.g., (555) 123-4567)",
  msgType: MsgType.Message
});
```

## Best Practices

### 1. Choose Format Based on Use Case

```typescript
// For APIs and database storage - use E164
const apiSchema = z.object({
  userPhone: pz.PhoneRequired({ 
    msg: "Phone",
    format: PhoneFormat.E164  // International standard
  })
});

// For US-centric UI display - use National
const displaySchema = z.object({
  displayPhone: pz.PhoneOptional({ 
    msg: "Phone",
    format: PhoneFormat.National  // Familiar to US users
  })
});
```

### 2. Handle Optional Phones Appropriately

```typescript
const contactPreferences = z.object({
  primaryPhone: pz.PhoneRequired({ msg: "Primary Phone" }),    // Always required
  mobilePhone: pz.PhoneOptional({ msg: "Mobile Phone" }),     // Optional backup
  workPhone: pz.PhoneOptional({ msg: "Work Phone" }),         // Optional business contact
});
```

### 3. Use Descriptive Field Names

```typescript
// Good - Clear purpose
const schema = pz.PhoneRequired({ msg: "Emergency Contact Phone" });

// Better - More specific context
const emergencySchema = z.object({
  emergencyContactPhone: pz.PhoneRequired({ msg: "Emergency Contact Phone" }),
  hospitalPhone: pz.PhoneOptional({ msg: "Preferred Hospital Phone" }),
});
```

### 4. Consider Data Consistency

```typescript
// Consistent format for all phone fields in a system
const consistentFormats = z.object({
  homePhone: pz.PhoneOptional({ format: PhoneFormat.E164 }),
  workPhone: pz.PhoneOptional({ format: PhoneFormat.E164 }),
  mobilePhone: pz.PhoneRequired({ format: PhoneFormat.E164 }),
});
```

### 5. Validation Before Display

```typescript
// Transform for display after validation
const processedPhone = phoneSchema.parse(userInput);  // "+15551234567"
const displayPhone = processedPhone.replace(/^\+1/, "").replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
// Result: "(555) 123-4567"
```

## Integration Examples

### With React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: pz.StringRequired({ msg: "Full Name" }),
  phone: pz.PhoneRequired({ 
    msg: "Phone Number",
    format: PhoneFormat.E164
  }),
  alternatePhone: pz.PhoneOptional({ 
    msg: "Alternate Phone",
    format: PhoneFormat.E164
  }),
});

const PhoneForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = (data) => {
    console.log("Normalized phones:", data);
    // data.phone is now in E164 format: "+15551234567"
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input 
        {...register("name")} 
        placeholder="Full Name" 
      />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input 
        {...register("phone")} 
        type="tel" 
        placeholder="Phone Number (e.g., (555) 123-4567)" 
      />
      {errors.phone && <span>{errors.phone.message}</span>}
      
      <input 
        {...register("alternatePhone")} 
        type="tel" 
        placeholder="Alternate Phone (optional)" 
      />
      {errors.alternatePhone && <span>{errors.alternatePhone.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

### With Express.js API

```typescript
import express from "express";

const userRegistrationSchema = z.object({
  name: pz.StringRequired({ msg: "Full Name" }),
  email: pz.EmailRequired({ msg: "Email Address" }),
  phone: pz.PhoneRequired({ 
    msg: "Phone Number",
    format: PhoneFormat.E164  // Store in international format
  }),
  notifications: z.object({
    smsEnabled: pz.BooleanRequired({ msg: "SMS Notifications" }),
    callsEnabled: pz.BooleanOptional({ msg: "Call Notifications" }),
  }),
});

app.post("/users", (req, res) => {
  try {
    const userData = userRegistrationSchema.parse(req.body);
    
    // Phone is automatically normalized to E164 format
    console.log("Validated phone:", userData.phone); // "+15551234567"
    
    // Save to database with consistent format
    await User.create({
      ...userData,
      phone: userData.phone  // Already normalized
    });
    
    res.json({ success: true, user: userData });
  } catch (error) {
    res.status(400).json({ 
      error: "Validation failed",
      issues: error.issues 
    });
  }
});
```

### Phone Number Formatting Utilities

```typescript
// Utility functions for phone display
const formatPhoneForDisplay = (e164Phone: string): string => {
  // Convert "+15551234567" to "(555) 123-4567"
  const cleaned = e164Phone.replace(/^\+1/, "");
  return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
};

const formatPhoneForSMS = (phone: string): string => {
  // Ensure E164 format for SMS APIs
  const nationalSchema = pz.PhoneRequired({ format: PhoneFormat.National });
  const e164Schema = pz.PhoneRequired({ format: PhoneFormat.E164 });
  
  const national = nationalSchema.parse(phone);
  return e164Schema.parse(national);
};

// Usage in component
const UserProfile = ({ user }) => {
  const displayPhone = formatPhoneForDisplay(user.phone); // "(555) 123-4567"
  
  return (
    <div>
      <h3>{user.name}</h3>
      <p>Phone: {displayPhone}</p>
      <button onClick={() => sendSMS(formatPhoneForSMS(user.phone))}>
        Send SMS
      </button>
    </div>
  );
};
```

### Database Integration

```typescript
// Database model with consistent phone storage
interface UserModel {
  id: string;
  name: string;
  email: string;
  primaryPhone: string;    // Always stored in E164: "+15551234567"
  secondaryPhone?: string; // Optional, also E164
  createdAt: Date;
}

// Validation schema ensuring E164 storage
const userCreateSchema = z.object({
  name: pz.StringRequired({ msg: "Full Name" }),
  email: pz.EmailRequired({ msg: "Email Address" }),
  primaryPhone: pz.PhoneRequired({ 
    msg: "Primary Phone",
    format: PhoneFormat.E164  // Database uses E164
  }),
  secondaryPhone: pz.PhoneOptional({ 
    msg: "Secondary Phone",
    format: PhoneFormat.E164
  }),
});

// API endpoint with consistent validation
app.post("/users", async (req, res) => {
  const userData = userCreateSchema.parse(req.body);
  
  // All phone numbers are now in consistent E164 format
  const user = await User.create({
    ...userData,
    id: generateId(),
    createdAt: new Date(),
  });
  
  res.json({ user });
});
```

## See Also

- [String Schemas](string-schemas.md) - Basic string validation
- [Email Schemas](email-schemas.md) - Email address validation
- [User Schemas](user-schemas.md) - User profile and credential validation
- [Form Validation Examples](../examples/form-validation.md) - Practical form usage
- [API Validation Examples](../examples/api-validation.md) - API endpoint validation
