# Boolean Schemas

Boolean schemas provide comprehensive boolean value validation with support for both native boolean values and string-to-boolean conversion, handling common representations like "true"/"false" strings.

## Overview

All boolean schemas in Phantom Zod provide:

- **Native boolean validation** for `true` and `false` values
- **String-to-boolean conversion** from "true"/"false" strings
- **Type coercion** with strict validation rules
- **Optional and required variants** for flexible validation
- **Consistent error handling** through localization
- **Type safety** with TypeScript inference

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, all boolean schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const isActiveTraditional = pz.BooleanRequired({ msg: "Active Status" });

// Simplified string parameter (equivalent)
const isActiveSimple = pz.BooleanRequired("Active Status");

// Both produce the same validation behavior
isActiveTraditional.parse(true);  // ✅ true
isActiveSimple.parse(true);       // ✅ true

// Error messages are identical
isActiveTraditional.parse("yes"); // ❌ "Active Status must be a boolean"
isActiveSimple.parse("yes");      // ❌ "Active Status must be a boolean"
```

**When to use string parameters:**
- Basic field name specification only
- Default validation behavior is sufficient
- Cleaner, more concise code

**When to use options objects:**
- Custom message types (`MsgType.Message`)
- Advanced localization configurations

## Available Schemas

### Core Boolean Schemas

#### BooleanRequired

Creates a required boolean schema that only accepts true `boolean` values.

```typescript
pz.BooleanRequired(options?: BaseSchemaOptions)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `msg` | `string` | `"Value"` | Field name or custom error message |
| `msgType` | `MsgType` | `MsgType.FieldName` | Message type for localization |

**Examples:**

```typescript
import { pz } from "phantom-zod";

const schema = pz.BooleanRequired({ msg: "Agreed to Terms" });

// Valid inputs
schema.parse(true);                // ✅ true
schema.parse(false);               // ✅ false

// Invalid inputs
schema.parse(1);                   // ❌ Error: Agreed to Terms must be a boolean
schema.parse(0);                   // ❌ Error: Agreed to Terms must be a boolean
schema.parse("true");              // ❌ Error: Agreed to Terms must be a boolean
schema.parse("false");             // ❌ Error: Agreed to Terms must be a boolean
schema.parse("");                  // ❌ Error: Agreed to Terms must be a boolean
schema.parse(null);                // ❌ Error: Agreed to Terms must be a boolean
schema.parse(undefined);           // ❌ Error: Agreed to Terms must be a boolean
```

**Use Cases:**
```typescript
const termsSchema = pz.BooleanRequired({ msg: "Terms Accepted" });
const isActiveSchema = pz.BooleanRequired({ msg: "Active Status" });
const enabledSchema = pz.BooleanRequired({ msg: "Feature Enabled" });
```

#### BooleanOptional

Creates an optional boolean schema that accepts `boolean` values or `undefined`.

```typescript
pz.BooleanOptional(options?: BaseSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.BooleanOptional({ msg: "Newsletter Subscription" });

// Valid inputs
schema.parse(true);                // ✅ true
schema.parse(false);               // ✅ false
schema.parse(undefined);           // ✅ undefined

// Invalid inputs
schema.parse("true");              // ❌ Error: Newsletter Subscription must be a boolean
schema.parse(1);                   // ❌ Error: Newsletter Subscription must be a boolean
schema.parse(null);                // ❌ Error: Newsletter Subscription must be a boolean
```

### String Boolean Schemas

#### BooleanStringRequired

Creates a required boolean schema that accepts boolean values and "true"/"false" strings, returning a string representation.

```typescript
pz.BooleanStringRequired(options?: BaseSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.BooleanStringRequired({ msg: "Feature Flag" });

// Valid inputs - all return strings
schema.parse(true);                // ✅ "true"
schema.parse(false);               // ✅ "false"
schema.parse("true");              // ✅ "true"
schema.parse("false");             // ✅ "false"
schema.parse("TRUE");              // ✅ "true" (case insensitive)
schema.parse("FALSE");             // ✅ "false" (case insensitive)
schema.parse("  true  ");          // ✅ "true" (trimmed)

// Invalid inputs
schema.parse("yes");               // ❌ Error: Feature Flag must be a boolean string
schema.parse("no");                // ❌ Error: Feature Flag must be a boolean string
schema.parse("1");                 // ❌ Error: Feature Flag must be a boolean string
schema.parse("0");                 // ❌ Error: Feature Flag must be a boolean string
schema.parse(1);                   // ❌ Error: Feature Flag must be a boolean string
schema.parse(0);                   // ❌ Error: Feature Flag must be a boolean string
schema.parse(undefined);           // ❌ Error: Feature Flag is required
```

#### BooleanStringOptional

Creates an optional boolean string schema that accepts boolean values, "true"/"false" strings, or undefined.

```typescript
pz.BooleanStringOptional(options?: BaseSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.BooleanStringOptional({ msg: "Email Notifications" });

// Valid inputs
schema.parse(true);                // ✅ "true"
schema.parse(false);               // ✅ "false"
schema.parse("true");              // ✅ "true"
schema.parse("false");             // ✅ "false"
schema.parse(undefined);           // ✅ undefined

// Invalid inputs
schema.parse("yes");               // ❌ Error: Email Notifications must be a boolean string
schema.parse("1");                 // ❌ Error: Email Notifications must be a boolean string
```

## Type Definitions

```typescript
interface BaseSchemaOptions {
  msg?: string;           // Field name or custom message
  msgType?: MsgType;      // Message formatting type
}

// Inferred types
type BooleanRequired = boolean;                   // Always true or false
type BooleanOptional = boolean | undefined;       // Boolean or undefined
type BooleanStringRequired = string;              // "true" or "false"
type BooleanStringOptional = string | undefined;  // "true", "false", or undefined
```

## Validation Behavior

### Accepted Values by Schema Type

| Schema Type | Accepts | Rejects | Output |
|------------|---------|---------|--------|
| `BooleanRequired` | `true`, `false` | strings, numbers, null, undefined, objects | `boolean` |
| `BooleanOptional` | `true`, `false`, `undefined` | strings, numbers, null, objects | `boolean \| undefined` |
| `BooleanStringRequired` | `true`, `false`, `"true"`, `"false"` | other strings, numbers, null, undefined | `"true" \| "false"` |
| `BooleanStringOptional` | `true`, `false`, `"true"`, `"false"`, `undefined` | other strings, numbers, null | `"true" \| "false" \| undefined` |

### String Conversion Rules

For `BooleanString` schemas:

| Input | Output | Notes |
|-------|--------|-------|
| `true` | `"true"` | Boolean to string |
| `false` | `"false"` | Boolean to string |
| `"true"` | `"true"` | Direct string |
| `"false"` | `"false"` | Direct string |
| `"TRUE"` | `"true"` | Case insensitive |
| `"FALSE"` | `"false"` | Case insensitive |
| `"  true  "` | `"true"` | Trimmed |
| `"True"`, `"False"` | `"true"`, `"false"` | Mixed case handled |

### Rejected Values

All boolean schemas reject these values:
- Numbers: `1`, `0`, `-1`, `42`
- Other strings: `"yes"`, `"no"`, `"1"`, `"0"`, `"on"`, `"off"`
- Objects: `{}`, `[]`, `new Date()`
- `null` (explicitly rejected)

## Common Patterns

### User Preferences Schema

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

const userPreferencesSchema = z.object({
  // Required boolean preferences
  agreedToTerms: pz.BooleanRequired({ 
    msg: "Terms Agreement" 
  }),
  emailVerified: pz.BooleanRequired({ 
    msg: "Email Verification Status" 
  }),
  
  // Optional boolean preferences
  newsletterSubscribed: pz.BooleanOptional({ 
    msg: "Newsletter Subscription" 
  }),
  profilePublic: pz.BooleanOptional({ 
    msg: "Public Profile" 
  }),
  
  // String boolean flags (for storage/API)
  darkModeEnabled: pz.BooleanStringRequired({ 
    msg: "Dark Mode" 
  }),
  notificationsEnabled: pz.BooleanStringOptional({ 
    msg: "Push Notifications" 
  }),
});

type UserPreferences = z.infer<typeof userPreferencesSchema>;
```

### Feature Flags Schema

```typescript
const featureFlagsSchema = z.object({
  // Core features (boolean)
  newDashboard: pz.BooleanRequired({ msg: "New Dashboard" }),
  betaFeatures: pz.BooleanRequired({ msg: "Beta Features" }),
  
  // Experimental features (optional)
  experimentalUI: pz.BooleanOptional({ msg: "Experimental UI" }),
  advancedMetrics: pz.BooleanOptional({ msg: "Advanced Metrics" }),
  
  // Configuration flags (string boolean for external systems)
  maintenanceMode: pz.BooleanStringRequired({ msg: "Maintenance Mode" }),
  debugLogging: pz.BooleanStringOptional({ msg: "Debug Logging" }),
});
```

### Form Validation Schema

```typescript
const contactFormSchema = z.object({
  // Contact information
  name: pz.StringRequired({ msg: "Name" }),
  email: pz.EmailRequired({ msg: "Email" }),
  message: pz.StringRequired({ msg: "Message" }),
  
  // Consent and preferences
  agreedToPrivacyPolicy: pz.BooleanRequired({ 
    msg: "Privacy Policy Agreement" 
  }),
  agreedToTerms: pz.BooleanRequired({ 
    msg: "Terms Agreement" 
  }),
  
  // Optional preferences
  subscribeToNewsletter: pz.BooleanOptional({ 
    msg: "Newsletter Subscription" 
  }),
  allowPhoneContact: pz.BooleanOptional({ 
    msg: "Phone Contact Permission" 
  }),
});
```

### System Configuration Schema

```typescript
const systemConfigSchema = z.object({
  // Database settings
  databaseEnabled: pz.BooleanRequired({ msg: "Database Enabled" }),
  migrationEnabled: pz.BooleanOptional({ msg: "Migration Enabled" }),
  
  // Security settings  
  sslEnabled: pz.BooleanRequired({ msg: "SSL Enabled" }),
  authRequired: pz.BooleanRequired({ msg: "Authentication Required" }),
  twoFactorEnabled: pz.BooleanOptional({ msg: "Two Factor Authentication" }),
  
  // Logging and monitoring (as strings for external config)
  loggingEnabled: pz.BooleanStringRequired({ msg: "Logging Enabled" }),
  metricsEnabled: pz.BooleanStringOptional({ msg: "Metrics Enabled" }),
  debugMode: pz.BooleanStringOptional({ msg: "Debug Mode" }),
});
```

### API Response Schema

```typescript
const apiResponseSchema = z.object({
  // Response metadata
  success: pz.BooleanRequired({ msg: "Success Status" }),
  cached: pz.BooleanOptional({ msg: "Cached Response" }),
  
  // Data payload
  data: z.any().optional(),
  
  // Error information
  hasErrors: pz.BooleanRequired({ msg: "Has Errors" }),
  isRetryable: pz.BooleanOptional({ msg: "Retryable Error" }),
  
  // Feature flags in response
  features: z.object({
    newFeatureEnabled: pz.BooleanStringOptional({ msg: "New Feature" }),
    betaAccess: pz.BooleanStringOptional({ msg: "Beta Access" }),
  }).optional(),
});
```

### E-commerce Settings Schema

```typescript
const storeSettingsSchema = z.object({
  // Store status
  storeOpen: pz.BooleanRequired({ msg: "Store Open" }),
  acceptingOrders: pz.BooleanRequired({ msg: "Accepting Orders" }),
  
  // Payment options
  paymentEnabled: pz.BooleanRequired({ msg: "Payment Enabled" }),
  creditCardAccepted: pz.BooleanOptional({ msg: "Credit Card Accepted" }),
  paypalEnabled: pz.BooleanOptional({ msg: "PayPal Enabled" }),
  
  // Shipping options
  shippingEnabled: pz.BooleanRequired({ msg: "Shipping Enabled" }),
  freeShippingAvailable: pz.BooleanOptional({ msg: "Free Shipping Available" }),
  internationalShipping: pz.BooleanOptional({ msg: "International Shipping" }),
  
  // Marketing features (stored as strings)
  newsletterSignupVisible: pz.BooleanStringRequired({ 
    msg: "Newsletter Signup Visible" 
  }),
  promotionBannerEnabled: pz.BooleanStringOptional({ 
    msg: "Promotion Banner" 
  }),
});
```

## Error Messages

Boolean schemas provide specific error messages based on validation type:

### Default Messages (English)

- **Required:** `"[Field Name] is required"`
- **Type Error:** `"[Field Name] must be a boolean"`
- **String Boolean Error:** `"[Field Name] must be a boolean string"`

### Custom Error Messages

```typescript
import { MsgType } from "phantom-zod";

const schema = pz.BooleanRequired({
  msg: "You must agree to the terms and conditions",
  msgType: MsgType.Message
});

const stringSchema = pz.BooleanStringRequired({
  msg: "Feature flag must be 'true' or 'false'",
  msgType: MsgType.Message
});
```

## Best Practices

### 1. Choose the Right Schema Type

```typescript
// Use BooleanRequired for UI state and user choices
const termsAccepted = pz.BooleanRequired({ msg: "Terms Accepted" });
const isActive = pz.BooleanRequired({ msg: "Active Status" });

// Use BooleanOptional for optional preferences
const newsletter = pz.BooleanOptional({ msg: "Newsletter" });
const notifications = pz.BooleanOptional({ msg: "Notifications" });

// Use BooleanStringRequired for API/database storage
const featureFlag = pz.BooleanStringRequired({ msg: "Feature Flag" });
const configSetting = pz.BooleanStringRequired({ msg: "Config Setting" });
```

### 2. Handle Form Validation Appropriately

```typescript
// Good: Clear consent validation
const consentSchema = z.object({
  privacyPolicyAccepted: pz.BooleanRequired({ 
    msg: "Privacy Policy Acceptance" 
  }),
  termsAccepted: pz.BooleanRequired({ 
    msg: "Terms Acceptance" 
  }),
  marketingConsent: pz.BooleanOptional({ 
    msg: "Marketing Consent" 
  }),
});

// Validation with business rules
const signupSchema = consentSchema.refine(
  data => data.privacyPolicyAccepted && data.termsAccepted,
  {
    message: "You must accept both privacy policy and terms",
    path: ["termsAccepted"]
  }
);
```

### 3. API Integration Patterns

```typescript
// For external APIs that expect string booleans
const externalApiSchema = z.object({
  enabled: pz.BooleanStringRequired({ msg: "Enabled" }),
  visible: pz.BooleanStringOptional({ msg: "Visible" }),
});

// For internal processing with native booleans
const internalSchema = z.object({
  enabled: pz.BooleanRequired({ msg: "Enabled" }),
  visible: pz.BooleanOptional({ msg: "Visible" }),
});

// Transform between formats
const transformForApi = (internal: any) => {
  return externalApiSchema.parse({
    enabled: internal.enabled,
    visible: internal.visible
  });
};
```

### 4. Configuration Management

```typescript
// Environment configuration with defaults
const configSchema = z.object({
  // Required settings
  productionMode: pz.BooleanStringRequired({ msg: "Production Mode" }),
  debugEnabled: pz.BooleanStringRequired({ msg: "Debug Enabled" }),
  
  // Optional with sensible defaults
  maintenanceMode: pz.BooleanStringOptional({ msg: "Maintenance Mode" }),
  experimentalFeatures: pz.BooleanStringOptional({ msg: "Experimental Features" }),
}).transform(data => ({
  ...data,
  // Provide defaults for optional fields
  maintenanceMode: data.maintenanceMode ?? "false",
  experimentalFeatures: data.experimentalFeatures ?? "false"
}));
```

## Integration Examples

### With React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: pz.StringRequired({ msg: "Name" }),
  email: pz.EmailRequired({ msg: "Email" }),
  
  // Boolean checkboxes
  newsletterSubscription: pz.BooleanOptional({ msg: "Newsletter" }),
  termsAccepted: pz.BooleanRequired({ msg: "Terms Accepted" }),
  privacyPolicyAccepted: pz.BooleanRequired({ msg: "Privacy Policy" }),
});

const RegistrationForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newsletterSubscription: false,
      termsAccepted: false,
      privacyPolicyAccepted: false,
    }
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register("name")} placeholder="Name" />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register("email")} type="email" placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      
      <label>
        <input 
          {...register("newsletterSubscription")} 
          type="checkbox" 
        />
        Subscribe to newsletter
      </label>
      
      <label>
        <input 
          {...register("termsAccepted")} 
          type="checkbox" 
          required 
        />
        I accept the terms and conditions *
      </label>
      {errors.termsAccepted && <span>{errors.termsAccepted.message}</span>}
      
      <label>
        <input 
          {...register("privacyPolicyAccepted")} 
          type="checkbox" 
          required 
        />
        I accept the privacy policy *
      </label>
      {errors.privacyPolicyAccepted && <span>{errors.privacyPolicyAccepted.message}</span>}
      
      <button type="submit">Register</button>
    </form>
  );
};
```

### With Express.js API

```typescript
import express from "express";

const userPreferencesSchema = z.object({
  userId: pz.StringRequired({ msg: "User ID" }),
  
  // Boolean preferences
  emailNotifications: pz.BooleanRequired({ msg: "Email Notifications" }),
  pushNotifications: pz.BooleanOptional({ msg: "Push Notifications" }),
  
  // String boolean flags for external storage
  newsletterSubscribed: pz.BooleanStringRequired({ msg: "Newsletter" }),
  marketingEmails: pz.BooleanStringOptional({ msg: "Marketing Emails" }),
});

app.put("/user/preferences", (req, res) => {
  try {
    const preferences = userPreferencesSchema.parse(req.body);
    
    // Boolean values are properly validated
    console.log("Email notifications:", preferences.emailNotifications); // true/false
    console.log("Newsletter:", preferences.newsletterSubscribed); // "true"/"false"
    
    // Save preferences with appropriate types
    await UserPreferences.upsert({
      userId: preferences.userId,
      emailNotifications: preferences.emailNotifications, // boolean
      pushNotifications: preferences.pushNotifications ?? false, // boolean
      newsletterSubscribed: preferences.newsletterSubscribed, // string
      marketingEmails: preferences.marketingEmails ?? "false", // string
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ 
      error: "Validation failed",
      issues: error.issues 
    });
  }
});
```

### Feature Flags System

```typescript
// Feature flags stored as strings in database/config
const featureFlagSchema = z.object({
  newDashboard: pz.BooleanStringRequired({ msg: "New Dashboard" }),
  betaFeatures: pz.BooleanStringOptional({ msg: "Beta Features" }),
  experimentalAPI: pz.BooleanStringOptional({ msg: "Experimental API" }),
});

// API endpoint for feature flags
app.get("/feature-flags", async (req, res) => {
  const flags = await FeatureFlag.getAll();
  
  // Validate and transform flags
  const validatedFlags = featureFlagSchema.parse({
    newDashboard: flags.newDashboard || "false",
    betaFeatures: flags.betaFeatures,
    experimentalAPI: flags.experimentalAPI,
  });
  
  // Convert to booleans for client consumption
  const clientFlags = {
    newDashboard: validatedFlags.newDashboard === "true",
    betaFeatures: validatedFlags.betaFeatures === "true",
    experimentalAPI: validatedFlags.experimentalAPI === "true",
  };
  
  res.json({ flags: clientFlags });
});

// Update feature flags
app.put("/feature-flags", (req, res) => {
  const flagUpdates = featureFlagSchema.parse(req.body);
  
  // All values are validated as "true"/"false" strings
  await FeatureFlag.updateMany(flagUpdates);
  
  res.json({ success: true });
});
```

### Database Integration

```typescript
// Database model with mixed boolean types
interface UserModel {
  id: string;
  email: string;
  emailVerified: boolean;        // Database boolean
  isActive: boolean;             // Database boolean
  preferences: {
    newsletter: string;          // "true"/"false" string
    marketing: string;           // "true"/"false" string
    notifications?: boolean;     // Optional boolean
  };
}

// API schema matching database structure
const userCreateSchema = z.object({
  email: pz.EmailRequired({ msg: "Email" }),
  
  // These become database booleans
  emailVerified: pz.BooleanRequired({ msg: "Email Verified" }),
  isActive: pz.BooleanRequired({ msg: "Active Status" }),
  
  // Preferences with mixed types
  preferences: z.object({
    newsletter: pz.BooleanStringRequired({ msg: "Newsletter" }),
    marketing: pz.BooleanStringRequired({ msg: "Marketing" }),
    notifications: pz.BooleanOptional({ msg: "Notifications" }),
  }),
});

app.post("/users", async (req, res) => {
  const userData = userCreateSchema.parse(req.body);
  
  const user = await User.create({
    ...userData,
    id: generateId(),
    // Boolean fields are ready for database
    emailVerified: userData.emailVerified,
    isActive: userData.isActive,
    // String boolean fields stored as strings
    preferences: {
      newsletter: userData.preferences.newsletter,
      marketing: userData.preferences.marketing,
      notifications: userData.preferences.notifications ?? false,
    },
  });
  
  res.json({ user });
});
```

## Common Gotchas and Solutions

### 1. HTML Form Handling

```typescript
// Problem: HTML forms send checkboxes as "on" or undefined
const htmlFormSchema = z.object({
  newsletter: z
    .string()
    .optional()
    .transform(val => val === "on")
    .pipe(pz.BooleanRequired({ msg: "Newsletter" }))
});

// Better: Handle at form processing level
const processFormData = (formData: FormData) => {
  return {
    newsletter: formData.has("newsletter"), // true if checkbox checked
  };
};
```

### 2. API Integration

```typescript
// Problem: External API expects specific string values
const externalApiData = {
  featureEnabled: true, // Our boolean
};

// Solution: Transform for external API
const apiPayload = {
  feature_enabled: externalApiData.featureEnabled ? "true" : "false"
};

// Or use BooleanString schema for direct conversion
const apiSchema = z.object({
  feature_enabled: pz.BooleanStringRequired({ msg: "Feature Enabled" })
});

const transformedPayload = apiSchema.parse({
  feature_enabled: externalApiData.featureEnabled
}); // { feature_enabled: "true" }
```

### 3. Database Storage

```typescript
// Different databases handle booleans differently
// SQLite: 0/1, PostgreSQL: true/false, some APIs: "true"/"false"

// Use appropriate schema based on storage
const sqliteSchema = z.object({
  enabled: pz.NumberRequired({ msg: "Enabled" }).transform(n => n === 1)
});

const postgresSchema = z.object({
  enabled: pz.BooleanRequired({ msg: "Enabled" })
});

const apiStringSchema = z.object({
  enabled: pz.BooleanStringRequired({ msg: "Enabled" })
});
```

## See Also

- [String Schemas](string-schemas.md) - Text validation
- [Number Schemas](number-schemas.md) - Numeric validation
- [Date Schemas](date-schemas.md) - Date and time validation
- [Enum Schemas](enum-schemas.md) - Enumeration validation
- [Form Validation Examples](../examples/form-validation.md) - Practical form usage
- [API Validation Examples](../examples/api-validation.md) - API endpoint validation
