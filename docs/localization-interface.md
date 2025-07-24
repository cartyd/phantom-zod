# LocalizationManager Common Interface

## ✅ Yes, there is now a common interface!

The `ILocalizationManager` interface provides a standardized contract for accessing localization functionality across the phantom-zod library.

## Interface Definition

```typescript
export interface ILocalizationManager {
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
}
```

## Access Patterns

### 1. **Direct Access (Global Instance)**
```typescript
import { localizationManager } from 'phantom-zod/localization';

// Direct access to the global instance
localizationManager.setLocale('es');
const currentLocale = localizationManager.getLocale();
const message = localizationManager.getMessage('string.required');
```

### 2. **Interface Access (Dependency Injection Friendly)**
```typescript
import { getLocalizationManager, type ILocalizationManager } from 'phantom-zod/localization';

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
