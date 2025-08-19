# Array Schemas

Array schemas provide comprehensive validation for arrays with support for generic element validation, length constraints, duplicate detection, and specialized array types for common data structures.

## Overview

All array schemas in Phantom Zod provide:

- **Generic array validation** for any element type using Zod schemas
- **Length constraints** with minimum and maximum item counts
- **Duplicate detection** and prevention
- **Element validation** with detailed error reporting
- **Specialized array types** for common data (strings, numbers, UUIDs, booleans)
- **Optional and required variants** for flexible validation
- **Consistent error handling** through localization
- **Type safety** with full TypeScript inference

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, specialized array schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const tagsTraditional = pz.StringArrayRequired({ msg: "Tags" });

// Simplified string parameter (equivalent)
const tagsSimple = pz.StringArrayRequired("Tags");

// Both produce the same validation behavior
const arrayInput = ["javascript", "typescript", "react"];
tagsTraditional.parse(arrayInput); // ✅ ["javascript", "typescript", "react"]
tagsSimple.parse(arrayInput);      // ✅ ["javascript", "typescript", "react"]

// Error messages are identical
tagsTraditional.parse([]); // ❌ "Tags must not be empty"
tagsSimple.parse([]);      // ❌ "Tags must not be empty"
```

**When to use string parameters:**
- Basic field name specification only
- Default constraints are sufficient (no special minItems, maxItems)
- Cleaner, more concise code

**When to use options objects:**
- Length constraints needed (`minItems`, `maxItems`)
- Duplicate control required (`allowDuplicates`)
- Custom message types (`MsgType.Message`)
- Advanced localization configurations

**Note:** Generic array schemas (`ArrayRequired`, `ArrayOptional`) require element schemas as their first parameter and may not support string overloads in the same way as specialized arrays.

## Available Schemas

### Generic Array Schemas

#### ArrayRequired

Creates a required array schema that validates each element against a provided Zod schema.

```typescript
pz.ArrayRequired<T>(elementSchema: z.ZodType<T>, options?: GenericArraySchemaOptions)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `msg` | `string` | `"Value"` | Field name or custom error message |
| `msgType` | `MsgType` | `MsgType.FieldName` | Message type for localization |
| `minItems` | `number` | `1` | Minimum number of items |
| `maxItems` | `number` | `undefined` | Maximum number of items |
| `allowDuplicates` | `boolean` | `false` | Whether to allow duplicate values |

**Examples:**

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

// String array
const tagsSchema = pz.ArrayRequired(z.string(), { 
  msg: "Tags", 
  minItems: 1, 
  maxItems: 10 
});

// Valid inputs
tagsSchema.parse(["javascript", "typescript"]);     // ✅ ["javascript", "typescript"]
tagsSchema.parse(["react"]);                        // ✅ ["react"]

// Invalid inputs
tagsSchema.parse([]);                               // ❌ Error: Tags must not be empty
tagsSchema.parse(["js", "ts", "js"]);               // ❌ Error: Tags contains duplicate items
tagsSchema.parse("not-array");                      // ❌ Error: Tags must be an array

// Number array with constraints
const scoresSchema = pz.ArrayRequired(z.number().min(0).max(100), {
  msg: "Test Scores",
  minItems: 1,
  maxItems: 5
});

scoresSchema.parse([85, 92, 78]);                   // ✅ [85, 92, 78]
scoresSchema.parse([110]);                          // ❌ Error: Invalid element (number out of range)

// Object array
const usersSchema = pz.ArrayRequired(
  z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    email: z.string().email()
  }),
  { msg: "Users", minItems: 1, maxItems: 100 }
);

usersSchema.parse([
  { id: "123e4567-e89b-12d3-a456-426614174000", name: "John", email: "john@example.com" }
]);                                                 // ✅ Valid array of users
```

#### ArrayOptional

Creates an optional array schema that accepts arrays, undefined, or empty arrays.

```typescript
pz.ArrayOptional<T>(elementSchema: z.ZodType<T>, options?: GenericArraySchemaOptions)
```

**Examples:**

```typescript
// Optional string array
const keywordsSchema = pz.ArrayOptional(z.string(), { 
  msg: "Keywords", 
  maxItems: 20 
});

// Valid inputs
keywordsSchema.parse(["seo", "marketing"]);         // ✅ ["seo", "marketing"]
keywordsSchema.parse([]);                           // ✅ []
keywordsSchema.parse(undefined);                    // ✅ undefined

// Invalid inputs
keywordsSchema.parse("not-array");                  // ❌ Error: Keywords must be an array

// Optional number array with duplicates allowed
const valuesSchema = pz.ArrayOptional(z.number(), {
  msg: "Values",
  allowDuplicates: true
});

valuesSchema.parse([1, 2, 2, 3]);                  // ✅ [1, 2, 2, 3] (duplicates allowed)
```

### Specialized Array Schemas

#### StringArrayRequired / StringArrayOptional

Pre-configured arrays for string elements with automatic trimming.

```typescript
pz.StringArrayRequired(options?: GenericArraySchemaOptions)
pz.StringArrayOptional(options?: GenericArraySchemaOptions)
```

**Examples:**

```typescript
const categoriesSchema = pz.StringArrayRequired({ 
  msg: "Categories", 
  minItems: 1, 
  maxItems: 5 
});

// Valid inputs - strings are automatically trimmed
categoriesSchema.parse(["  tech  ", "business"]);   // ✅ ["tech", "business"] (trimmed)
categoriesSchema.parse(["finance"]);                // ✅ ["finance"]

// Invalid inputs
categoriesSchema.parse([]);                         // ❌ Error: Categories must not be empty
categoriesSchema.parse(["", "tech"]);               // ❌ Error: Invalid empty string element

const optionalTagsSchema = pz.StringArrayOptional({ 
  msg: "Tags", 
  maxItems: 10 
});

optionalTagsSchema.parse(["react", "vue"]);         // ✅ ["react", "vue"]
optionalTagsSchema.parse(undefined);                // ✅ undefined
```

#### NumberArrayRequired / NumberArrayOptional

Pre-configured arrays for numeric elements.

```typescript
pz.NumberArrayRequired(options?: GenericArraySchemaOptions)
pz.NumberArrayOptional(options?: GenericArraySchemaOptions)
```

**Examples:**

```typescript
const coordinatesSchema = pz.NumberArrayRequired({
  msg: "Coordinates",
  minItems: 2,
  maxItems: 3
});

coordinatesSchema.parse([40.7128, -74.0060]);       // ✅ [40.7128, -74.0060] (lat, lng)
coordinatesSchema.parse([40.7128, -74.0060, 10]);   // ✅ [40.7128, -74.0060, 10] (with altitude)

const optionalScoresSchema = pz.NumberArrayOptional({
  msg: "Scores",
  minItems: 1
});

optionalScoresSchema.parse([95, 87, 92]);           // ✅ [95, 87, 92]
optionalScoresSchema.parse(undefined);              // ✅ undefined
```

#### BooleanArrayRequired / BooleanArrayOptional

Pre-configured arrays for boolean elements.

```typescript
pz.BooleanArrayRequired(options?: GenericArraySchemaOptions)
pz.BooleanArrayOptional(options?: GenericArraySchemaOptions)
```

**Examples:**

```typescript
const permissionsSchema = pz.BooleanArrayRequired({
  msg: "Permissions",
  minItems: 3,
  maxItems: 10
});

permissionsSchema.parse([true, false, true]);       // ✅ [true, false, true]

const featuresSchema = pz.BooleanArrayOptional({
  msg: "Feature Flags"
});

featuresSchema.parse([true, true, false]);          // ✅ [true, true, false]
featuresSchema.parse(undefined);                    // ✅ undefined
```

#### UuidArrayRequired / UuidArrayOptional

Pre-configured arrays for UUID elements.

```typescript
pz.UuidArrayRequired(options?: GenericArraySchemaOptions)
pz.UuidArrayOptional(options?: GenericArraySchemaOptions)
```

**Examples:**

```typescript
const userIdsSchema = pz.UuidArrayRequired({
  msg: "User IDs",
  minItems: 1,
  maxItems: 50
});

userIdsSchema.parse([
  "123e4567-e89b-12d3-a456-426614174000",
  "456e7890-e12b-34d5-a789-012345678901"
]);                                                 // ✅ Valid UUID array

const relatedIdsSchema = pz.UuidArrayOptional({
  msg: "Related IDs"
});

relatedIdsSchema.parse([
  "789e0123-e45b-67d8-a901-234567890123"
]);                                                 // ✅ Valid optional UUID array
relatedIdsSchema.parse(undefined);                 // ✅ undefined
```

## Type Definitions

```typescript
interface GenericArraySchemaOptions {
  msg?: string;              // Field name or custom message
  msgType?: MsgType;         // Message formatting type
  minItems?: number;         // Minimum number of items
  maxItems?: number;         // Maximum number of items
  allowDuplicates?: boolean; // Whether to allow duplicate values
}

// Inferred types
type GenericArrayRequired<T> = T[];              // Always an array of T
type GenericArrayOptional<T> = T[] | undefined;  // Array of T or undefined
type StringArrayRequired = string[];             // Always string array
type NumberArrayRequired = number[];             // Always number array
type BooleanArrayRequired = boolean[];           // Always boolean array
type UuidArrayRequired = string[];               // Always UUID string array
```

## Validation Features

### Element Validation

Each array item is validated against the provided element schema:

```typescript
// Each user object is fully validated
const usersSchema = pz.ArrayRequired(
  z.object({
    id: pz.UuidRequired({ msg: "User ID" }),
    name: pz.StringRequired({ msg: "Name" }),
    email: pz.EmailRequired({ msg: "Email" }),
    age: pz.NumberOptional({ msg: "Age", min: 0, max: 120 })
  }),
  { msg: "Users" }
);

// Validation occurs for each element
usersSchema.parse([
  { id: "123e4567-e89b-12d3-a456-426614174000", name: "John", email: "john@example.com", age: 30 },
  { id: "invalid-uuid", name: "Jane", email: "jane@example.com" } // ❌ Invalid UUID in first user
]);
```

### Length Constraints

Control array size with `minItems` and `maxItems`:

```typescript
const limitedArraySchema = pz.StringArrayRequired({
  msg: "Categories",
  minItems: 2,    // At least 2 items
  maxItems: 5     // At most 5 items
});

limitedArraySchema.parse(["a"]);               // ❌ Error: Categories must have at least 2 items
limitedArraySchema.parse(["a", "b"]);          // ✅ Valid (exactly 2 items)
limitedArraySchema.parse(["a", "b", "c", "d", "e", "f"]); // ❌ Error: Categories must have at most 5 items
```

### Duplicate Detection

Control whether duplicates are allowed:

```typescript
// No duplicates (default)
const uniqueTagsSchema = pz.StringArrayRequired({
  msg: "Unique Tags",
  allowDuplicates: false  // Default
});

uniqueTagsSchema.parse(["react", "vue", "react"]); // ❌ Error: Unique Tags contains duplicate items

// Allow duplicates
const scoresSchema = pz.NumberArrayRequired({
  msg: "Game Scores",
  allowDuplicates: true
});

scoresSchema.parse([100, 95, 100, 88]);        // ✅ Valid (duplicates allowed)
```

## Common Patterns

### Form Field Arrays

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

const contactFormSchema = z.object({
  name: pz.StringRequired({ msg: "Name" }),
  email: pz.EmailRequired({ msg: "Email" }),
  
  // Multiple phone numbers
  phoneNumbers: pz.ArrayOptional(pz.PhoneRequired(), {
    msg: "Phone Numbers",
    maxItems: 3
  }),
  
  // Multiple addresses
  addresses: pz.ArrayOptional(
    z.object({
      street: pz.StringRequired({ msg: "Street" }),
      city: pz.StringRequired({ msg: "City" }),
      zipCode: pz.StringRequired({ msg: "ZIP Code" })
    }),
    { msg: "Addresses", maxItems: 5 }
  ),
  
  // Tags/categories
  interests: pz.StringArrayOptional({
    msg: "Interests",
    maxItems: 10
  }),
});

type ContactForm = z.infer<typeof contactFormSchema>;
```

### E-commerce Product Schema

```typescript
const productSchema = z.object({
  name: pz.StringRequired({ msg: "Product Name" }),
  price: pz.PositiveRequired({ msg: "Price" }),
  
  // Product categories
  categories: pz.StringArrayRequired({
    msg: "Categories",
    minItems: 1,
    maxItems: 5
  }),
  
  // Product images
  imageIds: pz.UuidArrayOptional({
    msg: "Image IDs",
    maxItems: 10
  }),
  
  // Size options
  sizes: pz.ArrayOptional(
    pz.EnumRequired(["XS", "S", "M", "L", "XL"], { msg: "Size" }),
    { msg: "Available Sizes", maxItems: 5 }
  ),
  
  // Feature flags
  features: pz.BooleanArrayOptional({
    msg: "Product Features",
    maxItems: 20
  }),
  
  // Rating scores
  ratings: pz.NumberArrayOptional({
    msg: "Ratings",
    allowDuplicates: true
  }),
  
  // Related product IDs
  relatedProducts: pz.UuidArrayOptional({
    msg: "Related Products",
    maxItems: 10,
    allowDuplicates: false
  }),
});
```

### API Configuration Schema

```typescript
const apiConfigSchema = z.object({
  // Server endpoints
  endpoints: pz.ArrayRequired(pz.UrlRequired(), {
    msg: "API Endpoints",
    minItems: 1,
    maxItems: 10
  }),
  
  // Allowed HTTP methods
  allowedMethods: pz.ArrayRequired(
    pz.EnumRequired(["GET", "POST", "PUT", "DELETE"], { msg: "HTTP Method" }),
    { msg: "Allowed Methods", minItems: 1 }
  ),
  
  // Request headers
  requiredHeaders: pz.StringArrayOptional({
    msg: "Required Headers",
    maxItems: 20
  }),
  
  // Timeout values in milliseconds
  timeouts: pz.NumberArrayRequired({
    msg: "Timeout Values",
    minItems: 1,
    maxItems: 5,
    allowDuplicates: false
  }),
  
  // Feature toggles
  features: pz.BooleanArrayRequired({
    msg: "Feature Flags",
    minItems: 5,
    maxItems: 50
  }),
  
  // Service IDs
  dependentServices: pz.UuidArrayOptional({
    msg: "Dependent Service IDs",
    allowDuplicates: false
  }),
});
```

### Nested Array Structures

```typescript
// Matrix data structure
const matrixSchema = pz.ArrayRequired(
  pz.NumberArrayRequired({
    msg: "Matrix Row",
    minItems: 3,
    maxItems: 3
  }),
  {
    msg: "Matrix",
    minItems: 3,
    maxItems: 3
  }
);

// 3x3 matrix validation
matrixSchema.parse([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]);                                                 // ✅ Valid 3x3 matrix

// Hierarchical menu structure
const menuItemSchema = z.object({
  id: pz.UuidRequired({ msg: "Menu Item ID" }),
  title: pz.StringRequired({ msg: "Title" }),
  url: pz.UrlOptional({ msg: "URL" }),
  children: pz.ArrayOptional(
    z.lazy(() => menuItemSchema),  // Recursive reference
    { msg: "Child Menu Items", maxItems: 20 }
  )
});

const menuSchema = pz.ArrayRequired(menuItemSchema, {
  msg: "Navigation Menu",
  minItems: 1,
  maxItems: 10
});
```

### Advanced Validation Patterns

```typescript
// Tagged union arrays
const eventSchema = pz.ArrayRequired(
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal("click"),
      elementId: pz.StringRequired({ msg: "Element ID" }),
      timestamp: pz.DateTimeStringRequired({ msg: "Timestamp" })
    }),
    z.object({
      type: z.literal("view"),
      pageUrl: pz.UrlRequired({ msg: "Page URL" }),
      duration: pz.PositiveRequired({ msg: "Duration" })
    })
  ]),
  { msg: "User Events", minItems: 1 }
);

// Conditional array validation
const orderSchema = z.object({
  customerId: pz.UuidRequired({ msg: "Customer ID" }),
  items: pz.ArrayRequired(
    z.object({
      productId: pz.UuidRequired({ msg: "Product ID" }),
      quantity: pz.PositiveRequired({ msg: "Quantity" }),
      price: pz.PositiveRequired({ msg: "Price" })
    }),
    { msg: "Order Items", minItems: 1, maxItems: 100 }
  ),
  discountCodes: pz.StringArrayOptional({
    msg: "Discount Codes",
    maxItems: 5,
    allowDuplicates: false
  })
}).refine(
  data => {
    // Business rule: orders over $100 can have discount codes
    const total = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (data.discountCodes && data.discountCodes.length > 0) {
      return total >= 100;
    }
    return true;
  },
  {
    message: "Discount codes can only be applied to orders over $100",
    path: ["discountCodes"]
  }
);
```

## Error Messages

Array schemas provide specific error messages based on validation type:

### Default Messages (English)

- **Type Error:** `"[Field Name] must be an array"`
- **Empty Array:** `"[Field Name] must not be empty"`
- **Too Small:** `"[Field Name] must have at least [min] items"`
- **Too Large:** `"[Field Name] must have at most [max] items"`
- **Duplicates:** `"[Field Name] contains duplicate items"`
- **Element Error:** Specific error for invalid elements based on element schema

### Custom Error Messages

```typescript
import { MsgType } from "phantom-zod";

const schema = pz.StringArrayRequired({
  msg: "Please provide between 1 and 5 category names",
  msgType: MsgType.Message,
  minItems: 1,
  maxItems: 5
});
```

## Best Practices

### 1. Choose Appropriate Constraints

```typescript
// Good: Reasonable limits based on business needs
const tagsSchema = pz.StringArrayRequired({
  msg: "Tags",
  minItems: 1,
  maxItems: 10  // Reasonable UI limit
});

// Good: Allow flexibility for optional arrays
const optionalKeywordsSchema = pz.StringArrayOptional({
  msg: "Keywords",
  maxItems: 20  // Liberal limit for optional field
});

// Avoid: Overly restrictive limits without justification
const restrictiveSchema = pz.StringArrayRequired({
  msg: "Items",
  minItems: 5,
  maxItems: 5  // Too rigid - exactly 5 items required
});
```

### 2. Handle Duplicates Appropriately

```typescript
// Prevent duplicates for unique identifiers
const userIdsSchema = pz.UuidArrayRequired({
  msg: "User IDs",
  allowDuplicates: false  // Default - no duplicate IDs
});

// Allow duplicates for measurement data
const sensorsSchema = pz.NumberArrayOptional({
  msg: "Sensor Readings",
  allowDuplicates: true  // Multiple readings can be the same
});

// Consider business logic for duplicates
const orderItemsSchema = pz.ArrayRequired(
  z.object({
    productId: pz.UuidRequired({ msg: "Product ID" }),
    quantity: pz.PositiveRequired({ msg: "Quantity" })
  }),
  {
    msg: "Order Items",
    allowDuplicates: false  // Same product should be combined, not duplicated
  }
);
```

### 3. Use Specialized Schemas When Appropriate

```typescript
// Use specialized schemas for common types
const simpleTagsSchema = pz.StringArrayRequired({ msg: "Tags" });
const coordinatesSchema = pz.NumberArrayRequired({ msg: "Coordinates" });
const userIdsSchema = pz.UuidArrayRequired({ msg: "User IDs" });

// Use generic schema for complex types
const customObjectsSchema = pz.ArrayRequired(
  z.object({
    id: pz.UuidRequired({ msg: "ID" }),
    metadata: z.record(z.any())
  }),
  { msg: "Custom Objects" }
);
```

### 4. Consider Performance for Large Arrays

```typescript
// Set reasonable limits for performance
const performantSchema = pz.StringArrayOptional({
  msg: "Items",
  maxItems: 1000  // Reasonable limit for most use cases
});

// Be more restrictive for complex validations
const complexValidationSchema = pz.ArrayOptional(
  z.object({
    // Complex object with many fields
    id: pz.UuidRequired({ msg: "ID" }),
    data: z.record(z.any()),
    nested: z.object({
      // ... many nested fields
    })
  }),
  {
    msg: "Complex Objects",
    maxItems: 100  // Lower limit for complex objects
  }
);
```

## Integration Examples

### With React Hook Form

```typescript
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: pz.StringRequired({ msg: "Name" }),
  tags: pz.StringArrayOptional({
    msg: "Tags",
    maxItems: 10
  }),
  phoneNumbers: pz.ArrayOptional(pz.PhoneRequired(), {
    msg: "Phone Numbers",
    maxItems: 3
  }),
  addresses: pz.ArrayOptional(
    z.object({
      street: pz.StringRequired({ msg: "Street" }),
      city: pz.StringRequired({ msg: "City" }),
      zipCode: pz.StringRequired({ msg: "ZIP Code" })
    }),
    { msg: "Addresses", maxItems: 5 }
  )
});

const ArrayForm = () => {
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tags: [],
      phoneNumbers: [],
      addresses: []
    }
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: "tags"
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control,
    name: "addresses"
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register("name")} placeholder="Name" />
      {errors.name && <span>{errors.name.message}</span>}
      
      {/* Dynamic tags */}
      <div>
        <label>Tags:</label>
        {tagFields.map((field, index) => (
          <div key={field.id}>
            <input {...register(`tags.${index}`)} placeholder="Tag" />
            <button type="button" onClick={() => removeTag(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => appendTag("")}>Add Tag</button>
        {errors.tags && <span>{errors.tags.message}</span>}
      </div>
      
      {/* Dynamic addresses */}
      <div>
        <label>Addresses:</label>
        {addressFields.map((field, index) => (
          <div key={field.id}>
            <input {...register(`addresses.${index}.street`)} placeholder="Street" />
            <input {...register(`addresses.${index}.city`)} placeholder="City" />
            <input {...register(`addresses.${index}.zipCode`)} placeholder="ZIP" />
            <button type="button" onClick={() => removeAddress(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => appendAddress({ street: "", city: "", zipCode: "" })}>
          Add Address
        </button>
        {errors.addresses && <span>{errors.addresses.message}</span>}
      </div>
    </form>
  );
};
```

### With Express.js API

```typescript
import express from "express";

const createPostSchema = z.object({
  title: pz.StringRequired({ msg: "Title" }),
  content: pz.StringRequired({ msg: "Content" }),
  
  // Array fields
  tags: pz.StringArrayRequired({
    msg: "Tags",
    minItems: 1,
    maxItems: 10
  }),
  categoryIds: pz.UuidArrayOptional({
    msg: "Category IDs",
    maxItems: 5
  }),
  collaboratorIds: pz.UuidArrayOptional({
    msg: "Collaborator IDs",
    allowDuplicates: false
  }),
  attachments: pz.ArrayOptional(
    z.object({
      filename: pz.StringRequired({ msg: "Filename" }),
      url: pz.UrlRequired({ msg: "URL" }),
      mimeType: pz.StringRequired({ msg: "MIME Type" })
    }),
    { msg: "Attachments", maxItems: 20 }
  )
});

app.post("/posts", (req, res) => {
  try {
    const postData = createPostSchema.parse(req.body);
    
    // Arrays are validated with all constraints
    console.log("Tags:", postData.tags);                    // Array of validated strings
    console.log("Categories:", postData.categoryIds);       // Array of validated UUIDs
    console.log("Attachments:", postData.attachments);      // Array of validated objects
    
    // Process array data
    const processedPost = {
      ...postData,
      id: generateId(),
      authorId: req.user.id,
      createdAt: new Date().toISOString()
    };
    
    await Post.create(processedPost);
    res.json({ success: true, post: processedPost });
  } catch (error) {
    res.status(400).json({ 
      error: "Validation failed",
      issues: error.issues 
    });
  }
});

// Batch operations with arrays
const batchUpdateSchema = z.object({
  updates: pz.ArrayRequired(
    z.object({
      id: pz.UuidRequired({ msg: "ID" }),
      data: z.record(z.any())
    }),
    { msg: "Updates", minItems: 1, maxItems: 100 }
  )
});

app.put("/posts/batch", async (req, res) => {
  const { updates } = batchUpdateSchema.parse(req.body);
  
  const results = await Promise.allSettled(
    updates.map(update => Post.updateById(update.id, update.data))
  );
  
  res.json({ results });
});
```

### Database Integration

```typescript
// Database model with array fields
interface PostModel {
  id: string;
  title: string;
  content: string;
  tags: string[];           // Array of strings
  categoryIds: string[];    // Array of UUID strings
  authorId: string;
  createdAt: Date;
}

// Validation ensuring database compatibility
const postCreateSchema = z.object({
  title: pz.StringRequired({ msg: "Title" }),
  content: pz.StringRequired({ msg: "Content" }),
  authorId: pz.UuidRequired({ msg: "Author ID" }),
  
  // Array validations for database storage
  tags: pz.StringArrayRequired({
    msg: "Tags",
    minItems: 1,
    maxItems: 20,
    allowDuplicates: false
  }),
  categoryIds: pz.UuidArrayOptional({
    msg: "Category IDs",
    maxItems: 10,
    allowDuplicates: false
  })
});

// API with array processing
app.post("/posts", async (req, res) => {
  const postData = postCreateSchema.parse(req.body);
  
  // Validate category IDs exist
  if (postData.categoryIds?.length) {
    const existingCategories = await Category.findByIds(postData.categoryIds);
    if (existingCategories.length !== postData.categoryIds.length) {
      return res.status(400).json({ error: "Some category IDs do not exist" });
    }
  }
  
  const post = await Post.create({
    ...postData,
    id: generateId(),
    createdAt: new Date()
  });
  
  res.json({ post });
});

// Search with array filters
const searchSchema = z.object({
  tags: pz.StringArrayOptional({
    msg: "Tags",
    maxItems: 10
  }),
  categoryIds: pz.UuidArrayOptional({
    msg: "Category IDs",
    maxItems: 5
  })
});

app.get("/posts/search", async (req, res) => {
  const filters = searchSchema.parse(req.query);
  
  const query: any = {};
  
  if (filters.tags?.length) {
    query.tags = { $in: filters.tags };
  }
  
  if (filters.categoryIds?.length) {
    query.categoryIds = { $in: filters.categoryIds };
  }
  
  const posts = await Post.find(query);
  res.json({ posts });
});
```

## See Also

- [String Schemas](string-schemas.md) - Text validation for array elements
- [Number Schemas](number-schemas.md) - Numeric validation for array elements
- [UUID Schemas](uuid-schemas.md) - UUID validation for array elements
- [Boolean Schemas](boolean-schemas.md) - Boolean validation for array elements
- [Enum Schemas](enum-schemas.md) - Enum validation for array elements
- [Form Validation Examples](../examples/form-validation.md) - Practical form usage
- [API Validation Examples](../examples/api-validation.md) - API endpoint validation
