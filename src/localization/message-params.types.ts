
/**
 * Unified type-safe message formatter for all message groups.
 * Enforces correct params type for each message key and group at compile time.
 */
export type MessageGroupMap = {
  string: StringMessageParams;
  number: NumberMessageParams;
  email: EmailMessageParams;
  phone: PhoneMessageParams;
  uuid: UuidMessageParams;
  url: UrlMessageParams;
  boolean: BooleanMessageParams;
  array: ArrayMessageParams;
  enum: EnumMessageParams;
  date: DateMessageParams;
  money: MoneyMessageParams;
  postalCode: PostalCodeMessageParams;
  fileUpload: FileUploadMessageParams;
  pagination: PaginationMessageParams;
  address: AddressMessageParams;
  network: NetworkMessageParams;
  user: UserMessageParams;
};

export function formatMessage<
  G extends keyof MessageGroupMap,
  K extends keyof MessageGroupMap[G]
>(opts: {
  group: G;
  messageKey: K;
  params: MessageGroupMap[G][K];
  msg: string;
  msgType: string;
}): string {
  let formatted = opts.msg;
  for (const key in opts.params) {
    formatted = formatted.replace(`{${key}}`, String(opts.params[key]));
  }
  return `[${opts.msgType}] ${opts.group}.${String(opts.messageKey)}: ${formatted}`;
}

/**
 * Usage example (will error if params shape is wrong):
 *   formatMessage({ group: "string", messageKey: "tooShort", params: { min: 2 }, msg: "Too short! Min: {min}", msgType: "FieldName" })
 *   formatMessage({ group: "string", messageKey: "required", params: {}, msg: "Required!", msgType: "FieldName" })
 *   formatMessage({ group: "number", messageKey: "tooSmall", params: { min: 1 }, msg: "Too small! Min: {min}", msgType: "FieldName" })
 */


/**
 * Type mapping for string message keys to their expected params.
 */
export type StringMessageParams = {
  tooShort: { min: number };
  tooLong: { max: number };
  required: {};
  empty: {};
  mustBeString: {};
  trimmed: {};
  cannotBeEmpty: {};
};

export type NumberMessageParams = {
  tooSmall: { min: number };
  tooBig: { max: number };
  required: {};
  mustBeNumber: {};
  mustBeInteger: {};
  mustBeFloat: {};
  mustBePositive: {};
  mustBeNegative: {};
  mustBeNonNegative: {};
  mustBeNonPositive: {};
  outOfRange: { min: number; max: number };
  invalidDecimalPlaces: { max: number };
  invalid: {};
};

export type EmailMessageParams = {
  required: {};
  invalid: {};
  mustBeValidEmail: {};
  invalidFormat: {};
  domainInvalid: { domain: string };
};

export type PhoneMessageParams = {
  required: {};
  invalid: {};
  mustBeValidPhone: {};
  invalidE164Format: {};
  invalidNationalFormat: {};
  invalidFormat: {};
  examples: { e164: string; national: string };
};

export type UuidMessageParams = {
  required: {};
  invalid: {};
  mustBeValidUuid: {};
  mustBeValidUuidV4: {};
  invalidFormat: {};
};

export type UrlMessageParams = {
  required: {};
  invalid: {};
  mustBeValidUrl: {};
  invalidProtocol: { protocol: string };
  invalidDomain: { domain: string };
  missingProtocol: {};
};

export type BooleanMessageParams = {
  invalid: {};
  mustBeBoolean: {};
  mustBeBooleanString: {};
  invalidBooleanString: {};
};

export type ArrayMessageParams = {
  required: {};
  invalid: {};
  empty: {};
  tooSmall: { min: number };
  tooBig: { max: number };
  mustBeArray: {};
  mustBeStringArray: {};
  mustHaveMinItems: { min: number };
  mustHaveMaxItems: { max: number };
  mustNotBeEmpty: {};
  duplicateItems: {};
};

export type EnumMessageParams = {
  invalid: {};
  mustBeOneOf: { options: string[] };
  invalidOption: { option: string };
  availableOptions: { options: string[] };
};

export type DateMessageParams = {
  required: {};
  invalid: {};
  mustBeValidDate: {};
  mustBeValidDateTime: {};
  invalidFormat: {};
  invalidDateString: {};
  examples: { date: string; dateTime: string };
};

export type MoneyMessageParams = {
  required: {};
  invalid: {};
  mustBeValidAmount: {};
  mustBeValidCurrency: {};
  mustBePositiveAmount: {};
  invalidCurrencyCode: { code: string };
  invalidDecimalPlaces: { max: number };
  mustBeMoneyObject: {};
};

export type PostalCodeMessageParams = {
  required: {};
  invalid: {};
  mustBeValidZipCode: {};
  mustBeValidPostalCode: {};
  invalidFormat: {};
  examples: { us: string; uk: string; ca: string };
};

export type FileUploadMessageParams = {
  invalid: {};
  tooBig: { maxSize: number };
  mustBeValidFile: {};
  fileSizeExceeded: { maxSize: number };
  invalidFileType: { type: string };
  invalidMimeType: { mime: string };
  invalidFileName: { name: string };
  fileRequired: {};
  examples: { maxSize: string; allowedTypes: string };
};

export type PaginationMessageParams = {
  required: {};
  invalid: {};
  invalidPageNumber: { page: number };
  invalidLimit: { limit: number };
  invalidOffset: { offset: number };
  invalidCursor: { cursor: string };
  invalidSortOrder: { order: string };
  pageOutOfRange: { page: number; totalPages: number };
  limitExceeded: { limit: number };
};

export type AddressMessageParams = {
  required: {};
  invalid: {};
  mustBeValidAddress: {};
  streetRequired: {};
  cityRequired: {};
  stateRequired: {};
  countryRequired: {};
  postalCodeRequired: {};
  invalidState: { state: string };
  invalidUSState: {};
  invalidCountry: { country: string };
};

export type NetworkMessageParams = {
  required: {};
  invalid: {};
  mustBeValidIPv4: {};
  mustBeValidIPv6: {};
  mustBeValidMacAddress: {};
  invalidIPv4Format: {};
  invalidIPv6Format: {};
  invalidMacFormat: {};
  examples: { ipv4: string; ipv6: string; mac: string };
};

export type UserMessageParams = {
  required: {};
  invalid: {};
  usernameInvalid: {};
  passwordWeak: {};
  passwordTooShort: { min: number };
  passwordMissingUppercase: {};
  passwordMissingLowercase: {};
  passwordMissingNumbers: {};
  passwordMissingSpecialChars: {};
  passwordsDoNotMatch: {};
  passwordMustBeDifferent: {};
  emailAlreadyExists: { email: string };
  usernameAlreadyExists: { username: string };
  invalidRole: { role: string };
  invalidAccountType: { type: string };
  termsNotAccepted: {};
  invalidUnderscorePosition: {};
  invalidHyphenPosition: {};
  mustBeValidUserObject: {};
};
