/**
 * Example showing how to set up global logger and localization
 * for consistent behavior across all schema validations
 */

import { 
  setLogger, 
  setLocale, 
  setLocalizationManager,
  getLogger,
  getLocale,
  getLocalizationManager
} from '../src/common/message-handler';
import { LocalizationManager } from '../src/localization';
import { zStringRequired } from '../src/schemas/string-schemas';
import { zEmailRequired } from '../src/schemas/email-schemas';
import { zIPv4Required } from '../src/schemas/network-schemas';

// Example: Set up a custom logger
const customLogger = {
  warn: (message: string, meta?: any) => {
    console.error(`[VALIDATION WARNING]: ${message}`, meta);
  },
  debug: (message: string, meta?: any) => {
    console.log(`[VALIDATION DEBUG]: ${message}`, meta);
  }
};

// Example: Set up global configuration
function setupGlobalConfig() {
  // Set global logger - all schemas will use this logger
  setLogger(customLogger);
  
  // Set global locale - all schemas will use this locale
  setLocale('en');
  
  // Optionally set a custom localization manager
  // const customLocalizationManager = new LocalizationManager();
  // setLocalizationManager(customLocalizationManager);

  console.log('Global configuration set:');
  console.log('- Logger:', typeof getLogger());
  console.log('- Locale:', getLocale());
  console.log('- Localization Manager:', typeof getLocalizationManager());
}

// Example: Use schemas with global configuration
function exampleUsage() {
  setupGlobalConfig();

  // All these schemas will use the global logger and locale
  const nameSchema = zStringRequired('Name');
  const emailSchema = zEmailRequired('Email');
  const ipSchema = zIPv4Required('IP Address');

  console.log('\n--- Testing schemas with global config ---');

  try {
    nameSchema.parse(''); // Should trigger validation error
  } catch (error) {
    console.log('Name validation error:', error.issues[0].message);
  }

  try {
    emailSchema.parse('invalid-email'); // Should trigger validation error
  } catch (error) {
    console.log('Email validation error:', error.issues[0].message);
  }

  try {
    ipSchema.parse('999.999.999.999'); // Should trigger validation error
  } catch (error) {
    console.log('IP validation error:', error.issues[0].message);
  }

  console.log('\n--- Valid inputs ---');
  console.log('Valid name:', nameSchema.parse('John Doe'));
  console.log('Valid email:', emailSchema.parse('john@example.com'));
  console.log('Valid IP:', ipSchema.parse('192.168.1.1'));
}

// Run the example
if (require.main === module) {
  exampleUsage();
}

export { setupGlobalConfig, exampleUsage };
