# Address Schemas

The address schemas module provides comprehensive validation for physical addresses with support for different address formats, country-specific validation, and simplified address structures.

## Overview

This module offers flexible address validation with multiple schema types for different use cases, from simple addresses with minimal fields to full US address validation with state code validation and ZIP code formatting. All schemas automatically remove empty string fields from optional address components.

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, all address schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const addressTraditional = pz.AddressRequired({ msg: "Home Address" });

// Simplified string parameter (equivalent)
const addressSimple = pz.AddressRequired("Home Address");

// Both produce the same validation behavior
const addressInput = {
  street: "123 Main St",
  city: "Springfield",
  state: "IL",
  postalCode: "62704",
  country: "US"
};
addressTraditional.parse(addressInput); // ✅ Valid address object
addressSimple.parse(addressInput);      // ✅ Valid address object

// Error messages are identical
addressTraditional.parse({ street: "" }); // ❌ "Home Address street is required"
addressSimple.parse({ street: "" });      // ❌ "Home Address street is required"
```

**When to use string parameters:**
- Basic field name specification only
- Default validation behavior is sufficient
- Cleaner, more concise code

**When to use options objects:**
- Custom message types (`MsgType.Message`)
- Advanced localization configurations

## Available Schemas

### General Address Schemas

- **`pz.AddressRequired(msg?, msgType?)`** - Validates complete required address objects
- **`pz.AddressOptional(msg?, msgType?)`** - Validates complete optional address objects (accepts undefined)
- **`AddressSimple(msg?, msgType?)`** - Validates simplified addresses with minimal required fields

### Country-Specific Schemas

- **`pz.AddressUS(msg?, msgType?)`** - Validates US addresses with state codes and ZIP code validation

## Schema Structure

### Complete Address Structure

```typescript
interface CompleteAddress {
  street: string;        // Required: Street address
  street2?: string;      // Optional: Apartment, suite, etc. (removed if empty)
  city: string;          // Required: City name
  state: string;         // Required: State/province
  postalCode: string;    // Required: Postal/ZIP code
  country: string;       // Required: Country code or name
}
```

### Simple Address Structure

```typescript
interface SimpleAddress {
  street: string;        // Required: Street address
  city: string;          // Required: City name
  country: string;       // Required: Country code or name
}
```

### US Address Structure

```typescript
interface USAddress {
  street: string;        // Required: Street address
  street2?: string;      // Optional: Apartment, suite, etc. (removed if empty)
  city: string;          // Required: City name
  state: string;         // Required: US state code (AL, CA, NY, etc.)
  postalCode: string;    // Required: ZIP code (12345 or 12345-6789 format)
  country: "US";         // Automatically set to "US"
}
```

## Examples

### Basic Address Validation

```typescript
import { pz } from 'phantom-zod';

// Required address
const addressSchema = pz.AddressRequired();
const validAddress = addressSchema.parse({
  street: "123 Main Street",
  street2: "Apt 4B",
  city: "Springfield",
  state: "Illinois",
  postalCode: "62704",
  country: "United States"
}); // ✓ Valid

// Optional address
const optionalSchema = pz.AddressOptional();
optionalSchema.parse(undefined); // ✓ Valid
optionalSchema.parse({
  street: "456 Oak Ave",
  city: "Portland",
  state: "Oregon", 
  postalCode: "97201",
  country: "US"
}); // ✓ Valid (street2 is optional)
```

### Empty String Field Removal

```typescript
import { pz } from 'phantom-zod';

const schema = pz.AddressRequired();
const result = schema.parse({
  street: "123 Main Street",
  street2: "",              // Empty string
  city: "Springfield",
  state: "Illinois",
  postalCode: "62704",
  country: "US"
});

// result.street2 is undefined (empty string removed)
console.log(result.street2); // undefined
```

### Simple Address Validation

```typescript
import { pz } from 'phantom-zod';

// Minimal address with only essential fields
const simpleSchema = pz.AddressSimple();
const simpleAddress = simpleSchema.parse({
  street: "123 Main Street",
  city: "Springfield", 
  country: "US"
}); // ✓ Valid (no state or postal code required)
```

### US Address Validation

```typescript
import { pz } from 'phantom-zod';

// US-specific address with state code validation
const usSchema = pz.AddressUS();

// Valid US address
const validUS = usSchema.parse({
  street: "1600 Pennsylvania Avenue NW",
  city: "Washington",
  state: "DC", // Must be valid US state code
  postalCode: "20500", // ZIP code format
  // country defaults to "US"
}); // ✓ Valid

// With extended ZIP+4
const zipPlus4 = usSchema.parse({
  street: "350 Fifth Avenue",
  city: "New York", 
  state: "NY",
  postalCode: "10118-0110", // ZIP+4 format
  country: "US"
}); // ✓ Valid

// Invalid state code
usSchema.parse({
  street: "123 Main St",
  city: "Springfield",
  state: "XX", // Invalid state code
  postalCode: "12345",
  country: "US"
}); // ✗ Error: Invalid US state code
```

### Custom Error Messages

```typescript
import { pz } from 'phantom-zod';

// Custom field name
const shippingSchema = pz.AddressRequired('Shipping Address');

// Complete custom message
const customSchema = pz.AddressUS(
  'Please provide a valid US mailing address',
  MsgType.Message
);
```

### Form Validation Examples

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// User registration with required address
const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  address: pz.AddressRequired('Home Address')
});

// Profile with optional billing address
const profileSchema = z.object({
  userId: z.string().uuid(),
  billingAddress: pz.AddressOptional('Billing Address'),
  shippingAddress: pz.AddressRequired('Shipping Address')
});

// US-specific customer form
const usCustomerSchema = z.object({
  companyName: z.string(),
  businessAddress: pz.AddressUS('Business Address'),
  shippingAddress: pz.AddressUS('Shipping Address').optional()
});
```

## Error Messages

The address schemas provide specific error messages for validation failures:

- **Required field**: "Address is required"
- **Invalid address format**: "Address must be a valid address"
- **Invalid US state**: "State must be a valid US state code"
- **Invalid ZIP code**: "Postal Code must be a valid ZIP code"
- **Required address fields**: Field-specific messages for street, city, etc.

## US State Codes

The US address schema validates against all 50 state codes:

```typescript
// Valid US state codes
const validStates = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];
```

ZIP code validation supports both 5-digit and ZIP+4 formats:
- `12345` (5-digit format)
- `12345-6789` (ZIP+4 format)

## TypeScript Types

```typescript
// Complete address type
type AddressRequired = {
  street: string;
  street2?: string | undefined;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

// Optional address type
type AddressOptional = AddressRequired | undefined;

// Simple address type
type AddressSimple = {
  street: string;
  city: string;
  country: string;
};

// US address type
type AddressUS = {
  street: string;
  street2?: string | undefined;
  city: string;
  state: "AL" | "AK" | "AZ" | /* ... all US state codes */;
  postalCode: string;
  country: "US";
};

// Usage with schemas
const schema = pz.AddressRequired();
type InferredType = z.infer<typeof schema>; // AddressRequired
```

## Best Practices

### Address Collection Forms

```typescript
import { pz } from 'phantom-zod';

// Always collect complete addresses for shipping
const shippingAddressSchema = pz.AddressRequired('Shipping Address');

// Billing address optional if same as shipping
const orderSchema = z.object({
  shippingAddress: pz.AddressRequired('Shipping Address'),
  billingAddress: pz.AddressOptional('Billing Address'),
  sameAsBilling: z.boolean()
});
```

### International vs Domestic

```typescript
import { pz } from 'phantom-zod';

// Conditional validation based on country
const createAddressSchema = (country?: string) => {
  if (country === 'US') {
    return pz.AddressUS('Address');
  }
  return pz.AddressRequired('Address');
};

// Dynamic form validation
const orderFormSchema = z.object({
  country: z.string(),
  address: z.any() // Will be refined based on country
}).refine((data) => {
  const addressSchema = createAddressSchema(data.country);
  return addressSchema.safeParse(data.address).success;
});
```

### Address Normalization

```typescript
import { pz } from 'phantom-zod';

// Pre-processing for address normalization
const normalizeAddress = (address: any) => ({
  ...address,
  street: address.street?.trim().toUpperCase(),
  city: address.city?.trim(),
  state: address.state?.trim().toUpperCase(),
  postalCode: address.postalCode?.replace(/\D/g, '').substring(0, 5)
});

const schema = pz.AddressRequired().preprocess(normalizeAddress);
```

### Database Storage

```typescript
import { pz } from 'phantom-zod';

// User model with address
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  address: pz.AddressRequired('User Address'),
  mailingAddress: pz.AddressOptional('Mailing Address')
});

// Order model with US addresses
const OrderSchema = z.object({
  orderId: z.string(),
  customerId: z.string().uuid(),
  shippingAddress: pz.AddressUS('Shipping Address'),
  billingAddress: pz.AddressUS('Billing Address')
});
```

## Integration Examples

### React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pz } from 'phantom-zod';

const checkoutSchema = z.object({
  email: z.string().email(),
  shippingAddress: pz.AddressRequired('Shipping Address'),
  billingAddress: pz.AddressUS('Billing Address'),
  sameAsShipping: z.boolean()
});

function CheckoutForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema)
  });

  const sameAsShipping = watch('sameAsShipping');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Email */}
      <input {...register('email')} placeholder="Email" />
      
      {/* Shipping Address */}
      <fieldset>
        <legend>Shipping Address</legend>
        <input {...register('shippingAddress.street')} placeholder="Street" />
        <input {...register('shippingAddress.street2')} placeholder="Apt/Suite" />
        <input {...register('shippingAddress.city')} placeholder="City" />
        <input {...register('shippingAddress.state')} placeholder="State" />
        <input {...register('shippingAddress.postalCode')} placeholder="ZIP" />
        <input {...register('shippingAddress.country')} placeholder="Country" />
      </fieldset>

      {/* Billing Address */}
      <label>
        <input type="checkbox" {...register('sameAsShipping')} />
        Same as shipping address
      </label>
      
      {!sameAsShipping && (
        <fieldset>
          <legend>Billing Address</legend>
          <input {...register('billingAddress.street')} placeholder="Street" />
          <input {...register('billingAddress.street2')} placeholder="Apt/Suite" />
          <input {...register('billingAddress.city')} placeholder="City" />
          <select {...register('billingAddress.state')}>
            <option value="">Select State</option>
            <option value="CA">California</option>
            <option value="NY">New York</option>
            {/* ... other states */}
          </select>
          <input {...register('billingAddress.postalCode')} placeholder="ZIP" />
        </fieldset>
      )}

      {/* Display errors */}
      {errors.shippingAddress && (
        <div>Shipping Address: {errors.shippingAddress.message}</div>
      )}
      {errors.billingAddress && (
        <div>Billing Address: {errors.billingAddress.message}</div>
      )}

      <button type="submit">Complete Order</button>
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

// Customer registration endpoint
const registrationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  address: pz.AddressRequired('Customer Address')
});

app.post('/api/customers', (req, res) => {
  try {
    const customer = registrationSchema.parse(req.body);
    // Save customer to database
    res.json({ success: true, customer });
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid customer data',
      details: error.errors 
    });
  }
});

// US shipping calculation endpoint
const shippingSchema = z.object({
  fromAddress: pz.AddressUS('Origin Address'),
  toAddress: pz.AddressUS('Destination Address'),
  weight: z.number().positive(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number()
  })
});

app.post('/api/shipping/calculate', (req, res) => {
  try {
    const shipment = shippingSchema.parse(req.body);
    // Calculate shipping cost
    const cost = calculateShipping(shipment);
    res.json({ cost, estimatedDays: 3 });
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid shipping data',
      details: error.errors 
    });
  }
});
```

### Database Models

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// User model with optional addresses
export const UserModel = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  homeAddress: pz.AddressOptional('Home Address'),
  workAddress: pz.AddressOptional('Work Address'),
  preferences: z.object({
    defaultAddress: z.enum(['home', 'work']).optional()
  })
});

// Order model with required US addresses
export const OrderModel = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  orderDate: z.date(),
  shippingAddress: pz.AddressUS('Shipping Address'),
  billingAddress: pz.AddressUS('Billing Address'),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    price: z.number()
  })),
  total: z.number(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered'])
});

// Store location model
export const StoreLocationModel = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: pz.AddressUS('Store Address'),
  phone: z.string(),
  hours: z.object({
    monday: z.string(),
    tuesday: z.string(),
    wednesday: z.string(),
    thursday: z.string(),
    friday: z.string(),
    saturday: z.string(),
    sunday: z.string()
  }),
  services: z.array(z.string())
});
```

### Address Validation Service

```typescript
import { pz } from 'phantom-zod';

class AddressValidationService {
  // Validate and normalize any address
  validateGeneral(address: unknown) {
    const schema = pz.AddressRequired('Address');
    return schema.safeParse(address);
  }

  // Validate US address with state and ZIP validation
  validateUS(address: unknown) {
    const schema = pz.AddressUS('US Address');
    return schema.safeParse(address);
  }

  // Conditional validation based on country
  validateByCountry(address: unknown, country: string) {
    const schema = country === 'US' 
      ? pz.AddressUS('Address')
      : pz.AddressRequired('Address');
    
    return schema.safeParse(address);
  }

  // Validate shipping address pair
  validateShippingPair(from: unknown, to: unknown) {
    const fromResult = this.validateGeneral(from);
    const toResult = this.validateGeneral(to);
    
    return {
      from: fromResult,
      to: toResult,
      valid: fromResult.success && toResult.success
    };
  }
}

const addressValidator = new AddressValidationService();
export { addressValidator };
```

## See Also

- [String Schemas](./string-schemas.md) - For individual address field validation
- [Postal Code Schemas](./postal-code-schemas.md) - For postal code validation
- [Enum Schemas](./enum-schemas.md) - For country and state code validation
- [Object Validation Guide](../guides/object-validation.md) - Complex object validation patterns
