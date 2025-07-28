export {
  StringMessageParams,
  NumberMessageParams,
  EmailMessageParams,
  PhoneMessageParams,
  UuidMessageParams,
  UrlMessageParams,
  BooleanMessageParams,
  ArrayMessageParams,
  EnumMessageParams,
  DateMessageParams,
  MoneyMessageParams,
  PostalCodeMessageParams,
  FileUploadMessageParams,
  PaginationMessageParams,
  AddressMessageParams,
  NetworkMessageParams,
  UserMessageParams,
} from "./message-params.types";

import type {
  StringMessageParams,
  NumberMessageParams,
  EmailMessageParams,
  PhoneMessageParams,
  UuidMessageParams,
  UrlMessageParams,
  BooleanMessageParams,
  ArrayMessageParams,
  EnumMessageParams,
  DateMessageParams,
  MoneyMessageParams,
  PostalCodeMessageParams,
  FileUploadMessageParams,
  PaginationMessageParams,
  AddressMessageParams,
  NetworkMessageParams,
  UserMessageParams,
} from "./message-params.types";

/**
 * Represents the union of all possible parameter types used for various message categories.
 * Each category (such as string, number, email, etc.) contributes its specific parameter types,
 * allowing `MessageParams` to be used flexibly across different message validation and localization scenarios.
 */
export type MessageParams =
  | StringMessageParams[keyof StringMessageParams]
  | NumberMessageParams[keyof NumberMessageParams]
  | EmailMessageParams[keyof EmailMessageParams]
  | PhoneMessageParams[keyof PhoneMessageParams]
  | UuidMessageParams[keyof UuidMessageParams]
  | UrlMessageParams[keyof UrlMessageParams]
  | BooleanMessageParams[keyof BooleanMessageParams]
  | ArrayMessageParams[keyof ArrayMessageParams]
  | EnumMessageParams[keyof EnumMessageParams]
  | DateMessageParams[keyof DateMessageParams]
  | MoneyMessageParams[keyof MoneyMessageParams]
  | PostalCodeMessageParams[keyof PostalCodeMessageParams]
  | FileUploadMessageParams[keyof FileUploadMessageParams]
  | PaginationMessageParams[keyof PaginationMessageParams]
  | AddressMessageParams[keyof AddressMessageParams]
  | NetworkMessageParams[keyof NetworkMessageParams]
  | UserMessageParams[keyof UserMessageParams];

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
export interface StringMessages
  extends Pick<
    CommonMessages,
    "required" | "invalid" | "tooShort" | "tooLong" | "empty"
  > {
  mustBeString: string;
  trimmed: string;
}

/**
 * Email-specific validation messages
 */
export interface EmailMessages
  extends Pick<CommonMessages, "required" | "invalid"> {
  mustBeValidEmail: string;
  invalidFormat: string;
  domainInvalid: string;
}

/**
 * Phone-specific validation messages
 */
export interface PhoneMessages
  extends Pick<CommonMessages, "required" | "invalid"> {
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
export interface UuidMessages
  extends Pick<CommonMessages, "required" | "invalid"> {
  mustBeValidUuid: string;
  mustBeValidUuidV4: string;
  mustBeValidUuidV6: string;
  mustBeValidUuidV7: string;
  mustBeValidNanoid: string;
  invalidFormat: string;
}

/**
 * URL-specific validation messages
 */
export interface UrlMessages
  extends Pick<CommonMessages, "required" | "invalid"> {
  mustBeValidUrl: string;
  invalidProtocol: string;
  invalidDomain: string;
  missingProtocol: string;
}

/**
 * Number-specific validation messages
 */
export interface NumberMessages
  extends Pick<CommonMessages, "required" | "invalid" | "tooSmall" | "tooBig"> {
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
export interface BooleanMessages extends Pick<CommonMessages, "invalid"> {
  mustBeBoolean: string;
  mustBeBooleanString: string;
  invalidBooleanString: string;
}

/**
 * Array-specific validation messages
 */
export interface ArrayMessages
  extends Pick<
    CommonMessages,
    "required" | "invalid" | "empty" | "tooSmall" | "tooBig"
  > {
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
export interface EnumMessages extends Pick<CommonMessages, "invalid"> {
  mustBeOneOf: string;
  invalidOption: string;
  availableOptions: string;
}

/**
 * Date-specific validation messages
 */
export interface DateMessages
  extends Pick<CommonMessages, "required" | "invalid"> {
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
export interface MoneyMessages
  extends Pick<CommonMessages, "required" | "invalid"> {
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
export interface PostalCodeMessages
  extends Pick<CommonMessages, "required" | "invalid"> {
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
export interface FileUploadMessages
  extends Pick<CommonMessages, "invalid" | "tooBig"> {
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
export interface PaginationMessages
  extends Pick<CommonMessages, "required" | "invalid"> {
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
export interface AddressMessages
  extends Pick<CommonMessages, "required" | "invalid"> {
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
 * Network-specific validation messages
 */
export interface NetworkMessages
  extends Pick<CommonMessages, "required" | "invalid"> {
  mustBeValidIPv4: string;
  mustBeValidIPv6: string;
  mustBeValidMacAddress: string;
  invalidIPv4Format: string;
  invalidIPv6Format: string;
  invalidMacFormat: string;
  examples: {
    ipv4: string;
    ipv6: string;
    mac: string;
  };
}

/**
 * User-specific validation messages
 */
export interface UserMessages
  extends Pick<CommonMessages, "required" | "invalid"> {
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
  locale: import("./locale.types").LocaleCode;
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
  network: NetworkMessages;
  user: UserMessages;
}
