/**
 * Centralized regex patterns used throughout the application.
 * This file contains all regex patterns used for validation in schemas.
 */

// Email validation
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// UUID validation
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Phone number validation (US)
export const US_PHONE_E164_PATTERN = /^\+1\d{10}$/;
export const US_PHONE_NATIONAL_PATTERN = /^\d{10}$/;
export const US_PHONE_11_DIGIT_PATTERN = /^1\d{10}$/;
export const US_PHONE_DIGITS_ONLY_PATTERN = /\D/g; // For removing non-digits

// IPv4 validation
export const IPV4_PATTERN =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
export const IPV4_INVALID_OCTETS = /25[6-9]|2[6-9]\d|[3-9]\d\d|\d{4,}/;
export const IPV4_INVALID_CHAR_PATTERN = /[-()]/;

// IPv6 validation
export const IPV6_PATTERN =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|([0-9a-fA-F]{1,4}:)((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9]))$/;
export const IPV6_MULTIPLE_DOUBLE_COLON_PATTERN = /::.*::/;

// MAC Address validation
export const MAC_ADDRESS_PATTERN =
  /^(?:[0-9A-Fa-f]{2}([-:]))(?:[0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2}$|^[0-9A-Fa-f]{12}$/;
export const MAC_SEPARATOR_PATTERN = /[:.-]/;
export const VALID_MAC_FORMAT_PATTERN = /^[0-9A-Fa-f:.-]+$/;
export const INVALID_HEX_CHAR_PATTERN = /[G-Zg-z]/;

// Postal code validation (US ZIP codes)
export const US_ZIP_CODE_PATTERN = /^[\d]{5}(-\d{4})?$/;

// File validation
export const FILENAME_INVALID_CHARS_PATTERN =
  /^[^\u003c\u003e:\"/\\|?*\x00-\x1f]+$/;

// Number validation
export const INTEGER_PATTERN = /^-?\d+$/;
export const FLOAT_PATTERN = /^-?\d+(\.\d+)?$/;

// Money validation
export const MONEY_DECIMAL_PATTERN = /^\d+(\.\d+)?$/;

// Boolean validation patterns (for string representations)
export const BOOLEAN_STRING_PATTERN = /^(true|false)$/i;

// Common validation helpers
export const DIGITS_ONLY = /\d/g; // For extracting digits
export const NON_DIGITS = /\D/g; // For removing non-digits
export const LETTER_CASE_PATTERN = /[a-zA-Z]/;

/**
 * Export all patterns as a single object for easy import
 */
export const REGEX_PATTERNS = {
  EMAIL_PATTERN,
  UUID_PATTERN,
  UUID_V4_PATTERN,
  US_PHONE_E164_PATTERN,
  US_PHONE_NATIONAL_PATTERN,
  US_PHONE_11_DIGIT_PATTERN,
  US_PHONE_DIGITS_ONLY_PATTERN,
  IPV4_PATTERN,
  IPV6_PATTERN,
  MAC_ADDRESS_PATTERN,
  US_ZIP_CODE_PATTERN,
  FILENAME_INVALID_CHARS_PATTERN,
  INTEGER_PATTERN,
  FLOAT_PATTERN,
  MONEY_DECIMAL_PATTERN,
  BOOLEAN_STRING_PATTERN,
  DIGITS_ONLY,
  NON_DIGITS,
  INVALID_HEX_CHAR_PATTERN,
  INVALID_IPV4_OCTETS: IPV4_INVALID_OCTETS,
  LETTER_CASE_PATTERN,
  IPV4_INVALID_CHAR_PATTERN,
  IPV6_MULTIPLE_DOUBLE_COLON_PATTERN,
  MAC_SEPARATOR_PATTERN,
};

export default REGEX_PATTERNS; // Centralized regex for valid MAC address format
