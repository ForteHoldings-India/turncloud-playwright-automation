const { test } = require('@playwright/test');
const { LoginPage } = require('../../../framework/pages/loginTabScreen/loginPage');
const { loginData } = require('../../../framework/data/loginData');

test.describe('TurnCloud Login Positive Regression', () => {
  test.describe.configure({ timeout: 180000 });

  test('Positive: valid login succeeds', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto(loginData.url);
    await loginPage.login(loginData);
    await loginPage.assertLoginSucceeded();
  });
});
