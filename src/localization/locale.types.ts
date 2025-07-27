/**
 * Supported locale codes following BCP 47 standard
 */
export type LocaleCode = 
  | 'en'   // English
  | 'es'   // Spanish
  | 'fr'   // French
  | 'de'   // German
  | 'it'   // Italian
  | 'pt'   // Portuguese
  | 'ru'   // Russian
  | 'zh'   // Chinese
  | 'ja'   // Japanese
  | 'ko';  // Korean

/**
 * Locale configuration
 */
/**
 * Represents the configuration for a specific locale, including language code, display names,
 * formatting options for dates, times, currency, and numbers.
 *
 * @property code - The locale code (e.g., 'en-US', 'fr-FR').
 * @property name - The English name of the locale.
 * @property nativeName - The native name of the locale.
 * @property rtl - Indicates if the locale uses right-to-left text direction.
 * @property dateFormat - The format string for displaying dates.
 * @property timeFormat - The format string for displaying times.
 * @property currency - The currency code used in the locale (e.g., 'USD', 'EUR').
 * @property numberFormat - Formatting options for numbers in the locale.
 * @property numberFormat.decimal - The character used as the decimal separator.
 * @property numberFormat.thousands - The character used as the thousands separator.
 * @property numberFormat.precision - The number of decimal places to display.
 */
export interface LocaleConfig {
  code: LocaleCode;
  name: string;
  nativeName: string;
  rtl?: boolean;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    precision: number;
  };
}
