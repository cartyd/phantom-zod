
# LocalizationManager – Updated Common Interface

## Overview

The `LocalizationManager` is a robust, extensible service for managing localization in phantom-zod. It supports dynamic locale loading, message retrieval with parameter interpolation, fallback logic, and custom logging. It is designed for both global usage and dependency injection.

---

## Interface Summary

```typescript
export class LocalizationManager {
  // Locale management
  setLocale(locale: LocaleCode): void;
  getLocale(): LocaleCode;
  setFallbackLocale(locale: LocaleCode): void;
  getFallbackLocale(): LocaleCode;

  // Dynamic loading
  loadLocale(locale: LocaleCode): Promise<void>;
  loadLocales(locales: LocaleCode[]): Promise<void>;
  ensureLocaleLoaded(locale: LocaleCode): Promise<void>;

  // Message operations
  getMessage(key: string, params?: MessageParams, locale?: LocaleCode): string;
  getErrorMessage(fieldName: string, messageKey: MessageKeyPath, params?: MessageParams, locale?: LocaleCode): string;
  registerMessages(messages: LocalizationMessages): void;

  // Utility methods
  hasLocale(locale: LocaleCode): boolean;
  getAvailableLocales(): LocaleCode[];
  getSupportedLocales(): LocaleCode[];
  isMessageDefined(key: string, locale?: LocaleCode): boolean;
  getMessageKeys(locale?: LocaleCode): string[];
  setLogger(logger: Logger): void;
}
```

---

## Usage Patterns

### 1. **Global Instance**

```typescript
import { localizationManager } from 'phantom-zod/localization';

await localizationManager.loadLocale('es');
localizationManager.setLocale('es');
const msg = localizationManager.getMessage('string.required', { field: 'Email' });
```

### 2. **Dependency Injection / Custom Instance**

```typescript
import { createLocalizationManager } from 'phantom-zod/localization';

const manager = createLocalizationManager();
await manager.loadLocale('fr');
manager.setLocale('fr');
const msg = manager.getMessage('string.required');
```

### 3. **Testing and Reset**

```typescript
import { resetGlobalLocalizationManager } from 'phantom-zod/localization';

resetGlobalLocalizationManager(); // Resets the global instance to default state
```

---

## Key Features

- **Dynamic Locale Loading:**  
  Loads locale files on demand using static imports. Supports multiple locales and fallback logic.

- **Message Retrieval & Interpolation:**  
  Retrieves messages by key (dot notation supported) and interpolates parameters (e.g., `{field}`).

- **Fallback Logic:**  
  If a message or locale is missing, falls back to the default locale or the key itself.

- **Custom Logger Support:**  
  Allows injection of a custom logger for info, warn, error, and debug messages.

- **Validation & Registration:**  
  Validates message structure and allows manual registration of locale messages.

- **Utility Methods:**  
  Check available/supported locales, get all message keys, and verify message existence.

---

## Example: Advanced Usage

```typescript
import { LocalizationManager } from 'phantom-zod/localization';

const manager = new LocalizationManager();
await manager.loadLocales(['en', 'es']);
manager.setLocale('es');

const errorMsg = manager.getErrorMessage('Email', 'string.required', { fieldName: 'Email' });
console.log(errorMsg);

if (manager.isMessageDefined('string.required')) {
  // Message exists
}
```

---

## Type Safety

All methods are fully typed for maximum TypeScript safety and IntelliSense.

---

## Migration Notes

- The manager now uses static imports for locale files.
- Message retrieval supports dot notation and parameter interpolation.
- Fallback and logger logic are customizable.
- The global instance is provided for convenience, but custom instances are recommended for testing and advanced scenarios.

---

## Summary

The new `LocalizationManager` provides a unified, extensible, and type-safe API for all localization needs in phantom-zod. It supports global usage, dependency injection, and custom implementations, ensuring consistent and reliable localization across your application.

---

// Get the interface - useful for dependency injection
const manager: ILocalizationManager = getLocalizationManager();
manager.setLocale('es');
const message = manager.getMessage('string.required');
```

### 3. **Convenience Functions (Most Common Operations)**
```typescript
import { setLocale, getLocale, getMessage, loadLocale } from 'phantom-zod/localization';

// Convenience functions for common operations
await loadLocale('es');
setLocale('es');
const currentLocale = getLocale();
const message = getMessage('string.required');
```

## Benefits of the Common Interface

### 🔧 **Dependency Injection**
```typescript
class MyService {
  constructor(private localizationManager: ILocalizationManager) {}
  
  async initialize(locale: string) {
    await this.localizationManager.loadLocale(locale);
    this.localizationManager.setLocale(locale);
  }
  
  getErrorMessage(key: string) {
    return this.localizationManager.getMessage(key);
  }
}

// Inject the global instance
const service = new MyService(getLocalizationManager());
```

### 🧪 **Testing**
```typescript
// Create a mock implementation for testing
const mockManager: ILocalizationManager = {
  setLocale: jest.fn(),
  getLocale: jest.fn().mockReturnValue('en'),
  getMessage: jest.fn().mockReturnValue('test message'),
  // ... other methods
};

// Use in tests
const service = new MyService(mockManager);
```

### 🔄 **Custom Implementations**
```typescript
class CustomLocalizationManager implements ILocalizationManager {
  // Your custom implementation
  setLocale(locale: LocaleCode): void {
    // Custom logic
  }
  
  getMessage(key: string): string {
    // Custom message retrieval
  }
  
  // ... implement all interface methods
}

// Use your custom implementation
const customManager = new CustomLocalizationManager();
```

## Complete Usage Examples

### Basic Usage
```typescript
import { getLocalizationManager } from 'phantom-zod/localization';

async function setupLocalization() {
  const manager = getLocalizationManager();
  
  // Load additional locales
  await manager.loadLocale('es');
  await manager.loadLocale('fr');
  
  // Set current locale
  manager.setLocale('es');
  
  // Get localized messages
  const requiredMsg = manager.getMessage('string.required');
  const errorMsg = manager.getErrorMessage('Email', 'string.invalid');
  
  console.log('Available locales:', manager.getAvailableLocales());
  console.log('Current locale:', manager.getLocale());
  console.log('Fallback locale:', manager.getFallbackLocale());
}
```

### Advanced Usage with Class
```typescript
import type { ILocalizationManager } from 'phantom-zod/localization';

class ValidationService {
  constructor(private l10n: ILocalizationManager) {}
  
  async validateEmail(email: string, locale?: string): Promise<string[]> {
    const errors: string[] = [];
    
    if (locale) {
      await this.l10n.ensureLocaleLoaded(locale);
    }
    
    if (!email) {
      errors.push(
        this.l10n.getErrorMessage('Email', 'string.required', {}, locale)
      );
    } else if (!email.includes('@')) {
      errors.push(
        this.l10n.getErrorMessage('Email', 'email.invalidFormat', {}, locale)
      );
    }
    
    return errors;
  }
  
  getSupportedLocales(): string[] {
    return this.l10n.getAvailableLocales();
  }
}

// Usage
import { getLocalizationManager } from 'phantom-zod/localization';
const validator = new ValidationService(getLocalizationManager());
```

## Integration with Global Message Handler

The interface works seamlessly with the global message handler:

```typescript
import { getLocalizationManager } from 'phantom-zod/localization';
import { setLocale as setGlobalLocale } from 'phantom-zod/common/message-handler';

async function syncLocales(locale: string) {
  const manager = getLocalizationManager();
  
  // Ensure locale is loaded
  await manager.ensureLocaleLoaded(locale);
  
  // Set both locale states
  manager.setLocale(locale);
  setGlobalLocale(locale);
  
  console.log('Locales synchronized to:', locale);
}
```

## Type Safety

The interface provides full TypeScript support:

```typescript
import type { ILocalizationManager, LocaleCode, MessageParams } from 'phantom-zod/localization';

function createLocalizedMessage(
  manager: ILocalizationManager,
  key: string,
  params?: MessageParams,
  locale?: LocaleCode
): string {
  // Full type safety and IntelliSense support
  return manager.getMessage(key, params, locale);
}
```

## Summary

**✅ Yes, there is now a comprehensive common interface for accessing the LocalizationManager:**

- **🎯 `ILocalizationManager` Interface**: Standardized contract for all localization operations
- **🔄 Multiple Access Patterns**: Direct, interface-based, and convenience functions
- **💉 Dependency Injection Ready**: Perfect for testing and custom implementations  
- **🧪 Testing Friendly**: Easy to mock and test
- **📝 Type Safe**: Full TypeScript support with IntelliSense
- **🔗 Global Integration**: Works with global message handler system
- **🎨 Flexible**: Support for custom implementations while maintaining compatibility

The interface ensures consistent API access across the entire phantom-zod ecosystem!
