/**
 * Validation schema barrel export for test files
 * Provides commonly used validation schemas in a single import
 * 
 * Note: All schemas are now factory functions that require a message handler.
 * For direct usage in tests, import the factory functions and create instances.
 */
export {
  createStringSchemas,
  createEmailSchemas,
  createPhoneSchemas,
  createNumberSchemas,
  createDateSchemas,
  createBooleanSchemas,
  createUuidSchemas,
  createEnumSchemas,
  createArraySchemas,
  createUrlSchemas,
  createPostalCodeSchemas,
  // Type exports
  StringRequired,
  StringOptional,
  EmailRequired,
  EmailOptional,
  PhoneRequired,
  PhoneOptional,
  NumberRequired,
  NumberOptional,
  BooleanRequired,
  BooleanOptional,
  EnumRequired,
  EnumOptional,
  StringArrayRequired,
  StringArrayOptional,
  PostalCodeRequired,
  PostalCodeOptional,
} from "./index";
