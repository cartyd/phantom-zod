import type { 
  LocaleCode, 
  LocalizationMessages, 
  MessageParams, 
  MessageKeyPath,
  MessageRetriever 
} from './types';

/**
 * Localization manager for handling message retrieval and interpolation
 */
export class LocalizationManager {
  private messages = new Map<LocaleCode, LocalizationMessages>();
  private fallbackLocale: LocaleCode = 'en';

  /**
   * Load locale messages from JSON file
   */
  async loadLocale(locale: LocaleCode): Promise<void> {
    if (this.messages.has(locale)) {
      return; // Already loaded
    }

    try {
      const messages = await import(`./locales/${locale}.json`);
      this.registerMessages(messages as LocalizationMessages);
    } catch (error) {
      console.warn(`Failed to load locale '${locale}':`, error);
      throw new Error(`Locale '${locale}' not found`);
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
    this.fallbackLocale = locale;
  }

  /**
   * Register messages for a locale
   */
  registerMessages(messages: LocalizationMessages): void {
    this.messages.set(messages.locale, messages);
  }

  /**
   * Get a message by key with optional parameter interpolation
   * @param key - Message key in dot notation (e.g., 'string.required')
   * @param params - Parameters for message interpolation
   * @param locale - Optional locale override
   */
  getMessage(key: string, params?: MessageParams, locale?: LocaleCode): string {
    const targetLocale = locale || this.fallbackLocale;
    
    const message = this.getMessageFromLocale(targetLocale, key) 
      || this.getMessageFromLocale(this.fallbackLocale, key)
      || key; // Fallback to key itself

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
    return `${fieldName} ${message}`;
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
  private getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, key) => current?.[key], obj);
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
 * Global localization manager instance
 */
export const localizationManager = new LocalizationManager();
