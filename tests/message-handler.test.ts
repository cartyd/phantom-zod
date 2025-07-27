import { MessageHandler, createMessageHandler } from '../src/localization/message-handler';
import type { ErrorMessageFormatter } from '../src/localization/message-handler.types';
import type { Logger } from '../src/common/types/logger.types';
import { LocalizationManager } from '../src/localization/manager';

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
  getMessageKeys: jest.fn(),
  isMessageDefined: jest.fn(),
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

  test('should implement ErrorMessageFormatter interface', () => {
    expect(messageHandler).toHaveProperty('formatErrorMessage');
    expect(typeof messageHandler.formatErrorMessage).toBe('function');
  });

  test('should create instance with dependencies', () => {
    expect(messageHandler).toBeInstanceOf(MessageHandler);
  });

  test('should be assignable to ErrorMessageFormatter', () => {
    const handler: ErrorMessageFormatter = messageHandler;
    expect(typeof handler.formatErrorMessage).toBe('function');
  });

  test('createMessageHandler returns ErrorMessageFormatter', () => {
    const handler = createMessageHandler(mockLogger, mockLocalizationManager);

    expect(handler).toBeInstanceOf(MessageHandler);
    expect(typeof handler.formatErrorMessage).toBe('function');
  });
});
