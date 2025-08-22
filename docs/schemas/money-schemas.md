# Money Schemas

The money schemas module provides comprehensive validation for monetary values, currency codes, and financial data with support for ISO 4217 currency standards, decimal precision control, and various money-related use cases.

## Overview

This module offers robust financial data validation including currency code validation against ISO 4217 standards, monetary amount validation with configurable decimal precision, and specialized schemas for prices, price ranges, and money objects. It supports both numeric and string input formats for form compatibility.

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, most money schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const priceTraditional = pz.MoneyRequired({ msg: "Product Price" });

// Simplified string parameter (equivalent)
const priceSimple = pz.MoneyRequired("Product Price");

// Both produce the same validation behavior
const moneyInput = { amount: 99.99, currency: "USD" };
priceTraditional.parse(moneyInput); // ✅ { amount: 99.99, currency: "USD" }
priceSimple.parse(moneyInput);      // ✅ { amount: 99.99, currency: "USD" }

// Error messages are identical
priceTraditional.parse({ amount: -10, currency: "USD" }); // ❌ "Product Price amount must be positive"
priceSimple.parse({ amount: -10, currency: "USD" });      // ❌ "Product Price amount must be positive"
```

**When to use string parameters:**
- Basic field name specification only
- Default decimal precision (2) is sufficient
- Cleaner, more concise code

**When to use options objects:**
- Custom decimal precision needed (`maxDecimals`)
- Custom message types (`MsgType.Message`)
- Advanced localization configurations

**Note:** Some money schemas like `CurrencyCode` and `MoneyAmount` have specialized parameters and may not support string overloads in the same way.

## Available Schemas

### Core Money Schemas

- **`MoneyRequired(options?)`** - Validates required money objects with amount and currency
- **`MoneyOptional(options?)`** - Validates optional money objects (accepts undefined)
- **`MoneyFromString(options?)`** - Validates money objects with string amount input

### Currency and Amount Components

- **`CurrencyCode(options?)`** - Validates ISO 4217 currency codes
- **`MoneyAmount(options?)`** - Validates numeric monetary amounts
- **`MoneyAmountFromString(options?)`** - Validates string monetary amounts (converts to number)

### Price Schemas

- **`Price(currency, options?)`** - Creates price schemas with fixed currency
- **`PriceRange(currency, options?)`** - Validates price ranges with min/max values

## Schema Options

All money schemas accept a `MoneySchemaOptions` configuration object:

```typescript
interface MoneySchemaOptions {
  msg?: string;          // Custom field name or error message
  msgType?: MsgType;     // Whether msg is field name or complete message
  maxDecimals?: number;  // Maximum decimal places (default: 2)
}
```

## Money Object Structure

```typescript
interface MoneyObject {
  amount: number;    // Monetary amount (positive number)
  currency: string;  // ISO 4217 currency code (e.g., "USD", "EUR")
}
```

## Supported Currencies

The schemas validate against ISO 4217 currency codes. Common supported currencies include:

```typescript
const commonCurrencies = [
  "USD", // US Dollar
  "EUR", // Euro
  "GBP", // British Pound
  "JPY", // Japanese Yen
  "CHF", // Swiss Franc
  "CAD", // Canadian Dollar
  "AUD", // Australian Dollar
  "CNY", // Chinese Yuan
  "INR", // Indian Rupee
  "BRL", // Brazilian Real
  "KRW", // South Korean Won
  "MXN", // Mexican Peso
  // ... and many more
];
```

## Examples

### Basic Money Validation

```typescript
import { pz } from 'phantom-zod';

// Required money object
const priceSchema = pz.MoneyRequired();
const validPrice = priceSchema.parse({
  amount: 99.99,
  currency: "USD"
}); // ✓ Valid

// Optional money object
const discountSchema = pz.MoneyOptional();
discountSchema.parse(undefined); // ✓ Valid
discountSchema.parse({
  amount: 10.00,
  currency: "EUR"
}); // ✓ Valid
```

### Currency Code Validation

```typescript
import { pz } from 'phantom-zod';

const currencySchema = pz.CurrencyCode();

// Valid currency codes
currencySchema.parse("USD"); // ✓ Valid
currencySchema.parse("EUR"); // ✓ Valid
currencySchema.parse("GBP"); // ✓ Valid
currencySchema.parse("JPY"); // ✓ Valid

// Invalid currency codes
currencySchema.parse("XYZ"); // ✗ Error: Invalid currency code
currencySchema.parse("usd"); // ✗ Error: Must be uppercase
currencySchema.parse("");    // ✗ Error: Required
```

### Money Amount Validation

```typescript
import { pz } from 'phantom-zod';

// Numeric amount validation
const amountSchema = pz.MoneyAmount();
amountSchema.parse(99.99);  // ✓ Valid
amountSchema.parse(0.01);   // ✓ Valid
amountSchema.parse(0);      // ✗ Error: Must be positive
amountSchema.parse(-10);    // ✗ Error: Must be positive

// String amount validation (converts to number)
const stringAmountSchema = pz.MoneyAmountFromString();
stringAmountSchema.parse("99.99"); // ✓ Valid (returns 99.99)
stringAmountSchema.parse("10");    // ✓ Valid (returns 10)
stringAmountSchema.parse("abc");   // ✗ Error: Invalid format
```

### Decimal Precision Control

```typescript
import { pz } from 'phantom-zod';

// Default 2 decimal places
const standardPriceSchema = pz.MoneyAmount();
standardPriceSchema.parse(99.99);   // ✓ Valid
standardPriceSchema.parse(99.999);  // ✗ Error: Too many decimals

// Custom decimal precision
const cryptoSchema = pz.MoneyRequired({
  msg: 'Crypto Amount',
  maxDecimals: 8
});
cryptoSchema.parse({
  amount: 0.00000001,
  currency: "BTC" // Note: BTC not in ISO 4217, would need custom validation
}); // ✓ Valid for amount precision

// No decimals (whole numbers only)
const wholePriceSchema = pz.MoneyAmount({
  msg: 'Whole Price',
  maxDecimals: 0
});
wholePriceSchema.parse(100);   // ✓ Valid
wholePriceSchema.parse(99.50); // ✗ Error: No decimals allowed
```

### Form-Compatible String Input

```typescript
import { pz } from 'phantom-zod';

// For handling form data where amounts come as strings
const formPriceSchema = MoneyFromString({ msg: 'Product Price' });

const formData = {
  amount: "29.99", // String input from form
  currency: "USD"
};

const result = formPriceSchema.parse(formData);
// Result: { amount: 29.99, currency: "USD" } (amount converted to number)
```

### Fixed Currency Price Schemas

```typescript
import { pz } from 'phantom-zod';

// Price schema with fixed USD currency
const usdPriceSchema = pz.Price("USD", { msg: 'USD Price' });

// Input is just the amount, currency is automatically added
const product = usdPriceSchema.parse(49.99);
// Result: { amount: 49.99, currency: "USD" }

// Different currencies for different markets
const eurPriceSchema = pz.Price("EUR", { msg: 'EUR Price' });
const jpyPriceSchema = pz.Price("JPY", { msg: 'JPY Price', maxDecimals: 0 });

eurPriceSchema.parse(45.99); // { amount: 45.99, currency: "EUR" }
jpyPriceSchema.parse(5400);  // { amount: 5400, currency: "JPY" }
```

### Price Range Validation

```typescript
import { pz } from 'phantom-zod';

// Price range schema for filtering/searching
const priceRangeSchema = pz.PriceRange("USD", { msg: 'Price Range' });

const validRange = priceRangeSchema.parse({
  min: 10.00,
  max: 100.00
});
// Result: { 
//   min: { amount: 10.00, currency: "USD" }, 
//   max: { amount: 100.00, currency: "USD" } 
// }

// Invalid range (min > max)
priceRangeSchema.parse({
  min: 100.00,
  max: 10.00
}); // ✗ Error: Minimum must be less than maximum
```

### Custom Error Messages

```typescript
import { pz } from 'phantom-zod';

// Custom field names
const productPriceSchema = pz.MoneyRequired({ msg: 'Product Price' });
const shippingCostSchema = pz.MoneyOptional({ msg: 'Shipping Cost' });

// Complete custom messages
const customPriceSchema = pz.MoneyRequired({
  msg: 'Please enter a valid price with currency',
  msgType: MsgType.Message
});

const currencySelectSchema = pz.CurrencyCode({
  msg: 'Please select a valid currency',
  msgType: MsgType.Message
});
```

## Error Messages

The money schemas provide specific error messages for different validation failures:

- **Required field**: "Money is required"
- **Invalid currency code**: "Currency must be a valid currency code"
- **Invalid amount**: "Amount must be a valid amount"
- **Non-positive amount**: "Amount must be a positive amount"  
- **Too many decimals**: "Amount cannot have more than {max} decimal places"
- **Invalid money object**: "Money must be a money object"
- **Invalid price range**: "Price range is invalid" (min > max)

## TypeScript Types

```typescript
// Money object types
type MoneyRequired = {
  amount: number;
  currency: string;
};

type MoneyOptional = {
  amount: number;
  currency: string;
} | undefined;

// Price types
type PriceRequired = {
  amount: number;
  currency: string;
};

type PriceRange = {
  min: { amount: number; currency: string };
  max: { amount: number; currency: string };
};

// Currency type
type CurrencyCode = "USD" | "EUR" | "GBP" | /* ... all ISO 4217 codes */;

// Schema configuration
interface MoneySchemaOptions {
  msg?: string;
  msgType?: MsgType;
  maxDecimals?: number;
}

// Usage with schemas
const schema = pz.MoneyRequired();
type InferredType = z.infer<typeof schema>; // MoneyRequired
```

## Best Practices

### E-commerce Applications

```typescript
import { pz } from 'phantom-zod';

// Product pricing
const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: pz.MoneyRequired({ msg: 'Product Price' }),
  salePrice: pz.MoneyOptional({ msg: 'Sale Price' }),
  cost: pz.MoneyRequired({ msg: 'Cost Price' })
});

// Multi-currency pricing
const multiCurrencyProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  prices: z.record(
    z.string(), // Currency code key
    pz.MoneyAmount({ msg: 'Price Amount' })
  )
});

// Price filtering
const priceFilterSchema = z.object({
  category: z.string(),
  priceRange: pz.PriceRange("USD", { msg: 'Price Filter' }).optional()
});
```

### Financial Services

```typescript
import { pz } from 'phantom-zod';

// Transaction validation
const transactionSchema = z.object({
  id: z.string().uuid(),
  fromAccount: z.string(),
  toAccount: z.string(),
  amount: pz.MoneyRequired({ msg: 'Transaction Amount' }),
  fee: pz.MoneyOptional({ msg: 'Transaction Fee' }),
  exchangeRate: z.number().positive().optional()
});

// Account balance
const accountSchema = z.object({
  accountId: z.string(),
  balance: pz.MoneyRequired({ msg: 'Account Balance' }),
  availableBalance: pz.MoneyRequired({ msg: 'Available Balance' }),
  currency: pz.CurrencyCode({ msg: 'Account Currency' })
});

// Investment portfolio
const portfolioItemSchema = z.object({
  symbol: z.string(),
  quantity: z.number().positive(),
  unitPrice: pz.MoneyRequired({ msg: 'Unit Price' }),
  marketValue: pz.MoneyRequired({ msg: 'Market Value' }),
  gainLoss: pz.MoneyRequired({ msg: 'Gain/Loss' }) // Can be negative
});
```

### International Business

```typescript
import { pz } from 'phantom-zod';

// Multi-currency invoice
const invoiceSchema = z.object({
  invoiceId: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: pz.MoneyRequired({ msg: 'Unit Price' }),
    total: pz.MoneyRequired({ msg: 'Line Total' })
  })),
  subtotal: pz.MoneyRequired({ msg: 'Subtotal' }),
  tax: pz.MoneyRequired({ msg: 'Tax Amount' }),
  total: pz.MoneyRequired({ msg: 'Invoice Total' }),
  baseCurrency: pz.CurrencyCode({ msg: 'Base Currency' })
});

// Currency exchange
const exchangeRateSchema = z.object({
  fromCurrency: pz.CurrencyCode({ msg: 'From Currency' }),
  toCurrency: pz.CurrencyCode({ msg: 'To Currency' }),
  rate: z.number().positive(),
  amount: pz.MoneyRequired({ msg: 'Exchange Amount' }),
  convertedAmount: pz.MoneyRequired({ msg: 'Converted Amount' })
});
```

### Subscription and Billing

```typescript
import { pz } from 'phantom-zod';

// Subscription plan
const subscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  monthlyPrice: pz.Price("USD", { msg: 'Monthly Price' }),
  yearlyPrice: pz.Price("USD", { msg: 'Yearly Price' }),
  features: z.array(z.string()),
  trialDays: z.number().int().min(0)
});

// Billing record
const billingRecordSchema = z.object({
  customerId: z.string(),
  subscriptionId: z.string(),
  billingPeriod: z.object({
    start: z.date(),
    end: z.date()
  }),
  amount: pz.MoneyRequired({ msg: 'Billing Amount' }),
  tax: pz.MoneyOptional({ msg: 'Tax Amount' }),
  discounts: z.arrayz.array(pz.MoneyRequired({ msg: 'Discount Amount' })),
  total: pz.MoneyRequired({ msg: 'Total Amount' })
});
```

## Integration Examples

### React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pz } from 'phantom-zod';

const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string(),
  price: pz.MoneyFromString({ msg: 'Product Price' }),
  category: z.string(),
  inStock: z.boolean()
});

function ProductForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(productFormSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Product Name" />
      <textarea {...register('description')} placeholder="Description" />
      
      <div>
        <input 
          {...register('price.amount')} 
          type="number" 
          step="0.01"
          min="0"
          placeholder="Price" 
        />
        <select {...register('price.currency')}>
          <option value="">Select Currency</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
        </select>
      </div>

      <input {...register('category')} placeholder="Category" />
      
      <label>
        <input type="checkbox" {...register('inStock')} />
        In Stock
      </label>

      {errors.price?.amount && <span>{errors.price.amount.message}</span>}
      {errors.price?.currency && <span>{errors.price.currency.message}</span>}

      <button type="submit">Add Product</button>
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

// Product creation endpoint
const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: pz.MoneyRequired({ msg: 'Product Price' }),
  cost: pz.MoneyRequired({ msg: 'Cost Price' }),
  category: z.string()
});

app.post('/api/products', (req, res) => {
  try {
    const product = createProductSchema.parse(req.body);
    // Save product to database
    res.json({ success: true, product });
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid product data',
      details: error.errors 
    });
  }
});

// Price search endpoint
const priceSearchSchema = z.object({
  category: z.string().optional(),
  priceRange: pz.PriceRange("USD", { msg: 'Price Range' }).optional(),
  currency: pz.CurrencyCode({ msg: 'Currency' }).optional()
});

app.get('/api/products/search', (req, res) => {
  try {
    const filters = priceSearchSchema.parse(req.query);
    // Search products with price filters
    const products = searchProducts(filters);
    res.json(products);
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid search parameters',
      details: error.errors 
    });
  }
});

// Transaction endpoint
const transactionSchema = z.object({
  fromAccount: z.string(),
  toAccount: z.string(),
  amount: pz.MoneyRequired({ msg: 'Transaction Amount' }),
  description: z.string(),
  type: z.enum(['transfer', 'payment', 'withdrawal', 'deposit'])
});

app.post('/api/transactions', (req, res) => {
  try {
    const transaction = transactionSchema.parse(req.body);
    // Process transaction
    const result = processTransaction(transaction);
    res.json({ success: true, transaction: result });
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid transaction data',
      details: error.errors 
    });
  }
});
```

### Database Models

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// Product model
export const ProductModel = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: pz.MoneyRequired({ msg: 'Product Price' }),
  salePrice: pz.MoneyOptional({ msg: 'Sale Price' }),
  cost: pz.MoneyRequired({ msg: 'Cost Price' }),
  category: z.string(),
  inStock: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Order model
export const OrderModel = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    unitPrice: pz.MoneyRequired({ msg: 'Unit Price' }),
    total: pz.MoneyRequired({ msg: 'Line Total' })
  })),
  subtotal: pz.MoneyRequired({ msg: 'Subtotal' }),
  tax: pz.MoneyRequired({ msg: 'Tax Amount' }),
  shipping: pz.MoneyOptional({ msg: 'Shipping Cost' }),
  discounts: z.arrayz.array(pz.MoneyRequired({ msg: 'Discount Amount' })),
  total: pz.MoneyRequired({ msg: 'Order Total' }),
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
  createdAt: z.date()
});

// Payment model
export const PaymentModel = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  amount: pz.MoneyRequired({ msg: 'Payment Amount' }),
  method: z.enum(['credit_card', 'debit_card', 'paypal', 'bank_transfer']),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  transactionId: z.string().optional(),
  processedAt: z.date().optional()
});
```

### Currency Conversion Service

```typescript
import { pz } from 'phantom-zod';

class CurrencyService {
  private exchangeRates: Map<string, number> = new Map();

  // Convert money from one currency to another
  async convertMoney(
    money: { amount: number; currency: string }, 
    toCurrency: string
  ) {
    // Validate inputs
    const moneySchema = pz.MoneyRequired({ msg: 'Source Money' });
    const targetCurrencySchema = pz.CurrencyCode({ msg: 'Target Currency' });
    
    const validMoney = moneySchema.parse(money);
    const validTargetCurrency = targetCurrencySchema.parse(toCurrency);

    if (validMoney.currency === validTargetCurrency) {
      return validMoney;
    }

    const rate = await this.getExchangeRate(validMoney.currency, validTargetCurrency);
    const convertedAmount = validMoney.amount * rate;

    return {
      amount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimals
      currency: validTargetCurrency
    };
  }

  // Get current exchange rate
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const key = `${fromCurrency}_${toCurrency}`;
    // In real implementation, fetch from exchange rate API
    return this.exchangeRates.get(key) || 1;
  }

  // Validate money array for bulk operations
  validateMoneyArray(moneyArray: unknown[]) {
    const arraySchema = z.arrayz.array(pz.MoneyRequired({ msg: 'Money Item' }));
    return arraySchema.safeParse(moneyArray);
  }
}

const currencyService = new CurrencyService();
export { currencyService };
```

### Shopping Cart Service

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  name: z.string(),
  price: pz.MoneyRequired({ msg: 'Product Price' }),
  quantity: z.number().int().positive(),
  total: pz.MoneyRequired({ msg: 'Item Total' })
});

const cartSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  items: z.array(cartItemSchema),
  subtotal: pz.MoneyRequired({ msg: 'Cart Subtotal' }),
  tax: pz.MoneyRequired({ msg: 'Tax Amount' }),
  shipping: pz.MoneyOptional({ msg: 'Shipping Cost' }),
  total: pz.MoneyRequired({ msg: 'Cart Total' }),
  currency: pz.CurrencyCode({ msg: 'Cart Currency' })
});

class ShoppingCartService {
  // Add item to cart with price validation
  addItem(cart: any, item: any) {
    const itemSchema = cartItemSchema;
    const validItem = itemSchema.parse(item);
    
    // Validate price calculation
    const expectedTotal = {
      amount: validItem.price.amount * validItem.quantity,
      currency: validItem.price.currency
    };
    
    if (validItem.total.amount !== expectedTotal.amount) {
      throw new Error('Item total does not match price × quantity');
    }
    
    return {
      ...cart,
      items: [...cart.items, validItem]
    };
  }

  // Calculate cart totals
  calculateTotals(cart: any) {
    const cartData = cartSchema.parse(cart);
    
    // Validate all items have same currency
    const currencies = cartData.items.map(item => item.price.currency);
    const uniqueCurrencies = [...new Set(currencies)];
    
    if (uniqueCurrencies.length > 1) {
      throw new Error('All cart items must have the same currency');
    }
    
    // Calculate subtotal
    const subtotal = cartData.items.reduce((sum, item) => sum + item.total.amount, 0);
    
    // Calculate tax (example: 8.25%)
    const taxAmount = Math.round(subtotal * 0.0825 * 100) / 100;
    
    return {
      ...cartData,
      subtotal: { amount: subtotal, currency: cartData.currency },
      tax: { amount: taxAmount, currency: cartData.currency },
      total: { amount: subtotal + taxAmount, currency: cartData.currency }
    };
  }
}
```

## Advanced Use Cases

### Multi-Currency Support

```typescript
import { pz } from 'phantom-zod';

// Product with prices in multiple currencies
const multiCurrencyProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseCurrency: pz.CurrencyCode({ msg: 'Base Currency' }),
  prices: z.record(
    CurrencyCode({ msg: 'Currency Code' }),
    pz.MoneyAmount({ msg: 'Price Amount' })
  )
});

// Currency-aware pricing
const pricingContextSchema = z.object({
  userCurrency: pz.CurrencyCode({ msg: 'User Currency' }),
  displayPrices: z.arrayz.array(pz.MoneyRequired({ msg: 'Display Price' })),
  basePrices: z.arrayz.array(pz.MoneyRequired({ msg: 'Base Price' })),
  exchangeRates: z.record(z.string(), z.number().positive())
});
```

### Cryptocurrency Support

```typescript
import { pz } from 'phantom-zod';

// Custom crypto currency validation (not in ISO 4217)
const cryptoCurrencies = ["BTC", "ETH", "LTC", "XRP"] as const;
type CryptoCurrency = typeof cryptoCurrencies[number];

const cryptoAmountSchema = pz.MoneyAmount({
  msg: 'Crypto Amount',
  maxDecimals: 8 // Higher precision for crypto
});

const cryptoMoneySchema = z.object({
  amount: cryptoAmountSchema,
  currency: z.enum(cryptoCurrencies, {
    message: 'Invalid cryptocurrency code'
  })
});
```

## See Also

- [Number Schemas](./number-schemas.md) - Basic numeric validation
- [String Schemas](./string-schemas.md) - String validation and formatting
- [Enum Schemas](./enum-schemas.md) - For currency code validation
- [Array Schemas](./array-schemas.md) - For validating arrays of money objects
- [Object Validation Guide](../guides/object-validation.md) - Complex object validation patterns
