import { MessageHandler, IMessageHandler, createMessageHandler, FormatErrorOptions } from '../src/common/message-handler';
import { Logger } from '../src/common/logger';
import { LocalizationManager } from '../src/localization';
import { MsgType } from '../src/schemas/msg-type';
import type { LocaleCode, MessageParams } from '../src/localization/types';

// Mock Logger implementation
const createMockLogger = (): Logger => ({
  warn: jest.fn(),
  debug: jest.fn(),
});

// Mock LocalizationManager implementation
const createMockLocalizationManager = (): jest.Mocked<LocalizationManager> => ({
  getMessage: jest.fn(),
  setLocale: jest.fn(),
  getLocale: jest.fn(),
  setFallbackLocale: jest.fn(),
  getFallbackLocale: jest.fn(),
  loadLocale: jest.fn(),
  loadLocales: jest.fn(),
  ensureLocaleLoaded: jest.fn(),
  registerMessages: jest.fn(),
  hasLocale: jest.fn(),
  getAvailableLocales: jest.fn(),
  getSupportedLocales: jest.fn(),
  getErrorMessage: jest.fn(),
  setLogger: jest.fn(),
} as any);

describe('MessageHandler', () => {
  let mockLogger: Logger;
  let mockLocalizationManager: jest.Mocked<LocalizationManager>;
  let messageHandler: MessageHandler;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockLocalizationManager = createMockLocalizationManager();
    messageHandler = new MessageHandler(mockLogger, mockLocalizationManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor and Interface Compliance', () => {
    test('should implement IMessageHandler interface', () => {
      expect(messageHandler).toHaveProperty('formatErrorMessage');
      expect(typeof messageHandler.formatErrorMessage).toBe('function');
    });

    test('should create instance with dependencies', () => {
      expect(messageHandler).toBeInstanceOf(MessageHandler);
    });
  });

  describe('formatErrorMessage', () => {
    describe('Message Type Handling', () => {
      test('should return message directly for MsgType.Message', () => {
        const options: FormatErrorOptions = {
          msg: 'Custom error message',
          msgType: MsgType.Message,
        };

        const result = messageHandler.formatErrorMessage(options);

        expect(result).toBe('Custom error message');
        expect(mockLocalizationManager.getMessage).not.toHaveBeenCalled();
      });

      test('should process field name messages', () => {
        mockLocalizationManager.getMessage.mockReturnValue('is required');

        const options: FormatErrorOptions = {
          msg: 'Username',
          msgType: MsgType.FieldName,
          messageKey: 'string.required',
        };

        const result = messageHandler.formatErrorMessage(options);

        expect(result).toBe('Username is required');
        expect(mockLocalizationManager.getMessage).toHaveBeenCalledWith('string.required', undefined);
      });
    });

    describe('Message Key Resolution', () => {
      test('should retrieve localized message successfully', () => {
        mockLocalizationManager.getMessage.mockReturnValue('must be valid');

        const options: FormatErrorOptions = {
          msg: 'Email',
          msgType: MsgType.FieldName,
          messageKey: 'string.invalid',
        };

        const result = messageHandler.formatErrorMessage(options);

        expect(result).toBe('Email must be valid');
        expect(mockLocalizationManager.getMessage).toHaveBeenCalledWith('string.invalid', undefined);
      });

      test('should pass parameters to localization manager', () => {
        mockLocalizationManager.getMessage.mockReturnValue('is too short (minimum: 5 characters)');

        const params: MessageParams = { min: 5 };
        const options: FormatErrorOptions = {
          msg: 'Password',
          msgType: MsgType.FieldName,
          messageKey: 'string.tooShort',
          params,
        };

        const result = messageHandler.formatErrorMessage(options);

        expect(result).toBe('Password is too short (minimum: 5 characters)');
        expect(mockLocalizationManager.getMessage).toHaveBeenCalledWith('string.tooShort', params);
      });

      test('should handle localization manager returning the key (no message found)', () => {
        // When no message is found, localization manager returns the key itself
        mockLocalizationManager.getMessage
          .mockReturnValueOnce('string.invalid') // First call returns key (no message found)
          .mockReturnValueOnce('is invalid'); // Fallback call succeeds

        const options: FormatErrorOptions = {
          msg: 'Email',
          msgType: MsgType.FieldName,
          messageKey: 'string.invalid',
        };

        const result = messageHandler.formatErrorMessage(options);

        expect(result).toBe('Email is invalid');
        expect(mockLocalizationManager.getMessage).toHaveBeenCalledTimes(2);
        expect(mockLocalizationManager.getMessage).toHaveBeenNthCalledWith(1, 'string.invalid', undefined);
        expect(mockLocalizationManager.getMessage).toHaveBeenNthCalledWith(2, 'string.invalid', undefined);
      });
    });

    describe('Fallback Handling', () => {
      test('should use fallback when message key not found', () => {
        mockLocalizationManager.getMessage.mockReturnValue('string.invalid'); // Returns key (not found)

        const options: FormatErrorOptions = {
          msg: 'Email',
          msgType: MsgType.FieldName,
          messageKey: 'string.invalid',
          fallback: 'must be a valid email',
        };

        const result = messageHandler.formatErrorMessage(options);

        expect(result).toBe('Email must be a valid email');
      });

      test('should use default error message when no fallback provided', () => {
        mockLocalizationManager.getMessage
          .mockReturnValueOnce('string.invalid') // Primary key returns key (not found)
          .mockReturnValueOnce('is invalid'); // Default key succeeds

        const options: FormatErrorOptions = {
          msg: 'Email',
          msgType: MsgType.FieldName,
          messageKey: 'string.invalid',
        };

        const result = messageHandler.formatErrorMessage(options);

        expect(result).toBe('Email is invalid');
        expect(mockLocalizationManager.getMessage).toHaveBeenNthCalledWith(2, 'string.invalid', undefined);
      });

      test('should return only field name when all lookups fail', () => {
        // Mock to return the key itself for both the requested key and default key (indicating no messages found)
        mockLocalizationManager.getMessage
          .mockReturnValueOnce('nonexistent.key') // First call returns key (no message found)
          .mockReturnValueOnce('string.invalid'); // Default key also returns key (no message found)

        const options: FormatErrorOptions = {
          msg: 'Email',
          msgType: MsgType.FieldName,
          messageKey: 'nonexistent.key',
        };

        const result = messageHandler.formatErrorMessage(options);

        // When content is empty string, constructMessage returns just the msg without space
        expect(result).toBe('Email');
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'No valid message content found',
          {
            messageKey: 'nonexistent.key',
            component: 'formatErrorMessage',
          }
        );
        // Should try the key first, then try the default error message key
        expect(mockLocalizationManager.getMessage).toHaveBeenCalledWith('nonexistent.key', undefined);
        expect(mockLocalizationManager.getMessage).toHaveBeenCalledWith('string.invalid', undefined);
      });
    });

    describe('Error Handling', () => {
      test('should handle localization manager throwing error', () => {
        const error = new Error('Localization failed');
        mockLocalizationManager.getMessage.mockImplementation(() => {
          throw error;
        });

        const options: FormatErrorOptions = {
          msg: 'Email',
          msgType: MsgType.FieldName,
          messageKey: 'string.invalid',
          fallback: 'is invalid',
        };

        const result = messageHandler.formatErrorMessage(options);

        expect(result).toBe('Email is invalid');
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'Failed to retrieve localized message',
          {
            messageKey: 'string.invalid',
            error: 'Localization failed',
          }
        );
      });

      test('should handle non-Error exceptions', () => {
        mockLocalizationManager.getMessage.mockImplementation(() => {
          throw 'String error';
        });

        const options: FormatErrorOptions = {
          msg: 'Email',
          msgType: MsgType.FieldName,
          messageKey: 'string.invalid',
          fallback: 'is invalid',
        };

        const result = messageHandler.formatErrorMessage(options);

        expect(result).toBe('Email is invalid');
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'Failed to retrieve localized message',
          {
            messageKey: 'string.invalid',
            error: 'String error',
          }
        );
      });
    });

    describe('Logging', () => {
      test('should log debug information when debug logger provided', () => {
        mockLocalizationManager.getMessage.mockReturnValue('is required');

        const options: FormatErrorOptions = {
          msg: 'Username',
          msgType: MsgType.FieldName,
          messageKey: 'string.required',
          params: { min: 3 },
          fallback: 'is required',
        };

        messageHandler.formatErrorMessage(options);

        expect(mockLogger.debug).toHaveBeenCalledWith(
          'Error message formatted',
          {
            messageKey: 'string.required',
            params: { min: 3 },
            fallback: 'is required',
            component: 'formatErrorMessage',
          }
        );
      });

      test('should not throw when debug logger not provided', () => {
        const loggerWithoutDebug: Logger = { warn: jest.fn() };
        const handlerWithoutDebug = new MessageHandler(loggerWithoutDebug, mockLocalizationManager);
        mockLocalizationManager.getMessage.mockReturnValue('is required');

        const options: FormatErrorOptions = {
          msg: 'Username',
          msgType: MsgType.FieldName,
          messageKey: 'string.required',
        };

        expect(() => handlerWithoutDebug.formatErrorMessage(options)).not.toThrow();
      });
    });

    describe('Edge Cases', () => {
      test('should handle undefined messageKey', () => {
        const options: FormatErrorOptions = {
          msg: 'Email',
          msgType: MsgType.FieldName,
          fallback: 'is invalid',
        };

        const result = messageHandler.formatErrorMessage(options);

        expect(result).toBe('Email is invalid');
        expect(mockLocalizationManager.getMessage).not.toHaveBeenCalled();
      });

      test('should handle empty string messageKey', () => {
        // For empty string key, the `if (messageKey)` condition is false (falsy),
        // so it skips directly to the default key without calling getMessage with empty string
        mockLocalizationManager.getMessage.mockReturnValue('string.invalid'); // Default key returns key (no message found)

        const options: FormatErrorOptions = {
          msg: 'Email',
          msgType: MsgType.FieldName,
          messageKey: '',
        };

        const result = messageHandler.formatErrorMessage(options);

        // Since empty string is falsy, it skips to default key, which also fails
        expect(result).toBe('Email');
        expect(mockLocalizationManager.getMessage).toHaveBeenCalledWith('string.invalid', undefined);
        expect(mockLocalizationManager.getMessage).not.toHaveBeenCalledWith('', undefined);
      });

      test('should handle empty msg', () => {
        mockLocalizationManager.getMessage.mockReturnValue('is required');

        const options: FormatErrorOptions = {
          msg: '',
          msgType: MsgType.FieldName,
          messageKey: 'string.required',
        };

        const result = messageHandler.formatErrorMessage(options);

        expect(result).toBe(' is required');
      });

      test('should handle undefined params', () => {
        mockLocalizationManager.getMessage.mockReturnValue('is required');

        const options: FormatErrorOptions = {
          msg: 'Username',
          msgType: MsgType.FieldName,
          messageKey: 'string.required',
          params: undefined,
        };

        const result = messageHandler.formatErrorMessage(options);

        expect(result).toBe('Username is required');
        expect(mockLocalizationManager.getMessage).toHaveBeenCalledWith('string.required', undefined);
      });
    });
  });

  describe('Integration with Factory Function', () => {
    test('createMessageHandler should return IMessageHandler instance', () => {
      const handler = createMessageHandler(mockLogger, mockLocalizationManager);

      expect(handler).toBeInstanceOf(MessageHandler);
      expect(typeof handler.formatErrorMessage).toBe('function');
    });

    test('factory-created handler should behave identically', () => {
      const factoryHandler = createMessageHandler(mockLogger, mockLocalizationManager);
      mockLocalizationManager.getMessage.mockReturnValue('is required');

      const options: FormatErrorOptions = {
        msg: 'Username',
        msgType: MsgType.FieldName,
        messageKey: 'string.required',
      };

      const directResult = messageHandler.formatErrorMessage(options);
      
      // Reset mock to ensure clean test
      jest.clearAllMocks();
      mockLocalizationManager.getMessage.mockReturnValue('is required');
      
      const factoryResult = factoryHandler.formatErrorMessage(options);

      expect(factoryResult).toBe(directResult);
      expect(factoryResult).toBe('Username is required');
    });
  });

  describe('Type Compatibility', () => {
    test('should be assignable to IMessageHandler interface', () => {
      const handler: IMessageHandler = messageHandler;
      expect(typeof handler.formatErrorMessage).toBe('function');
    });

    test('should accept all valid FormatErrorOptions combinations', () => {
      const testCases: FormatErrorOptions[] = [
        { msg: 'Test', msgType: MsgType.Message },
        { msg: 'Test', msgType: MsgType.FieldName, messageKey: 'key' },
        { msg: 'Test', msgType: MsgType.FieldName, fallback: 'fallback' },
        { msg: 'Test', msgType: MsgType.FieldName, messageKey: 'key', params: { min: 1 } },
        { msg: 'Test', msgType: MsgType.FieldName, messageKey: 'key', params: { min: 1 }, fallback: 'fallback' },
      ];

      mockLocalizationManager.getMessage.mockReturnValue('test message');

      testCases.forEach((options, index) => {
        expect(() => messageHandler.formatErrorMessage(options)).not.toThrow();
      });
    });
  });
});
