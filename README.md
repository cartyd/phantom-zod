# Simplicate Schema

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
npm install simplicate-schema
```

## Quick Start

```typescript
import { zEmailRequired, zPhoneOptional, zStringRequired } from 'simplicate-schema';

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
import { zEmailOptional, MsgType } from 'simplicate-schema';

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
import { zEmailRequired } from 'simplicate-schema';

const schema = zEmailRequired('Email');
schema.parse('user@example.com'); // ✅ 'user@example.com'
schema.parse(''); // ❌ Throws: "Email is required"
schema.parse('invalid'); // ❌ Throws: "Email must be a valid email address"
```

### Phone Schemas

#### `zPhoneOptional(msg?, format?, msgType?)`
Validates and normalizes optional US phone numbers.

```typescript
import { zPhoneOptional, PhoneFormat } from 'simplicate-schema';

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
import { zPhoneRequired, PhoneFormat } from 'simplicate-schema';

const schema = zPhoneRequired('Mobile');
schema.parse('1234567890'); // ✅ '+11234567890'
schema.parse(''); // ❌ Throws: "Mobile is required"
schema.parse('123'); // ❌ Throws: "Mobile is invalid. Example of valid format: +11234567890"
```

### String Schemas

#### `zStringOptional(msg?, msgType?)`
Validates optional strings with automatic trimming.

```typescript
import { zStringOptional } from 'simplicate-schema';

const schema = zStringOptional('Name');
schema.parse('  John Doe  '); // ✅ 'John Doe'
schema.parse(''); // ✅ ''
schema.parse(undefined); // ✅ ''
schema.parse('   '); // ✅ '' (whitespace trimmed to empty)
```

#### `zStringRequired(msg?, msgType?)`
Validates required strings with trimming and non-empty validation.

```typescript
import { zStringRequired } from 'simplicate-schema';

const schema = zStringRequired('Name');
schema.parse('  John Doe  '); // ✅ 'John Doe'
schema.parse(''); // ❌ Throws: "Name is required"
schema.parse('   '); // ❌ Throws: "Name is required"
```

## Utility Functions

### Phone Utilities

#### `normalizeUSPhone(input, format?)`
Normalizes US phone numbers to E.164 or national format.

```typescript
import { normalizeUSPhone, PhoneFormat } from 'simplicate-schema';

normalizeUSPhone('1234567890'); // '+11234567890'
normalizeUSPhone('(123) 456-7890'); // '+11234567890'
normalizeUSPhone('1234567890', PhoneFormat.National); // '1234567890'
normalizeUSPhone('invalid'); // null
```

#### `phoneRefine(val, format?)`
Validates phone number format.

```typescript
import { phoneRefine, PhoneFormat } from 'simplicate-schema';

phoneRefine('+11234567890'); // true
phoneRefine('1234567890'); // false (when expecting E.164)
phoneRefine('1234567890', PhoneFormat.National); // true
phoneRefine(undefined); // true
```

### String Utilities

#### `trimOrUndefined(value)`
Trims string and returns undefined if empty.

```typescript
import { trimOrUndefined } from 'simplicate-schema';

trimOrUndefined('  hello  '); // 'hello'
trimOrUndefined(''); // undefined
trimOrUndefined('   '); // undefined
trimOrUndefined(undefined); // undefined
```

#### `trimOrEmpty(value)`
Trims string and returns empty string if undefined.

```typescript
import { trimOrEmpty } from 'simplicate-schema';

trimOrEmpty('  hello  '); // 'hello'
trimOrEmpty(''); // ''
trimOrEmpty(undefined); // ''
trimOrEmpty(null); // ''
```

### Email Utilities

#### `isEmail(val)`
Validates email format.

```typescript
import { isEmail } from 'simplicate-schema';

isEmail('user@example.com'); // true
isEmail('invalid-email'); // false
isEmail(undefined); // true
```

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
import { zEmailRequired, MsgType } from 'simplicate-schema';

const schema = zEmailRequired('Please enter a valid email address', MsgType.Message);
schema.parse('invalid'); // "Please enter a valid email address"
```

## Phone Number Formats

The library supports two phone number formats:

### E.164 Format (Default)
International format with country code: `+11234567890`

```typescript
import { zPhoneOptional, PhoneFormat } from 'simplicate-schema';

const schema = zPhoneOptional('Phone', PhoneFormat.E164);
// or simply:
const schema = zPhoneOptional('Phone'); // E.164 is default
```

### National Format
US national format without country code: `1234567890`

```typescript
import { zPhoneOptional, PhoneFormat } from 'simplicate-schema';

const schema = zPhoneOptional('Phone', PhoneFormat.National);
```

## Advanced Usage

### Form Validation

```typescript
import { z } from 'zod';
import { zEmailRequired, zPhoneOptional, zStringRequired } from 'simplicate-schema';

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
import { zEmailRequired } from 'simplicate-schema';

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
import { zEmailRequired, zPhoneOptional } from 'simplicate-schema';

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

### Version 1.0.0
- Initial release
- Email validation schemas
- Phone number validation with E.164 and national formats
- String validation with trimming
- Comprehensive test suite
- TypeScript support
- Utility functions for common operations
