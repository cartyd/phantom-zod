# Contributing to Phantom Zod

Thank you for your interest in contributing to Phantom Zod! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Architecture Overview](#architecture-overview)
- [Pull Request Process](#pull-request-process)
- [Development Tips](#development-tips)

## Getting Started

Phantom Zod is a TypeScript-first schema validation library built on top of Zod v4, providing pre-built validators for common data types with comprehensive error handling and customizable messages.

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Git
- TypeScript knowledge

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/phantom-zod.git
   cd phantom-zod
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Verify setup by running tests:
   ```bash
   npm test
   ```

## Development Workflow

### Branch Protection

The `main` branch is protected and requires pull requests for all changes. This ensures code quality and allows for proper review of contributions.

### Contributing Options

#### Option 1: Feature Branch (Recommended)

This is the standard workflow for most contributions:

1. **Create a feature branch** from main:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-description
   ```

2. **Make your changes** and commit them
3. **Push your branch** and create a pull request

#### Option 2: Fork and Pull Request

If you don't have write access to the repository:

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your changes
4. **Push to your fork** and create a pull request from your fork to the main repository

### Branch Naming Conventions

Use descriptive branch names with these prefixes:

- `feature/` - New features or enhancements
- `fix/` - Bug fixes  
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or improvements

Examples:
- `feature/add-email-validation`
- `fix/phone-number-parsing`
- `docs/update-contributing-guide`

### Development Process

1. **Create your branch** using the options above
2. **Make your changes** with proper tests
3. **Format your code**: `npm run format`
4. **Run tests**: `npm test`
5. **Run linting**: `npm run lint`
6. **Commit with clear messages**
7. **Push your branch**
8. **Create a pull request** through GitHub

### Example Workflow

```bash
# Start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/add-currency-validation

# Make your changes...
# Write tests...

# Verify everything works
npm run format
npm test
npm run lint

# Commit your work
git add .
git commit -m "feat: add currency validation schema with comprehensive tests"

# Push and create PR
git push origin feature/add-currency-validation
# Then create PR through GitHub interface
```

## Code Standards

### TypeScript

- Use TypeScript for all code
- Follow existing code patterns and conventions
- Ensure type safety - minimize use of `any` types
- Use meaningful variable and function names
- Follow the existing architectural patterns

### Code Formatting

- **Always run `npm run format`** before committing
- We use Prettier for consistent code formatting
- ESLint enforces code quality rules
- The CI/CD pipeline will check formatting automatically

### File Organization

- Schema modules: `src/schemas/`
- Tests: `tests/` (one test file per schema module)
- Common utilities: `src/common/`
- Localization: `src/localization/`
- Types: `src/common/types/`

## Testing Requirements

### Test Coverage

All new features should include comprehensive tests covering:

- ✅ **Valid input scenarios** - Test successful validation cases
- ❌ **Invalid input scenarios** - Test error cases and messages  
- 🔄 **Edge cases** - Test boundary conditions and unusual inputs
- 📝 **Type safety** - Verify TypeScript inference works correctly

### Test Structure

We use **table-driven test patterns** for comprehensive coverage:

```typescript
describe('YourSchema', () => {
  const validCases = [
    { input: 'valid input 1', expected: 'expected output 1' },
    { input: 'valid input 2', expected: 'expected output 2' },
  ];

  const invalidCases = [
    { input: 'invalid input 1', expectedError: 'Expected error message' },
    { input: 'invalid input 2', expectedError: 'Expected error message' },
  ];

  test.each(validCases)('should accept valid input: $input', ({ input, expected }) => {
    const result = schema.parse(input);
    expect(result).toBe(expected);
  });

  test.each(invalidCases)('should reject invalid input: $input', ({ input, expectedError }) => {
    expect(() => schema.parse(input)).toThrow(expectedError);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx jest tests/string-schemas.test.ts

# Run tests matching a pattern
npx jest --testNamePattern="StringRequired"
```

## Architecture Overview

### Design Patterns

**Factory Pattern**: Schema creators are factory functions that accept a `messageHandler` parameter for consistent error message formatting.

**Unified Namespace**: All schemas are accessible through the `pz` namespace object that aggregates exports from all schema modules.

### Key Components

- **Schema Modules** (`src/schemas/`): Domain-specific validation (strings, emails, phones, etc.)
- **Localization System** (`src/localization/`): Internationalization support with type-safe message handling
- **Message Handling** (`src/common/message-handler.ts`): Centralized error message formatting
- **Common Utilities** (`src/common/`): Shared utilities and type definitions

### Schema Creation Patterns

All schemas follow consistent patterns:

- **Trimming**: String-based schemas automatically trim whitespace
- **Type Safety**: Full TypeScript inference support  
- **Error Consistency**: Standardized error messages through localization
- **Flexibility**: Support for both field-name and custom message modes
- **Extensibility**: Easy addition of constraints and validation rules

## Pull Request Process

### Before Creating a PR

1. **Sync with main** if working on a long-running branch:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-feature-branch
   git merge main
   ```

2. **Verify everything works**:
   ```bash
   npm run format  # Format code
   npm run lint    # Check code quality  
   npm test        # Run all tests
   npm run build   # Verify build works
   ```

3. **Update documentation** if needed:
   - Add examples to relevant schema documentation in `docs/schemas/`
   - Update README.md for new major features
   - Include JSDoc comments for new public APIs

### PR Guidelines

- **Clear title**: Describe what the PR accomplishes
- **Detailed description**: 
  - Explain the changes and motivation
  - Reference related issues
  - Include usage examples for new features
  - Note any breaking changes
- **Complete testing**: All tests should pass
- **Updated docs**: Keep documentation current
- **Single focus**: One feature or fix per PR when possible

### PR Review Process

1. **Automated checks** will run (tests, linting, formatting)
2. **Manual review** by maintainers
3. **Feedback incorporation** if requested
4. **Approval and merge** by maintainers

## Development Tips

### Adding New Schema Types

1. **Follow existing patterns** in `src/schemas/`
2. **Add localization keys** in locale JSON files
3. **Create comprehensive tests** using table-driven patterns
4. **Document the new schema** in `docs/schemas/`
5. **Export in the pz namespace** in `pz.ts`

### Error Message Best Practices

- Use the localization system for consistency
- Support both `MsgType.FieldName` and `MsgType.Message` modes
- Provide clear, actionable error messages
- Test error messages thoroughly

### Performance Considerations

- Keep schema creation efficient
- Optimize for common validation scenarios
- Avoid unnecessary object creation
- Consider memory usage for large applications

### TypeScript Guidelines

- Leverage TypeScript's type inference
- Use generic types appropriately
- Provide clear type definitions for public APIs
- Maintain type safety without excessive complexity

## Getting Help

- **Documentation**: Check the [docs/](docs/) directory
- **Examples**: Look at existing schemas in `src/schemas/`
- **Issues**: Search [GitHub Issues](https://github.com/cartyd/phantom-zod/issues) for similar questions
- **Discussions**: Create an issue for questions or feature discussions

## Types of Contributions Welcome

- 🐛 **Bug fixes**
- ✨ **New schema types**
- 📚 **Documentation improvements**
- 🧪 **Test coverage enhancements**
- 🌍 **Localization additions**
- ⚡ **Performance improvements**
- 💡 **Feature suggestions**

## Code of Conduct

- Be respectful and constructive
- Focus on helpful feedback
- Welcome newcomers and help them learn
- Follow established project conventions

Thank you for contributing to Phantom Zod! Your contributions help make schema validation better for everyone. 🎉
