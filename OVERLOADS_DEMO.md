# String Parameter Overloads Demo

This demonstrates the new string parameter overloads available in phantom-zod. You can now use a simple string as the first parameter for commonly used schemas!

## ✅ Implemented Overloads

### String Schemas
```typescript
// New syntax
pz.StringOptional('User Name')
pz.StringRequired('Email Address')

// Still works (for complex options)
pz.StringOptional({ msg: 'Bio', maxLength: 500 })
pz.StringRequired({ msg: 'Password', minLength: 8 })
```

### Boolean Schemas
```typescript
// New syntax
pz.BooleanOptional('Is Active')
pz.BooleanRequired('Agreed to Terms')
pz.BooleanStringOptional('Feature Flag')
pz.BooleanStringRequired('Newsletter Subscription')

// Still works
pz.BooleanOptional({ msg: 'Custom Boolean' })
pz.BooleanStringRequired({ msg: 'Setting Flag' })
```

### Email Schemas
```typescript
// New syntax
pz.EmailOptional('Contact Email')
pz.EmailRequired('Primary Email')

// Still works (for pattern validation)
pz.EmailRequired({ msg: 'Work Email', pattern: /^.+@company\.com$/ })
```

### URL Schemas
```typescript
// New syntax
pz.UrlOptional('Website URL')
pz.UrlRequired('API Endpoint')

// Still works (for protocol/hostname validation)
pz.UrlRequired({ msg: 'HTTPS API', protocol: /^https$/ })
```

## Real-World Usage Example

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

const UserProfileSchema = z.object({
  // Simple string parameter syntax
  id: pz.StringRequired('User ID'),
  name: pz.StringOptional('Display Name'),
  email: pz.EmailRequired('Email Address'),
  website: pz.UrlOptional('Personal Website'),
  isActive: pz.BooleanRequired('Account Active'),
  newsletter: pz.BooleanStringOptional('Newsletter Subscription'),
  
  // Complex options when needed
  bio: pz.StringOptional({ msg: 'Biography', maxLength: 500 }),
  workEmail: pz.EmailRequired({ 
    msg: 'Work Email', 
    pattern: /^.+@company\.com$/ 
  }),
  secureApi: pz.UrlRequired({ 
    msg: 'API Endpoint', 
    protocol: /^https$/ 
  })
});

// Usage
const profile = UserProfileSchema.parse({
  id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  website: 'https://johndoe.com',
  isActive: true,
  newsletter: 'true',
  bio: 'Software engineer...',
  workEmail: 'john@company.com',
  secureApi: 'https://api.company.com/v1'
});
```

## Benefits

1. **Simpler syntax** for common use cases
2. **Full backward compatibility** - all existing code continues to work
3. **Better developer experience** - less typing for simple schemas
4. **Consistent error messages** - string parameter becomes field name in errors
5. **Type safety** - TypeScript correctly infers both usage patterns

## Backward Compatibility

All existing code continues to work exactly as before:

```typescript
// This still works perfectly
const oldSchema = pz.StringRequired({ 
  msg: 'Username', 
  minLength: 3, 
  maxLength: 20 
});

// New shorthand equivalent (when no constraints needed)
const newSchema = pz.StringRequired('Username');
```

The string parameter overloads are implemented as convenience wrappers that call the original functions with `{ msg: 'YourString' }`, so they produce identical schemas and behavior.
