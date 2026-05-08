const { expect } = require('@playwright/test');

class DiagnosisSection {
  constructor(page, workspace) {
    this.page = page;
    this.workspace = workspace;
    this.diagnosisHeading = page.getByText(/^Diagnosis$/i).first();
    this.diagnosisSection = this.diagnosisHeading.locator('..').locator('..').first();
  }

  escapeRegex(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Scroll to diagnosis section and ensure it's visible
   */
  async scrollToDiagnosisSection() {
    console.log('Scrolling to diagnosis section...');
    const mainContent = this.page.locator('main').first();
    await mainContent.evaluate(async (el) => {
      for (let i = 0; i < 15; i++) {
        el.scrollTop += 500;
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    });
    await this.workspace.settleUi(500);

    const addSingleBtn = this.page.getByRole('button', { name: /Add Single/i }).first();
    const isVisible = await addSingleBtn.isVisible({ timeout: 10000 }).catch(() => false);
    if (!isVisible) {
      await addSingleBtn.scrollIntoViewIfNeeded();
      await this.workspace.settleUi(300);
    }
    console.log('Scrolled to diagnosis section successfully');
  }

  /**
   * Click Add Single button
   */
  async clickAddSingleButton() {
    console.log('Clicking Add Single button...');
    const addSingleBtn = this.page.getByRole('button', { name: /Add Single/i }).first();
    await expect(addSingleBtn).toBeVisible({ timeout: 30000 });
    await expect(addSingleBtn).toBeEnabled({ timeout: 30000 });
    await addSingleBtn.click();
    await this.workspace.settleUi(800);
    console.log('Add Single button clicked');
  }

  getDialogByTitle(title) {
    return this.page
      .locator('body > div:visible')
      .filter({ has: this.page.getByText(new RegExp(`^${this.escapeRegex(title)}$`, 'i')) })
      .last();
  }

  async openListboxOption(listbox, optionText) {
    const toggle = listbox.getByRole('button', { name: /select/i }).first();
    await expect(toggle).toBeVisible({ timeout: 30000 });
    await toggle.click();
    await this.workspace.settleUi(400);

    const dropdownContainer = this.page.locator('.k-animation-container:visible').last();
    const option = dropdownContainer.getByRole('option', { name: new RegExp(this.escapeRegex(optionText), 'i') }).first();
    await expect(option).toBeVisible({ timeout: 30000 });
    await option.click();
    await this.workspace.settleUi(400);
  }

  async resolveDateValue(dateText, dateInput) {
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(String(dateText))) {
      return String(dateText);
    }

    if (/^\d{1,2}$/.test(String(dateText))) {
      const currentValue = (await dateInput.inputValue().catch(() => '')).trim();
      const match = currentValue.match(/^(\d{1,2})\/\d{1,2}\/(\d{4})$/);

      if (match) {
        const [, month, year] = match;
        return `${month.padStart(2, '0')}/${String(dateText).padStart(2, '0')}/${year}`;
      }

      const today = new Date();
      return `${String(today.getMonth() + 1).padStart(2, '0')}/${String(dateText).padStart(2, '0')}/${today.getFullYear()}`;
    }

    return String(dateText);
  }

  /**
   * Select diagnosis from dropdown
   * @param {string} diagnosisText - Diagnosis name or partial text to search
   */
  async selectDiagnosis(diagnosisText) {
    console.log(`Selecting diagnosis: ${diagnosisText}`);

    const dialog = this.getDialogByTitle('Diagnosis Add/Edit');
    await expect(dialog).toBeVisible({ timeout: 30000 });

    const diagnosisListbox = dialog.getByRole('listbox', { name: /Search For Diagnosis:/i }).first();
    await this.openListboxOption(diagnosisListbox, diagnosisText);
    await this.workspace.settleUi(500);
    console.log(`Diagnosis selected: ${diagnosisText}`);
  }

  /**
   * Select start date
   * @param {string} dateText - Date like "25" or full date
   */
  async selectStartDate(dateText) {
    console.log(`Selecting start date: ${dateText}`);
    const dialog = this.getDialogByTitle('Diagnosis Add/Edit');
    await expect(dialog).toBeVisible({ timeout: 30000 });
    const startDateInput = dialog.getByRole('combobox', { name: /Start Date:/i }).first();
    const resolvedDate = await this.resolveDateValue(dateText, startDateInput);
    await this.workspace.setStableDateValue(startDateInput, resolvedDate);
    await this.workspace.settleUi(400);
    console.log(`Start date selected: ${resolvedDate}`);
  }

  /**
   * Select order from dropdown
   * @param {number} orderNumber - Order number (1, 2, 3, etc.)
   */
  async selectOrder(orderNumber) {
    console.log(`Selecting order: ${orderNumber}`);
    const dialog = this.getDialogByTitle('Diagnosis Add/Edit');
    await expect(dialog).toBeVisible({ timeout: 30000 });
    const orderListbox = dialog.getByRole('listbox', { name: /Print Order:/i }).first();
    await this.openListboxOption(orderListbox, String(orderNumber));
    console.log(`Order selected: ${orderNumber}`);
  }

  /**
   * Click Update button to save diagnosis
   */
  async clickUpdateButton() {
    console.log('Clicking Update button...');
    const dialog = this.getDialogByTitle('Diagnosis Add/Edit');
    await expect(dialog).toBeVisible({ timeout: 30000 });
    const updateBtn = dialog.getByRole('button', { name: /Update/i }).first();
    await expect(updateBtn).toBeVisible({ timeout: 30000 });
    await this.workspace.settleUi(300);
    await updateBtn.click();
    await this.workspace.settleUi(800);
    await expect(dialog).not.toBeVisible({ timeout: 15000 }).catch(() => {});
    console.log('Update button clicked');
  }

  /**
   * Add a single diagnosis entry
   * @param {Object} details - { diagnosis: string, startDate: string (day), order: number }
   */
  async addSingleDiagnosis(details) {
    const { diagnosis, startDate, order } = details;

    console.log(`Adding single diagnosis: ${JSON.stringify(details)}`);

    await this.workspace.settleUi(300);
    await this.clickAddSingleButton();
    const dialog = this.getDialogByTitle('Diagnosis Add/Edit');
    await expect(dialog).toBeVisible({ timeout: 30000 });
    await dialog.scrollIntoViewIfNeeded();
    await this.workspace.settleUi(400);
    
    await this.selectDiagnosis(diagnosis);

    if (startDate) {
      const startDateInput = dialog.getByRole('combobox', { name: /Start Date:/i }).first();
      await startDateInput.scrollIntoViewIfNeeded();
      await this.workspace.settleUi(300);
      await this.selectStartDate(startDate);
    }

    if (order !== undefined && order !== null) {
      const orderListbox = dialog.getByRole('listbox', { name: /Print Order:/i }).first();
      await orderListbox.scrollIntoViewIfNeeded();
      await this.workspace.settleUi(300);
      await this.selectOrder(order);
    }

    await this.clickUpdateButton();

    console.log('Single diagnosis added successfully');
  }

  /**
   * Add multiple diagnoses at once using Add Multiple button
   * @param {Array} diagnosisList - Array of diagnosis names/texts
   */
  async addMultipleDiagnosis(diagnosisList) {
    console.log(`Adding multiple diagnoses: ${JSON.stringify(diagnosisList)}`);

    await this.workspace.settleUi(300);
    const addMultipleBtn = this.page.getByRole('button', { name: /Add Multiple/i }).first();
    await expect(addMultipleBtn).toBeVisible({ timeout: 30000 });
    await addMultipleBtn.scrollIntoViewIfNeeded();
    await this.workspace.settleUi(400);
    await addMultipleBtn.click();
    await this.workspace.settleUi(1500);

    // The multi-select input field
    const multiSelectInput = this.page.locator('#DiagnosisMultiSelect_taglist > .k-input-inner');
    await expect(multiSelectInput).toBeVisible({ timeout: 30000 });
    
    console.log('Add Multiple dialog opened');

    for (let i = 0; i < diagnosisList.length; i++) {
      const diagnosis = diagnosisList[i];
      console.log(`Processing diagnosis ${i + 1}/${diagnosisList.length}: ${diagnosis}`);

      // Click on the input field to focus it
      await multiSelectInput.click();
      await this.workspace.settleUi(300);

      // Type the diagnosis name to search
      console.log(`Typing diagnosis: ${diagnosis}`);
      await multiSelectInput.fill(diagnosis);
      await this.workspace.settleUi(800);

      // Find and click the matching option from the listbox
      const listbox = this.page.locator('#DiagnosisMultiSelect_listbox');
      await expect(listbox).toBeVisible({ timeout: 30000 });
      
      const option = listbox
        .getByText(new RegExp(this.escapeRegex(diagnosis), 'i'))
        .first();
      await expect(option).toBeVisible({ timeout: 30000 });
      await option.scrollIntoViewIfNeeded();
      await this.workspace.settleUi(300);
      await option.click();
      await this.workspace.settleUi(500);

      console.log(`Selected diagnosis: ${diagnosis}`);

      // Clear the input field for next diagnosis
      await multiSelectInput.click();
      await this.workspace.settleUi(200);
      await multiSelectInput.fill('');
      await this.workspace.settleUi(500);

      console.log(`Cleared search field for next diagnosis`);
    }

    await this.workspace.settleUi(500);

    // Close the dropdown by pressing Escape key
    console.log('Closing dropdown menu with tab key');
    await this.page.keyboard.press('Tab');
    await this.workspace.settleUi(800);

    // Click the Done button to save selections
    const doneButton = this.page.getByRole('button', { name: /Done/i }).first();
    await expect(doneButton).toBeVisible({ timeout: 30000 });
    await doneButton.click();
    await this.workspace.settleUi(800);

    console.log('Multiple diagnoses added successfully');
  }

  /**
   * Verify diagnosis appears in grid
   * @param {string} diagnosisText - Text to search for in grid
   */
  async expectDiagnosisInGrid(diagnosisText) {
    console.log(`Verifying diagnosis in grid: ${diagnosisText}`);
    const diagnosisGrid = this.diagnosisSection.locator('[role="grid"]').last();
    await expect(diagnosisGrid).toBeVisible({ timeout: 30000 });
    await expect(diagnosisGrid).toContainText(new RegExp(this.escapeRegex(diagnosisText), 'i'), { timeout: 10000 });
    console.log(`Diagnosis found in grid: ${diagnosisText}`);
  }
}

module.exports = { DiagnosisSection };
