const { defineConfig } = require('@playwright/test');
const baseConfig = require('./config/playwright.base');

module.exports = defineConfig({
  ...baseConfig,
  testDir: './tests/regression'
});
