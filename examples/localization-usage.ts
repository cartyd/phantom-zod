import { zStringRequired, zStringOptional } from '../src/schemas/string-schemas';
import { localizationManager, loadLocale, getMessage } from '../src/localization';
import { MsgType } from '../src/schemas/msg-type';

async function demonstrateLocalization() {
  // Example 1: Basic usage with English (default)
  console.log('=== Basic Usage (English) ===');

  const usernameSchema = zStringRequired('Username', MsgType.FieldName, 3, 20, 'en');

  try {
    console.log('Valid:', usernameSchema.parse('alice')); // "alice"
  } catch (error) {
    console.log('Error:', error.errors[0].message);
  }

  try {
    usernameSchema.parse('ab'); // Too short
  } catch (error) {
    console.log('Error:', error.errors[0].message); // "Username is too short (minimum: 3 characters)"
  }

  try {
    usernameSchema.parse(''); // Required
  } catch (error) {
    console.log('Error:', error.errors[0].message); // "Username is required"
  }

  // Example 2: Spanish locale
  console.log('\n=== Spanish Locale ===');
  
  try {
    await loadLocale('es');
    
    const usernameSchemaEs = zStringRequired('Nombre de usuario', MsgType.FieldName, 3, 20, 'es');
    
    try {
      usernameSchemaEs.parse('ab'); // Too short
    } catch (error) {
      console.log('Spanish Error:', error.errors[0].message); // "Nombre de usuario es demasiado corto (mínimo: 3 caracteres)"
    }
    
    try {
      usernameSchemaEs.parse(''); // Required
    } catch (error) {
      console.log('Spanish Error:', error.errors[0].message); // "Nombre de usuario es requerido"
    }
  } catch (error) {
    console.log('Could not load Spanish locale:', error.message);
  }

  // Example 3: Optional string with constraints
  console.log('\n=== Optional String ===');

  const descriptionSchema = zStringOptional('Description', MsgType.FieldName, undefined, 100, 'en');

  try {
    console.log('Valid:', descriptionSchema.parse('A short description')); // "A short description"
    console.log('Valid (empty):', descriptionSchema.parse('')); // ""
    console.log('Valid (undefined):', descriptionSchema.parse(undefined)); // ""
  } catch (error) {
    console.log('Error:', error.errors[0].message);
  }

  // Example 4: Custom message type (bypasses localization)
  console.log('\n=== Custom Messages ===');

  const customSchema = zStringRequired('This field must be filled out', MsgType.Message);

  try {
    customSchema.parse('');
  } catch (error) {
    console.log('Custom message:', error.errors[0].message); // "This field must be filled out"
  }

  // Example 5: Direct message access
  console.log('\n=== Direct Message Access ===');
  console.log('Available locales:', localizationManager.getAvailableLocales());
  
  // English messages
  console.log('English "string.required":', getMessage('string.required', undefined, 'en'));
  console.log('English "string.tooShort" with params:', getMessage('string.tooShort', { min: '5' }, 'en'));
  
  // Spanish messages (if loaded)
  if (localizationManager.hasLocale('es')) {
    console.log('Spanish "string.required":', getMessage('string.required', undefined, 'es'));
    console.log('Spanish "string.tooShort" with params:', getMessage('string.tooShort', { min: '5' }, 'es'));
  }

  // Example 6: Fallback behavior
  console.log('\n=== Fallback Behavior ===');
  console.log('Non-existent key:', getMessage('nonexistent.key', undefined, 'en')); // Returns key itself
  console.log('Non-existent locale falls back to English:', getMessage('string.required', undefined, 'fr' as any));
}

// Run the demonstration
demonstrateLocalization().catch(console.error);
