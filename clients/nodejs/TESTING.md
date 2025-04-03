# Testing the GOV.UK One Login Example Client

This document provides instructions on how to run the test suite for the GOV.UK One Login example client.

## Overview

The test suite includes unit tests for:

- Configuration management
- Controllers (authorize, callback, logout)
- Helper functions (authorization, crypto, discovery, user status)
- Main application routes

## Prerequisites

Before running the tests, make sure you have the following installed:

- Node.js (version 22.x or later recommended)
- npm (comes with Node.js)

## Running Tests

### Installing Dependencies

First, install all the required dependencies by running:

```bash
npm ci
```

### Running the Test Suite

To run the entire test suite:

```bash
npm test
```

### Running Tests with Coverage

To run tests with coverage reporting:

```bash
npm run test:coverage
```

This will generate a coverage report in the `coverage` directory. Open `coverage/lcov-report/index.html` in a browser to view the detailed report.

## Understanding the Test Structure

The tests are organized to match the application structure:

- `tests/config.test.ts` - Tests for the configuration singleton
- `tests/app.test.ts` - Tests for the main application routes
- `tests/components/` - Tests for controllers:
  - `authorize/authorize-controller.test.ts`
  - `callback/callback-controller.test.ts`
  - `logout/logout-controller.test.ts`
- `tests/helpers/` - Tests for helper functions:
  - `authorize-request.test.ts`
  - `crypto.test.ts`
  - `discovery-request.test.ts`
  - `user-status.test.ts`

## Mock Environment

Tests use a mock environment with test values specified in:

- `.env.test` - Test environment variables
- `tests/setup.ts` - Global test setup and mocks

## Adding New Tests

When adding new features to the application, follow these guidelines for testing:

1. Create a new test file in the appropriate directory that matches the application structure
2. Use descriptive test names that explain what is being tested
3. Arrange your tests with setup, execution, and assertions clearly separated
4. Mock external dependencies to avoid network calls during testing
5. Add the new tests to appropriate test suites

## Continuous Integration

Tests are automatically run in the CI pipeline. Make sure all tests pass before submitting a pull request.

## Common Testing Patterns

### Testing Controllers

Controllers should be tested by mocking the request, response, and next function:

```typescript
const req = { /* mock request */ };
const res = { redirect: jest.fn(), cookie: jest.fn() };
const next = jest.fn();

await myController(req as Request, res as Response, next);

// Assertions
expect(res.redirect).toHaveBeenCalledWith('/expected-path');
```

### Testing Helpers

Helper functions are tested by mocking their dependencies and verifying their output:

```typescript
// Mock dependencies
jest.spyOn(dependency, 'method').mockReturnValue(mockValue);

// Call the helper
const result = myHelper(input);

// Assertions
expect(result).toEqual(expectedOutput);
```

### Testing Error Handling

Test both successful and error cases:

```typescript
// Test error scenario
jest.spyOn(dependency, 'method').mockRejectedValue(new Error('Test error'));

await myFunction(input);

expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
```
