import type { LocaleCode } from './locale.types';
import type { MessageParams, LocalizationMessages } from './message.types';
import type { MessageKeyPath } from './message-key-path.types';

/**
 * Retrieves a localized message string based on a key and optional parameters.
 *
 * This interface supports two call signatures:
 * - Using a strongly-typed key path (`MessageKeyPath`) for type-safe message retrieval.
 * - Using a plain string key for more flexible access.
 *
 * @template T - The type representing a valid message key path.
 * @param key - The key identifying the message to retrieve. Can be a strongly-typed key path or a string.
 * @param params - Optional parameters to interpolate into the message.
 * @returns The localized message string corresponding to the provided key and parameters.
 */
export interface MessageRetriever {
  <T extends MessageKeyPath>(key: T, params?: MessageParams): string;
  (key: string, params?: MessageParams): string;
}

/**
 * Interface for managing localization within an application.
 *
 * Provides methods for locale management, dynamic loading of locale data,
 * message retrieval and registration, and utility functions for working with locales.
 *
 * @remarks
 * Implementations of this interface should handle loading and switching between different locales,
 * retrieving localized messages, and managing available locales.
 *
 * @method setLocale Sets the current locale.
 * @method getLocale Gets the current locale.
 * @method setFallbackLocale Sets the fallback locale to use when a message is missing in the current locale.
 * @method getFallbackLocale Gets the fallback locale.
 * @method loadLocale Dynamically loads locale data for the specified locale.
 * @method loadLocales Dynamically loads locale data for multiple locales.
 * @method ensureLocaleLoaded Ensures that the specified locale is loaded.
 * @method getMessage Retrieves a localized message by key, with optional parameters and locale override.
 * @method getErrorMessage Retrieves a localized error message for a field and message key, with optional parameters and locale override.
 * @method registerMessages Registers a set of localization messages.
 * @method hasLocale Checks if the specified locale is available.
 * @method getAvailableLocales Returns a list of all available locales.
 * @method getSupportedLocales Returns a list of all supported locales (may differ from loaded/available locales).
 * @method getMessageKeys Returns all message keys for a given locale. If no locale is provided, uses the current locale.
 * @method isMessageDefined Checks if a message key is defined for a given locale. If no locale is provided, uses the current locale.
 */
export interface LocalizationService {
  // Locale Management
  setLocale(locale: LocaleCode): void;
  getLocale(): LocaleCode;
  setFallbackLocale(locale: LocaleCode): void;
  getFallbackLocale(): LocaleCode;
  getSupportedLocales(): LocaleCode[];
  getAvailableLocales(): LocaleCode[];
  hasLocale(locale: LocaleCode): boolean;

  // Dynamic Loading
  loadLocale(locale: LocaleCode): Promise<void>;
  loadLocales(locales: LocaleCode[]): Promise<void>;
  ensureLocaleLoaded(locale: LocaleCode): Promise<void>;

  // Message Operations
  getMessage(key: string, params?: MessageParams, locale?: LocaleCode): string;
  getErrorMessage(fieldName: string, messageKey: MessageKeyPath, params?: MessageParams, locale?: LocaleCode): string;
  registerMessages(messages: LocalizationMessages): void;

  // Introspection
  getMessageKeys(locale?: LocaleCode): string[];
  isMessageDefined(key: string, locale?: LocaleCode): boolean;
}
