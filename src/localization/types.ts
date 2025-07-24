/**
 * Supported locale codes following BCP 47 standard
 */
export type LocaleCode = 
  | 'en'     // English
  | 'en-US'  // English (United States)
  | 'en-GB'  // English (United Kingdom)
  | 'es'     // Spanish
  | 'es-ES'  // Spanish (Spain)
  | 'es-MX'  // Spanish (Mexico)
  | 'fr'     // French
  | 'fr-FR'  // French (France)
  | 'fr-CA'  // French (Canada)
  | 'de'     // German
  | 'de-DE'  // German (Germany)
  | 'it'     // Italian
  | 'pt'     // Portuguese
  | 'pt-BR'  // Portuguese (Brazil)
  | 'ru'     // Russian
  | 'zh'     // Chinese
  | 'zh-CN'  // Chinese (Simplified)
  | 'zh-TW'  // Chinese (Traditional)
  | 'ja'     // Japanese
  | 'ko';    // Korean

/**
 * Message interpolation parameters
 */
export interface MessageParams {
  [key: string]: string | number;
}

/**
 * Message definition with optional parameters
 */
export interface MessageDefinition {
  message: string;
  params?: MessageParams;
}

/**
 * Common validation message keys used across all schemas
 */
export interface CommonMessages {
  required: string;
  invalid: string;
  mustBe: string;
  cannotBe: string;
  tooShort: string;
  tooLong: string;
  tooSmall: string;
  tooBig: string;
  outOfRange: string;
  notFound: string;
  duplicate: string;
  empty: string;
  notEmpty: string;
}

/**
 * String-specific validation messages
 */
export interface StringMessages extends Pick<CommonMessages, 'required' | 'invalid' | 'tooShort' | 'tooLong' | 'empty'> {
  mustBeString: string;
  trimmed: string;
}

/**
 * Email-specific validation messages
 */
export interface EmailMessages extends Pick<CommonMessages, 'required' | 'invalid'> {
  mustBeValidEmail: string;
  invalidFormat: string;
  domainInvalid: string;
}

/**
 * Phone-specific validation messages
 */
export interface PhoneMessages extends Pick<CommonMessages, 'required' | 'invalid'> {
  mustBeValidPhone: string;
  invalidE164Format: string;
  invalidNationalFormat: string;
  invalidFormat: string;
  examples: {
    e164: string;
    national: string;
  };
}

/**
 * UUID-specific validation messages
 */
export interface UuidMessages extends Pick<CommonMessages, 'required' | 'invalid'> {
  mustBeValidUuid: string;
  mustBeValidUuidV4: string;
  invalidFormat: string;
}

/**
 * URL-specific validation messages
 */
export interface UrlMessages extends Pick<CommonMessages, 'required' | 'invalid'> {
  mustBeValidUrl: string;
  invalidProtocol: string;
  invalidDomain: string;
  missingProtocol: string;
}

/**
 * Number-specific validation messages
 */
export interface NumberMessages extends Pick<CommonMessages, 'required' | 'invalid' | 'tooSmall' | 'tooBig'> {
  mustBeNumber: string;
  mustBeInteger: string;
  mustBeFloat: string;
  mustBePositive: string;
  mustBeNegative: string;
  mustBeNonNegative: string;
  mustBeNonPositive: string;
  outOfRange: string;
  invalidDecimalPlaces: string;
}

/**
 * Boolean-specific validation messages
 */
export interface BooleanMessages extends Pick<CommonMessages, 'invalid'> {
  mustBeBoolean: string;
  mustBeBooleanString: string;
  invalidBooleanString: string;
}

/**
 * Array-specific validation messages
 */
export interface ArrayMessages extends Pick<CommonMessages, 'required' | 'invalid' | 'empty' | 'tooSmall' | 'tooBig'> {
  mustBeArray: string;
  mustBeStringArray: string;
  mustHaveMinItems: string;
  mustHaveMaxItems: string;
  mustNotBeEmpty: string;
  duplicateItems: string;
}

/**
 * Enum-specific validation messages
 */
export interface EnumMessages extends Pick<CommonMessages, 'invalid'> {
  mustBeOneOf: string;
  invalidOption: string;
  availableOptions: string;
}

/**
 * Date-specific validation messages
 */
export interface DateMessages extends Pick<CommonMessages, 'required' | 'invalid'> {
  mustBeValidDate: string;
  mustBeValidDateTime: string;
  invalidFormat: string;
  invalidDateString: string;
  examples: {
    date: string;
    dateTime: string;
  };
}

/**
 * Money/Currency-specific validation messages
 */
export interface MoneyMessages extends Pick<CommonMessages, 'required' | 'invalid'> {
  mustBeValidAmount: string;
  mustBeValidCurrency: string;
  mustBePositiveAmount: string;
  invalidCurrencyCode: string;
  invalidDecimalPlaces: string;
  mustBeMoneyObject: string;
}

/**
 * Postal code-specific validation messages
 */
export interface PostalCodeMessages extends Pick<CommonMessages, 'required' | 'invalid'> {
  mustBeValidZipCode: string;
  mustBeValidPostalCode: string;
  invalidFormat: string;
  examples: {
    us: string;
    uk: string;
    ca: string;
  };
}

/**
 * File upload-specific validation messages
 */
export interface FileUploadMessages extends Pick<CommonMessages, 'invalid' | 'tooBig'> {
  mustBeValidFile: string;
  fileSizeExceeded: string;
  invalidFileType: string;
  invalidMimeType: string;
  invalidFileName: string;
  fileRequired: string;
  examples: {
    maxSize: string;
    allowedTypes: string;
  };
}

/**
 * Pagination-specific validation messages
 */
export interface PaginationMessages extends Pick<CommonMessages, 'required' | 'invalid'> {
  invalidPageNumber: string;
  invalidLimit: string;
  invalidOffset: string;
  invalidCursor: string;
  invalidSortOrder: string;
  pageOutOfRange: string;
  limitExceeded: string;
}

/**
 * Address-specific validation messages
 */
export interface AddressMessages extends Pick<CommonMessages, 'required' | 'invalid'> {
  mustBeValidAddress: string;
  streetRequired: string;
  cityRequired: string;
  stateRequired: string;
  countryRequired: string;
  postalCodeRequired: string;
  invalidState: string;
  invalidCountry: string;
}

/**
 * User-specific validation messages
 */
export interface UserMessages extends Pick<CommonMessages, 'required' | 'invalid'> {
  usernameInvalid: string;
  passwordWeak: string;
  passwordTooShort: string;
  passwordMissingUppercase: string;
  passwordMissingLowercase: string;
  passwordMissingNumbers: string;
  passwordMissingSpecialChars: string;
  passwordsDoNotMatch: string;
  emailAlreadyExists: string;
  usernameAlreadyExists: string;
  invalidRole: string;
  invalidAccountType: string;
  termsNotAccepted: string;
}

/**
 * Complete localization message structure
 */
export interface LocalizationMessages {
  locale: LocaleCode;
  common: CommonMessages;
  string: StringMessages;
  email: EmailMessages;
  phone: PhoneMessages;
  uuid: UuidMessages;
  url: UrlMessages;
  number: NumberMessages;
  boolean: BooleanMessages;
  array: ArrayMessages;
  enum: EnumMessages;
  date: DateMessages;
  money: MoneyMessages;
  postalCode: PostalCodeMessages;
  fileUpload: FileUploadMessages;
  pagination: PaginationMessages;
  address: AddressMessages;
  user: UserMessages;
}

/**
 * Message interpolation function type
 */
export type MessageInterpolator = (template: string, params?: MessageParams) => string;

/**
 * Message formatter function type
 */
export type MessageFormatter = (key: string, params?: MessageParams) => string;

/**
 * Locale configuration
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

/**
 * Message key paths for type-safe message access
 */
export type MessageKeyPath = 
  | `common.${keyof CommonMessages}`
  | `string.${keyof StringMessages}`
  | `email.${keyof EmailMessages}`
  | `phone.${keyof PhoneMessages}`
  | `phone.examples.${keyof PhoneMessages['examples']}`
  | `uuid.${keyof UuidMessages}`
  | `url.${keyof UrlMessages}`
  | `number.${keyof NumberMessages}`
  | `boolean.${keyof BooleanMessages}`
  | `array.${keyof ArrayMessages}`
  | `enum.${keyof EnumMessages}`
  | `date.${keyof DateMessages}`
  | `date.examples.${keyof DateMessages['examples']}`
  | `money.${keyof MoneyMessages}`
  | `postalCode.${keyof PostalCodeMessages}`
  | `postalCode.examples.${keyof PostalCodeMessages['examples']}`
  | `fileUpload.${keyof FileUploadMessages}`
  | `fileUpload.examples.${keyof FileUploadMessages['examples']}`
  | `pagination.${keyof PaginationMessages}`
  | `address.${keyof AddressMessages}`
  | `user.${keyof UserMessages}`;

/**
 * Type-safe message retrieval function
 */
export interface MessageRetriever {
  <T extends MessageKeyPath>(key: T, params?: MessageParams): string;
  (key: string, params?: MessageParams): string;
}

/**
 * Common interface for LocalizationManager implementations
 * Provides a contract for all localization manager functionality
 */
export interface LocalizationManagerInterface {
  // Locale management
  setLocale(locale: LocaleCode): void;
  getLocale(): LocaleCode;
  setFallbackLocale(locale: LocaleCode): void;
  getFallbackLocale(): LocaleCode;
  
  // Dynamic loading
  loadLocale(locale: LocaleCode): Promise<void>;
  loadLocales(locales: LocaleCode[]): Promise<void>;
  ensureLocaleLoaded(locale: LocaleCode): Promise<void>;
  
  // Message operations
  getMessage(key: string, params?: MessageParams, locale?: LocaleCode): string;
  getErrorMessage(fieldName: string, messageKey: MessageKeyPath, params?: MessageParams, locale?: LocaleCode): string;
  registerMessages(messages: LocalizationMessages): void;
  
  // Utility methods
  hasLocale(locale: LocaleCode): boolean;
  getAvailableLocales(): LocaleCode[];
}
