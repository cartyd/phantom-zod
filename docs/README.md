# Phantom Zod Schema Documentation

Welcome to the comprehensive documentation for Phantom Zod schemas. This documentation provides detailed information about all available validation schemas, their options, and usage examples.

## Quick Start

```typescript
import { pz } from "phantom-zod";

// Basic usage
const email = pz.EmailRequired({ msg: "Email Address" });
const result = email.parse("user@example.com"); // ✅ 'user@example.com'
```

## Documentation Structure

### 📝 Schema Reference

#### Core Validation Schemas
- **[String Schemas](schemas/string-schemas.md)** - Text validation with trimming and length constraints
  - `StringRequired` - Required string validation
  - `StringOptional` - Optional string validation

- **[Email Schemas](schemas/email-schemas.md)** - Email address validation with multiple formats
  - `EmailRequired`, `EmailOptional` - Basic email validation
  - `Html5EmailRequired`, `Html5EmailOptional` - HTML5-compliant validation
  - `Rfc5322EmailRequired`, `Rfc5322EmailOptional` - RFC 5322-compliant validation  
  - `UnicodeEmailRequired`, `UnicodeEmailOptional` - Unicode-friendly validation

- **[Phone Schemas](schemas/phone-schemas.md)** - Phone number validation and formatting
  - `PhoneRequired`, `PhoneOptional` - E.164 and national format support

- **[Number Schemas](schemas/number-schemas.md)** - Numeric validation with constraints
  - `NumberRequired`, `NumberOptional` - Basic number validation
  - `IntegerRequired`, `IntegerOptional` - Integer-only validation
  - `PositiveRequired`, `NonNegativeRequired` - Sign constraints

#### Data Type Schemas
- **[Date Schemas](schemas/date-schemas.md)** - Date and time validation
  - `DateRequired`, `DateOptional` - Date object validation
  - `DateStringRequired`, `DateStringOptional` - ISO date string validation
  - `DateTimeStringRequired`, `DateTimeStringOptional` - DateTime validation
  - `TimeStringRequired`, `TimeStringOptional` - Time validation

- **[Boolean Schemas](schemas/boolean-schemas.md)** - Boolean value validation
  - `BooleanRequired`, `BooleanOptional` - Boolean validation
  - `BooleanStringRequired`, `BooleanStringOptional` - String-to-boolean conversion

- **[UUID Schemas](schemas/uuid-schemas.md)** - UUID and unique identifier validation
  - `UuidRequired`, `UuidOptional` - General UUID validation
  - `UuidV4Required`, `UuidV4Optional` - UUIDv4 specific
  - `UuidV6Required`, `UuidV6Optional` - UUIDv6 specific
  - `UuidV7Required`, `UuidV7Optional` - UUIDv7 specific
  - `NanoidRequired`, `NanoidOptional` - Nanoid validation

#### Collection Schemas
- **[Array Schemas](schemas/array-schemas.md)** - Array validation with item constraints
  - `ArrayRequired`, `ArrayOptional` - Generic array validation
  - `StringArrayRequired`, `StringArrayOptional` - String array validation

- **[Enum Schemas](schemas/enum-schemas.md)** - Enumeration validation
  - `EnumRequired`, `EnumOptional` - Enum value validation

#### Network & Address Schemas
- **[URL Schemas](schemas/url-schemas.md)** - URL and web address validation
  - `UrlRequired`, `UrlOptional` - General URL validation
  - `HttpsUrlRequired`, `HttpsUrlOptional` - HTTPS-only validation
  - `WebUrlRequired`, `WebUrlOptional` - HTTP/HTTPS validation

- **[Network Schemas](schemas/network-schemas.md)** - Network address validation
  - `IPv4Required`, `IPv4Optional` - IPv4 address validation
  - `IPv6Required`, `IPv6Optional` - IPv6 address validation
  - `MacAddressRequired`, `MacAddressOptional` - MAC address validation

- **[Address Schemas](schemas/address-schemas.md)** - Physical address validation
  - `AddressRequired`, `AddressOptional` - Complete address validation
  - `AddressUS` - US-specific address validation

- **[Postal Code Schemas](schemas/postal-code-schemas.md)** - Postal code validation
  - `PostalCodeRequired`, `PostalCodeOptional` - ZIP/postal code validation

#### Business & Application Schemas
- **[Money Schemas](schemas/money-schemas.md)** - Currency and money validation
  - `MoneyRequired`, `MoneyOptional` - Money object validation
  - `CurrencyCode` - ISO 4217 currency codes
  - `MoneyAmount` - Money amount validation

- **[User Schemas](schemas/user-schemas.md)** - User credential and profile validation
  - `UserRequired`, `UserOptional` - User object validation
  - `Username`, `Password` - Credential validation
  - `UserRegistration` - Registration schema

- **[File Upload Schemas](schemas/file-upload-schemas.md)** - File validation
  - `FileUploadRequired`, `FileUploadOptional` - General file validation
  - `ImageUpload`, `DocumentUpload` - Type-specific validation

#### System Schemas
- **[ID List Schemas](schemas/id-list-schemas.md)** - ID collection validation
  - `IdListRequired`, `IdListOptional` - UUID list validation
  - `UniqueIdList` - Unique ID validation
  - `MongoIdRequired` - MongoDB ObjectId validation

- **[Pagination Schemas](schemas/pagination-schemas.md)** - Pagination parameter validation
  - `Pagination` - Basic pagination
  - `CursorPagination` - Cursor-based pagination
  - `OffsetPagination` - Offset-based pagination

### 🎯 Practical Examples

- **[Form Validation](examples/form-validation.md)** - Complete form validation examples
- **[API Validation](examples/api-validation.md)** - REST API endpoint validation
- **[Complex Objects](examples/complex-objects.md)** - Nested object validation patterns

### 🔧 Configuration & Customization

- **[Error Message Customization](api/error-handling.md)** - Custom error messages and localization
- **[Localization Guide](api/localization.md)** - Multi-language support
- **[Global Configuration](global-configuration.md)** - Library-wide settings

## Key Features

### 🚀 Unified API
All schemas are accessible through the `pz` namespace:
```typescript
import { pz } from "phantom-zod";

const userSchema = z.object({
  email: pz.EmailRequired({ msg: "Email" }),
  phone: pz.PhoneOptional({ msg: "Phone" }),
  age: pz.NumberOptional({ msg: "Age", min: 18 }),
});
```

### 🌐 Localization Support
Built-in support for multiple languages with customizable error messages:
```typescript
const schema = pz.StringRequired({ 
  msg: "User Name",
  msgType: MsgType.FieldName // Uses localized templates
});
```

### ⚡ Automatic Data Transformation
- String schemas automatically trim whitespace
- Phone numbers normalize to E.164 or national formats
- Consistent handling of empty/undefined values

### 📝 TypeScript Integration
Full TypeScript support with type inference:
```typescript
const emailSchema = pz.EmailRequired({ msg: "Email" });
type Email = z.infer<typeof emailSchema>; // string
```

## Quick Reference

### Common Patterns

**Required vs Optional Schemas:**
```typescript
// Required - throws error if missing/empty
const required = pz.StringRequired({ msg: "Name" });

// Optional - allows undefined/empty, converts to empty string
const optional = pz.StringOptional({ msg: "Middle Name" });
```

**Length Constraints:**
```typescript
const username = pz.StringRequired({ 
  msg: "Username", 
  minLength: 3, 
  maxLength: 20 
});
```

**Custom Error Messages:**
```typescript
import { MsgType } from "phantom-zod";

const schema = pz.EmailRequired({
  msg: "Please enter a valid email address",
  msgType: MsgType.Message // Use as complete message
});
```

**Combining with Zod Objects:**
```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

const userSchema = z.object({
  id: pz.UuidRequired({ msg: "User ID" }),
  email: pz.EmailRequired({ msg: "Email" }),
  profile: z.object({
    firstName: pz.StringRequired({ msg: "First Name" }),
    lastName: pz.StringRequired({ msg: "Last Name" }),
    age: pz.NumberOptional({ msg: "Age", min: 0, max: 120 }),
  }),
});
```

## Getting Started

1. **Installation:**
   ```bash
   npm install phantom-zod
   ```

2. **Basic Usage:**
   ```typescript
   import { pz } from "phantom-zod";
   
   const schema = pz.EmailRequired({ msg: "Email" });
   const result = schema.parse("user@example.com");
   ```

3. **Explore the Documentation:**
   - Start with [String Schemas](schemas/string-schemas.md) for basic validation
   - Check [Form Validation Examples](examples/form-validation.md) for practical usage
   - Review [Error Handling](api/error-handling.md) for customization options

## Contributing

Found an issue or want to contribute? Please check our [Contributing Guide](../CONTRIBUTING.md).

## License

ISC License - see [LICENSE](../LICENSE) file for details.
