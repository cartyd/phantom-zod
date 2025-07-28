# © 2025 Dave Carty. Licensed under the ISC License.

# Phantom Zod

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Available Schemas](#available-schemas)
  - [Email Schemas](#email-schemas)
  - [Phone Schemas](#phone-schemas)
  - [String Schemas](#string-schemas)
  - [Additional Schemas](#additional-schemas)
- [Localization Support](#localization-support)
  - [Basic Usage](#basic-localization-usage)
  - [Custom Locales](#custom-locales)
  - [Advanced Localization](#advanced-localization)
- [Error Message Customization](#error-message-customization)
- [Phone Number Formats](#phone-number-formats)
  - [E.164 Format (Default)](#e164-format-default)
  - [National Format](#national-format)
- [Advanced Usage](#advanced-usage)
  - [Form Validation](#form-validation)
  - [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Changelog](#changelog)

A TypeScript-first schema validation library built on top of Zod, providing pre-built validators for common data types with comprehensive error handling and customizable messages.

## Features

- 🛡️ **Type-safe validation** with full TypeScript support
- 📱 **Phone number validation** with E.164 and national format support
- 📧 **Email validation** with customizable error messages
- 📝 **String validation** with automatic trimming
- 🌐 **Internationalization** support for error messages
- 🔄 **Data transformation** during validation
- 🎯 **Pre-built schemas** for common use cases
- 📋 **Comprehensive testing** with 190+ test cases

## Installation

```bash
npm install phantom-zod
```

## Quick Start

```typescript
import { zEmailRequired, zPhoneOptional, zStringRequired } from 'phantom-zod';

// Email validation
const emailSchema = zEmailRequired('Email');
const result = emailSchema.parse('user@example.com'); // ✅ Valid

// Phone validation
const phoneSchema = zPhoneOptional('Phone');
const phone = phoneSchema.parse('(123) 456-7890'); // ✅ Transforms to '+11234567890'

// String validation
const nameSchema = zStringRequired('Name');
const name = nameSchema.parse('  John Doe  '); // ✅ Transforms to 'John Doe'
```

## Available Schemas

### Email Schemas

#### `zEmailOptional(msg?, msgType?)`
Validates optional email addresses with automatic trimming.

```typescript
import { zEmailOptional, MsgType } from 'phantom-zod';

const schema = zEmailOptional('Email Address');
schema.parse('user@example.com'); // ✅ 'user@example.com'
schema.parse('  user@example.com  '); // ✅ 'user@example.com' (trimmed)
schema.parse(undefined); // ✅ undefined
schema.parse('invalid-email'); // ❌ Throws: "Email Address must be a valid email address"

// Custom error message
const customSchema = zEmailOptional('Invalid email format', MsgType.Message);
customSchema.parse('invalid'); // ❌ Throws: "Invalid email format"
```

#### `zEmailRequired(msg?, msgType?)`
Validates required email addresses.

```typescript
import { zEmailRequired } from 'phantom-zod';

const schema = zEmailRequired('Email');
schema.parse('user@example.com'); // ✅ 'user@example.com'
schema.parse(''); // ❌ Throws: "Email is required"
schema.parse('invalid'); // ❌ Throws: "Email must be a valid email address"
```

### Phone Schemas

#### `zPhoneOptional(msg?, format?, msgType?)`
Validates and normalizes optional US phone numbers.

```typescript
import { zPhoneOptional, PhoneFormat } from 'phantom-zod';

// E.164 format (default)
const e164Schema = zPhoneOptional('Phone');
e164Schema.parse('1234567890'); // ✅ '+11234567890'
e164Schema.parse('(123) 456-7890'); // ✅ '+11234567890'
e164Schema.parse('+11234567890'); // ✅ '+11234567890'
e164Schema.parse(undefined); // ✅ undefined

// National format
const nationalSchema = zPhoneOptional('Phone', PhoneFormat.National);
nationalSchema.parse('+11234567890'); // ✅ '1234567890'
nationalSchema.parse('11234567890'); // ✅ '1234567890'
```

#### `zPhoneRequired(msg?, format?, msgType?)`
Validates required phone numbers.

```typescript
import { zPhoneRequired, PhoneFormat } from 'phantom-zod';

const schema = zPhoneRequired('Mobile');
schema.parse('1234567890'); // ✅ '+11234567890'
schema.parse(''); // ❌ Throws: "Mobile is required"
schema.parse('123'); // ❌ Throws: "Mobile is invalid. Example of valid format: +11234567890"
```

### String Schemas

#### `zStringOptional(msg?, msgType?)`
Validates optional strings with automatic trimming.

```typescript
import { zStringOptional } from 'phantom-zod';

const schema = zStringOptional('Name');
schema.parse('  John Doe  '); // ✅ 'John Doe'
schema.parse(''); // ✅ ''
schema.parse(undefined); // ✅ ''
schema.parse('   '); // ✅ '' (whitespace trimmed to empty)
```

#### `zStringRequired(msg?, msgType?)`
Validates required strings with trimming and non-empty validation.

```typescript
import { zStringRequired } from 'phantom-zod';

const schema = zStringRequired('Name');
schema.parse('  John Doe  '); // ✅ 'John Doe'
schema.parse(''); // ❌ Throws: "Name is required"
schema.parse('   '); // ❌ Throws: "Name is required"
```

### Additional Schemas

Phantom Zod provides many additional schema types for comprehensive validation:

- **Date Schemas**: `zDateOptional()`, `zDateRequired()` - Date validation with customizable formats
- **Number Schemas**: `zNumberOptional()`, `zNumberRequired()` - Number validation with range checks
- **UUID Schemas**: `zUuidOptional()`, `zUuidRequired()` - UUID validation with version support (v4, v6, v7)
- **Boolean Schemas**: `zBooleanOptional()`, `zBooleanRequired()` - Boolean validation
- **Enum Schemas**: `zEnumOptional()`, `zEnumRequired()` - Enum validation with custom values
- **Array Schemas**: `zArrayOptional()`, `zArrayRequired()` - Array validation with element type checking
- **URL Schemas**: `zUrlOptional()`, `zUrlRequired()` - URL validation with protocol restrictions
- **Postal Code Schemas**: `zPostalCodeOptional()`, `zPostalCodeRequired()` - Postal code validation
- **Address Schemas**: `zAddressOptional()`, `zAddressRequired()` - Address validation
- **Money Schemas**: `zMoneyOptional()`, `zMoneyRequired()` - Currency and amount validation
- **Network Schemas**: `zIPv4Optional()`, `zIPv6Optional()`, `zMacAddressOptional()` - Network address validation
- **User Schemas**: `zUsernameOptional()`, `zPasswordRequired()` - User credential validation
- **File Upload Schemas**: `zFileUploadOptional()`, `zFileUploadRequired()` - File validation
- **Pagination Schemas**: `zPaginationOptional()`, `zPaginationRequired()` - Pagination parameter validation

```typescript
import { 
  zUuidRequired, 
  zUrlRequired, 
  zDateRequired,
  zNumberRequired,
  zIPv4Optional 
} from 'phantom-zod';

// UUID validation
const idSchema = zUuidRequired({ msg: 'User ID' });
idSchema.parse('123e4567-e89b-12d3-a456-426614174000'); // ✅ Valid

// URL validation with HTTPS requirement
const urlSchema = zUrlRequired({ msg: 'Website URL' });
urlSchema.parse('https://example.com'); // ✅ Valid

// Date validation
const dateSchema = zDateRequired({ msg: 'Birth Date' });
dateSchema.parse('2023-12-25'); // ✅ Valid

// Number validation with range
const ageSchema = zNumberRequired({ msg: 'Age', min: 0, max: 120 });
ageSchema.parse(25); // ✅ Valid

// IP address validation
const ipSchema = zIPv4Optional({ msg: 'Server IP' });
ipSchema.parse('192.168.1.1'); // ✅ Valid
```

## Localization Support

Localization in Phantom Zod allows you to customize validation messages based on locale, offering dynamic translation and cultural adaptation of message content.

### Basic Usage

Initialize the localization system by registering default messages (e.g., English) and set a fallback locale.

```typescript
import { initializeLocalization, getMessage } from 'phantom-zod/localization';

// Initialize with default locale
initializeLocalization();

// Retrieve message with default fallback
const message = getMessage('someMessageKey');
console.log(message);
```

### Custom Locales

You can add custom locales by creating new message JSON files and registering them with the localization manager.

```typescript
import { localizationManager, LocalizationMessages } from 'phantom-zod/localization';

// Example: Adding Spanish locale
const esMessages: LocalizationMessages = {
  locale: 'es',
  common: {
    required: 'El campo es obligatorio.',
  },
  // Add more categories and messages as needed
};

localizationManager.registerMessages(esMessages);
localizationManager.setLocale('es');

// Retrieve Spanish message
const requiredMessage = getMessage('common.required');
console.log(requiredMessage); // "El campo es obligatorio."
```

### Advanced Localization

- **Dynamic Parameters**: Inject dynamic values into messages using parameterized keys.
- **Locale Switching**: Easily switch between locales with the `setLocale` method.
- **Fallback Handling**: Configure a fallback locale for missing translations.

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
