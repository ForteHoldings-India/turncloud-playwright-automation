const { expect } = require('@playwright/test');

class PatientCommon {
  constructor(page) {
    this.page = page;
    this.interactionDelayMs = 150;
    this.lookupColumnCount = 7;
    this.lookupAccountColumnIndex = 1;
    this.lookupFirstNameColumnIndex = 2;

    this.addPatientButton = page
      .getByRole('button', { name: /Add New Patient/i })
      .or(page.getByRole('button', { name: /^NEW/i }));
    this.patientsTopTab = page.getByRole('tab', { name: /Patients/i });
    this.saveButton = page.getByRole('button', { name: /^Save$/i });
    this.patientLookupNav = page
      .getByText(/^Patient Lookup$/i)
      .first()
      .or(page.locator('main').getByRole('list').first().getByRole('listitem').first());
    this.patientHeaderTab = page.locator('main').getByRole('list').first().getByRole('button').last();
    this.accountHeaderText = page.getByText(/Account:\s*\d+/i).first();
    this.patientResultsGrid = page.locator('main').getByRole('grid').last();
    this.existingPatientRows = this.patientResultsGrid.locator('[role="row"]:visible');
    this.lookupGridCells = this.patientResultsGrid.locator('[role="gridcell"]:visible');
    this.loadPatientsButton = page.getByRole('button', { name: /Load Patients/i });
    this.accountNumberListItem = page.locator('li').filter({ hasText: /Account No:/i }).first();
  }

  async settleUi(delay = this.interactionDelayMs) {
    await this.page.waitForTimeout(delay);
  }

  async dismissReleaseNotesIfPresent() {
    const releaseNotesDialog = this.page.getByRole('dialog', { name: /Turncloud Release Notes/i });

    for (let attempt = 1; attempt <= 3; attempt++) {
      if (!(await releaseNotesDialog.isVisible().catch(() => false))) {
        return;
      }

      const closeButton = releaseNotesDialog.getByRole('button', { name: /^Close$/i });
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click().catch(() => {});
      } else {
        await releaseNotesDialog.locator('button').first().click().catch(() => {});
      }

      await this.settleUi(500);

      if (!(await releaseNotesDialog.isVisible().catch(() => false))) {
        return;
      }

      await this.page.keyboard.press('Escape').catch(() => {});
      await this.settleUi(500);
    }
  }

  async waitForPatientReady() {
    for (let attempt = 1; attempt <= 5; attempt++) {
      await this.dismissReleaseNotesIfPresent();
      await expect(this.page.getByText(/loading data|done loading data|determining data/i)).toBeHidden({ timeout: 120000 });
      await this.dismissReleaseNotesIfPresent();

      if (await this.addPatientButton.isVisible().catch(() => false)) {
        return;
      }

      if (await this.patientLookupNav.isVisible().catch(() => false)) {
        return;
      }

      await this.patientsTopTab.click().catch(() => {});
      await this.settleUi(400);
    }
  }

  async ensureLookupRowsLoaded() {
    if (await this.lookupGridCells.nth(this.lookupAccountColumnIndex).isVisible().catch(() => false)) {
      return;
    }

    if (await this.loadPatientsButton.isVisible().catch(() => false)) {
      await this.loadPatientsButton.click();
      await this.settleUi(700);
    }

    await expect(this.lookupGridCells.nth(this.lookupAccountColumnIndex)).toBeVisible({ timeout: 30000 });
  }

  getLookupCellIndex(rowIndex, columnIndex) {
    return (rowIndex * this.lookupColumnCount) + columnIndex;
  }

  getLookupCell(rowIndex, columnIndex) {
    return this.lookupGridCells.nth(this.getLookupCellIndex(rowIndex, columnIndex));
  }

  async openAddPatient() {
    await this.waitForPatientReady();
    await this.dismissReleaseNotesIfPresent();

    if (!(await this.addPatientButton.isVisible().catch(() => false))) {
      await expect(this.patientLookupNav).toBeVisible({ timeout: 30000 });
      await this.patientLookupNav.click();
      await this.settleUi(400);
      await this.waitForPatientReady();
      await this.dismissReleaseNotesIfPresent();
    }

    await expect(this.addPatientButton).toBeVisible({ timeout: 60000 });
    await expect(this.addPatientButton).toBeEnabled({ timeout: 30000 });

    const firstNameInput = this.page.locator('input[placeholder="First Name"]').first();

    for (let attempt = 1; attempt <= 3; attempt++) {
      await this.dismissReleaseNotesIfPresent();
      await this.addPatientButton.scrollIntoViewIfNeeded();
      await this.addPatientButton.click();
      await this.dismissReleaseNotesIfPresent();

      if (await firstNameInput.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false)) {
        return;
      }

      if (attempt === 3) {
        throw new Error('Add New Patient form did not open.');
      }
    }
  }

  async setStableValue(locator, value) {
    for (let attempt = 1; attempt <= 4; attempt++) {
      await expect(locator).toBeEditable({ timeout: 30000 });
      await locator.click();
      await this.settleUi();

      await locator.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
      await this.settleUi(200);
      await locator.press('Backspace');
      await this.settleUi(200);

      await locator.type(value, { delay: 100 });
      await this.settleUi();
      await locator.press('Tab');
      await this.settleUi();

      const currentValue = await locator.inputValue();
      if (currentValue === value) {
        return;
      }

      await this.page.waitForTimeout(150);
    }

    await expect(locator).toHaveValue(value, { timeout: 10000 });
  }

  normalizeNumericValue(value) {
    const cleanedValue = String(value ?? '').replace(/[^0-9.-]/g, '');

    if (!cleanedValue || cleanedValue === '-' || cleanedValue === '.' || cleanedValue === '-.') {
      return '';
    }

    const numericValue = Number(cleanedValue);
    return Number.isNaN(numericValue) ? cleanedValue : String(numericValue);
  }

  async setStableNumericValue(locator, value) {
    const expectedValue = this.normalizeNumericValue(value);

    for (let attempt = 1; attempt <= 4; attempt++) {
      await expect(locator).toBeEditable({ timeout: 30000 });

      await locator.evaluate((input, rawValue) => {
        const numericValue = Number(String(rawValue).replace(/[^0-9.-]/g, ''));
        const jquery = window.jQuery || window.$;
        const widget = jquery ? jquery(input).data('kendoNumericTextBox') : null;

        if (widget && !Number.isNaN(numericValue)) {
          widget.value(numericValue);
          widget.trigger('change');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.blur();
          return true;
        }

        return false;
      }, value).catch(() => false);

      await this.settleUi(500);
      await locator.press('Tab').catch(() => {});
      await this.settleUi(500);

      let currentValue = this.normalizeNumericValue(await locator.inputValue());
      if (currentValue === expectedValue) {
        return;
      }

      await locator.click();
      await this.settleUi(200);
      await locator.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A').catch(() => {});
      await locator.press('Backspace').catch(() => {});
      await this.settleUi(200);
      await locator.type(String(value), { delay: 100 }).catch(() => {});
      await this.settleUi(300);
      await locator.press('Tab').catch(() => {});
      await this.settleUi(500);

      currentValue = this.normalizeNumericValue(await locator.inputValue());
      if (currentValue === expectedValue) {
        return;
      }

      await this.page.waitForTimeout(150);
    }

    await expect
      .poll(async () => this.normalizeNumericValue(await locator.inputValue()), { timeout: 10000 })
      .toBe(expectedValue);
  }

  normalizeDateValue(value) {
    const [month, day, year] = String(value ?? '').split('/').map(Number);

    if (!month || !day || !year) {
      return String(value ?? '').trim();
    }

    return `${month}/${day}/${year}`;
  }

  async setStableDateValue(locator, value) {
    await expect(locator).toBeEditable({ timeout: 30000 });
    const [month, day, year] = value.split('/').map(Number);

    await locator.evaluate((input, parts) => {
      const { month, day, year, formattedValue } = parts;
      const date = new Date(year, month - 1, day);
      const jquery = window.jQuery || window.$;
      const widget = jquery ? jquery(input).data('kendoDatePicker') : null;

      if (widget) {
        widget.value(date);
        widget.trigger('change');
        widget.close();
        input.blur();
        return;
      }

      input.focus();
      input.value = formattedValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.blur();
    }, { month, day, year, formattedValue: value });

    await this.settleUi(500);
    await locator.press('Tab').catch(() => {});
    await this.page.locator('.k-calendar-container:visible').first().waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await expect
      .poll(async () => this.normalizeDateValue(await locator.inputValue()), { timeout: 10000 })
      .toBe(this.normalizeDateValue(value));
  }

  async typeDateOfBirth(locator, dobValue) {
    await expect(locator).toBeEditable({ timeout: 30000 });
    await this.page.waitForTimeout(300);
    await locator.click();
    await locator.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await locator.press('Delete');

    const [month, day, year] = dobValue.split('/').map(Number);
    const normalizedMonth = String(month).padStart(2, '0');
    const normalizedDay = String(day).padStart(2, '0');

    await locator.press('Home');
    await locator.type(`${month}/${day}/${year}`, { delay: 50 });
    await this.settleUi(500);
    await expect(locator).toHaveValue(`${normalizedMonth}/${normalizedDay}/${year}`, { timeout: 10000 });
  }

  async selectListOption(listbox, optionName) {
    const toggle = listbox.getByRole('button', { name: /select/i });
    await expect(toggle).toBeVisible({ timeout: 30000 });
    await toggle.click();
    await this.settleUi(500);

    const option = this.page.getByRole('option', { name: optionName }).first();
    await expect(option).toBeVisible({ timeout: 30000 });
    await option.click();
    await this.settleUi(500);
  }

  async selectPickerOption(toggle, options, optionName, postSelectLocator = null) {
    await expect(toggle).toBeVisible({ timeout: 30000 });
    await toggle.click();
    await this.settleUi(500);

    const option = options.filter({ hasText: optionName }).first();
    await expect(option).toBeVisible({ timeout: 30000 });
    await option.click();
    await this.settleUi(500);

    if (postSelectLocator) {
      await expect(postSelectLocator).toHaveText(optionName, { timeout: 10000 });
    }
  }

  async selectPickerOptionByText(toggle, options, text, postSelectLocator = null) {
    const exactText = new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    await this.selectPickerOption(toggle, options, exactText, postSelectLocator);
  }

  async expectNewPatientHeader() {
    await expect(this.patientHeaderTab).toContainText(/NEW/i, { timeout: 15000 });
  }

  async getPatientHeaderTabText() {
    return (await this.patientHeaderTab.textContent())?.trim() || '';
  }

  async waitForPatientNameInHeader(firstName, lastName) {
    const escapedFirstName = firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedLastName = lastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patientNamePattern = new RegExp(`${escapedFirstName}.*${escapedLastName}`, 'i');

    await expect.poll(() => this.getPatientHeaderTabText(), { timeout: 30000 }).toMatch(patientNamePattern);
  }

  async expectPatientHeaderNotToContain(textOrPattern) {
    const pattern = textOrPattern instanceof RegExp
      ? textOrPattern
      : new RegExp(textOrPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    await expect.poll(() => this.getPatientHeaderTabText(), { timeout: 15000 }).not.toMatch(pattern);
  }

  async waitForSavedAccountNumber(previousAccountNumber = null) {
    let resolvedAccountNumber = null;

    await expect.poll(async () => {
      const headerText = (await this.accountHeaderText.textContent()) || '';
      const match = headerText.match(/Account:\s*(\d+)/i);
      const account = match?.[1] || null;

      if (!account) {
        return null;
      }

      if (previousAccountNumber && account === previousAccountNumber) {
        return null;
      }

      resolvedAccountNumber = account;
      return account;
    }, { timeout: 30000 }).not.toBeNull();

    return resolvedAccountNumber;
  }

  async openFirstExistingPatient() {
    await this.returnToPatientLookup();
    await this.ensureLookupRowsLoaded();

    const accountNumber = await this.getLookupAccountNumberByIndex(0);
    const firstNameCell = this.getLookupCell(0, this.lookupFirstNameColumnIndex);

    await expect(firstNameCell).toBeVisible({ timeout: 30000 });
    await firstNameCell.dblclick();

    await expect
      .poll(() => this.getCurrentPatientAccountNumber().catch(() => null), { timeout: 30000 })
      .toBe(accountNumber);
  }

  async activatePatientTabContaining(text) {
    const patientTab = this.page
      .locator('main')
      .getByRole('list')
      .first()
      .getByRole('button', { name: new RegExp(text, 'i') })
      .first();

    await expect(patientTab).toBeVisible({ timeout: 30000 });
    await patientTab.click();
    await this.settleUi(400);
  }

  async getLookupAccountNumberByIndex(index) {
    await this.returnToPatientLookup();
    await this.ensureLookupRowsLoaded();
    const accountCell = this.getLookupCell(index, this.lookupAccountColumnIndex);
    await expect(accountCell).toBeVisible({ timeout: 30000 });

    const accountCellText = (await accountCell.textContent())?.trim();
    if (!accountCellText) {
      throw new Error(`Unable to read lookup account number for row index ${index}`);
    }

    return accountCellText;
  }

  async getLookupFirstNameByIndex(index) {
    await this.returnToPatientLookup();
    await this.ensureLookupRowsLoaded();
    const firstNameCell = this.getLookupCell(index, this.lookupFirstNameColumnIndex);
    await expect(firstNameCell).toBeVisible({ timeout: 30000 });

    const firstNameCellText = (await firstNameCell.textContent())?.trim();
    if (!firstNameCellText) {
      throw new Error(`Unable to read lookup first name for row index ${index}`);
    }

    return firstNameCellText;
  }

  async openExistingPatientByIndex(index) {
    const accountNumber = await this.getLookupAccountNumberByIndex(index);
    await this.openExistingPatientByAccountNumber(accountNumber);
  }

  async openExistingPatientByAccountNumber(accountNumber) {
    await this.returnToPatientLookup();
    await this.ensureLookupRowsLoaded();
    const previousAccountNumber = await this.getCurrentPatientAccountNumber().catch(() => null);
    const targetCell = this.lookupGridCells.getByText(new RegExp(`^${accountNumber}$`)).first();

    await expect(targetCell).toBeVisible({ timeout: 30000 });

    for (let attempt = 1; attempt <= 2; attempt++) {
      if (attempt === 1) {
        await targetCell.click();
      } else {
        await targetCell.dblclick();
      }

      try {
        await expect
          .poll(() => this.getCurrentPatientAccountNumber().catch(() => null), { timeout: 20000 })
          .toBe(accountNumber);
        return;
      } catch (error) {
        const currentAccountNumber = await this.getCurrentPatientAccountNumber().catch(() => null);
        const sameAsPrevious = previousAccountNumber && currentAccountNumber === previousAccountNumber;

        if (attempt === 2 || (!sameAsPrevious && currentAccountNumber)) {
          throw error;
        }
      }
    }
  }

  async openExistingPatientByLookupCellText(cellText, options = {}) {
    const { doubleClick = false } = options;

    await this.returnToPatientLookup();
    await this.ensureLookupRowsLoaded();
    const targetCell = this.lookupGridCells.getByText(new RegExp(`^${cellText}$`, 'i')).first();
    await expect(targetCell).toBeVisible({ timeout: 30000 });

    if (doubleClick) {
      await targetCell.dblclick();
    } else {
      await targetCell.click();
    }

    await this.settleUi(500);
  }

  async getCurrentPatientAccountNumber() {
    const headerTabText = await this.getPatientHeaderTabText();
    const headerMatch = headerTabText.match(/^(\d+)/);

    if (headerMatch?.[1]) {
      return headerMatch[1];
    }

    const accountText = (await this.accountNumberListItem.textContent()) || '';
    const summaryMatch = accountText.match(/Account No:\s*(\d+)/i);

    if (summaryMatch?.[1]) {
      return summaryMatch[1];
    }

    throw new Error(
      `Unable to read current patient account number from header "${headerTabText}" or summary "${accountText}"`
    );
  }

  async expectCurrentPatientAccountNumber(accountNumber) {
    await expect.poll(() => this.getCurrentPatientAccountNumber(), { timeout: 30000 }).toBe(accountNumber);
  }

  async saveNewPatient() {
    await this.settleUi();
    await this.dismissReleaseNotesIfPresent();
    await expect(this.saveButton).toBeVisible({ timeout: 30000 });

    try {
      await this.saveButton.click({ timeout: 10000 });
    } catch (error) {
      await this.saveButton.evaluate((button) => button.click());
    }

    await this.settleUi(400);
    await this.dismissReleaseNotesIfPresent();
  }

  async returnToPatientLookup() {
    await this.waitForPatientReady();
    await this.dismissReleaseNotesIfPresent();

    for (let attempt = 1; attempt <= 4; attempt++) {
      if (await this.patientResultsGrid.isVisible().catch(() => false)) {
        return;
      }

      await this.dismissReleaseNotesIfPresent();
      await expect(this.patientLookupNav).toBeVisible({ timeout: 30000 });
      await this.patientLookupNav.click({ force: true });
      await this.settleUi(700);
      await this.dismissReleaseNotesIfPresent();

      if (await this.patientResultsGrid.isVisible().catch(() => false)) {
        return;
      }

      await this.patientsTopTab.click().catch(() => {});
      await this.settleUi(500);
    }

    await expect(this.patientResultsGrid).toBeVisible({ timeout: 30000 });
  }
}

module.exports = { PatientCommon };










