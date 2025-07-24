import type { 
  LocaleCode, 
  LocalizationMessages, 
  MessageParams, 
  MessageKeyPath,
  LocalizationManagerInterface 
} from './types';

/**
 * Logger interface for configurable logging
 */
interface Logger {
  warn(message: string, ...args: any[]): void;
}

/**
 * Default logger that uses console
 */
const defaultLogger: Logger = {
  warn: (message: string, ...args: any[]) => console.warn(message, ...args)
};

/**
 * Localization manager for handling message retrieval and interpolation
 */
export class LocalizationManager implements LocalizationManagerInterface {
  private messages = new Map<LocaleCode, LocalizationMessages>();
  private fallbackLocale: LocaleCode = 'en';
  private currentLocale: LocaleCode = 'en';
  private logger: Logger = defaultLogger;

  /**
   * Validate that imported JSON matches LocalizationMessages interface
   */
  private isValidLocalizationMessages(obj: any): obj is LocalizationMessages {
    return (
      obj &&
      typeof obj === 'object' &&
      typeof obj.locale === 'string' &&
      typeof obj.common === 'object' &&
      typeof obj.string === 'object' &&
      typeof obj.email === 'object' &&
      typeof obj.number === 'object' &&
      typeof obj.network === 'object'
      // Add more validation as needed
    );
  }

  /**
   * Static mapping of locale codes to their import functions
   * This enables static analysis and better bundling
   */
  private static readonly localeImports: Record<LocaleCode, () => Promise<{ default: any }>> = (() => {
    const imports: Record<string, () => Promise<{ default: any }>> = {};
    imports.en = () => import('./locales/en.json');
    imports['en-US'] = () => import('./locales/en-US.json');
    imports['en-GB'] = () => import('./locales/en-GB.json');
    imports.es = () => import('./locales/es.json');
    imports['es-ES'] = () => import('./locales/es-ES.json');
    imports['es-MX'] = () => import('./locales/es-MX.json');
    imports.fr = () => import('./locales/fr.json');
    imports['fr-FR'] = () => import('./locales/fr-FR.json');
    imports['fr-CA'] = () => import('./locales/fr-CA.json');
    imports.de = () => import('./locales/de.json');
    imports['de-DE'] = () => import('./locales/de-DE.json');
    imports.it = () => import('./locales/it.json');
    imports.pt = () => import('./locales/pt.json');
    imports['pt-BR'] = () => import('./locales/pt-BR.json');
    imports.ru = () => import('./locales/ru.json');
    imports.zh = () => import('./locales/zh.json');
    imports['zh-CN'] = () => import('./locales/zh-CN.json');
    imports['zh-TW'] = () => import('./locales/zh-TW.json');
    imports.ja = () => import('./locales/ja.json');
    imports.ko = () => import('./locales/ko.json');
    return imports as Record<LocaleCode, () => Promise<{ default: any }>>;
  })();

  /**
   * Load locale messages from JSON file
   */
  async loadLocale(locale: LocaleCode): Promise<void> {
    if (this.messages.has(locale)) {
      return; // Already loaded
    }

    const importFunction = LocalizationManager.localeImports[locale];
    if (!importFunction) {
      throw new Error(`Unsupported locale '${locale}'. Available locales: ${Object.keys(LocalizationManager.localeImports).join(', ')}`);
    }

    try {
      const messages = await importFunction();
      const localeData = messages.default;
      
      if (!this.isValidLocalizationMessages(localeData)) {
        throw new Error(`Invalid localization messages format in ${locale}.json`);
      }
      
      this.registerMessages(localeData);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid localization messages format')) {
        // Re-throw validation errors as-is (they have clear messages)
        throw error;
      }
      if (error instanceof Error && error.message.includes('Unsupported locale')) {
        // Re-throw unsupported locale errors as-is
        throw error;
      }
      // For file not found and other import errors, provide a clear error
      throw new Error(`Failed to load locale '${locale}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load multiple locales at once
   */
  async loadLocales(locales: LocaleCode[]): Promise<void> {
    await Promise.all(locales.map(locale => this.loadLocale(locale)));
  }

  /**
   * Set the fallback locale
   */
  setFallbackLocale(locale: LocaleCode): void {
    if (!this.isValidLocaleCode(locale)) {
      throw new Error(`Invalid locale code '${locale}'. Must be one of: ${this.getSupportedLocales().join(', ')}`);
    }
    this.fallbackLocale = locale;
  }

  /**
   * Get the fallback locale
   */
  getFallbackLocale(): LocaleCode {
    return this.fallbackLocale;
  }

  /**
   * Set the current active locale
   */
  setLocale(locale: LocaleCode): void {
    if (!this.isValidLocaleCode(locale)) {
      throw new Error(`Invalid locale code '${locale}'. Must be one of: ${this.getSupportedLocales().join(', ')}`);
    }
    this.currentLocale = locale;
  }

  /**
   * Get the current active locale
   */
  getLocale(): LocaleCode {
    return this.currentLocale;
  }

  /**
   * Register messages for a locale
   */
  registerMessages(messages: LocalizationMessages): void {
    this.messages.set(messages.locale, messages);
  }

  /**
   * Set a custom logger for handling warnings and errors
   * @param logger - Custom logger implementation
   */
  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  /**
   * Get a message by key with optional parameter interpolation
   * @param key - Message key in dot notation (e.g., 'string.required')
   * @param params - Parameters for message interpolation
   * @param locale - Optional locale override
   */
  getMessage(key: string, params?: MessageParams, locale?: LocaleCode): string {
    const targetLocale = locale ?? this.currentLocale;
    
    const message = this.getMessageFromLocale(targetLocale, key) 
      ?? this.getMessageFromLocale(this.fallbackLocale, key)
      ?? key; // Fallback to key itself

    return this.interpolateMessage(message, params);
  }

  /**
   * Get formatted error message for schemas
   */
  getErrorMessage(
    fieldName: string,
    messageKey: MessageKeyPath,
    params?: MessageParams,
    locale?: LocaleCode
  ): string {
    const message = this.getMessage(messageKey, params, locale);
    
    // Get the error formatting template from localization messages
    const formatTemplate = this.getMessage('common.errorFormat', { fieldName, message }, locale) 
      || this.getMessage('errorFormat', { fieldName, message }, locale)
      || '{fieldName} {message}'; // Ultimate fallback
    
    return this.interpolateMessage(formatTemplate, { fieldName, message });
  }

  /**
   * Ensure a locale is loaded, load it if not
   */
  async ensureLocaleLoaded(locale: LocaleCode): Promise<void> {
    if (!this.hasLocale(locale)) {
      await this.loadLocale(locale);
    }
  }

  /**
   * Check if a locale is available
   */
  hasLocale(locale: LocaleCode): boolean {
    return this.messages.has(locale);
  }

  /**
   * Get available locales
   */
  getAvailableLocales(): LocaleCode[] {
    return Array.from(this.messages.keys());
  }

  /**
   * Get all supported locale codes (whether loaded or not)
   */
  getSupportedLocales(): LocaleCode[] {
    return Object.keys(LocalizationManager.localeImports) as LocaleCode[];
  }

  /**
   * Validate if a locale code is supported
   */
  private isValidLocaleCode(locale: string): locale is LocaleCode {
    return locale in LocalizationManager.localeImports;
  }

  /**
   * Get message from specific locale
   */
  private getMessageFromLocale(locale: LocaleCode, key: string): string | undefined {
    const messages = this.messages.get(locale);
    if (!messages) return undefined;

    return this.getNestedValue(messages, key);
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: LocalizationMessages, path: string): string | undefined {
    const result = path.split('.').reduce((current: any, key: string) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
    
    return typeof result === 'string' ? result : undefined;
  }

  /**
   * Interpolate message parameters
   */
  private interpolateMessage(template: string, params?: MessageParams): string {
    if (!params) return template;

    return template.replace(/\{(\w+)\}/g, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }
}

/**
 * Create a new LocalizationManager instance
 * Useful for testing or when you need multiple independent managers
 */
export function createLocalizationManager(): LocalizationManager {
  return new LocalizationManager();
}

/**
 * Default global localization manager instance
 * This is provided for convenience but can be replaced or avoided in tests
 */
export const localizationManager = createLocalizationManager();

/**
 * Reset the global localization manager to a fresh state
 * Primarily useful for testing to ensure clean state between tests
 */
export function resetGlobalLocalizationManager(): void {
  // Clear existing data
  const currentManager = localizationManager as any;
  currentManager.messages.clear();
  currentManager.currentLocale = 'en';
  currentManager.fallbackLocale = 'en';
}
