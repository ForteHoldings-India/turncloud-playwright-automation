# Project Structure

This project is split into two main areas so test execution stays clean.

## Framework

Shared automation code lives under `framework/`.

- `framework/pages/` contains page objects
- `framework/data/` contains test data
- `framework/utils/` is reserved for helpers
- `config/` contains reusable Playwright configuration

## Test Suites

Runnable specs live under `tests/`.

- `tests/functional/` contains baseline workflow or reference tests
- `tests/regression/` contains only regression cases

Useful suite commands:

- `npm run test:functional`
- `npm run test:functional:headed`
- `npm run test:regression`
- `npm run test:regression:patients`
