const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: /username/i });
    this.passwordInput = page.getByRole('textbox', { name: /password/i });
    this.accountInput = page.getByRole('textbox', { name: /account/i });
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.loginErrorMessage = page.getByText(/invalid|incorrect|failed|error|unable/i).first();
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
  }

  async goto(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async enterUsername(username) {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password) {
    await this.passwordInput.fill(password);
  }

  async enterAccount(account) {
    await this.accountInput.fill(account);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async login({ username, password, account }) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.enterAccount(account);
    await this.clickLogin();
  }

  async waitForAuthentication() {
    // TurnCloud shows a transition page before session is ready.
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    await expect
      .poll(() => this.page.url(), { timeout: 120000 })
      .not.toContain('/loginprocess.html');
    await expect(this.page.getByText(/determining data|loading data/i)).toBeHidden({ timeout: 120000 });
  }

  async isLoginScreenVisible() {
    const [usernameVisible, passwordVisible, accountVisible, buttonVisible] = await Promise.all([
      this.usernameInput.isVisible().catch(() => false),
      this.passwordInput.isVisible().catch(() => false),
      this.accountInput.isVisible().catch(() => false),
      this.loginButton.isVisible().catch(() => false)
    ]);

    return usernameVisible && passwordVisible && accountVisible && buttonVisible;
  }

  async waitForLoginOutcome(timeout = 120000) {
    let resolvedOutcome = null;

    await expect.poll(async () => {
      const currentUrl = this.page.url();

      if (currentUrl.includes('/main.html')) {
        resolvedOutcome = 'success';
        return resolvedOutcome;
      }

      if (currentUrl.includes('/index.html') && await this.isLoginScreenVisible()) {
        resolvedOutcome = 'failure';
        return resolvedOutcome;
      }

      if (await this.isLoginScreenVisible()) {
        resolvedOutcome = 'failure';
        return resolvedOutcome;
      }

      return null;
    }, { timeout }).not.toBeNull();

    return resolvedOutcome;
  }

  async gotoMainPage(mainUrl) {
    await this.page.goto(mainUrl, { waitUntil: 'domcontentloaded' });
    await expect
      .poll(() => this.page.url(), { timeout: 30000 })
      .toContain('/main.html');
    await expect(this.loginButton).toBeHidden({ timeout: 15000 });
  }
  async assertLoginSucceeded() {
    await this.waitForAuthentication();
    await expect(this.loginButton).toBeHidden({ timeout: 30000 });
  }

  async assertLoginFailed() {
    const outcome = await this.waitForLoginOutcome(60000);
    expect(outcome).toBe('failure');
    await expect(this.loginButton).toBeVisible({ timeout: 30000 });
    await expect(this.forgotPasswordLink).toBeVisible({ timeout: 30000 });
  }

  async expectLoginFailureMessage() {
    await expect(this.loginErrorMessage).toBeVisible({ timeout: 15000 });
  }

  async loginAndOpenMain({ username, password, account, mainUrl }) {
    await this.login({ username, password, account });
    await this.waitForAuthentication();
    await this.gotoMainPage(mainUrl);
  }
}

module.exports = { LoginPage };
