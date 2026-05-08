const { test } = require('@playwright/test');
const { LoginPage } = require('../../../framework/pages/loginTabScreen/loginPage');
const { loginData } = require('../../../framework/data/loginData');

function buildInvalidLoginData(overrides) {
  return {
    ...loginData,
    ...overrides
  };
}

test.describe('TurnCloud Login Negative Regression', () => {
  test.describe.configure({ timeout: 180000 });

  test('Negative: invalid password does not allow login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const invalidLogin = buildInvalidLoginData({
      password: `${loginData.password}_invalid`
    });

    await loginPage.goto(loginData.url);
    await loginPage.login(invalidLogin);
    await loginPage.assertLoginFailed();
  });

  test('Negative: invalid username does not allow login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const invalidLogin = buildInvalidLoginData({
      username: `${loginData.username}_invalid`
    });

    await loginPage.goto(loginData.url);
    await loginPage.login(invalidLogin);
    await loginPage.assertLoginFailed();
  });

  test('Negative: invalid account does not allow login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const invalidLogin = buildInvalidLoginData({
      account: `${loginData.account}999`
    });

    await loginPage.goto(loginData.url);
    await loginPage.login(invalidLogin);
    await loginPage.assertLoginFailed();
  });
});
