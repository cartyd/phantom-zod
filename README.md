# © 2025 Dave Carty. Licensed under the ISC License.

# Phantom Zod

A TypeScript-first schema validation library built on top of Zod, providing pre-built validators for common data types with comprehensive error handling and customizable messages.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
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
import { pz } from 'phantom-zod';

// Simple validation
const email = pz.zEmailRequired({ msg: 'Email' });
const result = email.parse('user@example.com'); // ✅ 'user@example.com'
```

## Using the `pz` Namespace

Phantom Zod provides all schemas through a unified `pz` namespace, making it easy to access any validation schema from a single import:

```typescript
import { pz } from 'phantom-zod';

// String validation with trimming
const name = pz.zStringRequired({ msg: 'Full Name' });
name.parse('  John Doe  '); // ✅ 'John Doe'

// Email validation
const email = pz.zEmailRequired({ msg: 'Email Address' });
email.parse('user@example.com'); // ✅ 'user@example.com'

// Phone validation with format options
const phone = pz.zPhoneOptional({ msg: 'Phone Number' });
phone.parse('(555) 123-4567'); // ✅ '+15551234567' (E.164 format)

// UUID validation (supports v4, v6, v7)
const id = pz.zUuidV7Required({ msg: 'User ID' });
id.parse('018f6d6e-f14d-7c2a-b732-c6d5730303e0'); // ✅ Valid UUIDv7

// Number validation with constraints
const age = pz.zNumberRequired({ msg: 'Age', min: 0, max: 120 });
age.parse(25); // ✅ 25

// URL validation with protocol restrictions
const website = pz.zUrlOptional({ msg: 'Website' });
website.parse('https://example.com'); // ✅ 'https://example.com'

// Date validation
const birthDate = pz.zDateStringOptional({ msg: 'Birth Date' });
birthDate.parse('1990-01-15'); // ✅ '1990-01-15'

// Boolean validation
const isActive = pz.zBooleanRequired({ msg: 'Active Status' });
isActive.parse(true); // ✅ true

// Array validation with pz.zStringOptional for consistency
const tags = pz.zArrayOptional(pz.zStringOptional(), { msg: 'Tags' });
tags.parse(['javascript', 'typescript', 'react']); // ✅ ['javascript', 'typescript', 'react']

// Or use the convenience function (equivalent)
const tagsSimple = pz.zStringArrayOptional({ msg: 'Tags' });
tags.parse(['javascript', 'typescript', 'react']); // ✅ ['javascript', 'typescript', 'react']

// Money validation
const price = pz.zMoneyRequired({ msg: 'Price', currency: 'USD' });
price.parse({ amount: 99.99, currency: 'USD' }); // ✅ Valid money object
```

## Object Schema Construction

The real power of Phantom Zod comes when building complex object schemas using the `pz` namespace with Zod's object construction:

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// User profile schema
const userProfileSchema = z.object({
  // Personal information
  id: pz.zUuidV7Required({ msg: 'User ID' }),
  email: pz.zEmailRequired({ msg: 'Email Address' }),
  firstName: pz.zStringRequired({ msg: 'First Name' }),
  lastName: pz.zStringRequired({ msg: 'Last Name' }),
  displayName: pz.zStringOptional({ msg: 'Display Name' }),
  
  // Contact information
  phone: pz.zPhoneOptional({ msg: 'Phone Number' }),
  website: pz.zUrlOptional({ msg: 'Personal Website' }),
  
  // Profile details
  age: pz.zNumberOptional({ msg: 'Age', min: 13, max: 120 }),
  isActive: pz.zBooleanRequired({ msg: 'Account Status' }),
  role: pz.zEnumRequired(['admin', 'user', 'moderator'], { msg: 'User Role' }),
  tags: pz.zStringArrayOptional({ msg: 'Profile Tags' }),
  
  // Address
  address: pz.zAddressOptional({ msg: 'Home Address' }),
  
  // Timestamps
  createdAt: pz.zDateStringRequired({ msg: 'Created Date' }),
  lastLoginAt: pz.zDateTimeStringOptional({ msg: 'Last Login' }),
});

// Product schema with money handling
const productSchema = z.object({
  id: pz.zUuidRequired({ msg: 'Product ID' }),
  name: pz.zStringRequired({ msg: 'Product Name', minLength: 2, maxLength: 100 }),
  description: pz.zStringOptional({ msg: 'Description', maxLength: 500 }),
  price: pz.zMoneyRequired({ msg: 'Price' }),
  category: pz.zEnumRequired(['electronics', 'clothing', 'books'], { msg: 'Category' }),
  tags: pz.zStringArrayOptional({ msg: 'Product Tags', maxItems: 10 }),
  isAvailable: pz.zBooleanRequired({ msg: 'Availability' }),
  website: pz.zUrlOptional({ msg: 'Product URL' }),
});
```

## Complete Example

Here's a comprehensive example showing schema definition, validation, and error handling:

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// Define a comprehensive user registration schema
const userRegistrationSchema = z.object({
  // Required fields
  email: pz.zEmailRequired({ msg: 'Email Address' }),
  password: pz.zStringRequired({ msg: 'Password', minLength: 8 }),
  firstName: pz.zStringRequired({ msg: 'First Name' }),
  lastName: pz.zStringRequired({ msg: 'Last Name' }),
  
  // Optional fields
  phone: pz.zPhoneOptional({ msg: 'Phone Number' }),
  website: pz.zUrlOptional({ msg: 'Personal Website' }),
  age: pz.zNumberOptional({ msg: 'Age', min: 13, max: 120 }),
  
  // Complex fields
  interests: pz.zStringArrayOptional({ msg: 'Interests' }),
  address: z.object({
    street: pz.zStringRequired({ msg: 'Street Address' }),
    city: pz.zStringRequired({ msg: 'City' }),
    state: pz.zStringRequired({ msg: 'State', minLength: 2, maxLength: 2 }),
    zipCode: pz.zPostalCodeRequired({ msg: 'ZIP Code' }),
  }).optional(),
  
  // Preferences
  newsletter: pz.zBooleanRequired({ msg: 'Newsletter Subscription' }),
  accountType: pz.zEnumRequired(['personal', 'business'], { msg: 'Account Type' }),
});

// Type inference
type UserRegistration = z.infer<typeof userRegistrationSchema>;

// Example data
const registrationData = {
  email: '  user@example.com  ',  // Will be trimmed
  password: 'securePassword123',
  firstName: 'John',
  lastName: 'Doe',
  phone: '(555) 123-4567',        // Will be normalized to +15551234567
  website: 'https://johndoe.com',
  age: 25,
  interests: ['programming', 'reading', 'hiking'],
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001'
  },
  newsletter: true,
  accountType: 'personal' as const,
};

// Validation with error handling
try {
  const validatedUser = userRegistrationSchema.parse(registrationData);
  console.log('Validation successful:', validatedUser);
  
  // The result will have:
  // - Trimmed email: 'user@example.com'
  // - Normalized phone: '+15551234567'
  // - All other data validated and type-safe
  
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log('Validation errors:');
    error.issues.forEach(issue => {
      console.log(`- ${issue.path.join('.')}: ${issue.message}`);
    });
  }
}

// Safe parsing (doesn't throw)
const result = userRegistrationSchema.safeParse(registrationData);

if (result.success) {
  console.log('User data:', result.data);
} else {
  console.log('Validation failed:', result.error.issues);
}

// Example with invalid data
const invalidData = {
  email: 'not-an-email',        // Invalid email
  password: '123',               // Too short
  firstName: '',                 // Empty string
  lastName: 'Doe',
  age: 150,                      // Too high
  phone: 'invalid-phone',        // Invalid phone
  website: 'not-a-url',          // Invalid URL
  accountType: 'invalid-type',   // Invalid enum value
  newsletter: 'yes',             // Should be boolean
};

const invalidResult = userRegistrationSchema.safeParse(invalidData);
console.log('Validation errors for invalid data:');
invalidResult.error?.issues.forEach(issue => {
  console.log(`- ${issue.path.join('.')}: ${issue.message}`);
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
- `pz.zStringRequired({ msg, minLength, maxLength })` - Required string with trimming
- `pz.zStringOptional({ msg, minLength, maxLength })` - Optional string with trimming

### 📧 Email Schemas
- `pz.zEmailRequired({ msg })` - Required email validation
- `pz.zEmailOptional({ msg })` - Optional email validation
- `pz.zHtml5EmailRequired({ msg })` - HTML5-compliant email validation
- `pz.zRfc5322EmailRequired({ msg })` - RFC 5322-compliant email validation
- `pz.zUnicodeEmailRequired({ msg })` - Unicode-friendly email validation

### 📱 Phone Schemas
- `pz.zPhoneRequired({ msg, format })` - Required phone number (E.164/National)
- `pz.zPhoneOptional({ msg, format })` - Optional phone number

### 🆔 UUID Schemas
- `pz.zUuidRequired({ msg })` - Any UUID version
- `pz.zUuidOptional({ msg })` - Optional UUID
- `pz.zUuidV4Required({ msg })` - Specific UUIDv4
- `pz.zUuidV6Required({ msg })` - Specific UUIDv6
- `pz.zUuidV7Required({ msg })` - Specific UUIDv7
- `pz.zNanoidRequired({ msg })` - Nanoid validation

### 🔢 Number Schemas
- `pz.zNumberRequired({ msg, min, max })` - Required number with constraints
- `pz.zNumberOptional({ msg, min, max })` - Optional number
- `pz.zIntegerRequired({ msg, min, max })` - Integer validation
- `pz.zPositiveRequired({ msg })` - Positive numbers only
- `pz.zNonNegativeRequired({ msg })` - Non-negative numbers

### 🗓️ Date Schemas
- `pz.zDateRequired({ msg })` - Date object validation
- `pz.zDateOptional({ msg })` - Optional date object
- `pz.zDateStringRequired({ msg })` - ISO date string (YYYY-MM-DD)
- `pz.zDateStringOptional({ msg })` - Optional ISO date string
- `pz.zDateTimeStringRequired({ msg })` - ISO datetime string
- `pz.zTimeStringRequired({ msg })` - ISO time string (HH:MM:SS)

### ✅ Boolean Schemas
- `pz.zBooleanRequired({ msg })` - Required boolean
- `pz.zBooleanOptional({ msg })` - Optional boolean
- `pz.zBooleanStringRequired({ msg })` - Boolean as string ("true"/"false")

### 📋 Array Schemas
- `pz.zStringArrayRequired({ msg, minItems, maxItems })` - Required string array
- `pz.zStringArrayOptional({ msg, minItems, maxItems })` - Optional string array

### 🔗 URL Schemas
- `pz.zUrlRequired({ msg, protocol, hostname })` - Required URL validation
- `pz.zUrlOptional({ msg, protocol, hostname })` - Optional URL validation
- `pz.zHttpsUrlRequired({ msg })` - HTTPS-only URLs
- `pz.zWebUrlRequired({ msg })` - HTTP/HTTPS URLs

### 🏠 Address Schemas
- `pz.zAddressRequired({ msg })` - Complete address validation
- `pz.zAddressOptional({ msg })` - Optional address
- `pz.zAddressUS({ msg })` - US-specific address validation
- `pz.zPostalCodeRequired({ msg })` - US ZIP code validation

### 💰 Money Schemas
- `pz.zMoneyRequired({ msg, currency, decimalPlaces })` - Money object validation
- `pz.zMoneyOptional({ msg, currency, decimalPlaces })` - Optional money
- `pz.zCurrencyCode({ msg })` - ISO 4217 currency codes
- `pz.zMoneyAmount({ msg, decimalPlaces })` - Money amount validation

### 🌐 Network Schemas
- `pz.zIPv4Required({ msg })` - IPv4 address validation
- `pz.zIPv6Required({ msg })` - IPv6 address validation
- `pz.zMacAddressRequired({ msg })` - MAC address validation
- `pz.zNetworkAddressGeneric({ msg })` - Any network address type

### 👤 User Schemas
- `pz.zUserRequired({ msg })` - Complete user object
- `pz.zUserOptional({ msg })` - Optional user object
- `pz.zUsername({ msg, minLength, maxLength })` - Username validation
- `pz.zPassword({ msg, minLength, requirements })` - Password validation
- `pz.zUserRegistration({ msg })` - User registration schema

### 📁 File Upload Schemas
- `pz.zFileUploadRequired({ msg, maxSize, allowedTypes })` - File validation
- `pz.zFileUploadOptional({ msg, maxSize, allowedTypes })` - Optional file
- `pz.zImageUpload({ msg, maxSize })` - Image-specific validation
- `pz.zDocumentUpload({ msg, maxSize })` - Document validation

### 📄 Pagination Schemas
- `pz.zPagination({ msg, maxLimit })` - Pagination parameters
- `pz.zCursorPagination({ msg })` - Cursor-based pagination
- `pz.zOffsetPagination({ msg })` - Offset-based pagination

### 🏷️ Enum Schemas
- `pz.zEnumRequired(values, { msg })` - Required enum validation
- `pz.zEnumOptional(values, { msg })` - Optional enum validation

### 🆔 ID List Schemas
- `pz.zIdListRequired({ msg, minItems, maxItems })` - UUID list validation
- `pz.zUniqueIdList({ msg })` - Unique ID list validation
- `pz.zMongoIdRequired({ msg })` - MongoDB ObjectId validation

## Error Message Customization

All schemas support two types of error messages:

### Field Name (Default)
The message is treated as a field name and incorporated into standard error messages.

```typescript
const schema = zEmailRequired('Email Address');
schema.parse(''); // "Email Address is required"
schema.parse('invalid'); // "Email Address must be a valid email address"
```

### Custom Message
Use `MsgType.Message` to provide complete custom error messages.

```typescript
import { zEmailRequired, MsgType } from 'phantom-zod';

const schema = zEmailRequired('Please enter a valid email address', MsgType.Message);
schema.parse('invalid'); // "Please enter a valid email address"
```

## Phone Number Formats

The library supports two phone number formats:

### E.164 Format (Default)
International format with country code: `+11234567890`

```typescript
import { zPhoneOptional, PhoneFormat } from 'phantom-zod';

const schema = zPhoneOptional('Phone', PhoneFormat.E164);
// or simply:
const schema = zPhoneOptional('Phone'); // E.164 is default
```

### National Format
US national format without country code: `1234567890`

```typescript
import { zPhoneOptional, PhoneFormat } from 'phantom-zod';

const schema = zPhoneOptional('Phone', PhoneFormat.National);
```

## Advanced Usage

### Form Validation

```typescript
import { z } from 'zod';
import { zEmailRequired, zPhoneOptional, zStringRequired } from 'phantom-zod';

const userSchema = z.object({
  name: zStringRequired('Full Name'),
  email: zEmailRequired('Email Address'),
  phone: zPhoneOptional('Phone Number'),
  company: zStringOptional('Company Name'),
});

type User = z.infer<typeof userSchema>;

const userData = {
  name: '  John Doe  ',
  email: 'john@example.com',
  phone: '(555) 123-4567',
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
import { ZodError } from 'zod';
import { zEmailRequired } from 'phantom-zod';

const schema = zEmailRequired('Email');

try {
  schema.parse('invalid-email');
} catch (error) {
  if (error instanceof ZodError) {
    console.log(error.issues[0].message); // "Email must be a valid email address"
  }
}
```

## TypeScript Support

The library is built with TypeScript and provides full type safety:

```typescript
import { zEmailRequired, zPhoneOptional } from 'phantom-zod';

const emailSchema = zEmailRequired();
const phoneSchema = zPhoneOptional();

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

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

ISC License - see LICENSE file for details.

## Changelog

### Version 1.1.0
- **🌐 Localization Support**: Added comprehensive internationalization system
  - Multi-language error message support
  - Dynamic locale switching
  - Fallback locale handling
  - Type-safe message parameter injection
- **📋 Extended Schema Library**: Added comprehensive validation schemas
  - Date, Number, UUID, Boolean, Enum schemas
  - Array, URL, Postal Code, Address schemas
  - Money, Network (IP/MAC), User credential schemas
  - File upload and Pagination schemas
- **🏗️ Enhanced Architecture**: Improved factory pattern for schema creation
- **📚 Comprehensive Documentation**: Updated with localization examples and new schema usage
- **🧪 Extended Test Coverage**: Added tests for localization and new schemas

### Version 1.0.0
- Initial release
- Email validation schemas
- Phone number validation with E.164 and national formats
- String validation with trimming
- Comprehensive test suite
- TypeScript support
- Utility functions for common operations
