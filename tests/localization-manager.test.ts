import { LocalizationManager } from '../src/localization/manager';
import type { LocaleCode } from '../src/localization/types/locale.types';
import type { LocalizationMessages, MessageParams } from '../src/localization/types/message.types';

// Create minimal complete message structures for testing
const createMinimalMessages = (locale: LocaleCode, overrides: any = {}): LocalizationMessages => ({
  locale,
  common: {
    required: 'is required',
    invalid: 'is invalid',
    mustBe: 'must be',
    cannotBe: 'cannot be',
    tooShort: 'is too short',
    tooLong: 'is too long',
    tooSmall: 'is too small',
    tooBig: 'is too big',
    outOfRange: 'is out of range',
    notFound: 'not found',
    duplicate: 'is duplicate',
    empty: 'is empty',
    notEmpty: 'must not be empty',
    errorFormat: '{fieldName} {message}',
    ...overrides.common
  },
  string: {
    required: 'is required',
    invalid: 'is invalid',
    tooShort: 'is too short (minimum: {min} characters)',
    tooLong: 'is too long (maximum: {max} characters)',
    empty: 'is empty',
    mustBeString: 'must be a string',
    trimmed: 'will be trimmed',
    ...overrides.string
  },
  email: {
    required: 'is required',
    invalid: 'is invalid',
    mustBeValidEmail: 'must be a valid email address',
    invalidFormat: 'has invalid email format',
    domainInvalid: 'has invalid domain',
    ...overrides.email
  },
  phone: {
    required: 'is required',
    invalid: 'is invalid',
    mustBeValidPhone: 'must be a valid phone number',
    invalidE164Format: 'is invalid. Example: {example}',
    invalidNationalFormat: 'is invalid. Example: {example}',
    invalidFormat: 'has invalid format',
    examples: { e164: '+11234567890', national: '1234567890' },
    ...overrides.phone
  },
  uuid: {
    required: 'is required',
    invalid: 'is invalid',
    mustBeValidUuid: 'must be a valid UUID',
    mustBeValidUuidV4: 'must be a valid UUIDv4',
    invalidFormat: 'has invalid UUID format',
    ...overrides.uuid
  },
  url: {
    required: 'is required',
    invalid: 'is invalid',
    mustBeValidUrl: 'must be a valid URL',
    invalidProtocol: 'has invalid protocol',
    invalidDomain: 'has invalid domain',
    missingProtocol: 'is missing protocol',
    ...overrides.url
  },
  number: {
    required: 'is required',
    invalid: 'is invalid',
    tooSmall: 'is too small (minimum: {min})',
    tooBig: 'is too big (maximum: {max})',
    mustBeNumber: 'must be a number',
    mustBeInteger: 'must be an integer',
    mustBeFloat: 'must be a float',
    mustBePositive: 'must be positive',
    mustBeNegative: 'must be negative',
    mustBeNonNegative: 'must be non-negative',
    mustBeNonPositive: 'must be non-positive',
    outOfRange: 'is out of range ({min} to {max})',
    invalidDecimalPlaces: 'has too many decimal places (maximum: {max})',
    ...overrides.number
  },
  boolean: {
    invalid: 'is invalid',
    mustBeBoolean: 'must be a boolean value',
    mustBeBooleanString: 'must be a boolean value ("true" or "false")',
    invalidBooleanString: 'must be "true" or "false"',
    ...overrides.boolean
  },
  array: {
    required: 'is required',
    invalid: 'is invalid',
    empty: 'is empty',
    tooSmall: 'must have at least {min} items',
    tooBig: 'must have at most {max} items',
    mustBeArray: 'must be an array',
    mustBeStringArray: 'must be an array of strings',
    mustHaveMinItems: 'must have at least {min} items',
    mustHaveMaxItems: 'must have at most {max} items',
    mustNotBeEmpty: 'must be an array of strings with at least one item',
    duplicateItems: 'contains duplicate items',
    ...overrides.array
  },
  enum: {
    invalid: 'is invalid',
    mustBeOneOf: 'must be one of: {values}',
    invalidOption: 'is not a valid option',
    availableOptions: 'available options are: {values}',
    ...overrides.enum
  },
  date: {
    required: 'is required',
    invalid: 'is invalid',
    mustBeValidDate: 'must be a valid date',
    mustBeValidDateTime: 'must be a valid date and time',
    invalidFormat: 'has invalid format (expected: {format})',
    invalidDateString: 'is not a valid date string',
    examples: { date: 'YYYY-MM-DD', dateTime: 'YYYY-MM-DDTHH:mm:ssZ' },
    ...overrides.date
  },
  money: {
    required: 'is required',
    invalid: 'is invalid',
    mustBeValidAmount: 'must be a valid amount',
    mustBeValidCurrency: 'must be a valid currency',
    mustBePositiveAmount: 'must be a positive amount',
    invalidCurrencyCode: 'has invalid currency code',
    invalidDecimalPlaces: 'has too many decimal places (maximum: {max})',
    mustBeMoneyObject: 'must be a valid money object',
    ...overrides.money
  },
  postalCode: {
    required: 'is required',
    invalid: 'is invalid',
    mustBeValidZipCode: 'must be a valid US ZIP code',
    mustBeValidPostalCode: 'must be a valid postal code',
    invalidFormat: 'has invalid format',
    examples: { us: '12345 or 12345-6789', uk: 'SW1A 1AA', ca: 'K1A 0A6' },
    ...overrides.postalCode
  },
  fileUpload: {
    invalid: 'is invalid',
    tooBig: 'is too big (maximum: {maxSize})',
    mustBeValidFile: 'must be a valid file',
    fileSizeExceeded: 'exceeds maximum file size ({maxSize})',
    invalidFileType: 'has invalid file type',
    invalidMimeType: 'has invalid MIME type (allowed: {allowedTypes})',
    invalidFileName: 'has invalid file name',
    fileRequired: 'file is required',
    examples: { maxSize: 'Maximum size: {size}', allowedTypes: 'Allowed types: {types}' },
    ...overrides.fileUpload
  },
  pagination: {
    required: 'is required',
    invalid: 'is invalid',
    invalidPageNumber: 'has invalid page number',
    invalidLimit: 'has invalid limit (must be between {min} and {max})',
    invalidOffset: 'has invalid offset',
    invalidCursor: 'has invalid cursor',
    invalidSortOrder: 'has invalid sort order (must be \'asc\' or \'desc\')',
    pageOutOfRange: 'page is out of range',
    limitExceeded: 'limit exceeded (maximum: {max})',
    ...overrides.pagination
  },
  address: {
    required: 'is required',
    invalid: 'is invalid',
    mustBeValidAddress: 'must be a valid address object',
    streetRequired: 'street is required',
    cityRequired: 'city is required',
    stateRequired: 'state is required',
    countryRequired: 'country is required',
    postalCodeRequired: 'postal code is required',
    invalidState: 'has invalid state code',
    invalidCountry: 'has invalid country code',
    ...overrides.address
  },
  network: {
    required: 'is required',
    invalid: 'is invalid',
    mustBeValidIPv4: 'must be a valid IPv4 address',
    mustBeValidIPv6: 'must be a valid IPv6 address',
    mustBeValidMacAddress: 'must be a valid MAC address',
    invalidIPv4Format: 'has invalid IPv4 format',
    invalidIPv6Format: 'has invalid IPv6 format',
    invalidMacFormat: 'has invalid MAC format',
    examples: { ipv4: '192.168.1.1', ipv6: '::1', mac: '00:11:22:33:44:55' },
    ...overrides.network
  },
  user: {
    required: 'is required',
    invalid: 'is invalid',
    usernameInvalid: 'has invalid username format',
    passwordWeak: 'password is too weak',
    passwordTooShort: 'password is too short (minimum: {min} characters)',
    passwordMissingUppercase: 'password must contain at least one uppercase letter',
    passwordMissingLowercase: 'password must contain at least one lowercase letter',
    passwordMissingNumbers: 'password must contain at least one number',
    passwordMissingSpecialChars: 'password must contain at least one special character',
    passwordsDoNotMatch: 'passwords do not match',
    emailAlreadyExists: 'email already exists',
    usernameAlreadyExists: 'username already exists',
    invalidRole: 'has invalid role',
    invalidAccountType: 'has invalid account type',
    termsNotAccepted: 'terms and conditions must be accepted',
    ...overrides.user
  }
});

// Mock locale files  
const mockEnglishMessages = createMinimalMessages('en');
// Add custom nested structure for testing
(mockEnglishMessages as any).nested = { deep: { value: 'deep nested value with {param}' } };

const mockSpanishMessages = createMinimalMessages('es', {
  common: {
    errorFormat: '{fieldName} {message}'
  },
  string: {
    required: 'es requerido',
    tooShort: 'es demasiado corto (mínimo: {min} caracteres)',
    invalid: 'es inválido'
  },
  email: {
    invalid: 'debe ser una dirección de correo válida',
    required: 'el correo es requerido'
  },
  number: {
    required: 'es requerido',
    tooSmall: 'debe ser al menos {min}',
    invalid: 'debe ser un número válido'
  }
});

const mockIncompleteMessages = createMinimalMessages('fr', {
  string: {
    required: 'est requis'
    // This will still have all required fields from createMinimalMessages
  }
});

// Mock dynamic imports
jest.mock('../src/localization/locales/en.json', () => mockEnglishMessages, { virtual: true });
jest.mock('../src/localization/locales/es.json', () => mockSpanishMessages, { virtual: true });
jest.mock('../src/localization/locales/fr.json', () => mockIncompleteMessages, { virtual: true });

describe('LocalizationManager', () => {
  let manager: LocalizationManager;

  beforeEach(() => {
    manager = new LocalizationManager();
    // Clear any console warnings during tests
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor and Initial State', () => {
    const initialStateTests = [
      {
        name: 'should initialize with default locale as "en"',
        test: () => expect(manager.getLocale()).toBe('en')
      },
      {
        name: 'should initialize with fallback locale as "en"',
        test: () => expect(manager.getFallbackLocale()).toBe('en')
      },
      {
        name: 'should have no available locales initially',
        test: () => expect(manager.getAvailableLocales()).toEqual([])
      },
      {
        name: 'should not have any locale initially',
        test: () => expect(manager.hasLocale('en' as LocaleCode)).toBe(false)
      }
    ];

    test.each(initialStateTests)('$name', ({ test }) => {
      test();
    });
  });

  describe('setLocale and getLocale', () => {
    const localeTests = [
      {
        name: 'should set and get valid locale',
        locale: 'es' as LocaleCode,
        expected: 'es'
      },
      {
        name: 'should set and get different valid locale',
        locale: 'fr' as LocaleCode,
        expected: 'fr'
      },
      {
        name: 'should handle locale change multiple times',
        locale: 'de' as LocaleCode,
        expected: 'de'
      }
    ];

    test.each(localeTests)('$name', ({ locale, expected }) => {
      manager.setLocale(locale);
      expect(manager.getLocale()).toBe(expected);
    });
  });

  describe('setFallbackLocale and getFallbackLocale', () => {
    const fallbackTests = [
      {
        name: 'should set and get valid fallback locale',
        fallback: 'es' as LocaleCode,
        expected: 'es'
      },
      {
        name: 'should override default fallback locale',
        fallback: 'fr' as LocaleCode,
        expected: 'fr'
      }
    ];

    test.each(fallbackTests)('$name', ({ fallback, expected }) => {
      manager.setFallbackLocale(fallback);
      expect(manager.getFallbackLocale()).toBe(expected);
    });
  });

  describe('registerMessages', () => {
    const registerTests = [
      {
        name: 'should register valid English messages',
        messages: mockEnglishMessages,
        expectedLocale: 'en',
        expectHasLocale: true
      },
      {
        name: 'should register valid Spanish messages',
        messages: mockSpanishMessages,
        expectedLocale: 'es',
        expectHasLocale: true
      },
      {
        name: 'should register incomplete messages',
        messages: mockIncompleteMessages,
        expectedLocale: 'fr',
        expectHasLocale: true
      }
    ];

    test.each(registerTests)('$name', ({ messages, expectedLocale, expectHasLocale }) => {
      manager.registerMessages(messages);
      expect(manager.hasLocale(expectedLocale as LocaleCode)).toBe(expectHasLocale);
      expect(manager.getAvailableLocales()).toContain(expectedLocale);
    });
  });

  describe('loadLocale', () => {
    const loadLocaleTests = [
      {
        name: 'should load valid English locale',
        locale: 'en' as LocaleCode,
        shouldSucceed: true,
        shouldThrow: false
      },
      {
        name: 'should load valid Spanish locale',
        locale: 'es' as LocaleCode,
        shouldSucceed: true,
        shouldThrow: false
      },
      {
        name: 'should throw error for invalid locale',
        locale: 'invalid' as LocaleCode,
        shouldSucceed: false,
        shouldThrow: true
      },
      {
        name: 'should handle non-existent locale gracefully',
        locale: 'xx' as LocaleCode,
        shouldSucceed: false,
        shouldThrow: true
      }
    ];

    test.each(loadLocaleTests)('$name', async ({ locale, shouldSucceed, shouldThrow }) => {
      if (shouldThrow) {
        await expect(manager.loadLocale(locale)).rejects.toThrow();
      } else {
        await expect(manager.loadLocale(locale)).resolves.toBeUndefined();
        expect(manager.hasLocale(locale)).toBe(shouldSucceed);
      }
    });

    test('should not reload already loaded locale', async () => {
      await manager.loadLocale('en' as LocaleCode);
      const availableCount = manager.getAvailableLocales().length;
      
      // Load same locale again
      await manager.loadLocale('en' as LocaleCode);
      expect(manager.getAvailableLocales().length).toBe(availableCount);
    });
  });

  describe('loadLocales', () => {
    const loadLocalesTests = [
      {
        name: 'should load multiple valid locales',
        locales: ['en', 'es'] as LocaleCode[],
        expectedCount: 2,
        shouldThrow: false
      },
      {
        name: 'should handle empty locale array',
        locales: [] as LocaleCode[],
        expectedCount: 0,
        shouldThrow: false
      },
      {
        name: 'should partially succeed with mixed valid/invalid locales',
        locales: ['en', 'invalid', 'es'] as LocaleCode[],
        expectedCount: undefined, // Will throw, so count is irrelevant
        shouldThrow: true
      }
    ];

    test.each(loadLocalesTests)('$name', async ({ locales, expectedCount, shouldThrow }) => {
      if (shouldThrow) {
        await expect(manager.loadLocales(locales)).rejects.toThrow();
      } else {
        await manager.loadLocales(locales);
        if (expectedCount !== undefined) {
          expect(manager.getAvailableLocales().length).toBe(expectedCount);
        }
      }
    });
  });

  describe('getMessage', () => {
    beforeEach(async () => {
      manager.registerMessages(mockEnglishMessages);
      manager.registerMessages(mockSpanishMessages);
      manager.registerMessages(mockIncompleteMessages);
      manager.setFallbackLocale('en' as LocaleCode);
    });

    const getMessageTests = [
      // Valid cases
      {
        name: 'should get message with no parameters',
        key: 'string.required',
        params: undefined as MessageParams | undefined,
        locale: 'en' as LocaleCode,
        expected: 'is required'
      },
      {
        name: 'should get message with parameters',
        key: 'string.tooShort',
        params: { min: 5 } as MessageParams,
        locale: 'en' as LocaleCode,
        expected: 'is too short (minimum: 5 characters)'
      },
      {
        name: 'should get Spanish message',
        key: 'string.required',
        params: undefined as MessageParams | undefined,
        locale: 'es' as LocaleCode,
        expected: 'es requerido'
      },
      {
        name: 'should get Spanish message with parameters',
        key: 'string.tooShort', 
        params: { min: 10 } as MessageParams,
        locale: 'es' as LocaleCode,
        expected: 'es demasiado corto (mínimo: 10 caracteres)'
      },
      {
        name: 'should get deeply nested message',
        key: 'nested.deep.value',
        params: { param: 'test' } as MessageParams,
        locale: 'en' as LocaleCode,
        expected: 'deep nested value with test'
      },
      {
        name: 'should handle multiple parameters',
        key: 'number.tooSmall',
        params: { min: 0 } as MessageParams,
        locale: 'en' as LocaleCode,
        expected: 'is too small (minimum: 0)'
      },
      // Fallback cases
      {
        name: 'should fallback to English for missing Spanish key',
        key: 'nested.deep.value',
        params: { param: 'fallback' } as MessageParams,
        locale: 'es' as LocaleCode,
        expected: 'deep nested value with fallback'
      },
      {
        name: 'should fallback to English for incomplete locale',
        key: 'string.tooShort',
        params: { min: 3 } as MessageParams,
        locale: 'fr' as LocaleCode,
        expected: 'is too short (minimum: 3 characters)'
      },
      // Edge cases
      {
        name: 'should return key for non-existent key',
        key: 'nonexistent.key',
        params: undefined as MessageParams | undefined,
        locale: 'en' as LocaleCode,
        expected: 'nonexistent.key'
      },
      {
        name: 'should return key for non-existent locale and key',
        key: 'nonexistent.key',
        params: undefined as MessageParams | undefined,
        locale: 'xx' as LocaleCode,
        expected: 'nonexistent.key'
      },
      {
        name: 'should handle empty key',
        key: '',
        params: undefined as MessageParams | undefined,
        locale: 'en' as LocaleCode,
        expected: ''
      },
      {
        name: 'should ignore unused parameters',
        key: 'string.required',
        params: { unused: 'value', another: 'param' } as MessageParams,
        locale: 'en' as LocaleCode,
        expected: 'is required'
      },
      {
        name: 'should preserve unmatched parameter placeholders',
        key: 'string.tooShort',
        params: { wrong: 'value' } as MessageParams,
        locale: 'en' as LocaleCode,
        expected: 'is too short (minimum: {min} characters)'
      }
    ];

    test.each(getMessageTests)('$name', ({ key, params, locale, expected }) => {
      const result = manager.getMessage(key, params, locale);
      expect(result).toBe(expected);
    });

    test('should use current locale when no locale specified', () => {
      manager.setLocale('es' as LocaleCode);
      const result = manager.getMessage('string.required');
      expect(result).toBe('es requerido');
    });
  });

  describe('getErrorMessage', () => {
    beforeEach(() => {
      manager.registerMessages(mockEnglishMessages);
      manager.registerMessages(mockSpanishMessages);
    });

    const errorMessageTests = [
      {
        name: 'should format error message with field name',
        fieldName: 'Username',
        messageKey: 'string.required' as const,
        params: undefined as MessageParams | undefined,
        locale: 'en' as LocaleCode,
        expected: 'Username is required'
      },
      {
        name: 'should format error message with parameters',
        fieldName: 'Password',
        messageKey: 'string.tooShort' as const,
        params: { min: 8 } as MessageParams,
        locale: 'en' as LocaleCode,
        expected: 'Password is too short (minimum: 8 characters)'
      },
      {
        name: 'should format Spanish error message',
        fieldName: 'Contraseña',
        messageKey: 'string.required' as const,
        params: undefined as MessageParams | undefined,
        locale: 'es' as LocaleCode,
        expected: 'Contraseña es requerido'
      },
      {
        name: 'should handle empty field name',
        fieldName: '',
        messageKey: 'string.required' as const,
        params: undefined as MessageParams | undefined,
        locale: 'en' as LocaleCode,
        expected: ' is required'
      }
    ];

    test.each(errorMessageTests)('$name', ({ fieldName, messageKey, params, locale, expected }) => {
      const result = manager.getErrorMessage(fieldName, messageKey, params, locale);
      expect(result).toBe(expected);
    });
  });

  describe('ensureLocaleLoaded', () => {
    const ensureLoadedTests = [
      {
        name: 'should load locale if not present',
        locale: 'en' as LocaleCode,
        preRegister: false,
        shouldSucceed: true
      },
      {
        name: 'should not reload if already present',
        locale: 'es' as LocaleCode,
        preRegister: true,
        shouldSucceed: true
      },
      {
        name: 'should throw for invalid locale',
        locale: 'invalid' as LocaleCode,
        preRegister: false,
        shouldSucceed: false
      }
    ];

    test.each(ensureLoadedTests)('$name', async ({ locale, preRegister, shouldSucceed }) => {
      if (preRegister) {
        manager.registerMessages(locale === 'es' ? mockSpanishMessages : mockEnglishMessages);
      }

      if (shouldSucceed) {
        await expect(manager.ensureLocaleLoaded(locale)).resolves.toBeUndefined();
        expect(manager.hasLocale(locale)).toBe(true);
      } else {
        await expect(manager.ensureLocaleLoaded(locale)).rejects.toThrow();
      }
    });
  });

  describe('hasLocale', () => {
    const hasLocaleTests = [
      {
        name: 'should return false for unregistered locale',
        locale: 'en' as LocaleCode,
        preRegister: false,
        expected: false
      },
      {
        name: 'should return true for registered locale',
        locale: 'en' as LocaleCode,
        preRegister: true,
        expected: true
      },
      {
        name: 'should return false for non-existent locale',
        locale: 'xx' as LocaleCode,
        preRegister: false,
        expected: false
      }
    ];

    test.each(hasLocaleTests)('$name', ({ locale, preRegister, expected }) => {
      if (preRegister) {
        manager.registerMessages(mockEnglishMessages);
      }
      expect(manager.hasLocale(locale)).toBe(expected);
    });
  });

  describe('getAvailableLocales', () => {
    test('should return empty array initially', () => {
      expect(manager.getAvailableLocales()).toEqual([]);
    });

    test('should return registered locales', () => {
      manager.registerMessages(mockEnglishMessages);
      manager.registerMessages(mockSpanishMessages);
      
      const available = manager.getAvailableLocales();
      expect(available).toContain('en');
      expect(available).toContain('es');
      expect(available.length).toBe(2);
    });

    test('should not duplicate locales', () => {
      manager.registerMessages(mockEnglishMessages);
      manager.registerMessages(mockEnglishMessages); // Register twice
      
      expect(manager.getAvailableLocales().length).toBe(1);
    });
  });

  describe('Parameter Interpolation Edge Cases', () => {
    beforeEach(() => {
      // Use a test locale that extends the minimal structure
      const testMessages = createMinimalMessages('test' as LocaleCode);
      // Add custom complex structure for testing
      (testMessages as any).complex = {
        multiple: 'Value {a} and {b} with {c}',
        special: 'Special chars: {param} with {special}',
        numbers: 'Number {num} and string {str}',
        nested: 'Nested {outer.inner} param',
        braces: 'Multiple {{param}} braces'
      };
      manager.registerMessages(testMessages);
    });

    const interpolationTests = [
      {
        name: 'should handle multiple parameters',
        key: 'complex.multiple',
        params: { a: '1', b: '2', c: '3' } as MessageParams,
        expected: 'Value 1 and 2 with 3'
      },
      {
        name: 'should handle special characters in parameters',
        key: 'complex.special',
        params: { param: 'test@value', special: '100%' } as MessageParams,
        expected: 'Special chars: test@value with 100%'
      },
      {
        name: 'should handle numeric parameters',
        key: 'complex.numbers',
        params: { num: 42, str: 'hello' } as MessageParams,
        expected: 'Number 42 and string hello'
      },
      {
        name: 'should handle undefined parameters', 
        key: 'complex.multiple',
        params: { a: '1', c: '3' } as MessageParams, // b is missing
        expected: 'Value 1 and {b} with 3'
      },
      {
        name: 'should handle empty string parameters',
        key: 'complex.multiple',
        params: { a: '', b: 'middle', c: '' } as MessageParams,
        expected: 'Value  and middle with '
      },
      {
        name: 'should not interpolate complex parameter names',
        key: 'complex.nested',
        params: { 'outer.inner': 'value' } as MessageParams,
        expected: 'Nested {outer.inner} param'
      },
      {
        name: 'should handle double braces by replacing first set',
        key: 'complex.braces',
        params: { param: 'test' } as MessageParams,
        expected: 'Multiple {test} braces'
      }
    ];

    test.each(interpolationTests)('$name', ({ key, params, expected }) => {
      const result = manager.getMessage(key, params, 'test' as LocaleCode);
      expect(result).toBe(expected);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle malformed message objects gracefully', () => {
      const malformedMessages = createMinimalMessages('malformed' as LocaleCode);
      // Overwrite with malformed structures
      (malformedMessages as any).string = null; // null instead of object
      (malformedMessages as any).number = 'not an object'; // string instead of object

      expect(() => manager.registerMessages(malformedMessages)).not.toThrow();
      
      const result = manager.getMessage('string.required', undefined, 'malformed' as LocaleCode);
      expect(result).toBe('string.required'); // Should fallback to key
    });

    test('should handle circular references in parameters', () => {
      manager.registerMessages(mockEnglishMessages);
      
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      // Should not throw and should convert to string
      expect(() => {
        manager.getMessage('string.tooShort', { min: circular } as MessageParams, 'en' as LocaleCode);
      }).not.toThrow();
    });

    test('should handle very deep nesting in message keys', () => {
      const deepMessages = createMinimalMessages('deep' as LocaleCode);
      // Add custom deep structure for testing
      (deepMessages as any).level1 = {
        level2: {
          level3: {
            level4: {
              level5: 'very deep message'
            }
          }
        }
      };

      manager.registerMessages(deepMessages);
      const result = manager.getMessage('level1.level2.level3.level4.level5', undefined, 'deep' as LocaleCode);
      expect(result).toBe('very deep message');
    });

    test('should handle array indices in message keys', () => {
      const arrayMessages = createMinimalMessages('array' as LocaleCode);
      // Add custom array structure for testing
      (arrayMessages as any).items = ['first', 'second', 'third'];

      manager.registerMessages(arrayMessages);
      const result = manager.getMessage('items.1', undefined, 'array' as LocaleCode);
      expect(result).toBe('second');
    });
  });

  describe('Performance and Memory Tests', () => {
    test('should handle large number of locales', () => {
      const localeCount = 100;
      for (let i = 0; i < localeCount; i++) {
        const messages = createMinimalMessages(`locale${i}` as LocaleCode);
        // Add custom test structure for testing
        (messages as any).test = { message: `message ${i}` };
        manager.registerMessages(messages);
      }

      expect(manager.getAvailableLocales().length).toBe(localeCount);
      expect(manager.getMessage('test.message', undefined, 'locale50' as LocaleCode)).toBe('message 50');
    });

    test('should handle large message objects', () => {
      const largeMessages = createMinimalMessages('large' as LocaleCode);
      
      // Create a large nested structure
      for (let i = 0; i < 1000; i++) {
        (largeMessages as any)[`category${i}`] = {
          [`message${i}`]: `Large message ${i} with {param}`
        };
      }

      manager.registerMessages(largeMessages);
      
      const result = manager.getMessage('category500.message500', { param: 'test' } as MessageParams, 'large' as LocaleCode);
      expect(result).toBe('Large message 500 with test');
    });
  });
});
