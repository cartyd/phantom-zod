/**
 * Centralized regex patterns used throughout the application.
 * This file contains all regex patterns used for validation in schemas.
 */

// Email validation
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// UUID validation
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Phone number validation (US)
export const US_PHONE_E164_PATTERN = /^\+1\d{10}$/;
export const US_PHONE_NATIONAL_PATTERN = /^\d{10}$/;
export const US_PHONE_11_DIGIT_PATTERN = /^1\d{10}$/;
export const US_PHONE_DIGITS_ONLY_PATTERN = /\D/g; // For removing non-digits

// URL validation
export const IPV4_PATTERN = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

// Postal code validation (US ZIP codes)
export const US_ZIP_CODE_PATTERN = /^[\d]{5}(-\d{4})?$/;

// File validation
export const FILENAME_INVALID_CHARS_PATTERN = /^[^\u003c\u003e:\"/\\|?*\x00-\x1f]+$/;

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
  US_ZIP_CODE_PATTERN,
  FILENAME_INVALID_CHARS_PATTERN,
  INTEGER_PATTERN,
  FLOAT_PATTERN,
  MONEY_DECIMAL_PATTERN,
  BOOLEAN_STRING_PATTERN,
  DIGITS_ONLY,
  NON_DIGITS,
};

export default REGEX_PATTERNS;
