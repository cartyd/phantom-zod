/**
 * Unified mapping of message group names to their corresponding parameter types.
 *
 * This type provides a centralized registry that maps each validation category
 * (such as string, number, email, etc.) to its specific parameter interface.
 * It enables type-safe message formatting by ensuring the correct parameter
 * types are used for each message group at compile time.
 *
 * @property string - String validation message parameters.
 * @property number - Number validation message parameters.
 * @property email - Email validation message parameters.
 * @property phone - Phone validation message parameters.
 * @property uuid - UUID validation message parameters.
 * @property url - URL validation message parameters.
 * @property boolean - Boolean validation message parameters.
 * @property array - Array validation message parameters.
 * @property enum - Enum validation message parameters.
 * @property date - Date validation message parameters.
 * @property money - Money/currency validation message parameters.
 * @property postalCode - Postal code validation message parameters.
 * @property fileUpload - File upload validation message parameters.
 * @property pagination - Pagination validation message parameters.
 * @property address - Address validation message parameters.
 * @property network - Network address validation message parameters.
 * @property user - User account validation message parameters.
 * @property record - Record (key-value object) validation message parameters.
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
  record: RecordMessageParams;
};

/**
 * Formats a localized message by replacing parameter placeholders in the message string
 * with their corresponding values and prepending metadata.
 *
 * @typeParam TGroup - The key of the message group in the `MessageGroupMap`.
 * @typeParam TKey - The key of the message within the specified group.
 * @param opts - An object containing:
 *   - `group`: The message group key.
 *   - `messageKey`: The message key within the group.
 *   - `params`: An object mapping parameter names to their values for interpolation.
 *   - `msg`: The message template string containing placeholders in `{key}` format.
 *   - `msgType`: A string indicating the type of the message (e.g., "error", "info").
 * @returns The formatted message string with parameters replaced and metadata prepended.
 *
 * @example
 * formatMessage({
 *   group: "string",
 *   messageKey: "tooShort",
 *   params: { min: 2 },
 *   msg: "Too short! Min: {min}",
 *   msgType: "error"
 * });
 * // Returns: "[error] string.tooShort: Too short! Min: 2"
 */
export function formatMessage<
  TGroup extends keyof MessageGroupMap,
  TKey extends keyof MessageGroupMap[TGroup],
>(opts: {
  group: TGroup;
  messageKey: TKey;
  params: MessageGroupMap[TGroup][TKey];
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
 * Represents the parameter types for various string validation messages.
 *
 * Each property corresponds to a specific validation error and defines
 * the expected parameters for formatting the error message.
 *
 * @property tooShort - Parameters for the "too short" validation message, including the minimum allowed length.
 * @property tooLong - Parameters for the "too long" validation message, including the maximum allowed length.
 * @property required - Parameters for the "required" validation message (no additional parameters).
 * @property empty - Parameters for the "empty" validation message (no additional parameters).
 * @property mustBeString - Parameters for the "must be string" validation message.
 *   - `receivedType`: The actual type that was received (e.g., "number", "object").
 * @property trimmed - Parameters for the "trimmed" validation message.
 *   - `originalLength`: The length of the string before trimming.
 *   - `trimmedLength`: The length of the string after trimming.
 * @property cannotBeEmpty - Parameters for the "cannot be empty" validation message (no additional parameters).
 */
export type StringMessageParams = {
  tooShort: { min: number };
  tooLong: { max: number };
  required: {};
  empty: {};
  mustBeString: { receivedType?: string };
  trimmed: { originalLength?: number; trimmedLength?: number };
  cannotBeEmpty: {};
};

/**
 * Represents the parameter objects for various number-related validation messages.
 *
 * Each property corresponds to a specific validation scenario and defines the
 * expected shape of parameters required to generate a localized message.
 *
 * - `tooSmall`: Parameters for a value that is too small, including the minimum allowed value.
 * - `tooBig`: Parameters for a value that is too large, including the maximum allowed value.
 * - `required`: Parameters for a required value (no additional data).
 * - `mustBeNumber`: Parameters for a value that must be a number.
 *   - `receivedType`: The actual type that was received (e.g., "string", "object").
 * - `mustBeInteger`: Parameters for a value that must be an integer.
 *   - `receivedValue`: The actual value that was received (e.g., "3.14").
 * - `mustBeFloat`: Parameters for a value that must be a float (no additional data).
 * - `mustBePositive`: Parameters for a value that must be positive.
 *   - `receivedValue`: The actual value that was received (e.g., "-5").
 * - `mustBeNegative`: Parameters for a value that must be negative.
 *   - `receivedValue`: The actual value that was received (e.g., "5").
 * - `mustBeNonNegative`: Parameters for a value that must be non-negative.
 *   - `receivedValue`: The actual value that was received (e.g., "-1").
 * - `mustBeNonPositive`: Parameters for a value that must be non-positive.
 *   - `receivedValue`: The actual value that was received (e.g., "1").
 * - `outOfRange`: Parameters for a value that is out of range, including both minimum and maximum allowed values.
 * - `invalidDecimalPlaces`: Parameters for a value with invalid decimal places, including the maximum allowed.
 * - `invalid`: Parameters for a value that is invalid.
 *   - `reason`: Optional reason why the value is invalid.
 */
export type NumberMessageParams = {
  tooSmall: { min: number };
  tooBig: { max: number };
  required: {};
  mustBeNumber: { receivedType?: string };
  mustBeInteger: { receivedValue?: string };
  mustBeFloat: {};
  mustBePositive: { receivedValue?: string };
  mustBeNegative: { receivedValue?: string };
  mustBeNonNegative: { receivedValue?: string };
  mustBeNonPositive: { receivedValue?: string };
  outOfRange: { min: number; max: number };
  invalidDecimalPlaces: { max: number };
  invalid: { reason?: string };
};

/**
 * Represents the parameter types for various email-related localization messages.
 *
 * Each property corresponds to a specific validation message and defines the shape
 * of the parameters that can be passed to that message.
 *
 * - `required`: Parameters for the "required" message (no parameters).
 * - `invalid`: Parameters for the "invalid" message.
 *   - `reason`: Optional reason why the email is invalid.
 * - `mustBeValidEmail`: Parameters for the "must be a valid email" message.
 *   - `suggestions`: Optional array of suggested corrections (e.g., ["gmail.com", "hotmail.com"]).
 * - `invalidFormat`: Parameters for the "invalid format" message.
 *   - `expectedFormat`: Description of the expected email format.
 * - `domainInvalid`: Parameters for the "domain invalid" message, requires a `domain` string.
 */
export type EmailMessageParams = {
  required: {};
  invalid: { reason?: string };
  mustBeValidEmail: { suggestions?: string[] };
  invalidFormat: { expectedFormat?: string };
  domainInvalid: { domain: string };
};

/**
 * Represents the parameter types for phone-related validation messages.
 *
 * @property required - Parameters for the "required" validation message (no additional data).
 * @property invalid - Parameters for the "invalid" validation message.
 *   - `detectedCountry`: The country detected from the phone number, if any.
 * @property mustBeValidPhone - Parameters for the "must be a valid phone" validation message.
 *   - `supportedFormats`: Array of supported phone number formats.
 * @property invalidE164Format - Parameters for the "invalid E.164 format" validation message.
 *   - `receivedFormat`: The format that was actually received.
 * @property invalidNationalFormat - Parameters for the "invalid national format" validation message.
 *   - `country`: The country for which the national format is expected.
 *   - `expectedFormat`: The expected national format for the country.
 * @property invalidFormat - Parameters for the "invalid format" validation message.
 *   - `receivedFormat`: The format that was actually received.
 *   - `supportedFormats`: Array of supported phone number formats.
 * @property examples - Example phone numbers in E.164 and national formats.
 * @property examples.e164 - Example phone number in E.164 format.
 * @property examples.national - Example phone number in national format.
 */
export type PhoneMessageParams = {
  required: {};
  invalid: { detectedCountry?: string };
  mustBeValidPhone: { supportedFormats?: string[] };
  invalidE164Format: { receivedFormat?: string };
  invalidNationalFormat: { country?: string; expectedFormat?: string };
  invalidFormat: { receivedFormat?: string; supportedFormats?: string[] };
  examples: { e164: string; national: string };
};

/**
 * Represents the parameter types for various UUID-related validation messages.
 *
 * Each property corresponds to a specific validation scenario and is associated with
 * an empty object, indicating that no additional parameters are required for these messages.
 *
 * @property required - Indicates that a UUID value is required.
 * @property invalid - Indicates that the provided UUID is invalid.
 *   - `receivedValue`: The invalid UUID value that was provided.
 *   - `reason`: Optional reason why the UUID is invalid.
 * @property mustBeValidUuid - Indicates that the value must be a valid UUID.
 *   - `receivedValue`: The invalid value that was provided.
 * @property mustBeValidUuidV4 - Indicates that the value must be a valid UUID version 4.
 *   - `receivedVersion`: The UUID version that was detected, if any.
 * @property mustBeValidUuidV6 - Indicates that the value must be a valid UUID version 6.
 *   - `receivedVersion`: The UUID version that was detected, if any.
 * @property mustBeValidUuidV7 - Indicates that the value must be a valid UUID version 7.
 *   - `receivedVersion`: The UUID version that was detected, if any.
 * @property mustBeValidNanoid - Indicates that the value must be a valid nanoid.
 *   - `receivedValue`: The invalid nanoid value that was provided.
 *   - `receivedLength`: The length of the received value, if relevant.
 * @property invalidFormat - Indicates that the UUID format is invalid.
 *   - `expectedFormat`: Description of the expected UUID format.
 */
export type UuidMessageParams = {
  required: {};
  invalid: { receivedValue?: string; reason?: string };
  mustBeValidUuid: { receivedValue?: string };
  mustBeValidUuidV4: { receivedVersion?: string };
  mustBeValidUuidV6: { receivedVersion?: string };
  mustBeValidUuidV7: { receivedVersion?: string };
  mustBeValidNanoid: { receivedValue?: string; receivedLength?: number };
  invalidFormat: { expectedFormat?: string };
};

/**
 * Represents the parameter types for various URL-related validation messages.
 *
 * Each property corresponds to a specific validation scenario and defines the shape
 * of the parameters that can be passed to the message formatter for that scenario.
 *
 * - `required`: Parameters for a message indicating a required URL field (no parameters).
 * - `invalid`: Parameters for a message indicating a generic invalid URL.
 *   - `reason`: Optional reason why the URL is invalid.
 * - `mustBeValidUrl`: Parameters for a message indicating the value must be a valid URL.
 *   - `receivedValue`: The invalid URL that was provided.
 * - `invalidProtocol`: Parameters for a message indicating an invalid protocol, includes the invalid `protocol`.
 * - `invalidDomain`: Parameters for a message indicating an invalid domain, includes the invalid `domain`.
 * - `missingProtocol`: Parameters for a message indicating a missing protocol.
 *   - `suggestedProtocols`: Array of suggested protocols (e.g., ["https", "http"]).
 */
export type UrlMessageParams = {
  required: {};
  invalid: { reason?: string };
  mustBeValidUrl: { receivedValue?: string };
  invalidProtocol: { protocol: string };
  invalidDomain: { domain: string };
  missingProtocol: { suggestedProtocols?: string[] };
};

/**
 * Represents the parameter types for boolean-related validation messages.
 *
 * Each property corresponds to a specific boolean validation scenario,
 * and its value is an object containing parameters for message formatting.
 *
 * - `invalid`: Parameters for a generic invalid boolean value message.
 *   - `receivedValue`: The invalid value that was received.
 *   - `receivedType`: The type of the value that was received.
 * - `mustBeBoolean`: Parameters for a message indicating the value must be a boolean.
 *   - `receivedType`: The type of the value that was received.
 * - `mustBeBooleanString`: Parameters for a message indicating the value must be a boolean string.
 *   - `receivedValue`: The invalid string value that was received.
 * - `invalidBooleanString`: Parameters for a message indicating the value is an invalid boolean string.
 *   - `receivedValue`: The invalid string value that was received.
 *   - `validOptions`: Array of valid boolean string options (e.g., ["true", "false"]).
 */
export type BooleanMessageParams = {
  invalid: { receivedValue?: string; receivedType?: string };
  mustBeBoolean: { receivedType?: string };
  mustBeBooleanString: { receivedValue?: string };
  invalidBooleanString: { receivedValue?: string; validOptions?: string[] };
};

/**
 * Represents the parameter types for various array validation messages.
 *
 * Each property corresponds to a specific validation scenario and defines
 * the expected shape of parameters that can be passed to message templates.
 *
 * - `required`: Parameters for a required array validation.
 * - `invalid`: Parameters for an invalid array validation.
 *   - `receivedType`: The type of the value that was received instead of an array.
 *   - `reason`: Optional reason why the array is invalid.
 * - `empty`: Parameters for an empty array validation.
 *   - `minRequired`: The minimum number of items required when array cannot be empty.
 * - `tooSmall`: Parameters for when the array has fewer items than allowed.
 *   - `min`: The minimum number of items required.
 * - `tooBig`: Parameters for when the array has more items than allowed.
 *   - `max`: The maximum number of items allowed.
 * - `mustBeArray`: Parameters for when the value must be an array.
 *   - `receivedType`: The type of the value that was received.
 * - `mustBeStringArray`: Parameters for when the value must be an array of strings.
 *   - `receivedTypes`: Array of types found in the array (e.g., ["string", "number"]).
 *   - `invalidIndices`: Array of indices where non-string values were found.
 * - `mustHaveMinItems`: Parameters for when the array must have at least a minimum number of items.
 *   - `min`: The minimum number of items required.
 * - `mustHaveMaxItems`: Parameters for when the array must have at most a maximum number of items.
 *   - `max`: The maximum number of items allowed.
 * - `mustNotBeEmpty`: Parameters for when the array must not be empty.
 *   - `purpose`: Optional description of why the array cannot be empty.
 * - `duplicateItems`: Parameters for when the array contains duplicate items.
 *   - `duplicateValues`: Array of values that appear more than once.
 *   - `indices`: Array of indices where duplicates were found.
 */
export type ArrayMessageParams = {
  required: {};
  invalid: { receivedType?: string; reason?: string };
  empty: { minRequired?: number };
  tooSmall: { min: number };
  tooBig: { max: number };
  mustBeArray: { receivedType?: string };
  mustBeStringArray: { receivedTypes?: string[]; invalidIndices?: number[] };
  mustHaveMinItems: { min: number };
  mustHaveMaxItems: { max: number };
  mustNotBeEmpty: { purpose?: string };
  duplicateItems: { duplicateValues?: string[]; indices?: number[] };
};

/**
 * Represents the parameter types for enum-related validation messages.
 *
 * Each property corresponds to a specific enum validation scenario and defines
 * the expected shape of parameters that can be passed to message templates.
 *
 * @property invalid - Parameters for a generic invalid enum value message.
 *   - `receivedValue`: The invalid value that was provided.
 * @property mustBeOneOf - Parameters for a message indicating the value must be one of the allowed options.
 *   - `options`: Array of valid enum option strings.
 * @property invalidOption - Parameters for a message indicating an invalid specific option was provided.
 *   - `option`: The invalid option that was provided.
 * @property availableOptions - Parameters for a message listing all available enum options.
 *   - `options`: Array of all available enum option strings.
 */
export type EnumMessageParams = {
  invalid: { receivedValue?: string };
  mustBeOneOf: { options: string[] };
  invalidOption: { option: string };
  availableOptions: { options: string[] };
};

/**
 * Represents the parameter types for date and datetime-related validation messages.
 *
 * Each property corresponds to a specific date validation scenario and defines
 * the expected shape of parameters that can be passed to message templates.
 *
 * @property required - Parameters for a required date field message (no additional data).
 * @property invalid - Parameters for a generic invalid date message (no additional data).
 * @property mustBeValidDate - Parameters for a message indicating the value must be a valid date (no additional data).
 * @property mustBeValidDateTime - Parameters for a message indicating the value must be a valid datetime (no additional data).
 * @property invalidFormat - Parameters for a message indicating the date format is invalid (no additional data).
 * @property invalidDateString - Parameters for a message indicating the date string is invalid (no additional data).
 * @property mustIncludeTimezone - Parameters for a message indicating the datetime must include timezone information (no additional data).
 * @property examples - Example date formats to help users understand expected format.
 *   - `date`: Example date string format.
 *   - `dateTime`: Example datetime string format.
 */
export type DateMessageParams = {
  required: {};
  invalid: {};
  mustBeValidDate: {};
  mustBeValidDateTime: {};
  invalidFormat: {};
  invalidDateString: {};
  mustIncludeTimezone: {};
  examples: { date: string; dateTime: string };
};

/**
 * Represents the parameter types for money and currency-related validation messages.
 *
 * Each property corresponds to a specific monetary validation scenario and defines
 * the expected shape of parameters that can be passed to message templates.
 *
 * @property required - Parameters for a required money field message (no additional data).
 * @property invalid - Parameters for a generic invalid money value message (no additional data).
 * @property mustBeValidAmount - Parameters for a message indicating the amount must be valid (no additional data).
 * @property mustBeValidCurrency - Parameters for a message indicating the currency must be valid (no additional data).
 * @property mustBePositiveAmount - Parameters for a message indicating the amount must be positive (no additional data).
 * @property invalidCurrencyCode - Parameters for a message indicating an invalid currency code was provided.
 *   - `code`: The invalid currency code that was provided.
 * @property invalidDecimalPlaces - Parameters for a message indicating invalid decimal places in the amount.
 *   - `max`: The maximum number of decimal places allowed.
 * @property mustBeMoneyObject - Parameters for a message indicating the value must be a valid money object (no additional data).
 */
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

/**
 * Represents the parameter types for postal code and zip code validation messages.
 *
 * Each property corresponds to a specific postal code validation scenario and defines
 * the expected shape of parameters that can be passed to message templates.
 *
 * @property required - Parameters for a required postal code field message (no additional data).
 * @property invalid - Parameters for a generic invalid postal code message (no additional data).
 * @property mustBeValidZipCode - Parameters for a message indicating the value must be a valid ZIP code (no additional data).
 * @property mustBeValidPostalCode - Parameters for a message indicating the value must be a valid postal code (no additional data).
 * @property invalidFormat - Parameters for a message indicating the postal code format is invalid (no additional data).
 * @property examples - Example postal code formats for different countries.
 *   - `us`: Example US ZIP code format.
 *   - `uk`: Example UK postal code format.
 *   - `ca`: Example Canadian postal code format.
 */
export type PostalCodeMessageParams = {
  required: {};
  invalid: {};
  mustBeValidZipCode: {};
  mustBeValidPostalCode: {};
  invalidFormat: {};
  examples: { us: string; uk: string; ca: string };
};

/**
 * Represents the parameter types for file upload validation messages.
 *
 * Each property corresponds to a specific file upload validation scenario and defines
 * the expected shape of parameters that can be passed to message templates.
 *
 * @property invalid - Parameters for a generic invalid file message (no additional data).
 * @property tooBig - Parameters for a message indicating the file size exceeds the maximum allowed.
 *   - `maxSize`: The maximum allowed file size in bytes.
 * @property mustBeValidFile - Parameters for a message indicating the value must be a valid file (no additional data).
 * @property fileSizeExceeded - Parameters for a message indicating the file size was exceeded.
 *   - `maxSize`: The maximum allowed file size in bytes.
 * @property invalidFileType - Parameters for a message indicating an invalid file type was provided.
 *   - `type`: The invalid file type that was provided.
 * @property invalidMimeType - Parameters for a message indicating an invalid MIME type was provided.
 *   - `mime`: The invalid MIME type that was provided.
 * @property invalidFileName - Parameters for a message indicating an invalid file name was provided.
 *   - `name`: The invalid file name that was provided.
 * @property fileRequired - Parameters for a message indicating a file is required (no additional data).
 * @property examples - Example file upload constraints to help users understand requirements.
 *   - `maxSize`: Example maximum file size string.
 *   - `allowedTypes`: Example allowed file types string.
 */
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

/**
 * Represents the parameter types for pagination-related validation messages.
 *
 * Each property corresponds to a specific pagination validation scenario and defines
 * the expected shape of parameters that can be passed to message templates.
 *
 * @property required - Parameters for a required pagination field message (no additional data).
 * @property invalid - Parameters for a generic invalid pagination value message (no additional data).
 * @property invalidPageNumber - Parameters for a message indicating an invalid page number was provided.
 *   - `page`: The invalid page number that was provided.
 * @property invalidLimit - Parameters for a message indicating an invalid limit value was provided.
 *   - `limit`: The invalid limit value that was provided.
 * @property invalidOffset - Parameters for a message indicating an invalid offset value was provided.
 *   - `offset`: The invalid offset value that was provided.
 * @property invalidCursor - Parameters for a message indicating an invalid cursor value was provided.
 *   - `cursor`: The invalid cursor value that was provided.
 * @property invalidSortOrder - Parameters for a message indicating an invalid sort order was provided.
 *   - `order`: The invalid sort order that was provided.
 * @property pageOutOfRange - Parameters for a message indicating the page number is out of range.
 *   - `page`: The requested page number.
 *   - `totalPages`: The total number of available pages.
 * @property limitExceeded - Parameters for a message indicating the limit value was exceeded.
 *   - `limit`: The limit value that was exceeded.
 */
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

/**
 * Represents the parameter types for address validation messages.
 *
 * Each property corresponds to a specific address validation scenario and defines
 * the expected shape of parameters that can be passed to message templates.
 *
 * @property required - Parameters for a required address field message (no additional data).
 * @property invalid - Parameters for a generic invalid address message (no additional data).
 * @property mustBeValidAddress - Parameters for a message indicating the value must be a valid address (no additional data).
 * @property streetRequired - Parameters for a message indicating the street address is required (no additional data).
 * @property cityRequired - Parameters for a message indicating the city is required (no additional data).
 * @property stateRequired - Parameters for a message indicating the state/province is required (no additional data).
 * @property countryRequired - Parameters for a message indicating the country is required (no additional data).
 * @property postalCodeRequired - Parameters for a message indicating the postal code is required (no additional data).
 * @property invalidState - Parameters for a message indicating an invalid state/province was provided.
 *   - `state`: The invalid state/province that was provided.
 * @property invalidUSState - Parameters for a message indicating an invalid US state was provided (no additional data).
 * @property invalidCountry - Parameters for a message indicating an invalid country was provided.
 *   - `country`: The invalid country that was provided.
 */
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

/**
 * Represents the parameter types for network-related validation messages.
 *
 * Each property corresponds to a specific network validation scenario and defines
 * the expected shape of parameters that can be passed to message templates.
 *
 * @property required - Parameters for a required network field message (no additional data).
 * @property invalid - Parameters for a generic invalid network value message (no additional data).
 * @property mustBeValidIPv4 - Parameters for a message indicating the value must be a valid IPv4 address (no additional data).
 * @property mustBeValidIPv6 - Parameters for a message indicating the value must be a valid IPv6 address (no additional data).
 * @property mustBeValidMacAddress - Parameters for a message indicating the value must be a valid MAC address (no additional data).
 * @property invalidIPv4Format - Parameters for a message indicating the IPv4 format is invalid (no additional data).
 * @property invalidIPv6Format - Parameters for a message indicating the IPv6 format is invalid (no additional data).
 * @property invalidMacFormat - Parameters for a message indicating the MAC address format is invalid (no additional data).
 * @property examples - Example network address formats to help users understand expected format.
 *   - `ipv4`: Example IPv4 address format.
 *   - `ipv6`: Example IPv6 address format.
 *   - `mac`: Example MAC address format.
 */
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

/**
 * Represents the parameter types for user account and authentication-related validation messages.
 *
 * Each property corresponds to a specific user validation scenario and defines
 * the expected shape of parameters that can be passed to message templates.
 *
 * @property required - Parameters for a required user field message (no additional data).
 * @property invalid - Parameters for a generic invalid user value message.
 *   - `reason`: Optional reason why the user value is invalid.
 * @property usernameInvalid - Parameters for a message indicating the username is invalid.
 *   - `violations`: Array of specific validation failures (e.g., ["too_short", "invalid_chars"]).
 *   - `requirements`: Array of username requirements (e.g., ["min_3_chars", "alphanumeric_only"]).
 * @property passwordWeak - Parameters for a message indicating the password is weak.
 *   - `score`: Password strength score (typically 0-4).
 *   - `missingRequirements`: Array of missing password requirements (e.g., ["uppercase", "numbers"]).
 *   - `suggestions`: Array of suggestions to improve password strength.
 * @property passwordTooShort - Parameters for a message indicating the password is too short.
 *   - `min`: The minimum required password length.
 * @property passwordMissingUppercase - Parameters for a message indicating the password is missing uppercase characters.
 *   - `minRequired`: Minimum number of uppercase characters required.
 * @property passwordMissingLowercase - Parameters for a message indicating the password is missing lowercase characters.
 *   - `minRequired`: Minimum number of lowercase characters required.
 * @property passwordMissingNumbers - Parameters for a message indicating the password is missing numeric characters.
 *   - `minRequired`: Minimum number of numeric characters required.
 * @property passwordMissingSpecialChars - Parameters for a message indicating the password is missing special characters.
 *   - `minRequired`: Minimum number of special characters required.
 *   - `allowedChars`: String of allowed special characters (e.g., "!@#$%^&*()").
 * @property passwordsDoNotMatch - Parameters for a message indicating the passwords do not match.
 *   - `field1`: Name of the first password field.
 *   - `field2`: Name of the second password field.
 * @property passwordMustBeDifferent - Parameters for a message indicating the password must be different from the current one.
 *   - `reason`: Optional reason why the password must be different.
 * @property emailAlreadyExists - Parameters for a message indicating the email address is already in use.
 *   - `email`: The email address that already exists.
 * @property usernameAlreadyExists - Parameters for a message indicating the username is already in use.
 *   - `username`: The username that already exists.
 * @property invalidRole - Parameters for a message indicating an invalid user role was provided.
 *   - `role`: The invalid role that was provided.
 * @property invalidAccountType - Parameters for a message indicating an invalid account type was provided.
 *   - `type`: The invalid account type that was provided.
 * @property termsNotAccepted - Parameters for a message indicating the terms of service were not accepted.
 *   - `termsVersion`: The version of terms that need to be accepted.
 *   - `requiredSections`: Array of required sections that must be accepted.
 * @property invalidUnderscorePosition - Parameters for a message indicating invalid underscore positioning in username.
 *   - `position`: The invalid position where underscore was found.
 *   - `allowedPositions`: Description of where underscores are allowed.
 * @property invalidHyphenPosition - Parameters for a message indicating invalid hyphen positioning in username.
 *   - `position`: The invalid position where hyphen was found.
 *   - `allowedPositions`: Description of where hyphens are allowed.
 * @property mustBeValidUserObject - Parameters for a message indicating the value must be a valid user object.
 *   - `requiredFields`: Array of fields that are required in the user object.
 *   - `invalidFields`: Array of fields that contain invalid values.
 */
export type UserMessageParams = {
  required: {};
  invalid: { reason?: string };
  usernameInvalid: { violations?: string[]; requirements?: string[] };
  passwordWeak: {
    score?: number;
    missingRequirements?: string[];
    suggestions?: string[];
  };
  passwordTooShort: { min: number };
  passwordMissingUppercase: { minRequired?: number };
  passwordMissingLowercase: { minRequired?: number };
  passwordMissingNumbers: { minRequired?: number };
  passwordMissingSpecialChars: { minRequired?: number; allowedChars?: string };
  passwordsDoNotMatch: { field1?: string; field2?: string };
  passwordMustBeDifferent: { reason?: string };
  emailAlreadyExists: { email: string };
  usernameAlreadyExists: { username: string };
  invalidRole: { role: string };
  invalidAccountType: { type: string };
  termsNotAccepted: { termsVersion?: string; requiredSections?: string[] };
  invalidUnderscorePosition: { position?: number; allowedPositions?: string };
  invalidHyphenPosition: { position?: number; allowedPositions?: string };
  mustBeValidUserObject: {
    requiredFields?: string[];
    invalidFields?: string[];
  };
};

/**
 * Represents the parameter types for record (key-value object) validation messages.
 *
 * Each property corresponds to a specific record validation scenario and defines
 * the expected shape of parameters that can be passed to message templates.
 *
 * @property required - Parameters for a required record field message (no additional data).
 * @property invalid - Parameters for a generic invalid record message.
 *   - `reason`: Optional reason why the record is invalid.
 * @property mustBeRecord - Parameters for a message indicating the value must be a valid record object.
 *   - `receivedType`: The type of the value that was received instead of an object.
 * @property tooFewEntries - Parameters for a message indicating the record has too few entries.
 *   - `min`: The minimum number of entries required.
 * @property tooManyEntries - Parameters for a message indicating the record has too many entries.
 *   - `max`: The maximum number of entries allowed.
 * @property invalidKeys - Parameters for a message indicating the record contains invalid keys.
 *   - `allowedKeys`: Array of keys that are allowed in the record.
 *   - `invalidKeys`: Array of keys that are not allowed and were found in the record.
 * @property invalidKeyPattern - Parameters for a message indicating record keys don't match the required pattern.
 *   - `pattern`: The regex pattern that keys must match.
 *   - `invalidKeys`: Array of keys that don't match the pattern.
 * @property missingRequiredKeys - Parameters for a message indicating the record is missing required keys.
 *   - `requiredKeys`: Array of keys that are required in the record.
 *   - `missingKeys`: Array of required keys that are missing from the record.
 * @property examples - Example record formats to help users understand expected structure.
 *   - `keyValue`: Example simple key-value record structure.
 *   - `stringRecord`: Example record with string values.
 */
export type RecordMessageParams = {
  required: {};
  invalid: { reason?: string };
  mustBeRecord: { receivedType?: string };
  tooFewEntries: { min: number };
  tooManyEntries: { max: number };
  invalidKeys: { allowedKeys?: string[]; invalidKeys?: string[] };
  invalidKeyPattern: { pattern?: string; invalidKeys?: string[] };
  missingRequiredKeys: { requiredKeys?: string[]; missingKeys?: string[] };
  examples: { keyValue: string; stringRecord: string };
};
