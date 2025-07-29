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

- **Money Schemas**: `zMoneyOptional()`, `zMoneyRequired()` - Currency and amount validation

## Available Schemas & New Capabilities

Phantom Zod now provides a rich set of schema factories with advanced features:

- **Dynamic locale management** for error messages
- **Parameter interpolation** in messages
- **Convenience schema factories** for all common types
- **Type-safe output and error handling**
- **Utility methods for message keys, existence, and supported locales**

### Example: Advanced Schema Usage
```typescript
import {
  zEmailRequired,
  zPhoneOptional,
  zStringRequired,
  zUuidRequired,
  zUrlRequired,
  zDateRequired,
  zNumberRequired,
  zIPv4Optional,
  zBooleanRequired,
  zEnumRequired,
  zArrayRequired,
  zMoneyRequired,
  zPostalCodeRequired,
  zAddressRequired,
  zFileUploadRequired,
  zPaginationRequired
} from 'phantom-zod';

// Email validation with custom message
const emailSchema = zEmailRequired({ msg: 'Email Address' });
emailSchema.parse('user@example.com'); // ✅ 'user@example.com'
// Throws: "Email Address is required" if empty

// Phone validation with format
const phoneSchema = zPhoneOptional({ msg: 'Phone', format: 'national' });
phoneSchema.parse('1234567890'); // ✅ '1234567890'

// String validation with trimming
const nameSchema = zStringRequired({ msg: 'Name' });
nameSchema.parse('  John Doe  '); // ✅ 'John Doe'

// UUID validation
const idSchema = zUuidRequired({ msg: 'User ID' });
idSchema.parse('123e4567-e89b-12d3-a456-426614174000'); // ✅ Valid

// URL validation with protocol restriction
const urlSchema = zUrlRequired({ msg: 'Website URL', protocol: /^https$/ });
urlSchema.parse('https://example.com'); // ✅ Valid

// Date validation
const dateSchema = zDateRequired({ msg: 'Birth Date' });
dateSchema.parse('2023-12-25'); // ✅ Valid

// Number validation with range
const ageSchema = zNumberRequired({ msg: 'Age', min: 0, max: 120 });
ageSchema.parse(25); // ✅ Valid

// Boolean validation
const boolSchema = zBooleanRequired({ msg: 'Active' });
- **User Schemas**: `zUsernameOptional()`, `zPasswordRequired()` - User credential validation

// Enum validation
const statusSchema = zEnumRequired(['active', 'inactive'], { msg: 'Status' });
statusSchema.parse('active'); // ✅ 'active'

// Array validation
const tagsSchema = zArrayRequired(zStringRequired(), { msg: 'Tags' });
- **File Upload Schemas**: `zFileUploadOptional()`, `zFileUploadRequired()` - File validation

// Money validation
const moneySchema = zMoneyRequired({ msg: 'Amount', currency: 'USD' });
- **Pagination Schemas**: `zPaginationOptional()`, `zPaginationRequired()` - Pagination parameter validation

// Postal code validation
const postalSchema = zPostalCodeRequired({ msg: 'Postal Code' });
postalSchema.parse('12345'); // ✅ '12345'

// Address validation
const addressSchema = zAddressRequired({ msg: 'Address' });
addressSchema.parse({ street: '123 Main St', city: 'NYC', zip: '10001' }); // ✅ Valid

// File upload validation
const fileSchema = zFileUploadRequired({ msg: 'Resume' });
fileSchema.parse({ name: 'resume.pdf', size: 102400 }); // ✅ Valid

// Pagination validation
const paginationSchema = zPaginationRequired({ msg: 'Pagination' });

```

### Utility Methods & Message Management
```typescript
import { localizationManager } from 'phantom-zod/localization';

// Load and switch locales
await localizationManager.loadLocale('es');
localizationManager.setLocale('es');

// Get a localized message
const msg = localizationManager.getMessage('string.required');

// Check if a message key exists
const exists = localizationManager.isMessageDefined('string.required');

// Get all message keys for a locale
const keys = localizationManager.getMessageKeys('es');

// Register custom messages
localizationManager.registerMessages({
  locale: 'fr',
  common: { required: 'Ce champ est obligatoire.' },
  // ...
});

// Set a custom logger
localizationManager.setLogger(console);
```
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
