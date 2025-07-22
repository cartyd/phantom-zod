// Import types first
import type { 
  LocaleCode, 
  LocalizationMessages, 
  MessageParams, 
  MessageKeyPath,
  MessageRetriever,
  LocaleConfig 
} from './types';

// Export types
export type { 
  LocaleCode, 
  LocalizationMessages, 
  MessageParams, 
  MessageKeyPath,
  MessageRetriever,
  LocaleConfig 
} from './types';

// Export manager
export { LocalizationManager, localizationManager } from './manager';

// Initialize default English locale
import { localizationManager } from './manager';
import enMessages from './locales/en.json';

// Register English as default and fallback locale
localizationManager.registerMessages(enMessages as LocalizationMessages);
localizationManager.setFallbackLocale('en');

/**
 * Load and register a locale
 * @param locale - Locale code to load
 */
export async function loadLocale(locale: LocaleCode): Promise<void> {
  await localizationManager.loadLocale(locale);
}

/**
 * Load multiple locales
 * @param locales - Array of locale codes to load
 */
export async function loadLocales(locales: LocaleCode[]): Promise<void> {
  await localizationManager.loadLocales(locales);
}

/**
 * Get message with specific locale
 * @param key - Message key
 * @param params - Parameters for interpolation
 * @param locale - Locale to use (defaults to English)
 */
export function getMessage(key: string, params?: MessageParams, locale: LocaleCode = 'en'): string {
  return localizationManager.getMessage(key, params, locale);
}
