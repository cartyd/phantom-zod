# © 2025 Dave Carty. Licensed under the ISC License.

# Phantom Zod

A TypeScript-first schema validation library built on top of Zod, providing pre-built validators for common data types with comprehensive error handling and customizable messages.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [String Parameter Overloads](#string-parameter-overloads)
- [Using the `pz` Namespace](#using-the-pz-namespace)
- [Object Schema Construction](#object-schema-construction)
- [Complete Example](#complete-example)
- [Available Schemas](#available-schemas)
- [Localization Support](#localization-support)
- [Error Message Customization](#error-message-customization)
- [Phone Number Formats](#phone-number-formats)
- [Advanced Usage](#advanced-usage)
- [TypeScript Support](#typescript-support)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Changelog](#changelog)

## Features

- 🚀 **Unified `pz` namespace** - Access all schemas from a single import
- 🎯 **TypeScript-first** - Built with TypeScript for full type safety
- 🌐 **Localization support** - Multi-language error messages
- 📝 **Custom error messages** - Flexible message customization
- ⚡ **Performance optimized** - Built on Zod with additional optimizations
- 🧪 **Comprehensive testing** - 1300+ test cases covering edge cases
- 📚 **Complete schema library** - Validation for all common data types

## Installation

```bash
npm install phantom-zod
# or
yarn add phantom-zod
# or
pnpm add phantom-zod
```

## Quick Start

```typescript
import { pz } from "phantom-zod";

// Simple validation with options object
const email = pz.EmailRequired({ msg: "Email" });
const result = email.parse("user@example.com"); // ✅ 'user@example.com'

// Or use the simplified string parameter overload
const emailSimple = pz.EmailRequired("Email");
const resultSimple = emailSimple.parse("user@example.com"); // ✅ 'user@example.com'

// ✨ NEW: Chainable .default() support!
const emailWithDefault = pz.EmailRequired("Email").default("user@example.com");
const defaultResult = emailWithDefault.parse(undefined); // ✅ 'user@example.com'
```

## String Parameter Overloads

Phantom Zod v1.5+ supports simplified string parameter usage for most schemas. Instead of always passing an options object, you can pass a string directly as the field name for basic validation:

### Basic Usage

```typescript
import { pz } from "phantom-zod";

// Traditional options object approach
const emailTraditional = pz.EmailRequired({ msg: "Email Address" });

// Simplified string parameter approach (equivalent)
const emailSimple = pz.EmailRequired("Email Address");

// Both produce the same validation behavior
emailTraditional.parse("user@example.com"); // ✅ 'user@example.com'
emailSimple.parse("user@example.com");      // ✅ 'user@example.com'

// Error messages work the same way
emailTraditional.parse("");       // ❌ "Email Address is required"
emailSimple.parse("");            // ❌ "Email Address is required"
```

### When to Use Each Approach

**Use string parameters when:**
- You only need to set the field name/message
- You want cleaner, more concise code
- You're building simple validation schemas

**Use options objects when:**
- You need additional configuration (minLength, maxLength, format, etc.)
- You want to use custom message types (MsgType.Message)
- You need locale-specific configurations

### Examples by Schema Type

```typescript
import { pz } from "phantom-zod";

// String schemas
const name = pz.StringRequired("Full Name");                    // Simple
const bio = pz.StringOptional({ msg: "Bio", maxLength: 500 });  // With constraints

// Email schemas  
const email = pz.EmailRequired("Email");                        // Simple
const workEmail = pz.Html5EmailRequired("Work Email");          // Simple

// UUID schemas
const userId = pz.UuidV7Required("User ID");                   // Simple
const sessionId = pz.UuidRequired("Session ID");               // Simple

// Number schemas
const count = pz.NumberRequired("Count");                      // Simple
const age = pz.NumberRequired({ msg: "Age", min: 0, max: 120 }); // With constraints

// Boolean schemas
const isActive = pz.BooleanRequired("Active Status");          // Simple

// Date schemas
const birthDate = pz.DateStringRequired("Birth Date");         // Simple
const timestamp = pz.DateTimeStringOptional("Timestamp");      // Simple

// Complex schemas that support string overloads
const address = pz.AddressOptional("Home Address");            // Simple
const phone = pz.PhoneRequired("Phone Number");               // Simple (uses default E.164 format)

// Record schemas
const settings = pz.RecordOptional(z.string(), "User Settings");     // Simple
const counters = pz.RecordRequired(z.number(), "Counters");          // Simple

// When you need format options, use the options object
const phoneNational = pz.PhoneRequired({ 
  msg: "Phone Number", 
  format: PhoneFormat.National 
});

// When you need record constraints, use the options object
const restrictedConfig = pz.RecordRequired(z.string(), {
  msg: "Configuration",
  allowedKeys: ["host", "port", "timeout"],
  requiredKeys: ["host", "port"],
});
```

### Backwards Compatibility

The string parameter overloads are fully backwards compatible. All existing code using options objects will continue to work exactly as before. The string overloads are additional convenience methods that complement the existing API.

## ✨ Chainable .default() Support

Phantom Zod v1.5.1+ fully supports Zod's `.default()` chaining on all schema types! This was a critical TypeScript fix that enables the fluent API experience users expect.

### Basic .default() Usage

```typescript
import { pz } from "phantom-zod";

// All schemas now support .default() chaining:
const userSchema = z.object({
  name: pz.StringRequired("Full Name").default("Anonymous"),
  email: pz.EmailRequired("Email").default("user@example.com"),
  phone: pz.PhoneOptional("Phone").default("+1234567890"),
  website: pz.UrlOptional("Website").default("https://example.com"),
  isActive: pz.BooleanRequired("Active").default(true),
  age: pz.NumberOptional("Age").default(25),
  id: pz.UuidV4Required("User ID").default(crypto.randomUUID()),
  role: pz.EnumRequired(["user", "admin"], "Role").default("user"),
});

// Parse with missing fields - defaults will be applied
const result = userSchema.parse({
  email: "john@example.com",
  // All other fields will use their default values
});

console.log(result);
// ✅ Output:
// {
//   name: "Anonymous",
//   email: "john@example.com", 
//   phone: "+1234567890",
//   website: "https://example.com",
//   isActive: true,
//   age: 25,
//   id: "550e8400-e29b-41d4-a716-446655440000",
//   role: "user"
// }
```

### Complex Chaining

```typescript
// Combine .default() with other Zod methods:
const complexSchema = z.object({
  title: pz.StringRequired("Title")
    .default("Untitled")
    .min(3)
    .max(100),
    
  price: pz.NumberRequired("Price")
    .default(0)
    .min(0)
    .max(10000),
    
  tags: pz.StringArrayOptional("Tags")
    .default([])
    .max(10),
    
  metadata: z.object({
    createdAt: pz.DateStringRequired("Created Date").default(new Date().toISOString()),
    updatedAt: pz.DateStringOptional("Updated Date"), // Optional - no default needed
  }),
});
```

### Why This Matters

Before this fix, TypeScript compilation would fail when trying to chain `.default()` due to return type inference issues. Now you get the full power of Zod's fluent API with all Phantom Zod schemas!

```typescript
// ❌ Before v1.5.1 - TypeScript errors:
// const schema = pz.EmailRequired("Email").default("test@example.com");
//                                         ^^^^^^^ 
// Error: Property 'default' does not exist on type...

// ✅ Now works perfectly:
const schema = pz.EmailRequired("Email").default("test@example.com");
```

## Using the `pz` Namespace

Phantom Zod provides all schemas through a unified `pz` namespace, making it easy to access any validation schema from a single import:

```typescript
import { pz } from "phantom-zod";

// String validation with trimming
const name = pz.StringRequired({ msg: "Full Name" });
name.parse("  John Doe  "); // ✅ 'John Doe'

// Email validation
const email = pz.EmailRequired({ msg: "Email Address" });
email.parse("user@example.com"); // ✅ 'user@example.com'

// Phone validation with format options
const phone = pz.PhoneOptional({ msg: "Phone Number" });
phone.parse("(555) 123-4567"); // ✅ '+15551234567' (E.164 format)

// UUID validation (supports v4, v6, v7)
const id = pz.UuidV7Required({ msg: "User ID" });
id.parse("018f6d6e-f14d-7c2a-b732-c6d5730303e0"); // ✅ Valid UUIDv7

// Number validation with constraints
const age = pz.NumberRequired({ msg: "Age", min: 0, max: 120 });
age.parse(25); // ✅ 25

// URL validation with protocol restrictions
const website = pz.UrlOptional({ msg: "Website" });
website.parse("https://example.com"); // ✅ 'https://example.com'

// Date validation
const birthDate = pz.DateStringOptional({ msg: "Birth Date" });
birthDate.parse("1990-01-15"); // ✅ '1990-01-15'

// Boolean validation
const isActive = pz.BooleanRequired({ msg: "Active Status" });
isActive.parse(true); // ✅ true

// Array validation with pz.StringOptional for consistency
const tags = pz.ArrayOptional(pz.StringOptional(), { msg: "Tags" });
tags.parse(["javascript", "typescript", "react"]); // ✅ ['javascript', 'typescript', 'react']

// Or use the convenience function (equivalent)
const tagsSimple = pz.StringArrayOptional({ msg: "Tags" });
tags.parse(["javascript", "typescript", "react"]); // ✅ ['javascript', 'typescript', 'react']

// Money validation
const price = pz.MoneyRequired({ msg: "Price", currency: "USD" });
price.parse({ amount: 99.99, currency: "USD" }); // ✅ Valid money object
```

## Object Schema Construction

The real power of Phantom Zod comes when building complex object schemas using the `pz` namespace with Zod's object construction:

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

// User profile schema
const userProfileSchema = z.object({
  // Personal information
  id: pz.UuidV7Required({ msg: "User ID" }),
  email: pz.EmailRequired({ msg: "Email Address" }),
  firstName: pz.StringRequired({ msg: "First Name" }),
  lastName: pz.StringRequired({ msg: "Last Name" }),
  displayName: pz.StringOptional({ msg: "Display Name" }),

  // Contact information
  phone: pz.PhoneOptional({ msg: "Phone Number" }),
  website: pz.UrlOptional({ msg: "Personal Website" }),

  // Profile details
  age: pz.NumberOptional({ msg: "Age", min: 13, max: 120 }),
  isActive: pz.BooleanRequired({ msg: "Account Status" }),
  role: pz.EnumRequired(["admin", "user", "moderator"], { msg: "User Role" }),
  tags: pz.StringArrayOptional({ msg: "Profile Tags" }),

  // Address
  address: pz.AddressOptional({ msg: "Home Address" }),

  // Timestamps
  createdAt: pz.DateStringRequired({ msg: "Created Date" }),
  lastLoginAt: pz.DateTimeStringOptional({ msg: "Last Login" }),
});

// Product schema with money handling
const productSchema = z.object({
  id: pz.UuidRequired({ msg: "Product ID" }),
  name: pz.StringRequired({
    msg: "Product Name",
    minLength: 2,
    maxLength: 100,
  }),
  description: pz.StringOptional({ msg: "Description", maxLength: 500 }),
  price: pz.MoneyRequired({ msg: "Price" }),
  category: pz.EnumRequired(["electronics", "clothing", "books"], {
    msg: "Category",
  }),
  tags: pz.StringArrayOptional({ msg: "Product Tags", maxItems: 10 }),
  isAvailable: pz.BooleanRequired({ msg: "Availability" }),
  website: pz.UrlOptional({ msg: "Product URL" }),
});
```

## Complete Example

Here's a comprehensive example showing schema definition, validation, and error handling:

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

// Define a comprehensive user registration schema
const userRegistrationSchema = z.object({
  // Required fields
  email: pz.EmailRequired({ msg: "Email Address" }),
  password: pz.StringRequired({ msg: "Password", minLength: 8 }),
  firstName: pz.StringRequired({ msg: "First Name" }),
  lastName: pz.StringRequired({ msg: "Last Name" }),

  // Optional fields
  phone: pz.PhoneOptional({ msg: "Phone Number" }),
  website: pz.UrlOptional({ msg: "Personal Website" }),
  age: pz.NumberOptional({ msg: "Age", min: 13, max: 120 }),

  // Complex fields
  interests: pz.StringArrayOptional({ msg: "Interests" }),
  address: z
    .object({
      street: pz.StringRequired({ msg: "Street Address" }),
      city: pz.StringRequired({ msg: "City" }),
      state: pz.StringRequired({ msg: "State", minLength: 2, maxLength: 2 }),
      zipCode: pz.PostalCodeRequired({ msg: "ZIP Code" }),
    })
    .optional(),

  // Preferences
  newsletter: pz.BooleanRequired({ msg: "Newsletter Subscription" }),
  accountType: pz.EnumRequired(["personal", "business"], {
    msg: "Account Type",
  }),
});

// Type inference
type UserRegistration = z.infer<typeof userRegistrationSchema>;

// Example data
const registrationData = {
  email: "  user@example.com  ", // Will be trimmed
  password: "securePassword123",
  firstName: "John",
  lastName: "Doe",
  phone: "(555) 123-4567", // Will be normalized to +15551234567
  website: "https://johndoe.com",
  age: 25,
  interests: ["programming", "reading", "hiking"],
  address: {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
  },
  newsletter: true,
  accountType: "personal" as const,
};

// Validation with error handling
try {
  const validatedUser = userRegistrationSchema.parse(registrationData);
  console.log("Validation successful:", validatedUser);

  // The result will have:
  // - Trimmed email: 'user@example.com'
  // - Normalized phone: '+15551234567'
  // - All other data validated and type-safe
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log("Validation errors:");
    error.issues.forEach((issue) => {
      console.log(`- ${issue.path.join(".")}: ${issue.message}`);
    });
  }
}

// Safe parsing (doesn't throw)
const result = userRegistrationSchema.safeParse(registrationData);

if (result.success) {
  console.log("User data:", result.data);
} else {
  console.log("Validation failed:", result.error.issues);
}

// Example with invalid data
const invalidData = {
  email: "not-an-email", // Invalid email
  password: "123", // Too short
  firstName: "", // Empty string
  lastName: "Doe",
  age: 150, // Too high
  phone: "invalid-phone", // Invalid phone
  website: "not-a-url", // Invalid URL
  accountType: "invalid-type", // Invalid enum value
  newsletter: "yes", // Should be boolean
};

const invalidResult = userRegistrationSchema.safeParse(invalidData);
console.log("Validation errors for invalid data:");
invalidResult.error?.issues.forEach((issue) => {
  console.log(`- ${issue.path.join(".")}: ${issue.message}`);
});

// Output will show specific, helpful error messages:
// - email: Email Address must be a valid email address
// - password: Password must be at least 8 characters
// - firstName: First Name is required
// - age: Age must be at most 120
// - phone: Phone Number must be a valid phone number
// - website: Personal Website must be a valid URL
// - accountType: Account Type must be one of: personal, business
// - newsletter: Newsletter Subscription must be a boolean
```

## Available Schemas

Phantom Zod provides a comprehensive set of validation schemas accessible through the `pz` namespace:

### 📝 String Schemas

- `pz.StringRequired({ msg, minLength, maxLength })` - Required string with trimming
- `pz.StringOptional({ msg, minLength, maxLength })` - Optional string with trimming

📚 [View detailed String schemas documentation →](docs/schemas/string-schemas.md)

### 📧 Email Schemas

- `pz.EmailRequired({ msg })` - Required email validation
- `pz.EmailOptional({ msg })` - Optional email validation
- `pz.Html5EmailRequired({ msg })` - HTML5-compliant email validation
- `pz.Rfc5322EmailRequired({ msg })` - RFC 5322-compliant email validation
- `pz.UnicodeEmailRequired({ msg })` - Unicode-friendly email validation

📚 [View detailed Email schemas documentation →](docs/schemas/email-schemas.md)

### 📱 Phone Schemas

- `pz.PhoneRequired({ msg, format })` - Required phone number (E.164/National)
- `pz.PhoneOptional({ msg, format })` - Optional phone number

📚 [View detailed Phone schemas documentation →](docs/schemas/phone-schemas.md)

### 🆔 UUID Schemas

- `pz.UuidRequired({ msg })` - Any UUID version
- `pz.UuidOptional({ msg })` - Optional UUID
- `pz.UuidV4Required({ msg })` - Specific UUIDv4
- `pz.UuidV6Required({ msg })` - Specific UUIDv6
- `pz.UuidV7Required({ msg })` - Specific UUIDv7
- `pz.NanoidRequired({ msg })` - Nanoid validation

📚 [View detailed UUID schemas documentation →](docs/schemas/uuid-schemas.md)

### 🔢 Number Schemas

- `pz.NumberRequired({ msg, min, max })` - Required number with constraints
- `pz.NumberOptional({ msg, min, max })` - Optional number
- `pz.IntegerRequired({ msg, min, max })` - Integer validation
- `pz.PositiveRequired({ msg })` - Positive numbers only
- `pz.NonNegativeRequired({ msg })` - Non-negative numbers

📚 [View detailed Number schemas documentation →](docs/schemas/number-schemas.md)

### 🗓️ Date Schemas

- `pz.DateRequired({ msg })` - Date object validation
- `pz.DateOptional({ msg })` - Optional date object
- `pz.DateStringRequired({ msg })` - ISO date string (YYYY-MM-DD)
- `pz.DateStringOptional({ msg })` - Optional ISO date string
- `pz.DateTimeStringRequired({ msg })` - ISO datetime string
- `pz.TimeStringRequired({ msg })` - ISO time string (HH:MM:SS)

📚 [View detailed Date schemas documentation →](docs/schemas/date-schemas.md)

### ✅ Boolean Schemas

- `pz.BooleanRequired({ msg })` - Required boolean
- `pz.BooleanOptional({ msg })` - Optional boolean
- `pz.BooleanStringRequired({ msg })` - Boolean as string ("true"/"false")

📚 [View detailed Boolean schemas documentation →](docs/schemas/boolean-schemas.md)

### 📋 Array Schemas

- `pz.StringArrayRequired({ msg, minItems, maxItems })` - Required string array
- `pz.StringArrayOptional({ msg, minItems, maxItems })` - Optional string array

📚 [View detailed Array schemas documentation →](docs/schemas/array-schemas.md)

### 🔗 URL Schemas

- `pz.UrlRequired({ msg, protocol, hostname })` - Required URL validation
- `pz.UrlOptional({ msg, protocol, hostname })` - Optional URL validation
- `pz.HttpsUrlRequired({ msg })` - HTTPS-only URLs
- `pz.WebUrlRequired({ msg })` - HTTP/HTTPS URLs

📚 [View detailed URL schemas documentation →](docs/schemas/url-schemas.md)

### 🏠 Address Schemas

- `pz.AddressRequired({ msg })` - Complete address validation
- `pz.AddressOptional({ msg })` - Optional address
- `pz.AddressUS({ msg })` - US-specific address validation
- `pz.PostalCodeRequired({ msg })` - US ZIP code validation

📚 [View detailed Address schemas documentation →](docs/schemas/address-schemas.md) | [Postal Code schemas →](docs/schemas/postal-code-schemas.md)

### 💰 Money Schemas

- `pz.MoneyRequired({ msg, currency, decimalPlaces })` - Money object validation
- `pz.MoneyOptional({ msg, currency, decimalPlaces })` - Optional money
- `pz.CurrencyCode({ msg })` - ISO 4217 currency codes
- `pz.MoneyAmount({ msg, decimalPlaces })` - Money amount validation

📚 [View detailed Money schemas documentation →](docs/schemas/money-schemas.md)

### 🌐 Network Schemas

- `pz.IPv4Required({ msg })` - IPv4 address validation
- `pz.IPv6Required({ msg })` - IPv6 address validation
- `pz.MacAddressRequired({ msg })` - MAC address validation
- `pz.NetworkAddressGeneric({ msg })` - Any network address type

📚 [View detailed Network schemas documentation →](docs/schemas/network-schemas.md)

### 👤 User Schemas

- `pz.UserRequired({ msg })` - Complete user object
- `pz.UserOptional({ msg })` - Optional user object
- `pz.Username({ msg, minLength, maxLength })` - Username validation
- `pz.Password({ msg, minLength, requirements })` - Password validation
- `pz.UserRegistration({ msg })` - User registration schema

📚 [View detailed User schemas documentation →](docs/schemas/user-schemas.md)

### 📁 File Upload Schemas

- `pz.FileUploadRequired({ msg, maxSize, allowedTypes })` - File validation
- `pz.FileUploadOptional({ msg, maxSize, allowedTypes })` - Optional file
- `pz.ImageUpload({ msg, maxSize })` - Image-specific validation
- `pz.DocumentUpload({ msg, maxSize })` - Document validation

📚 [View detailed File Upload schemas documentation →](docs/schemas/file-upload-schemas.md)

### 🏷️ Enum Schemas

- `pz.EnumRequired(values, { msg })` - Required enum validation
- `pz.EnumOptional(values, { msg })` - Optional enum validation

📚 [View detailed Enum schemas documentation →](docs/schemas/enum-schemas.md)

### 🆔 ID List Schemas

- `pz.IdListRequired({ msg, minItems, maxItems })` - UUID list validation
- `pz.UniqueIdList({ msg })` - Unique ID list validation
- `pz.MongoIdRequired({ msg })` - MongoDB ObjectId validation

📚 [View detailed ID List schemas documentation →](docs/schemas/id-list-schemas.md)

### 📊 Record Schemas

- `pz.RecordRequired(valueSchema, { msg, minEntries, maxEntries, allowedKeys, requiredKeys, keyPattern })` - Required key-value record validation
- `pz.RecordOptional(valueSchema, { msg, minEntries, maxEntries, allowedKeys, requiredKeys, keyPattern })` - Optional key-value record validation

📚 [View detailed Record schemas documentation →](docs/schemas/record-schemas.md)

## Error Message Customization

All schemas support two types of error messages:

### Field Name (Default)

The message is treated as a field name and incorporated into standard error messages.

```typescript
const schema = pz.EmailRequired({ msg: "Email Address" });
schema.parse(""); // "Email Address is required"
schema.parse("invalid"); // "Email Address must be a valid email address"
```

### Custom Message

Use `MsgType.Message` to provide complete custom error messages.

```typescript
import { pz, MsgType } from "phantom-zod";

const schema = pz.EmailRequired({
  msg: "Please enter a valid email address",
  msgType: MsgType.Message,
});
schema.parse("invalid"); // "Please enter a valid email address"
```

## Phone Number Formats

The library supports two phone number formats:

### E.164 Format (Default)

International format with country code: `+11234567890`

```typescript
import { pz, PhoneFormat } from "phantom-zod";

const schema = pz.PhoneOptional({ msg: "Phone", format: PhoneFormat.E164 });
// or simply:
const schema = pz.PhoneOptional({ msg: "Phone" }); // E.164 is default
```

### National Format

US national format without country code: `1234567890`

```typescript
import { pz, PhoneFormat } from "phantom-zod";

const schema = pz.PhoneOptional({ msg: "Phone", format: PhoneFormat.National });
```

## Advanced Usage

### Form Validation

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

const userSchema = z.object({
  name: pz.StringRequired({ msg: "Full Name" }),
  email: pz.EmailRequired({ msg: "Email Address" }),
  phone: pz.PhoneOptional({ msg: "Phone Number" }),
  company: pz.StringOptional({ msg: "Company Name" }),
});

type User = z.infer<typeof userSchema>;

const userData = {
  name: "  John Doe  ",
  email: "john@example.com",
  phone: "(555) 123-4567",
  company: undefined,
};

const result = userSchema.parse(userData);
// Result:
// {
//   name: 'John Doe',
//   email: 'john@example.com',
//   phone: '+15551234567',
//   company: ''
// }
```

### Error Handling

```typescript
import { ZodError } from "zod";
import { pz } from "phantom-zod";

const schema = pz.EmailRequired({ msg: "Email" });

try {
  schema.parse("invalid-email");
} catch (error) {
  if (error instanceof ZodError) {
    console.log(error.issues[0].message); // "Email must be a valid email address"
  }
}
```

## TypeScript Support

The library is built with TypeScript and provides full type safety:

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

const emailSchema = pz.EmailRequired({ msg: "Email" });
const phoneSchema = pz.PhoneOptional({ msg: "Phone" });

type Email = z.infer<typeof emailSchema>; // string
type Phone = z.infer<typeof phoneSchema>; // string | undefined
```

## Testing

The library includes comprehensive tests with 190+ test cases covering:

- ✅ Valid input scenarios
- ❌ Invalid input scenarios
- 🔄 Data transformation
- 📱 Phone number normalization
- 🌐 Unicode support
- ⚡ Performance testing
- 🧠 Memory safety

Run tests:

```bash
npm test
npm run test:coverage
npm run test:watch
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for detailed information on:

- Development workflow and branch protection
- Code standards and testing requirements  
- Pull request process
- Architecture overview and development tips

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and add tests
4. Format code: `npm run format`
5. Run tests: `npm test`
6. Submit a pull request

The `main` branch is protected and requires pull requests for all changes.

## License

ISC License - see LICENSE file for details.

## Changelog

### Version 1.5.0 (Current Feature Branch)

- **🚀 Universal String Parameter Overloads**: Comprehensive string parameter support across all schema types
  - Direct string parameter usage for all schemas: `pz.EmailRequired("Email")`
  - Extended beyond basic schemas to include complex types (Address, Money, Network, etc.)
  - Backwards compatible with existing options object approach
  - Cleaner, more concise schema definitions for rapid development
- **📋 Enhanced Schema Coverage**: String overloads added to:
  - Address, Array, Boolean, Date, Email schemas
  - Enum, File Upload, ID List, Money schemas  
  - Network, Number, Phone, Postal Code schemas
  - String, URL, User, UUID schemas
- **🧪 Expanded Test Suite**: Comprehensive test coverage for all string parameter overloads
- **📚 Updated Documentation**: Examples and usage patterns updated throughout

### Version 1.4.0

- **📚 Comprehensive Schema Documentation**: Complete documentation overhaul
  - Individual schema documentation files for each category (18 total)
  - Cross-linked documentation structure from main README
  - Detailed examples, usage patterns, and best practices
  - Form validation examples and real-world use cases
- **🏗️ Project Structure Enhancement**: Added WARP.md with mandatory branching workflow
- **🔧 Development Workflow**: Established feature branch requirements and CI/CD automation
- **✨ Documentation Quality**: Professional-grade documentation ready for production use

### Version 1.3.0

- **🔧 Developer Experience Improvements**: Enhanced TypeScript integration and IntelliSense support
- **⚡ Performance Optimizations**: Improved schema creation and validation performance
- **🐛 Bug Fixes**: Resolved edge cases in phone number validation and locale handling
- **📖 Documentation Updates**: Improved API documentation and usage examples
- **🎯 Type Safety**: Enhanced TypeScript definitions for better compile-time checking

### Version 1.2.1

- **🐛 Critical Bug Fixes**: Resolved issues with localization message loading
- **🔧 Build Improvements**: Enhanced build process for better distribution
- **📦 Dependency Updates**: Updated to latest compatible versions

### Version 1.2.0

- **🎯 Schema Refinements**: Enhanced validation logic for complex data types
- **🌍 Localization Enhancements**: Additional locale support and improved message formatting
- **🔒 Type Safety Improvements**: Stricter TypeScript definitions and better error handling
- **🧪 Test Suite Expansion**: Added comprehensive edge case testing and validation scenarios
- **🏗️ Architecture Improvements**: Refined factory patterns for better maintainability

### Version 1.1.0

- **🌐 Localization Support**: Added comprehensive internationalization system
  - Multi-language error message support
  - Dynamic locale switching with fallback handling
  - Type-safe message parameter injection
  - Extensible locale system for custom languages
- **📋 Extended Schema Library**: Added comprehensive validation schemas
  - Date, Number, UUID, Boolean, Enum schemas
  - Array, URL, Postal Code, Address schemas
  - Money, Network (IP/MAC), User credential schemas
  - File upload and Pagination schemas
- **🏗️ Enhanced Architecture**: Improved factory pattern for schema creation
- **📚 Comprehensive Documentation**: Updated with localization examples and new schema usage
- **🧪 Extended Test Coverage**: Added 1000+ tests for localization and new schemas

### Version 1.0.0

- **🎉 Initial Release**: Foundation of Phantom Zod validation library
- **📧 Email Validation**: Comprehensive email validation schemas with multiple formats
- **📱 Phone Number Support**: Validation with E.164 and national formats
- **📝 String Validation**: Automatic trimming and length constraints
- **🧪 Comprehensive Testing**: 190+ test cases covering all scenarios
- **🔷 TypeScript Support**: Full type safety and inference
- **🛠️ Utility Functions**: Common operations and helper functions
