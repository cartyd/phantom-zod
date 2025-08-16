# Postal Code Schemas

The postal code schemas module provides comprehensive validation for US postal codes (ZIP codes) with format validation, business rule enforcement, and reserved code filtering.

## Overview

This module offers robust US ZIP code validation with support for both 5-digit and ZIP+4 extended formats. It includes business rule validation to reject reserved codes, incomplete formats, and known non-US postal codes that might match the US format pattern.

## Available Schemas

- **`PostalCodeRequired(options?)`** - Validates required US postal codes (ZIP codes)
- **`PostalCodeOptional(options?)`** - Validates optional US postal codes (accepts undefined)

## Schema Options

Both schemas accept a `PostalCodeSchemaOptions` configuration object:

```typescript
interface PostalCodeSchemaOptions {
  msg?: string;       // Custom field name or error message
  msgType?: MsgType;  // Whether msg is field name or complete message
}
```

## Supported Formats

### Valid ZIP Code Formats

- **5-digit ZIP**: `12345`
- **ZIP+4**: `12345-6789`

### Format Validation Pattern

```typescript
const US_ZIP_CODE_PATTERN = /^[\d]{5}(-\d{4})?$/;
```

This pattern ensures:
- Exactly 5 digits for the base ZIP code
- Optional 4-digit extension with hyphen separator
- No leading/trailing spaces or other characters

## Business Rules

### Reserved/Invalid Codes

The schemas automatically reject certain reserved or invalid codes:

```typescript
// Reserved codes
"00000"      // Reserved test code
"00000-1234" // Any ZIP+4 with 00000 base
"99999"      // Reserved test code  
"99999-1234" // Any ZIP+4 with 99999 base

// Invalid formats
"12345-"     // Incomplete ZIP+4 (ends with hyphen)
"12 345"     // Contains spaces
```

### Known Non-US Codes

The validation rejects specific postal codes from other countries that happen to match the US format:

```typescript
const knownNonUsCodes = ["75001", "10117"]; // France, Germany examples
```

## Examples

### Basic Postal Code Validation

```typescript
import { pz } from 'phantom-zod';

// Required ZIP code
const zipSchema = pz.PostalCodeRequired();
zipSchema.parse("12345");      // ✓ Valid
zipSchema.parse("12345-6789"); // ✓ Valid
zipSchema.parse("");           // ✗ Error: Required

// Optional ZIP code
const optionalZipSchema = pz.PostalCodeOptional();
optionalZipSchema.parse("12345");      // ✓ Valid
optionalZipSchema.parse("12345-6789"); // ✓ Valid
optionalZipSchema.parse(undefined);    // ✓ Valid
```

### Invalid Format Examples

```typescript
import { pz } from 'phantom-zod';

const schema = pz.PostalCodeRequired();

// Invalid formats
schema.parse("1234");       // ✗ Error: Too short
schema.parse("123456");     // ✗ Error: Too long
schema.parse("12345-");     // ✗ Error: Incomplete ZIP+4
schema.parse("12345-67");   // ✗ Error: ZIP+4 extension too short
schema.parse("12345-67890"); // ✗ Error: ZIP+4 extension too long
schema.parse("12 345");     // ✗ Error: Contains space
schema.parse("abcde");      // ✗ Error: Non-numeric
```

### Reserved Code Validation

```typescript
import { pz } from 'phantom-zod';

const schema = pz.PostalCodeRequired();

// Reserved codes are rejected
schema.parse("00000");      // ✗ Error: Reserved code
schema.parse("00000-1234"); // ✗ Error: Reserved code with extension
schema.parse("99999");      // ✗ Error: Reserved code
schema.parse("99999-5678"); // ✗ Error: Reserved code with extension

// Known non-US codes are rejected
schema.parse("75001");      // ✗ Error: French postal code
schema.parse("10117");      // ✗ Error: German postal code
```

### Custom Error Messages

```typescript
import { pz } from 'phantom-zod';

// Custom field name
const shippingZipSchema = pz.PostalCodeRequired({
  msg: 'Shipping ZIP Code'
});

const billingZipSchema = pz.PostalCodeOptional({
  msg: 'Billing ZIP Code'
});

// Complete custom message
const customMessageSchema = pz.PostalCodeRequired({
  msg: 'Please enter a valid 5-digit ZIP code',
  msgType: MsgType.Message
});
```

### Form Integration Examples

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// User address form
const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: pz.PostalCodeRequired({ msg: 'ZIP Code' })
});

// Profile with optional mailing address
const profileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  homeZipCode: pz.PostalCodeRequired({ msg: 'Home ZIP Code' }),
  mailingZipCode: pz.PostalCodeOptional({ msg: 'Mailing ZIP Code' })
});

// Business location form
const businessSchema = z.object({
  businessName: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: pz.PostalCodeRequired({ msg: 'Business ZIP Code' })
  }),
  serviceAreas: z.array(PostalCodeRequired({ msg: 'Service Area ZIP' }))
});
```

## Error Messages

The postal code schemas provide specific error messages for different validation failures:

- **Required field**: "Postal Code is required"
- **Invalid format**: "Postal Code must be a valid ZIP code"
- **Reserved codes**: "Postal Code must be a valid ZIP code" (same as invalid format)
- **Incomplete format**: "Postal Code must be a valid ZIP code"

All error messages can be customized using the `msg` and `msgType` options.

## TypeScript Types

```typescript
// Schema return types
type PostalCodeRequired = string;
type PostalCodeOptional = string | undefined;

// Configuration interface
interface PostalCodeSchemaOptions {
  msg?: string;
  msgType?: MsgType;
}

// Usage with schemas
const requiredSchema = pz.PostalCodeRequired();
type RequiredType = z.infer<typeof requiredSchema>; // string

const optionalSchema = pz.PostalCodeOptional();
type OptionalType = z.infer<typeof optionalSchema>; // string | undefined
```

## Best Practices

### Address Validation

```typescript
import { pz } from 'phantom-zod';

// Always validate ZIP codes for shipping addresses
const shippingAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2), // US state abbreviation
  zipCode: pz.PostalCodeRequired({ msg: 'Shipping ZIP Code' })
});

// Optional for international addresses
const internationalAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  country: z.string(),
  postalCode: z.string().optional() // Generic postal code for non-US
});
```

### ZIP Code Normalization

```typescript
import { pz } from 'phantom-zod';

// Pre-processing to clean ZIP code input
const normalizeZipCode = (zip: any) => {
  if (typeof zip !== 'string') return zip;
  
  // Remove spaces and normalize format
  return zip.replace(/\s+/g, '')
           .replace(/(\d{5})(\d{4})/, '$1-$2'); // Add hyphen if missing
};

const schema = pz.PostalCodeRequired().preprocess(normalizeZipCode);

// Usage
schema.parse("12345 6789"); // Becomes "12345-6789"
schema.parse("123456789");  // Becomes "12345-6789"
```

### Geographic Validation

```typescript
import { pz } from 'phantom-zod';

// ZIP code ranges for specific states/regions
const validateStateZipCode = (zipCode: string, state: string) => {
  const stateZipRanges = {
    'CA': { min: 90000, max: 96699 },  // California
    'NY': { min: 10000, max: 14999 },  // New York
    'TX': { min: 73000, max: 79999 },  // Texas
    'FL': { min: 32000, max: 34999 }   // Florida
  };
  
  const range = stateZipRanges[state as keyof typeof stateZipRanges];
  if (!range) return true; // Unknown state, skip validation
  
  const zipNumber = parseInt(zipCode.split('-')[0]);
  return zipNumber >= range.min && zipNumber <= range.max;
};

// Address schema with state-ZIP validation
const stateAddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: pz.PostalCodeRequired({ msg: 'ZIP Code' })
}).refine((data) => validateStateZipCode(data.zipCode, data.state), {
  message: "ZIP code does not match the selected state",
  path: ["zipCode"]
});
```

### Service Area Management

```typescript
import { pz } from 'phantom-zod';

// Service coverage by ZIP code
const serviceAreaSchema = z.object({
  serviceName: z.string(),
  coverageAreas: z.array(PostalCodeRequired({ msg: 'Coverage ZIP Code' })),
  excludedAreas: z.array(PostalCodeRequired({ msg: 'Excluded ZIP Code' })).optional()
});

// Delivery zone validation
const deliveryZoneSchema = z.object({
  zoneName: z.string(),
  baseZipCode: pz.PostalCodeRequired({ msg: 'Base ZIP Code' }),
  deliveryRadius: z.number().positive(),
  coveredZipCodes: z.array(PostalCodeRequired({ msg: 'Covered ZIP Code' }))
});
```

## Integration Examples

### React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pz } from 'phantom-zod';

const addressFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: pz.PostalCodeRequired({ msg: 'ZIP Code' }),
  
  // Optional mailing address
  differentMailingAddress: z.boolean(),
  mailingZipCode: pz.PostalCodeOptional({ msg: 'Mailing ZIP Code' })
});

function AddressForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(addressFormSchema)
  });

  const hasDifferentMailing = watch('differentMailingAddress');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} placeholder="First Name" />
      <input {...register('lastName')} placeholder="Last Name" />
      <input {...register('street')} placeholder="Street Address" />
      <input {...register('city')} placeholder="City" />
      <select {...register('state')}>
        <option value="">Select State</option>
        <option value="CA">California</option>
        <option value="NY">New York</option>
        <option value="TX">Texas</option>
        {/* ... other states */}
      </select>
      <input 
        {...register('zipCode')} 
        placeholder="ZIP Code" 
        maxLength={10} 
        pattern="[0-9]{5}(-[0-9]{4})?"
      />

      <label>
        <input type="checkbox" {...register('differentMailingAddress')} />
        Use different mailing address
      </label>

      {hasDifferentMailing && (
        <fieldset>
          <legend>Mailing Address</legend>
          {/* Additional mailing address fields */}
          <input {...register('mailingZipCode')} placeholder="Mailing ZIP Code" />
        </fieldset>
      )}

      {errors.zipCode && <span>{errors.zipCode.message}</span>}
      {errors.mailingZipCode && <span>{errors.mailingZipCode.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Express.js API

```typescript
import express from 'express';
import { z } from 'zod';
import { pz } from 'phantom-zod';

const app = express();

// Store location endpoint
const storeLocationSchema = z.object({
  name: z.string().min(1),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2),
    zipCode: pz.PostalCodeRequired({ msg: 'Store ZIP Code' })
  }),
  phone: z.string(),
  services: z.array(z.string())
});

app.post('/api/stores', (req, res) => {
  try {
    const store = storeLocationSchema.parse(req.body);
    // Save store to database
    res.json({ success: true, store });
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid store data',
      details: error.errors 
    });
  }
});

// ZIP code lookup endpoint
const zipLookupSchema = z.object({
  zipCode: pz.PostalCodeRequired({ msg: 'ZIP Code' })
});

app.get('/api/zip/:zipCode', (req, res) => {
  try {
    const { zipCode } = zipLookupSchema.parse({ zipCode: req.params.zipCode });
    // Look up ZIP code information
    const zipInfo = lookupZipCode(zipCode);
    res.json(zipInfo);
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid ZIP code format',
      details: error.errors 
    });
  }
});

// Service area endpoint
const serviceAreaSchema = z.object({
  serviceType: z.string(),
  zipCodes: z.array(PostalCodeRequired({ msg: 'Service ZIP Code' }))
});

app.post('/api/service-areas', (req, res) => {
  try {
    const serviceArea = serviceAreaSchema.parse(req.body);
    // Process service area
    res.json({ success: true, serviceArea });
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid service area data',
      details: error.errors 
    });
  }
});
```

### Database Models

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// Customer model
export const CustomerModel = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: pz.PostalCodeRequired({ msg: 'Billing ZIP Code' })
  }),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: pz.PostalCodeRequired({ msg: 'Shipping ZIP Code' })
  }).optional()
});

// Business model
export const BusinessModel = z.object({
  id: z.string().uuid(),
  name: z.string(),
  ein: z.string(),
  addresses: z.array(z.object({
    type: z.enum(['main', 'mailing', 'warehouse']),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: pz.PostalCodeRequired({ msg: 'Business ZIP Code' })
  })),
  serviceAreas: z.array(PostalCodeRequired({ msg: 'Service Area ZIP' }))
});

// Event model
export const EventModel = z.object({
  id: z.string().uuid(),
  title: z.string(),
  date: z.date(),
  venue: z.object({
    name: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: pz.PostalCodeRequired({ msg: 'Venue ZIP Code' })
    })
  }),
  attendeeZipCodes: z.array(PostalCodeOptional({ msg: 'Attendee ZIP Code' }))
});
```

### Shipping and Logistics

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// Shipping calculation service
const shippingRequestSchema = z.object({
  fromZipCode: pz.PostalCodeRequired({ msg: 'Origin ZIP Code' }),
  toZipCode: pz.PostalCodeRequired({ msg: 'Destination ZIP Code' }),
  weight: z.number().positive(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive()
  }),
  serviceType: z.enum(['ground', 'express', 'overnight'])
});

// Delivery zone service
class DeliveryZoneService {
  // Check if ZIP code is in delivery area
  isInDeliveryArea(zipCode: string, baseZipCode: string, radiusMiles: number): boolean {
    const schema = pz.PostalCodeRequired();
    
    // Validate both ZIP codes
    const validZip = schema.safeParse(zipCode);
    const validBaseZip = schema.safeParse(baseZipCode);
    
    if (!validZip.success || !validBaseZip.success) {
      return false;
    }
    
    // Calculate distance between ZIP codes (implementation would use actual geo data)
    return this.calculateZipDistance(zipCode, baseZipCode) <= radiusMiles;
  }

  // Get shipping cost based on ZIP codes
  calculateShippingCost(fromZip: string, toZip: string, weight: number): number {
    const schema = pz.PostalCodeRequired();
    
    schema.parse(fromZip);
    schema.parse(toZip);
    
    // Calculate shipping cost based on ZIP code zones
    const zone = this.getShippingZone(fromZip, toZip);
    return this.getZoneRate(zone) * weight;
  }

  private calculateZipDistance(zip1: string, zip2: string): number {
    // Implementation would use actual ZIP code coordinate data
    return 0;
  }

  private getShippingZone(fromZip: string, toZip: string): number {
    // Implementation would determine shipping zone based on ZIP codes
    return 1;
  }

  private getZoneRate(zone: number): number {
    // Implementation would return rate per pound for zone
    return 0.5;
  }
}
```

## Advanced Use Cases

### ZIP+4 Preference

```typescript
import { pz } from 'phantom-zod';

// Schema that prefers ZIP+4 format
const enhancedZipSchema = pz.PostalCodeRequired({ msg: 'ZIP Code' })
  .refine((zip) => {
    if (zip.includes('-')) return true;
    // Allow 5-digit but warn in application logic
    console.warn('Consider providing ZIP+4 for more accurate delivery');
    return true;
  });

// Business rule: require ZIP+4 for certain services
const precisionDeliverySchema = z.object({
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: pz.PostalCodeRequired({ msg: 'ZIP Code' })
      .refine((zip) => zip.includes('-'), {
        message: 'ZIP+4 format required for precision delivery'
      })
  }),
  serviceType: z.literal('precision-delivery')
});
```

### Military/PO Box Address Handling

```typescript
import { pz } from 'phantom-zod';

// Special handling for military addresses (APO/FPO)
const militaryAddressSchema = z.object({
  type: z.enum(['domestic', 'military']),
  address: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('domestic'),
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: pz.PostalCodeRequired({ msg: 'ZIP Code' })
    }),
    z.object({
      type: z.literal('military'),
      unit: z.string(),
      apoFpo: z.enum(['APO', 'FPO', 'DPO']),
      state: z.enum(['AA', 'AE', 'AP']), // Military state codes
      zipCode: pz.PostalCodeRequired({ msg: 'Military ZIP Code' })
    })
  ])
});
```

## See Also

- [Address Schemas](./address-schemas.md) - Complete address validation including postal codes
- [String Schemas](./string-schemas.md) - Basic string validation patterns
- [Array Schemas](./array-schemas.md) - For validating arrays of ZIP codes
- [Enum Schemas](./enum-schemas.md) - For state code validation
- [Validation Guide](../guides/validation.md) - General validation patterns
