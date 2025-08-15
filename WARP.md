# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Phantom Zod is a TypeScript-first schema validation library built on top of Zod v4, providing pre-built validators for common data types with comprehensive error handling and customizable messages. The library features a unified `pz` namespace for easy access to all validation schemas and includes extensive localization support.

## Development Commands

### Building & Development
```bash
npm run build          # Build TypeScript and copy localization files
npm run dev            # Watch mode compilation
```

### Testing
```bash
npm test               # Run all tests with Jest
npm run test:watch     # Run tests in watch mode  
npm run test:coverage  # Run tests with coverage report
```

### Code Quality
```bash
npm run lint           # Run ESLint on source files
npm run format         # Format code with Prettier
```

**Important**: Always run `npm run format` before committing changes. The CI/CD pipeline includes Prettier formatting checks and will fail if code is not properly formatted.

### Running Individual Tests
```bash
# Run specific test file
npx jest tests/string-schemas.test.ts
npx jest tests/email-schemas.test.ts

# Run tests matching pattern
npx jest --testNamePattern="zStringRequired"
npx jest --testPathPattern="string"
```

## Architecture Overview

### Core Design Patterns

**Factory Pattern with Dependency Injection**: All schema creators are factory functions that accept a `messageHandler` parameter, enabling consistent error message formatting across the library.

```typescript
// Example from string-schemas.ts
export const createStringSchemas = (messageHandler: ErrorMessageFormatter) => {
  const zStringRequired = (options: StringSchemaOptions = {}) => {
    // Schema creation logic with injected message handler
  };
  return { zStringRequired, zStringOptional };
};
```

**Unified Namespace (`pz`)**: All schemas are accessible through a single `pz` namespace object that aggregates exports from all schema modules, providing a consistent API surface.

```typescript
// pz.ts aggregates all schema modules
export const pz = {
  ...addressSchemas,
  ...arraySchemas,
  ...booleanSchemas,
  // ... all other schema modules
};
```

### Key Architectural Components

**Schema Modules** (`src/schemas/`): Each module handles specific validation domains (strings, emails, phones, etc.) and exports factory functions that create Zod schemas with consistent error handling.

**Localization System** (`src/localization/`): Comprehensive i18n support with:
- `LocalizationManager`: Handles locale registration, message retrieval, and fallback logic
- JSON locale files with structured message hierarchies
- Type-safe message parameter injection
- Dynamic locale switching capabilities

**Message Handling** (`src/common/message-handler.ts`): Centralized error message formatting that supports both field-name-based and custom message modes via `MsgType` enum.

**Common Utilities** (`src/common/`): Shared utilities including regex patterns, string manipulation functions, and type definitions used across schema modules.

### Schema Creation Patterns

All schemas follow consistent patterns:
- **Trimming**: String-based schemas automatically trim whitespace
- **Type Safety**: Full TypeScript inference support
- **Error Consistency**: Standardized error messages through localization system
- **Flexibility**: Support for both field-name and custom message modes
- **Extensibility**: Easy addition of constraints (min/max length, format validation, etc.)

### Test Architecture

**Table-Driven Tests**: Extensive test coverage using table-driven patterns with valid, invalid, and edge case scenarios as specified in the rules.

**Test Structure**: Tests are organized in `tests/` directory with one file per schema module, using Jest with TypeScript support and ESM configuration.

**Mock Strategy**: Tests use `createTestMessageHandler()` to create type-safe mocks for error message formatting, ensuring consistent testing of error scenarios.

## Key Implementation Details

### Data Transformation
- String schemas automatically trim input values
- Phone numbers are normalized to E.164 or national formats
- Empty/undefined values are consistently handled across schema types

### Error Message System
The library uses a two-tier message system:
- **Field Name Mode** (`MsgType.FieldName`): Uses provided string as field name in standardized error templates
- **Custom Message Mode** (`MsgType.Message`): Uses provided string as complete error message

### Localization Structure
Localization messages are organized hierarchically by validation domain (string, email, phone, etc.) with parameter interpolation support for dynamic values like minimum/maximum lengths.

### Dependencies & Build Setup
- Built with TypeScript 5.0+ using ES2020 modules
- Zod v4 as core dependency
- Jest with ts-jest for testing in ESM mode
- ESLint with TypeScript rules and naming conventions enforced
- Prettier for code formatting

## Development Tips

**Schema Extension**: When adding new schema types, follow the factory pattern and ensure localization message keys are added to locale JSON files.

**Testing**: Always create table-driven tests with comprehensive test cases covering valid inputs, invalid inputs, and edge cases. Test files should be placed in `tests/` directory.

**Error Messages**: Use the localization system for all error messages. Never hardcode error strings in schema definitions.

**Build Process**: The build step copies localization JSON files from `src/localization/locales/` to `dist/localization/locales/` - ensure new locale files are included.

**Auto-Publishing**: The repository is configured with GitHub Actions to automatically publish to npm when the version in `package.json` changes on the main branch. To trigger a release:
1. Update the version in `package.json` (e.g., from `1.2.0` to `1.3.0`)
2. Commit and merge to main
3. GitHub Actions will automatically build, test, and publish to npm
4. A git tag and GitHub release will be created automatically
