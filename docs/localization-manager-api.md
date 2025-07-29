
# LocalizationManager API – Updated Reference

## Overview

The `LocalizationManager` provides complete locale management, dynamic loading, message retrieval, fallback logic, parameter interpolation, and utility methods for internationalization in phantom-zod.

---

## API Reference

### Locale Management
| Method                      | Description                   | Example                                  |
|-----------------------------|-------------------------------|------------------------------------------|
| `setLocale(locale)`         | Set the current active locale | `manager.setLocale('es')`                |
| `getLocale()`               | Get the current active locale | `manager.getLocale()` // 'es'            |
| `setFallbackLocale(locale)` | Set fallback locale           | `manager.setFallbackLocale('en')`        |
| `getFallbackLocale()`       | Get fallback locale           | `manager.getFallbackLocale()` // 'en'    |

### Dynamic Loading
| Method                      | Description                        | Example                                      |
|-----------------------------|------------------------------------|----------------------------------------------|
| `loadLocale(locale)`        | Load a locale from JSON file       | `await manager.loadLocale('es')`             |
| `loadLocales(locales)`      | Load multiple locales              | `await manager.loadLocales(['es', 'fr'])`    |
| `ensureLocaleLoaded(locale)`| Load locale if not already loaded  | `await manager.ensureLocaleLoaded('es')`     |

### Message Retrieval
| Method                                          | Description                  | Example                                              |
|-------------------------------------------------|------------------------------|------------------------------------------------------|
| `getMessage(key, params?, locale?)`             | Get localized message        | `manager.getMessage('string.required')`              |
| `getErrorMessage(field, key, params?, locale?)` | Get formatted error message  | `manager.getErrorMessage('Email', 'string.required')`|

### Utility Methods
| Method                              | Description                         | Example                                              |
|-------------------------------------|-------------------------------------|------------------------------------------------------|
| `hasLocale(locale)`                 | Check if locale is loaded           | `manager.hasLocale('es')` // true/false              |
| `getAvailableLocales()`             | Get all loaded locales              | `manager.getAvailableLocales()` // ['en', 'es']      |
| `getSupportedLocales()`             | Get all supported locales           | `manager.getSupportedLocales()` // ['en', 'es', ...] |
| `isMessageDefined(key, locale?)`    | Check if message key exists         | `manager.isMessageDefined('string.required')`        |
| `getMessageKeys(locale?)`           | Get all message keys for a locale   | `manager.getMessageKeys('es')`                       |
| `registerMessages(messages)`        | Register locale messages            | `manager.registerMessages(messages)`                 |
| `setLogger(logger)`                 | Set a custom logger                 | `manager.setLogger(myLogger)`                        |

---

## Usage Examples

### Basic Locale Switching
```typescript
import { localizationManager } from 'phantom-zod/localization';

await localizationManager.loadLocale('es');
localizationManager.setLocale('es');
const message = localizationManager.getMessage('string.required'); // "es requerido"

localizationManager.setLocale('en');
const englishMessage = localizationManager.getMessage('string.required'); // "is required"
```

### Advanced Usage: Overrides, Parameters, and Message Keys
```typescript
// Set current locale to Spanish
localizationManager.setLocale('es');

// Get message in current locale
const currentMessage = localizationManager.getMessage('string.required'); // "es requerido"

// Override locale for specific message
const englishMessage = localizationManager.getMessage('string.required', {}, 'en'); // "is required"

// Message with parameters in current locale
const paramMessage = localizationManager.getMessage('string.tooShort', { min: '5' }); // "es demasiado corto (mínimo: 5 caracteres)"

// Get all message keys for current locale
const keys = localizationManager.getMessageKeys();
```

---

## Integration with Global Handler

The `LocalizationManager` works alongside the global message handler, but they maintain **separate locale state**:

```typescript
import { localizationManager } from 'phantom-zod/localization';
import { setLocale, getLocale } from 'phantom-zod/common/message-handler';

localizationManager.setLocale('es');  // LocalizationManager locale
setLocale('en');                      // Global handler locale

console.log(localizationManager.getLocale()); // 'es'
console.log(getLocale());                     // 'en'
```

### Synchronization Pattern
If you want to keep them synchronized:

```typescript
async function syncLocale(locale: LocaleCode) {
  localizationManager.setLocale(locale);
  setLocale(locale);
  await localizationManager.ensureLocaleLoaded(locale);
}

await syncLocale('es'); // Both systems now use Spanish
```

---

## Message Resolution Order

When `getMessage()` is called, the LocalizationManager follows this order:

1. **Target Locale**: Uses `locale` parameter OR current locale (`getLocale()`)
2. **Fallback Locale**: If message not found, tries fallback locale (`getFallbackLocale()`)
3. **Key Fallback**: If still not found, returns the key itself

```typescript
localizationManager.setLocale('es');        // Current: Spanish
localizationManager.setFallbackLocale('en'); // Fallback: English

// Resolution order for getMessage('some.key'):
// 1. Try Spanish ('es')
// 2. If not found, try English ('en') 
// 3. If still not found, return 'some.key'
```

---

## Summary

**LocalizationManager now provides:**

- ✅ Full locale management (set/get current and fallback)
- ✅ Dynamic locale loading with JSON imports
- ✅ Separate locale state from global handler
- ✅ Complete message resolution with fallback
- ✅ Parameter interpolation
- ✅ Utility methods for keys, existence, and supported locales
- ✅ Custom logger support
- ✅ Full TypeScript support
