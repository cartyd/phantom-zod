// Import types used in this file
import type { 
  LocaleCode, 
  LocalizationMessages, 
  MessageParams
} from './types';

// Export all types for consumers
export type { 
  LocaleCode, 
  LocalizationMessages, 
  MessageParams, 
  MessageKeyPath,
  MessageRetriever,
  LocaleConfig,
  LocalizationManagerInterface 
} from './types';

// Export manager
export { LocalizationManager, localizationManager } from './manager';

// Import manager instance for initialization
import { localizationManager } from './manager';

// Import default locale data
import enMessages from './locales/en.json';

/**
 * Type guard to validate that imported JSON matches LocalizationMessages interface
 */
function isValidLocalizationMessages(obj: any): obj is LocalizationMessages {
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
 * Initialize the localization system with default English locale
 * Call this function before using other localization functions
 */
export function initializeLocalization(): void {
  if (!isValidLocalizationMessages(enMessages)) {
    throw new Error('Invalid localization messages format in en.json');
  }
  localizationManager.registerMessages(enMessages);
  localizationManager.setFallbackLocale('en');
}

// Auto-initialize for convenience (can be disabled by calling initializeLocalization manually)
initializeLocalization();

/**
 * Get message with specific locale, with enhanced default behavior
 * This is kept as a convenience function since it improves the default locale handling
 * @param key - Message key
 * @param params - Parameters for interpolation
 * @param locale - Locale to use (defaults to manager's fallback locale)
 */
export function getMessage(key: string, params?: MessageParams, locale?: LocaleCode): string {
  const targetLocale = locale ?? localizationManager.getFallbackLocale();
  return localizationManager.getMessage(key, params, targetLocale);
}

// For convenience, export commonly used manager methods as aliases
// Use localizationManager directly for full API access
export const {
  loadLocale,
  loadLocales, 
  setLocale,
  getLocale,
  hasLocale,
  getAvailableLocales
} = localizationManager;
