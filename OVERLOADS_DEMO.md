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

### UUID Schemas
```typescript
// New syntax
pz.UuidOptional('Entity ID')
pz.UuidRequired('Primary Key')
pz.UuidV4Optional('Session Token')
pz.UuidV4Required('User ID')
pz.NanoidOptional('Short ID')
pz.NanoidRequired('Unique Identifier')

// Still works
pz.UuidRequired({ msg: 'Custom UUID' })
pz.UuidV4Optional({ msg: 'Request ID' })
```

### Enum Schemas
```typescript
// New syntax
pz.EnumOptional(['active', 'inactive', 'pending'], 'Status')
pz.EnumRequired(['admin', 'user', 'guest'], 'User Role')
pz.EnumOptional(['light', 'dark', 'auto'], 'Theme')

// Still works (for complex options)
pz.EnumRequired(['high', 'medium', 'low'], { msg: 'Priority', msgType: MsgType.FieldName })
```

### Phone Schemas
```typescript
// New syntax
pz.PhoneOptional('Contact Phone')
pz.PhoneRequired('Primary Phone')

// Still works (for format specification)
pz.PhoneRequired({ msg: 'Emergency Contact', format: PhoneFormat.National })
pz.PhoneOptional({ msg: 'Work Phone', format: PhoneFormat.E164 })
```

## Real-World Usage Example

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

const UserProfileSchema = z.object({
  // Simple string parameter syntax
  id: pz.UuidRequired('User ID'),
  sessionToken: pz.UuidV4Optional('Session Token'),
  shortId: pz.NanoidOptional('Short Identifier'),
  name: pz.StringOptional('Display Name'),
  email: pz.EmailRequired('Email Address'),
  phone: pz.PhoneOptional('Contact Phone'),
  emergencyContact: pz.PhoneRequired('Emergency Phone'),
  website: pz.UrlOptional('Personal Website'),
  isActive: pz.BooleanRequired('Account Active'),
  newsletter: pz.BooleanStringOptional('Newsletter Subscription'),
  role: pz.EnumRequired(['admin', 'user', 'guest'], 'User Role'),
  status: pz.EnumOptional(['active', 'inactive', 'pending'], 'Account Status'),
  theme: pz.EnumOptional(['light', 'dark', 'auto'], 'Preferred Theme'),
  
  // Complex options when needed
  bio: pz.StringOptional({ msg: 'Biography', maxLength: 500 }),
  workEmail: pz.EmailRequired({ 
    msg: 'Work Email', 
    pattern: /^.+@company\.com$/ 
  }),
  workPhone: pz.PhoneRequired({ 
    msg: 'Work Phone', 
    format: PhoneFormat.National 
  }),
  secureApi: pz.UrlRequired({ 
    msg: 'API Endpoint', 
    protocol: /^https$/ 
  })
});

// Usage
const profile = UserProfileSchema.parse({
  id: '123e4567-e89b-12d3-a456-426614174000',
  sessionToken: '987fcdeb-51a2-4321-9876-543210987654',
  shortId: 'V1StGXR8_Z5jdHi6B-myT',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '(555) 123-4567',
  emergencyContact: '+15551234567',
  website: 'https://johndoe.com',
  isActive: true,
  newsletter: 'true',
  role: 'user',
  status: 'active',
  theme: 'dark',
  bio: 'Software engineer...',
  workEmail: 'john@company.com',
  workPhone: '5559876543',
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
