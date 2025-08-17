# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2024-08-17

### Added
- **String Parameter Overloads**: All schema functions now support simplified string parameter syntax for basic field name specification
  - Pass a simple string as the first parameter instead of an options object for cleaner, more concise code
  - Backward compatible - existing options object usage continues to work unchanged
  - Available across all schema types: string, number, boolean, email, URL, UUID, address, network, money, date, phone, and enum schemas
  - Example: `pz.EmailRequired("Email Address")` instead of `pz.EmailRequired({ msg: "Email Address" })`

### Enhanced
- **Error Message Localization**: Improved error message formatting to include failure reasons in URL validation
- **Test Coverage**: Comprehensive test suite for all string parameter overloads ensuring type safety and functionality
- **Documentation**: Updated all schema documentation files to include string parameter overload examples and usage patterns

### Fixed
- **URL Schema Error Messages**: Resolved double colon issue in URL validation error messages for combined protocol and hostname constraints
- **Address Schema API**: Updated address schema tests to align with new overload API using options objects

### Technical Details
- All specialized schemas (HttpsUrlRequired, HttpUrlRequired, etc.) now support string parameter overloads
- Maintained complete backward compatibility with existing options-based API
- Added extensive test coverage for overload functionality (600+ additional tests)
- Improved localization message templates to support dynamic error message formatting

## [1.4.x] - Previous Versions
- Previous features and fixes (detailed history not available in current codebase)
