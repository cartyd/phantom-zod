# LocalizationManager API - Locale Management

## ✅ Current Capabilities

The `LocalizationManager` now provides **complete locale management functionality**:

### Locale Setting & Getting
```typescript
import { localizationManager } from 'phantom-zod/localization';

// Set the current active locale
localizationManager.setLocale('es');

// Get the current active locale
const currentLocale = localizationManager.getLocale(); // Returns: 'es'
```

### Fallback Locale Management
```typescript
// Set the fallback locale (used when translations are missing)
localizationManager.setFallbackLocale('en');

// Get the fallback locale
const fallbackLocale = localizationManager.getFallbackLocale(); // Returns: 'en'
```

## Complete API Reference

### Locale Management
| Method | Description | Example |
|--------|-------------|---------|
| `setLocale(locale)` | Set the current active locale | `manager.setLocale('es')` |
| `getLocale()` | Get the current active locale | `manager.getLocale()` // 'es' |
| `setFallbackLocale(locale)` | Set fallback locale | `manager.setFallbackLocale('en')` |
| `getFallbackLocale()` | Get fallback locale | `manager.getFallbackLocale()` // 'en' |

### Dynamic Loading
| Method | Description | Example |
|--------|-------------|---------|
| `loadLocale(locale)` | Load a locale from JSON file | `await manager.loadLocale('es')` |
| `loadLocales(locales)` | Load multiple locales | `await manager.loadLocales(['es', 'fr'])` |
| `ensureLocaleLoaded(locale)` | Load locale if not already loaded | `await manager.ensureLocaleLoaded('es')` |

### Message Retrieval
| Method | Description | Example |
|--------|-------------|---------|
| `getMessage(key, params?, locale?)` | Get localized message | `manager.getMessage('string.required')` |
| `getErrorMessage(field, key, params?, locale?)` | Get formatted error message | `manager.getErrorMessage('Email', 'string.required')` |

### Utility Methods
| Method | Description | Example |
|--------|-------------|---------|
| `hasLocale(locale)` | Check if locale is loaded | `manager.hasLocale('es')` // true/false |
| `getAvailableLocales()` | Get all loaded locales | `manager.getAvailableLocales()` // ['en', 'es'] |
| `registerMessages(messages)` | Register locale messages | `manager.registerMessages(messages)` |

## Usage Examples

### Basic Locale Switching
```typescript
import { localizationManager } from 'phantom-zod/localization';

// Load Spanish locale
await localizationManager.loadLocale('es');

// Switch to Spanish
localizationManager.setLocale('es');

// Get message in current locale (Spanish)
const message = localizationManager.getMessage('string.required');
// Returns: "es requerido"

// Switch back to English
localizationManager.setLocale('en');

// Get message in current locale (English)
const englishMessage = localizationManager.getMessage('string.required');
// Returns: "is required"
```

### Advanced Usage with Overrides
```typescript
// Set current locale to Spanish
localizationManager.setLocale('es');

// Get message in current locale
const currentMessage = localizationManager.getMessage('string.required');
// Returns: "es requerido" (Spanish)

// Override locale for specific message
const englishMessage = localizationManager.getMessage('string.required', {}, 'en');
// Returns: "is required" (English override)

// Message with parameters in current locale
const paramMessage = localizationManager.getMessage('string.tooShort', { min: '5' });
// Returns: "es demasiado corto (mínimo: 5 caracteres)"
```

## Integration with Global Handler

The `LocalizationManager` works alongside the global message handler, but they maintain **separate locale state**:

```typescript
import { localizationManager } from 'phantom-zod/localization';
import { setLocale, getLocale } from 'phantom-zod/common/message-handler';

// These are separate locale states:
localizationManager.setLocale('es');  // LocalizationManager locale
setLocale('en');                      // Global handler locale

console.log(localizationManager.getLocale()); // 'es'
console.log(getLocale());                     // 'en'
```

### Synchronization Pattern
If you want to keep them synchronized, you can create a helper function:

```typescript
function syncLocale(locale: LocaleCode) {
  // Set both locale states
  localizationManager.setLocale(locale);
  setLocale(locale);
  
  // Optionally load the locale if not already loaded
  await localizationManager.ensureLocaleLoaded(locale);
}

// Usage
await syncLocale('es'); // Both systems now use Spanish
```

## Message Resolution Order

When `getMessage()` is called, the LocalizationManager follows this resolution order:

1. **Target Locale**: Uses `locale` parameter OR current locale (`getLocale()`)
2. **Fallback Locale**: If message not found, tries fallback locale (`getFallbackLocale()`)
3. **Key Fallback**: If still not found, returns the key itself

```typescript
// Example resolution flow:
localizationManager.setLocale('es');        // Current: Spanish
localizationManager.setFallbackLocale('en'); // Fallback: English

// Resolution order for getMessage('some.key'):
// 1. Try Spanish ('es')
// 2. If not found, try English ('en') 
// 3. If still not found, return 'some.key'
```

## ✅ Summary

**Yes, the LocalizationManager now fully supports setting and retrieving the locale** with these key features:

- ✅ `setLocale()` / `getLocale()` - Current active locale
- ✅ `setFallbackLocale()` / `getFallbackLocale()` - Fallback locale  
- ✅ Dynamic locale loading with JSON imports
- ✅ Separate locale state from global handler (allows flexibility)
- ✅ Complete message resolution with fallback handling
- ✅ Parameter interpolation support
- ✅ Full TypeScript support
