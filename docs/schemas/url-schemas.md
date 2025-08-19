# URL Schemas

The URL schemas module provides comprehensive validation for URL strings with support for protocol filtering, hostname validation, and common web URL patterns.

## Overview

This module offers flexible URL validation that can be configured to restrict protocols (HTTP, HTTPS, FTP, etc.) and validate hostnames/domains. It includes convenience functions for common use cases like HTTPS-only URLs and general web URLs.

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, all URL schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const websiteTraditional = pz.UrlRequired({ msg: "Website URL" });

// Simplified string parameter (equivalent)
const websiteSimple = pz.UrlRequired("Website URL");

// Both produce the same validation behavior
const urlInput = "https://example.com";
websiteTraditional.parse(urlInput); // ✅ "https://example.com"
websiteSimple.parse(urlInput);      // ✅ "https://example.com"

// Error messages are identical
websiteTraditional.parse("invalid"); // ❌ "Website URL must be a valid URL"
websiteSimple.parse("invalid");      // ❌ "Website URL must be a valid URL"
```

**When to use string parameters:**
- Basic field name specification only
- Default URL validation is sufficient
- Cleaner, more concise code

**When to use options objects:**
- Protocol restrictions needed (`protocol` regex)
- Hostname validation required (`hostname` regex)
- Custom message types (`MsgType.Message`)
- Advanced localization configurations

## Available Schemas

### Basic URL Schemas

- **`UrlRequired(options?)`** - Validates required URL strings
- **`UrlOptional(options?)`** - Validates optional URL strings (accepts undefined)

### Protocol-Specific Schemas

- **`HttpsUrlRequired(options?)`** - Validates required HTTPS URLs only
- **`HttpsUrlOptional(options?)`** - Validates optional HTTPS URLs only
- **`HttpUrlRequired(options?)`** - Validates required HTTP URLs only  
- **`HttpUrlOptional(options?)`** - Validates optional HTTP URLs only
- **`Wepz.UrlRequired(options?)`** - Validates required HTTP/HTTPS URLs
- **`Wepz.UrlOptional(options?)`** - Validates optional HTTP/HTTPS URLs

## Options

All URL schemas accept a `UrlSchemaOptions` configuration object:

```typescript
interface UrlSchemaOptions {
  protocol?: RegExp;  // Protocol validation pattern
  hostname?: RegExp;  // Hostname validation pattern
  msg?: string;       // Custom field name or error message
  msgType?: MsgType;  // Whether msg is field name or complete message
}
```

### Protocol Validation

Use regular expressions to restrict allowed protocols:

```typescript
// HTTPS only
{ protocol: /^https$/ }

// HTTP or HTTPS
{ protocol: /^https?$/ }

// FTP protocols
{ protocol: /^(ftp|ftps)$/ }

// Custom protocols
{ protocol: /^(ws|wss)$/ }
```

### Hostname Validation

Use regular expressions to validate domains and hostnames:

```typescript
// Specific domain
{ hostname: /^example\.com$/ }

// Subdomain pattern
{ hostname: /^api\.company\.com$/ }

// Multiple subdomains
{ hostname: /^(api|admin)\.company\.com$/ }

// Any subdomain
{ hostname: /\.example\.com$/ }
```

## Examples

### Basic URL Validation

```typescript
import { pz } from 'phantom-zod';

// Accept any valid URL
const anyUrlSchema = pz.UrlRequired();
anyUrlSchema.parse('https://example.com'); // ✓ Valid
anyUrlSchema.parse('http://example.com');  // ✓ Valid
anyUrlSchema.parse('ftp://files.com');     // ✓ Valid

// Optional URL
const optionalUrlSchema = pz.UrlOptional();
optionalUrlSchema.parse('https://example.com'); // ✓ Valid
optionalUrlSchema.parse(undefined);             // ✓ Valid
```

### Protocol-Specific Validation

```typescript
import { pz } from 'phantom-zod';

// HTTPS only
const secureSchema = HttpsUrlRequired();
secureSchema.parse('https://example.com'); // ✓ Valid
secureSchema.parse('http://example.com');  // ✗ Error

// Web URLs (HTTP/HTTPS)
const webSchema = Wepz.UrlRequired();
webSchema.parse('https://example.com'); // ✓ Valid
webSchema.parse('http://example.com');  // ✓ Valid
webSchema.parse('ftp://example.com');   // ✗ Error
```

### Hostname Validation

```typescript
import { pz } from 'phantom-zod';

// Specific domain
const apiSchema = pz.UrlRequired({
  hostname: /^api\.company\.com$/
});
apiSchema.parse('https://api.company.com'); // ✓ Valid
apiSchema.parse('https://example.com');     // ✗ Error

// Secure API endpoint
const secureApiSchema = HttpsUrlRequired({
  hostname: /^api\.company\.com$/
});
secureApiSchema.parse('https://api.company.com'); // ✓ Valid
secureApiSchema.parse('http://api.company.com');  // ✗ Error (protocol)
secureApiSchema.parse('https://other.com');       // ✗ Error (hostname)
```

### Combined Protocol and Hostname Validation

```typescript
import { pz } from 'phantom-zod';

// Secure API with strict validation
const strictApiSchema = pz.UrlRequired({
  protocol: /^https$/,
  hostname: /^api\.company\.com$/,
  msg: 'API Endpoint'
});

strictApiSchema.parse('https://api.company.com'); // ✓ Valid
strictApiSchema.parse('http://api.company.com');  // ✗ Error
strictApiSchema.parse('https://other.com');       // ✗ Error
```

### Multiple Subdomain Patterns

```typescript
import { pz } from 'phantom-zod';

// Accept multiple subdomains
const serviceSchema = Wepz.UrlRequired({
  hostname: /^(api|admin|dashboard)\.company\.com$/
});

serviceSchema.parse('https://api.company.com');       // ✓ Valid
serviceSchema.parse('https://admin.company.com');     // ✓ Valid
serviceSchema.parse('https://dashboard.company.com'); // ✓ Valid
serviceSchema.parse('https://other.company.com');     // ✗ Error
```

### Custom Error Messages

```typescript
import { pz } from 'phantom-zod';

// Field name for error context
const profileUrlSchema = pz.UrlRequired({
  protocol: /^https$/,
  msg: 'Profile Website'
});

// Complete custom message
const customMessageSchema = pz.UrlRequired({
  msg: 'Please enter a valid secure website URL',
  msgType: MsgType.Message
});
```

## Error Messages

The URL schemas provide specific error messages based on validation failures:

- **Invalid URL format**: "URL must be a valid URL"
- **Protocol mismatch**: "URL has invalid protocol: non-HTTPS" 
- **Hostname mismatch**: "URL has invalid domain: expected hostname"
- **Combined validation**: "URL is invalid: protocol or hostname mismatch"
- **Required field**: "URL is required"

## TypeScript Types

```typescript
// Schema return types
type UrlSchema = z.ZodString;
type OptionalUrlSchema = z.ZodOptional<z.ZodString>;

// Configuration interface
interface UrlSchemaOptions {
  protocol?: RegExp;
  hostname?: RegExp;
  msg?: string;
  msgType?: MsgType;
}

// Usage with schemas
const urlSchema = pz.UrlRequired();
type UrlType = z.infer<typeof urlSchema>; // string

const optionalSchema = pz.UrlOptional();
type OptionalUrlType = z.infer<typeof optionalSchema>; // string | undefined
```

## Best Practices

### Security Considerations

```typescript
// Always use HTTPS for external APIs
const externalApiSchema = HttpsUrlRequired({
  hostname: /^api\.trusted-service\.com$/
});

// Allow HTTP only for internal/localhost development
const devApiSchema = pz.UrlRequired({
  hostname: /^(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)$/
});
```

### Domain Validation Patterns

```typescript
// Exact domain match
const exactDomain = /^example\.com$/;

// Subdomain support
const withSubdomains = /^[\w-]+\.example\.com$/;

// Multiple domains
const multipleDomains = /^(example|test)\.com$/;

// Development environments
const devDomains = /\.(local|dev)$/;
```

### API Endpoint Validation

```typescript
// Microservice URL validation
const microserviceSchema = HttpsUrlRequired({
  hostname: /^(user|auth|payment)-service\.company\.com$/,
  msg: 'Microservice URL'
});

// Public API validation
const publicApiSchema = HttpsUrlRequired({
  hostname: /^api\.company\.com$/,
  msg: 'Public API Endpoint'
});
```

### Form Validation

```typescript
// Website field in user profiles
const websiteSchema = Wepz.UrlOptional({
  msg: 'Website URL'
});

// Required API configuration
const apiConfigSchema = HttpsUrlRequired({
  hostname: /^api\.[\w-]+\.com$/,
  msg: 'API Configuration URL'
});
```

## Integration Examples

### React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pz } from 'phantom-zod';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  website: Wepz.UrlOptional({ msg: 'Website URL' }),
  apiEndpoint: pz.UrlRequired({
    protocol: /^https$/,
    hostname: /^api\.company\.com$/,
    msg: 'API Endpoint'
  })
});

function ProfileForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" />
      <input {...register('website')} placeholder="Website (optional)" />
      <input {...register('apiEndpoint')} placeholder="API Endpoint" />
      
      {errors.website && <span>{errors.website.message}</span>}
      {errors.apiEndpoint && <span>{errors.apiEndpoint.message}</span>}
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

// Service configuration endpoint
const serviceConfigSchema = z.object({
  name: z.string(),
  healthCheckUrl: HttpsUrlRequired({
    msg: 'Health Check URL'
  }),
  documentationUrl: Wepz.UrlOptional({
    msg: 'Documentation URL'
  }),
  webhookUrl: HttpsUrlRequired({
    hostname: /^webhook\.company\.com$/,
    msg: 'Webhook URL'
  })
});

app.post('/api/services', (req, res) => {
  try {
    const config = serviceConfigSchema.parse(req.body);
    // Process validated service configuration
    res.json({ success: true, config });
  } catch (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.errors 
    });
  }
});
```

### Database Models

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// User profile schema
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  website: Wepz.UrlOptional({ msg: 'Personal Website' }),
  linkedInUrl: HttpsUrlRequired({
    hostname: /^(www\.)?linkedin\.com$/,
    msg: 'LinkedIn Profile'
  }).optional(),
  portfolioUrl: HttpsUrlRequired({
    msg: 'Portfolio Website'
  }).optional()
});

// API integration schema
export const IntegrationSchema = z.object({
  name: z.string(),
  baseUrl: HttpsUrlRequired({
    msg: 'API Base URL'
  }),
  webhookUrl: HttpsUrlRequired({
    msg: 'Webhook URL'
  }).optional(),
  documentationUrl: Wepz.UrlOptional({
    msg: 'API Documentation'
  })
});
```

### Configuration Validation

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// Application configuration
const configSchema = z.object({
  // External services (production)
  apiUrl: HttpsUrlRequired({
    hostname: /^api\.company\.com$/,
    msg: 'Production API URL'
  }),
  
  // Internal services (can be HTTP in development)
  internalApiUrl: process.env.NODE_ENV === 'production' 
    ? HttpsUrlRequired({
        hostname: /^internal\.company\.com$/,
        msg: 'Internal API URL'
      })
    : HttpUrlOptional({
        hostname: /^(localhost|127\.0\.0\.1)$/,
        msg: 'Internal API URL'
      }),
  
  // Optional monitoring
  healthCheckUrl: HttpsUrlRequired({
    msg: 'Health Check URL'
  }).optional()
});
```

## See Also

- [String Schemas](./string-schemas.md) - Basic string validation
- [Enum Schemas](./enum-schemas.md) - For validating URL protocols from predefined sets
- [Array Schemas](./array-schemas.md) - For validating arrays of URLs
- [Network Schemas](./network-schemas.md) - For IP addresses and network validation
- [Validation Guide](../guides/validation.md) - General validation patterns
