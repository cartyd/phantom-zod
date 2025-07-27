
import type { Logger } from '../common/types/logger.types';
import { LocaleCode } from './locale.types';
import { LocalizationService } from './localization-manager.types';
import { MessageKeyPath } from './message-key-path.types';
import { LocalizationMessages, MessageParams } from './message.types';


/**
 * Default logger that uses console
 */
export const defaultLogger: Logger = {
  info: (message: string, ...args: any[]) => console.info(message, ...args),
  warn: (message: string, ...args: any[]) => console.warn(message, ...args),
  error: (message: string, ...args: any[]) => console.error(message, ...args),
  debug: (message: string, ...args: any[]) => console.debug(message, ...args),
};

/**
 * Localization manager for handling message retrieval and interpolation
 */
/**
 * Manages localization messages for multiple locales, providing message retrieval,
 * parameter interpolation, and locale management for internationalization support.
 *
 * The `LocalizationManager` loads, validates, and registers localization message files,
 * supports dynamic locale switching, and provides methods to retrieve and format messages
 * with parameter interpolation. It also supports fallback locales and custom logging.
 *
 * Features:
 * - Dynamic loading of locale JSON files via static imports.
 * - Validation of localization message structure.
 * - Retrieval of messages by key (dot notation supported).
 * - Parameter interpolation in messages.
 * - Fallback to a default locale if a message or locale is missing.
 * - Customizable logger for warnings and errors.
 * - Methods to check, register, and list available and supported locales.
 *
 * @example
 * ```typescript
 * const manager = new LocalizationManager();
 * await manager.loadLocale('en');
 * manager.setLocale('en');
 * const message = manager.getMessage('string.required', { field: 'Email' });
 * ```
 *
 * @implements {LocalizationService}
 */
export class LocalizationManager implements LocalizationService {
  /**
   * Create a new LocalizationManager
   * @param logger Optional custom logger. If not provided, uses defaultLogger.
   */
  constructor(logger?: Logger) {
    this.logger = logger ?? defaultLogger;
  }
  /**
   * Retrieves all message keys for a given locale in dot notation.
   *
   * If no locale is provided, the current locale is used. The keys are collected
   * recursively from the messages object, with nested keys represented in dot notation
   * (e.g., "greeting.hello").
   *
   * @param locale - (Optional) The locale code to retrieve message keys for.
   * @returns An array of message keys in dot notation for the specified locale.
   */
  getMessageKeys(locale?: LocaleCode): string[] {
    const targetLocale = locale ?? this.currentLocale;
    const messages = this.messages.get(targetLocale);
    if (!messages) return [];
    // Recursively collect all keys in dot notation
    const collectKeys = (obj: any, prefix = ''): string[] => {
      if (typeof obj !== 'object' || obj === null) return [];
      return Object.entries(obj).flatMap(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'string') return [fullKey];
        return collectKeys(value, fullKey);
      });
    };
    return collectKeys(messages);
  }

  /**
   * Checks whether a message with the specified key is defined for a given locale.
   *
   * @param key - The key of the message to check, which may represent a nested path (e.g., "errors.required").
   * @param locale - (Optional) The locale code to check for the message. If not provided, the current locale is used.
   * @returns `true` if the message exists and is a string in the specified locale; otherwise, `false`.
   */
  isMessageDefined(key: string, locale?: LocaleCode): boolean {
    const targetLocale = locale ?? this.currentLocale;
    const messages = this.messages.get(targetLocale);
    if (!messages) return false;
    return typeof this.getNestedValue(messages, key) === 'string';
  }
  private messages = new Map<LocaleCode, LocalizationMessages>();
  private fallbackLocale: LocaleCode = 'en';
  private currentLocale: LocaleCode = 'en';
  private logger: Logger;

  /**
   * Determines whether the provided object conforms to the `LocalizationMessages` interface.
   *
   * This method checks that the input is an object and contains the required properties:
   * - `locale` (string)
   * - `common` (object)
   * - `string` (object)
   * - `email` (object)
   * - `number` (object)
   * - `network` (object)
   *
   * Additional validation can be added as needed for further type safety.
   *
   * @param obj - The object to validate.
   * @returns `true` if the object matches the `LocalizationMessages` structure, otherwise `false`.
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
    imports.es = () => import('./locales/es.json');
    imports.fr = () => import('./locales/fr.json');
    imports.de = () => import('./locales/de.json');
    imports.it = () => import('./locales/it.json');
    imports.pt = () => import('./locales/pt.json');
    imports.ru = () => import('./locales/ru.json');
    imports.zh = () => import('./locales/zh.json');
    imports.ja = () => import('./locales/ja.json');
    imports.ko = () => import('./locales/ko.json');
    return imports as Record<LocaleCode, () => Promise<{ default: any }>>;
  })();

  /**
   * Loads localization messages for the specified locale if they are not already loaded.
   *
   * @param locale - The locale code to load messages for.
   * @returns A promise that resolves when the locale messages are loaded.
   * @throws {Error} If the locale is unsupported, the localization messages are invalid, or if there is an error loading the locale file.
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
   * Asynchronously loads multiple locales by invoking `loadLocale` for each provided locale code.
   *
   * @param locales - An array of locale codes to load.
   * @returns A promise that resolves when all specified locales have been loaded.
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
   * Retrieves a localized message string for the given key, optionally interpolating parameters and selecting a locale.
   *
   * The method attempts to fetch the message from the specified locale, falling back to the current locale,
   * then to the fallback locale, and finally to the key itself if no message is found.
   * Interpolates the message with the provided parameters if applicable.
   *
   * @param key - The key identifying the message to retrieve.
   * @param params - Optional parameters to interpolate into the message.
   * @param locale - Optional locale code to use for message retrieval. Defaults to the current locale if not provided.
   * @returns The localized and interpolated message string, or the key if no message is found.
   */
  getMessage(key: string, params?: MessageParams, locale?: LocaleCode): string {
    const targetLocale = locale ?? this.currentLocale;
    
    const message = this.getMessageFromLocale(targetLocale, key) 
      ?? this.getMessageFromLocale(this.fallbackLocale, key)
      ?? key; // Fallback to key itself

    return this.interpolateMessage(message, params);
  }

  /**
   * Retrieves a localized and formatted error message for a given field.
   *
   * This method looks up the error message template using the provided message key and parameters,
   * then formats it with the field name and the resolved message. It supports localization by accepting
   * an optional locale code. If a specific error format template is not found, it falls back to a default format.
   *
   * @param fieldName - The name of the field associated with the error.
   * @param messageKey - The key path used to look up the error message in the localization resources.
   * @param params - Optional parameters to interpolate into the error message.
   * @param locale - Optional locale code to use for localization.
   * @returns The formatted, localized error message string.
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
   * Retrieves a nested string value from a `LocalizationMessages` object using a dot-separated path.
   *
   * @param obj - The object containing localization messages.
   * @param path - The dot-separated path string representing the nested key (e.g., "errors.required").
   * @returns The string value at the specified path, or `undefined` if the path does not exist or does not resolve to a string.
   */
  private getNestedValue(obj: LocalizationMessages, path: string): string | undefined {
    const result = path.split('.').reduce((current: any, key: string) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
    
    return typeof result === 'string' ? result : undefined;
  }


  /**
   * Replaces placeholders in a template string with corresponding values from the provided parameters.
   *
   * Placeholders in the template should be in the format `{key}`. If a key from the template exists in the
   * `params` object, it will be replaced with its value. If the key does not exist in `params`, the placeholder
   * will remain unchanged.
   *
   * @param template - The string containing placeholders to interpolate.
   * @param params - An optional object containing key-value pairs to replace placeholders in the template.
   * @returns The interpolated string with placeholders replaced by their corresponding values.
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
