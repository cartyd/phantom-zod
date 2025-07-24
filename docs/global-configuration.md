# Global Configuration

The phantom-zod library provides a global configuration system that allows you to set up a logger and localization interface once and have it used by all schemas throughout your application.

## Features

- **Global Logger**: Set a single logger instance that all schemas will use for debugging and warnings
- **Global Locale**: Set a default locale that all schemas will use for error messages
- **Global Localization Manager**: Optionally replace the default localization manager with a custom implementation

## API Reference

### Setting Global Configuration

```typescript
import { 
  setLogger, 
  setLocale, 
  setLocalizationManager 
} from 'phantom-zod/common/message-handler';
```

#### `setLogger(logger: Logger): void`

Sets the global logger instance used by all schemas.

```typescript
const customLogger = {
  warn: (message: string, meta?: any) => {
    console.error(`[VALIDATION WARNING]: ${message}`, meta);
  },
  debug: (message: string, meta?: any) => {
    console.log(`[VALIDATION DEBUG]: ${message}`, meta);
  }
};

setLogger(customLogger);
```

#### `setLocale(locale: LocaleCode): void`

Sets the global locale used by all schemas for error message formatting.

```typescript
setLocale('en'); // English
setLocale('es'); // Spanish
setLocale('fr'); // French
// ... other supported locales
```

#### `setLocalizationManager(manager: LocalizationManager): void`

Replaces the default localization manager with a custom implementation.

```typescript
import { LocalizationManager } from 'phantom-zod/localization';

const customManager = new LocalizationManager();
// Configure your custom manager...

setLocalizationManager(customManager);
```

### Getting Current Configuration

```typescript
import { 
  getLogger, 
  getLocale, 
  getLocalizationManager 
} from 'phantom-zod/common/message-handler';
```

#### `getLogger(): Logger`

Returns the current global logger instance.

#### `getLocale(): LocaleCode`

Returns the current global locale.

#### `getLocalizationManager(): LocalizationManager`

Returns the current global localization manager instance.

## Usage Example

```typescript
import { 
  setLogger, 
  setLocale 
} from 'phantom-zod/common/message-handler';
import { zStringRequired, zEmailRequired } from 'phantom-zod/schemas';

// Set up global configuration once at app startup
setLogger({
  warn: (msg, meta) => console.error('VALIDATION:', msg, meta),
  debug: (msg, meta) => console.log('DEBUG:', msg, meta)
});
setLocale('en');

// All schemas will now use the global configuration
const nameSchema = zStringRequired('Name');
const emailSchema = zEmailRequired('Email');

// Validation errors will use the global logger and locale
try {
  nameSchema.parse(''); // Uses global logger and locale
} catch (error) {
  console.log(error.issues[0].message);
}
```

## Logger Interface

The logger interface is minimal and flexible:

```typescript
interface Logger {
  warn(message: string, meta?: any): void;
  debug?(message: string, meta?: any): void; // Optional
}
```

## Supported Locales

The following locales are supported:

- `en` - English
- `en-US` - English (United States)
- `en-GB` - English (United Kingdom)
- `es` - Spanish
- `es-ES` - Spanish (Spain)
- `es-MX` - Spanish (Mexico)
- `fr` - French
- `fr-FR` - French (France)
- `fr-CA` - French (Canada)
- `de` - German
- `de-DE` - German (Germany)
- `it` - Italian
- `pt` - Portuguese
- `pt-BR` - Portuguese (Brazil)
- `ru` - Russian
- `zh` - Chinese
- `zh-CN` - Chinese (Simplified)
- `zh-TW` - Chinese (Traditional)
- `ja` - Japanese
- `ko` - Korean

## Benefits

1. **Consistency**: All schemas use the same logger and locale settings
2. **Centralized Configuration**: Set up once at application startup
3. **Easy Testing**: Mock logger and locale for testing scenarios
4. **Performance**: No need to pass configuration to each schema instance
5. **Maintainability**: Change logging or localization behavior globally

## Migration from Per-Schema Configuration

If you were previously passing `locale` or `localizationManager` parameters to individual schema functions, you can remove those parameters and rely on the global configuration instead:

```typescript
// Before (per-schema configuration)
const schema = zStringRequired('Name', MsgType.FieldName, 1, 50, 'en');

// After (global configuration)
setLocale('en'); // Set once globally
const schema = zStringRequired('Name', MsgType.FieldName, 1, 50);
```
