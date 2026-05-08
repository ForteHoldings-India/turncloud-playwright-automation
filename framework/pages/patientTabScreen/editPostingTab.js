const { expect } = require('@playwright/test');

class EditPostingTab {
  constructor(page, workspace) {
    this.page = page;
    this.workspace = workspace;

    this.financialsTopTab = page.getByRole('tab', { name: /Financials/i });
    this.editPostingNav = page
      .getByRole('treeitem', { name: /Edit Posting/i })
      .or(page.getByRole('tab', { name: /Edit Posting/i }))
      .or(page.getByText(/^Edit Posting$/i).first());
    this.editPostingTitle = page.getByText(/Edit Posting/i).first();
    this.addNewChargeButton = page.locator('#LedgerNextAddChargeBtn');
    this.confirmChargeButton = page.locator('.k-button.k-rounded-md.k-button-flat.k-button-flat-success:visible').last();
    this.saveChangesButton = page.getByRole('button', { name: /Save Changes/i });
    this.addNewPaymentButton = page.getByRole('button', { name: /Add New Payment/i });
    this.postingRows = page
      .locator('[role="treegrid"] [role="row"]:visible')
      .filter({ has: page.locator('[role="gridcell"]') });
    this.activeEditRow = page.locator('tr.k-grid-edit-row:visible').last();
    this.activeFeeCodeInput = page.locator("tr.k-grid-edit-row input[name='feeCode']");
    this.activeTextbox = page.getByRole('textbox').last();
    this.paymentWindow = page.locator('.k-window:visible').filter({ hasText: /Payment|Split Payments/i }).last();
    this.paymentAmountInput = this.paymentWindow.getByRole('spinbutton').first();
    this.paymentTypeDropdown = page.locator("span[aria-owns='LNPayWindowTypeDropdown_listbox']");
    this.paymentTypeOptions = page.locator("#LNPayWindowTypeDropdown-list ul span");
    this.splitPaymentsButton = this.paymentWindow.locator("#LNPayWindowSplitBtn");
    this.savePaymentButton = this.paymentWindow.locator("#LNPayWindowSaveBtn");
    this.finalSaveButton = page.getByRole('button', { name: /^Save$/i });
    this.insuranceBalanceValue = page
      .getByText(/^Insurance Balance:$/i)
      .first()
      .locator('xpath=following-sibling::*[1]');
    this.patientBalanceValue = page
      .getByText(/^Patient Balance:$/i)
      .first()
      .locator('xpath=following-sibling::*[1]');
    this.insuranceCreditValue = page
      .getByText(/^Insurance Credit:$/i)
      .first()
      .locator('xpath=following-sibling::*[1]');
    this.patientCreditValue = page
      .getByText(/^Patient Credit:$/i)
      .first()
      .locator('xpath=following-sibling::*[1]');
  }

  escapeRegex(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async openEditPostingTab() {
    if (!(await this.editPostingNav.isVisible().catch(() => false))) {
      await expect(this.financialsTopTab).toBeVisible({ timeout: 30000 });
      await this.financialsTopTab.click();
      await this.workspace.settleUi(500);
    }

    await expect(this.editPostingNav).toBeVisible({ timeout: 30000 });
    await this.editPostingNav.click();
    await expect(this.editPostingTitle).toBeVisible({ timeout: 30000 });
    await expect(this.addNewChargeButton).toBeVisible({ timeout: 30000 });
    await this.workspace.settleUi(500);
  }

  async addNewCharge({ chargeCode = 'Fee 8', saveAfter = true } = {}) {
    await expect(this.addNewChargeButton).toBeVisible({ timeout: 30000 });
    await expect(this.addNewChargeButton).toBeEnabled({ timeout: 30000 });
    await this.addNewChargeButton.scrollIntoViewIfNeeded();
    await this.page.mouse.wheel(0, 800);
    await this.workspace.settleUi(500);
    await expect(this.addNewChargeButton).toBeVisible({ timeout: 30000 });
    await this.addNewChargeButton.click({ force: true });
    await this.workspace.settleUi(1000);

    const feeCodeCell = this.page.getByRole('gridcell').filter({ hasText: /^$/ }).nth(3);
    await expect(feeCodeCell).toBeVisible({ timeout: 30000 });
    await feeCodeCell.click({ force: true });
    await this.workspace.settleUi(300);

    const feeCodeInput = this.page.getByRole('textbox').last();

    if (await feeCodeInput.isVisible().catch(() => false)) {
      await feeCodeInput.click({ force: true });
      await feeCodeInput.fill(chargeCode);
      await feeCodeInput.press('Enter');
    } else {
      await this.page.keyboard.type(chargeCode, { delay: 50 });
      await this.page.keyboard.press('Enter');
    }

    await expect(this.page.getByRole('row', { name: new RegExp(this.escapeRegex(chargeCode), 'i') }).first()).toBeVisible({ timeout: 30000 });

    if (saveAfter) {
      await this.saveChanges();
    }
  }

  async saveChanges() {
    await expect(this.saveChangesButton).toBeVisible({ timeout: 30000 });
    await this.saveChangesButton.scrollIntoViewIfNeeded();
    await this.saveChangesButton.click();
    await this.workspace.settleUi(1000);
  }

  async expectInsuranceBalance(amount) {
    await this.expectBalance(this.insuranceBalanceValue, amount);
  }

  async expectPatientBalance(amount) {
    await this.expectBalance(this.patientBalanceValue, amount);
  }

  async expectInsuranceCredit(amount) {
    await this.expectBalance(this.insuranceCreditValue, amount);
  }

  async expectPatientCredit(amount) {
    await this.expectBalance(this.patientCreditValue, amount);
  }

  async expectNetInsuranceBalance(balanceAmount, creditAmount, expectedNetAmount) {
    expect(Number(balanceAmount) - Number(creditAmount)).toBe(Number(expectedNetAmount));
    await this.expectInsuranceBalance(balanceAmount);
    await this.expectInsuranceCredit(creditAmount);
  }

  async expectNetPatientBalance(balanceAmount, creditAmount, expectedNetAmount) {
    expect(Number(balanceAmount) - Number(creditAmount)).toBe(Number(expectedNetAmount));
    await this.expectPatientBalance(balanceAmount);
    await this.expectPatientCredit(creditAmount);
  }

  async expectChargeRowValue(chargeCode, amount) {
    const expectedAmount = this.formatCurrency(amount);
    const chargeRow = this.page.getByRole('row', { name: new RegExp(this.escapeRegex(chargeCode), 'i') }).first();

    await expect(chargeRow).toBeVisible({ timeout: 30000 });
    await expect(chargeRow).toContainText(expectedAmount, { timeout: 30000 });
  }

  async expectChargeRowPatientTotal(chargeCode, chargeAmount, adjustmentAmount) {
    const expectedPatientTotal = Number(chargeAmount) + this.normalizeLedgerAmount(adjustmentAmount);
    await this.expectChargeRowValue(chargeCode, expectedPatientTotal);
  }

  async expectBalance(balanceLocator, amount) {
    const expectedAmount = this.formatCurrency(amount);
    await expect
      .poll(async () => {
        const balanceText = await balanceLocator.textContent().catch(() => '');
        return String(balanceText).trim();
      }, { timeout: 30000 })
      .toBe(expectedAmount);
  }

  formatCurrency(amount) {
    const numericAmount = Number(String(amount).replace(/[^0-9.-]/g, ''));
    return `$${numericAmount.toFixed(2)}`;
  }

  normalizeLedgerAmount(amount) {
    const rawAmount = String(amount).trim();
    const numericAmount = Number(rawAmount.replace(/[^0-9.-]/g, ''));

    if (rawAmount.includes('(') && rawAmount.includes(')')) {
      return -numericAmount;
    }

    return numericAmount;
  }

  async addNewPayment({ amount }) {
    await expect(this.addNewPaymentButton).toBeVisible({ timeout: 30000 });
    await this.addNewPaymentButton.scrollIntoViewIfNeeded();
    await this.addNewPaymentButton.click();
    await expect(this.paymentWindow).toBeVisible({ timeout: 30000 });

    await this.workspace.setStableNumericValue(this.paymentAmountInput, amount);

    await expect(this.splitPaymentsButton).toBeVisible({ timeout: 30000 });
    await this.splitPaymentsButton.scrollIntoViewIfNeeded();
    console.log("Before split click");

    await this.splitPaymentsButton.click({ force: true });

    console.log("After split click");

    await this.page.pause();


    await this.workspace.settleUi(1000);

    await expect(this.savePaymentButton).toBeVisible({ timeout: 30000 });
    await this.savePaymentButton.scrollIntoViewIfNeeded();
    await this.savePaymentButton.click();
    await expect(this.paymentWindow).toBeHidden({ timeout: 30000 }).catch(async () => {
      await this.workspace.settleUi(1000);
    });

    if (await this.finalSaveButton.isVisible().catch(() => false)) {
      await this.finalSaveButton.scrollIntoViewIfNeeded();
      await this.finalSaveButton.click();
      await this.workspace.settleUi(1000);
    }
  }

  async addTypedPayment({ paymentType, amount }) {
    await expect(this.addNewPaymentButton).toBeVisible({ timeout: 30000 });
    await this.addNewPaymentButton.scrollIntoViewIfNeeded();
    await this.addNewPaymentButton.click();
    await expect(this.paymentWindow).toBeVisible({ timeout: 30000 });

    await this.selectPaymentType(paymentType);
    await this.workspace.setStableNumericValue(this.paymentAmountInput, amount);
    await expect(this.splitPaymentsButton).toBeVisible({ timeout: 30000 });
    await this.splitPaymentsButton.scrollIntoViewIfNeeded();
    console.log("Before split click");
    await this.splitPaymentsButton.click({ force: true });
    console.log("After split click");
    await this.page.pause();
    await expect(this.savePaymentButton).toBeVisible({ timeout: 30000 });
    await this.savePaymentButton.scrollIntoViewIfNeeded();
    await this.savePaymentButton.click();
    await expect(this.paymentWindow).toBeHidden({ timeout: 30000 }).catch(async () => {
      await this.workspace.settleUi(1000);
    });
  }

  async selectPaymentType(paymentType) {
    await expect(this.paymentTypeDropdown).toBeVisible({ timeout: 30000 });
    await this.paymentTypeDropdown.click();
    await this.workspace.settleUi(300);

    const option = this.paymentTypeOptions
      .filter({ hasText: new RegExp(`^${this.escapeRegex(paymentType)}$`, 'i') })
      .first();
    await expect(option).toBeVisible({ timeout: 30000 });
    await option.click();
    await this.workspace.settleUi(300);
  }
}

module.exports = { EditPostingTab };
