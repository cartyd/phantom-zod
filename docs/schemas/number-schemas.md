# Number Schemas

Number schemas provide comprehensive numeric validation with support for integers, floating-point numbers, sign constraints, range validation, and string-to-number coercion with strict error handling.

## Overview

All number schemas in Phantom Zod provide:

- **Type coercion** from strings to numbers with strict validation
- **Range constraints** with minimum and maximum values
- **Sign validation** (positive, negative, non-negative, non-positive)
- **Integer constraints** with decimal rejection
- **Safety checks** for finite numbers and safe integers
- **Consistent error handling** through localization
- **Type safety** with TypeScript inference

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, all number schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const ageTraditional = pz.NumberRequired({ msg: "Age" });

// Simplified string parameter (equivalent)
const ageSimple = pz.NumberRequired("Age");

// Both produce the same validation behavior
ageTraditional.parse(25); // ✅ 25
ageSimple.parse(25);      // ✅ 25

// Error messages are identical
ageTraditional.parse("abc"); // ❌ "Age must be a number"
ageSimple.parse("abc");      // ❌ "Age must be a number"
```

**When to use string parameters:**
- Basic field name specification only
- Default validation behavior is sufficient
- Cleaner, more concise code

**When to use options objects:**
- Range constraints needed (`min`, `max`)
- Custom message types (`MsgType.Message`)
- Advanced localization configurations

## Available Schemas

### Core Number Schemas

#### NumberRequired

Creates a required number schema that accepts numbers and coerces valid numeric strings.

```typescript
pz.NumberRequired(options?: NumberSchemaOptions)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `msg` | `string` | `"Value"` | Field name or custom error message |
| `msgType` | `MsgType` | `MsgType.FieldName` | Message type for localization |
| `min` | `number` | `undefined` | Minimum value (inclusive) |
| `max` | `number` | `undefined` | Maximum value (inclusive) |

**Examples:**

```typescript
import { pz } from "phantom-zod";

const schema = pz.NumberRequired({ msg: "Age" });

// Valid inputs
schema.parse(25);           // ✅ 25
schema.parse("42");         // ✅ 42 (coerced from string)
schema.parse("3.14");       // ✅ 3.14
schema.parse("-10");        // ✅ -10
schema.parse("0");          // ✅ 0

// Invalid inputs
schema.parse("");           // ❌ Error: Age must be a number
schema.parse("abc");        // ❌ Error: Age must be a number
schema.parse("12.34.56");   // ❌ Error: Age must be a number
schema.parse("123.");       // ❌ Error: Age must be a number
schema.parse(null);         // ❌ Error: Age must be a number
schema.parse(undefined);    // ❌ Error: Age is required
```

**With Range Constraints:**
```typescript
const ageSchema = pz.NumberRequired({ 
  msg: "Age", 
  min: 0, 
  max: 120 
});

ageSchema.parse(25);        // ✅ 25
ageSchema.parse(0);         // ✅ 0 (min boundary)
ageSchema.parse(120);       // ✅ 120 (max boundary)
ageSchema.parse(-1);        // ❌ Error: Age must be at least 0
ageSchema.parse(150);       // ❌ Error: Age must be at most 120
```

#### NumberOptional

Creates an optional number schema that accepts numbers, valid numeric strings, or undefined.

```typescript
pz.NumberOptional(options?: NumberSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.NumberOptional({ msg: "Score" });

// Valid inputs
schema.parse(95);           // ✅ 95
schema.parse("88");         // ✅ 88
schema.parse(undefined);    // ✅ undefined
schema.parse(0);            // ✅ 0

// Invalid inputs
schema.parse("invalid");    // ❌ Error: Score must be a number
schema.parse("");           // ❌ Error: Score must be a number
```

#### NumberStringRequired / NumberStringOptional

Creates number schemas that return the validated number as a string.

```typescript
const stringNumberSchema = pz.NumberStringRequired({ msg: "Price" });

stringNumberSchema.parse(29.99);   // ✅ "29.99"
stringNumberSchema.parse("42");    // ✅ "42"
```

### Integer Schemas

#### IntegerRequired

Creates a required integer schema that only accepts whole numbers.

```typescript
pz.IntegerRequired(options?: NumberSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.IntegerRequired({ msg: "Count" });

// Valid inputs
schema.parse(10);           // ✅ 10
schema.parse("25");         // ✅ 25
schema.parse(-5);           // ✅ -5
schema.parse("0");          // ✅ 0

// Invalid inputs
schema.parse(3.14);         // ❌ Error: Count must be an integer
schema.parse("2.5");        // ❌ Error: Count must be an integer
schema.parse("abc");        // ❌ Error: Count must be a number
```

**With Constraints:**
```typescript
const quantitySchema = pz.IntegerRequired({ 
  msg: "Quantity", 
  min: 1, 
  max: 100 
});

quantitySchema.parse(50);   // ✅ 50
quantitySchema.parse(1);    // ✅ 1 (min boundary)
quantitySchema.parse(100);  // ✅ 100 (max boundary)
quantitySchema.parse(0);    // ❌ Error: Quantity must be at least 1
quantitySchema.parse(150);  // ❌ Error: Quantity must be at most 100
```

#### IntegerOptional

Optional version of integer validation.

```typescript
const schema = pz.IntegerOptional({ msg: "Priority" });

schema.parse(1);            // ✅ 1
schema.parse(undefined);    // ✅ undefined
schema.parse(2.5);          // ❌ Error: Priority must be an integer
```

### Sign-Constrained Schemas

#### PositiveRequired

Creates a schema that only accepts positive numbers (> 0).

```typescript
pz.PositiveRequired(options?: NumberSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.PositiveRequired({ msg: "Amount" });

// Valid inputs
schema.parse(10);           // ✅ 10
schema.parse(0.1);          // ✅ 0.1
schema.parse("25");         // ✅ 25

// Invalid inputs
schema.parse(0);            // ❌ Error: Amount must be positive
schema.parse(-5);           // ❌ Error: Amount must be positive
schema.parse("-10");        // ❌ Error: Amount must be positive
```

#### NegativeRequired

Creates a schema that only accepts negative numbers (< 0).

```typescript
const schema = pz.NegativeRequired({ msg: "Debt" });

schema.parse(-10);          // ✅ -10
schema.parse("-5.5");       // ✅ -5.5
schema.parse(5);            // ❌ Error: Debt must be negative
schema.parse(0);            // ❌ Error: Debt must be negative
```

#### NonNegativeRequired

Creates a schema that accepts zero and positive numbers (>= 0).

```typescript
const schema = pz.NonNegativeRequired({ msg: "Balance" });

// Valid inputs
schema.parse(100);          // ✅ 100
schema.parse(0);            // ✅ 0
schema.parse("25.5");       // ✅ 25.5

// Invalid inputs
schema.parse(-1);           // ❌ Error: Balance must be non-negative
schema.parse("-0.1");       // ❌ Error: Balance must be non-negative
```

#### NonPositiveRequired

Creates a schema that accepts zero and negative numbers (<= 0).

```typescript
const schema = pz.NonPositiveRequired({ msg: "Temperature Change" });

schema.parse(-10);          // ✅ -10
schema.parse(0);            // ✅ 0
schema.parse("-5.2");       // ✅ -5.2
schema.parse(1);            // ❌ Error: Temperature Change must be non-positive
```

### Safety and Precision Schemas

#### FiniteRequired

Creates a schema that only accepts finite numbers (not Infinity or -Infinity).

```typescript
const schema = pz.FiniteRequired({ msg: "Measurement" });

schema.parse(100);          // ✅ 100
schema.parse(-50);          // ✅ -50
schema.parse(Infinity);     // ❌ Error: Measurement must be finite
schema.parse(-Infinity);    // ❌ Error: Measurement must be finite
```

#### SafeIntegerRequired

Creates a schema that only accepts safe integers (within JavaScript's safe integer range).

```typescript
const schema = pz.SafeIntegerRequired({ msg: "ID" });

schema.parse(123456789);                    // ✅ 123456789
schema.parse(Number.MAX_SAFE_INTEGER);      // ✅ 9007199254740991
schema.parse(Number.MAX_SAFE_INTEGER + 1);  // ❌ Error: ID must be a safe integer
```

## Type Definitions

```typescript
interface NumberSchemaOptions {
  msg?: string;           // Field name or custom message
  msgType?: MsgType;      // Message formatting type
  min?: number;           // Minimum value (inclusive)
  max?: number;           // Maximum value (inclusive)
}

// Inferred types
type NumberRequired = number;              // Always a number
type NumberOptional = number | undefined;  // Number or undefined
type NumberStringRequired = string;        // Number as string
type IntegerRequired = number;             // Integer number
type PositiveRequired = number;            // Positive number
```

## Validation Behavior

### String Coercion Rules

Number schemas accept strings and convert them to numbers with strict validation:

| Input | Result | Valid |
|-------|--------|-------|
| `"123"` | `123` | ✅ |
| `"3.14"` | `3.14` | ✅ |
| `"-42"` | `-42` | ✅ |
| `"0"` | `0` | ✅ |
| `""` | - | ❌ Empty string |
| `"abc"` | - | ❌ Invalid number |
| `"123."` | - | ❌ Trailing decimal |
| `"12.34.56"` | - | ❌ Multiple decimals |
| `" 123 "` | `123` | ✅ Trimmed |

### Type Rejection

The following types are always rejected:
- `null` - Explicit null values
- `undefined` - For required schemas
- `boolean` - Boolean values
- `object` - Objects and arrays
- `symbol` - Symbol values

## Common Patterns

### Form Input Validation

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

const userProfileSchema = z.object({
  // Basic number fields
  age: pz.NumberRequired({ 
    msg: "Age", 
    min: 13, 
    max: 120 
  }),
  weight: pz.NumberOptional({ 
    msg: "Weight", 
    min: 0,
    max: 1000
  }),
  
  // Integer fields
  dependents: pz.IntegerRequired({ 
    msg: "Number of Dependents", 
    min: 0,
    max: 20
  }),
  
  // Positive numbers
  salary: pz.PositiveRequired({ 
    msg: "Annual Salary",
    min: 1000,
    max: 10000000
  }),
  
  // Non-negative (can be zero)
  savings: pz.NonNegativeRequired({ 
    msg: "Savings Amount",
    max: 100000000
  }),
});

type UserProfile = z.infer<typeof userProfileSchema>;
```

### E-commerce Product Schema

```typescript
const productSchema = z.object({
  name: pz.StringRequired({ msg: "Product Name" }),
  price: pz.PositiveRequired({ 
    msg: "Price", 
    min: 0.01,     // Minimum 1 cent
    max: 99999.99  // Maximum price
  }),
  originalPrice: pz.PositiveOptional({ 
    msg: "Original Price",
    min: 0.01
  }),
  stockQuantity: pz.IntegerRequired({ 
    msg: "Stock Quantity",
    min: 0,
    max: 10000
  }),
  weight: pz.PositiveOptional({ 
    msg: "Weight (kg)",
    min: 0.001,    // Minimum 1 gram
    max: 1000      // Maximum 1 ton
  }),
  dimensions: z.object({
    length: pz.PositiveRequired({ msg: "Length", min: 0.1 }),
    width: pz.PositiveRequired({ msg: "Width", min: 0.1 }),
    height: pz.PositiveRequired({ msg: "Height", min: 0.1 }),
  }).optional(),
});
```

### Scientific Data Schema

```typescript
const experimentSchema = z.object({
  temperature: pz.NumberRequired({ 
    msg: "Temperature (°C)",
    min: -273.15,  // Absolute zero
    max: 10000     // Reasonable upper limit
  }),
  pressure: pz.NonNegativeRequired({ 
    msg: "Pressure (Pa)",
    min: 0
  }),
  sampleCount: pz.SafeIntegerRequired({ 
    msg: "Sample Count",
    min: 1,
    max: Number.MAX_SAFE_INTEGER
  }),
  errorMargin: pz.PositiveRequired({ 
    msg: "Error Margin (%)",
    min: 0.001,
    max: 100
  }),
  controlValue: pz.FiniteRequired({ 
    msg: "Control Value"
  }),
});
```

### Financial Schema

```typescript
const transactionSchema = z.object({
  amount: pz.PositiveRequired({ 
    msg: "Amount",
    min: 0.01,        // Minimum transaction
    max: 1000000      // Maximum transaction
  }),
  fee: pz.NonNegativeRequired({ 
    msg: "Transaction Fee",
    max: 1000
  }),
  exchangeRate: pz.PositiveOptional({ 
    msg: "Exchange Rate",
    min: 0.0001,
    max: 10000
  }),
  accountBalance: pz.NumberRequired({ 
    msg: "Account Balance",
    min: -10000,      // Overdraft limit
    max: 10000000     // Account limit
  }),
});
```

### Configuration Schema

```typescript
const configSchema = z.object({
  // Server configuration
  port: pz.IntegerRequired({ 
    msg: "Port Number",
    min: 1,
    max: 65535
  }),
  maxConnections: pz.IntegerRequired({ 
    msg: "Max Connections",
    min: 1,
    max: 10000
  }),
  
  // Performance settings
  timeout: pz.PositiveRequired({ 
    msg: "Timeout (seconds)",
    min: 1,
    max: 3600
  }),
  retryAttempts: pz.IntegerRequired({ 
    msg: "Retry Attempts",
    min: 0,
    max: 10
  }),
  
  // Optional settings
  cacheSize: pz.IntegerOptional({ 
    msg: "Cache Size (MB)",
    min: 1,
    max: 10000
  }),
  
  // Decimal precision
  precision: pz.IntegerRequired({ 
    msg: "Decimal Precision",
    min: 0,
    max: 10
  }),
});
```

## Error Messages

Number schemas provide specific error messages based on validation type:

### Default Messages (English)

- **Required:** `"[Field Name] is required"`
- **Type:** `"[Field Name] must be a number"`
- **Integer:** `"[Field Name] must be an integer"`
- **Positive:** `"[Field Name] must be positive"`
- **Negative:** `"[Field Name] must be negative"`
- **Non-negative:** `"[Field Name] must be non-negative"`
- **Non-positive:** `"[Field Name] must be non-positive"`
- **Minimum:** `"[Field Name] must be at least [min]"`
- **Maximum:** `"[Field Name] must be at most [max]"`
- **Finite:** `"[Field Name] must be finite"`
- **Safe Integer:** `"[Field Name] must be a safe integer"`

### Custom Error Messages

```typescript
import { MsgType } from "phantom-zod";

const schema = pz.NumberRequired({
  msg: "Please enter a valid age between 18 and 65",
  msgType: MsgType.Message,
  min: 18,
  max: 65
});
```

## Best Practices

### 1. Choose Appropriate Constraints

```typescript
// Good: Reasonable constraints based on domain
const ageSchema = pz.IntegerRequired({ 
  msg: "Age", 
  min: 0, 
  max: 150 
});

// Good: Business-specific constraints
const priceSchema = pz.PositiveRequired({ 
  msg: "Price", 
  min: 0.01,      // Minimum 1 cent
  max: 999999.99  // Reasonable maximum
});

// Avoid: Overly restrictive without business justification
const restrictedSchema = pz.IntegerRequired({ 
  msg: "Count", 
  min: 42, 
  max: 43  // Too specific without reason
});
```

### 2. Use Appropriate Number Types

```typescript
// Use Integer for count-based fields
const itemCount = pz.IntegerRequired({ msg: "Item Count" });
const userCount = pz.IntegerOptional({ msg: "User Count" });

// Use Positive for amounts that can't be zero
const price = pz.PositiveRequired({ msg: "Price" });
const distance = pz.PositiveRequired({ msg: "Distance" });

// Use NonNegative for amounts that can be zero
const balance = pz.NonNegativeRequired({ msg: "Balance" });
const score = pz.NonNegativeRequired({ msg: "Score" });

// Use regular Number for measurements that can be negative
const temperature = pz.NumberRequired({ msg: "Temperature" });
const altitude = pz.NumberRequired({ msg: "Altitude" });
```

### 3. Handle Edge Cases

```typescript
// Consider zero as a valid value
const quantitySchema = pz.IntegerRequired({ 
  msg: "Quantity",
  min: 0  // Zero is valid (out of stock)
});

// Use SafeInteger for IDs and counters
const idSchema = pz.SafeIntegerRequired({ msg: "ID" });

// Use Finite for calculated values
const ratioSchema = pz.FiniteRequired({ msg: "Ratio" });
```

### 4. Provide Clear Field Names

```typescript
// Good: Descriptive field names
const userAgeSchema = pz.IntegerRequired({ msg: "User Age" });
const productPriceSchema = pz.PositiveRequired({ msg: "Product Price" });
const accountBalanceSchema = pz.NumberRequired({ msg: "Account Balance" });

// Avoid: Generic names
const numberSchema = pz.NumberRequired({ msg: "Number" });
const valueSchema = pz.NumberRequired({ msg: "Value" });
```

## Integration Examples

### With React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  age: pz.IntegerRequired({ 
    msg: "Age", 
    min: 18, 
    max: 100 
  }),
  salary: pz.PositiveOptional({ 
    msg: "Annual Salary",
    min: 1000
  }),
  dependents: pz.IntegerRequired({ 
    msg: "Dependents", 
    min: 0, 
    max: 10 
  }),
});

const NumberForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema)
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input 
        {...register("age")} 
        type="number" 
        placeholder="Age" 
        min="18" 
        max="100"
      />
      {errors.age && <span>{errors.age.message}</span>}
      
      <input 
        {...register("salary")} 
        type="number" 
        placeholder="Annual Salary (optional)" 
        min="1000"
        step="1000"
      />
      {errors.salary && <span>{errors.salary.message}</span>}
      
      <input 
        {...register("dependents")} 
        type="number" 
        placeholder="Number of Dependents" 
        min="0" 
        max="10"
      />
      {errors.dependents && <span>{errors.dependents.message}</span>}
    </form>
  );
};
```

### With Express.js API

```typescript
import express from "express";

const productSchema = z.object({
  name: pz.StringRequired({ msg: "Product Name" }),
  price: pz.PositiveRequired({ 
    msg: "Price", 
    min: 0.01,
    max: 99999.99
  }),
  quantity: pz.IntegerRequired({ 
    msg: "Quantity",
    min: 0,
    max: 10000
  }),
  weight: pz.PositiveOptional({ 
    msg: "Weight",
    min: 0.001
  }),
});

app.post("/products", (req, res) => {
  try {
    const productData = productSchema.parse(req.body);
    
    // All numbers are validated and coerced
    console.log("Price:", typeof productData.price, productData.price);
    // Price: number 29.99
    
    await Product.create(productData);
    res.json({ success: true, product: productData });
  } catch (error) {
    res.status(400).json({ 
      error: "Validation failed",
      issues: error.issues 
    });
  }
});
```

### Database Integration

```typescript
// Database model with proper number types
interface OrderModel {
  id: number;
  customerId: number;
  totalAmount: number;    // Positive number
  taxAmount: number;      // Non-negative
  itemCount: number;      // Integer
  discount: number;       // Can be zero or positive
  created: Date;
}

// Validation schema matching database constraints
const orderSchema = z.object({
  customerId: pz.SafeIntegerRequired({ msg: "Customer ID" }),
  totalAmount: pz.PositiveRequired({ 
    msg: "Total Amount",
    min: 0.01,
    max: 999999.99
  }),
  taxAmount: pz.NonNegativeRequired({ 
    msg: "Tax Amount",
    max: 99999.99
  }),
  itemCount: pz.IntegerRequired({ 
    msg: "Item Count",
    min: 1,
    max: 100
  }),
  discount: pz.NonNegativeRequired({ 
    msg: "Discount",
    max: 1000
  }),
});

// API endpoint with validation
app.post("/orders", async (req, res) => {
  const orderData = orderSchema.parse(req.body);
  
  const order = await Order.create({
    ...orderData,
    id: generateId(),
    created: new Date(),
  });
  
  res.json({ order });
});
```

## See Also

- [String Schemas](string-schemas.md) - Text validation
- [Boolean Schemas](boolean-schemas.md) - Boolean validation
- [Date Schemas](date-schemas.md) - Date and time validation
- [Money Schemas](money-schemas.md) - Currency and money validation
- [Form Validation Examples](../examples/form-validation.md) - Practical form usage
- [API Validation Examples](../examples/api-validation.md) - API endpoint validation
