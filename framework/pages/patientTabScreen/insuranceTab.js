const { expect } = require('@playwright/test');

class InsuranceTab {
  constructor(page, workspace) {
    this.page = page;
    this.workspace = workspace;

    this.insuranceTabButton = page.locator('#PatientInsurance').getByText('Insurance').first();
    this.addInsuranceButton = page.getByRole('button', { name: /Add New Insurance/i });
    this.insuranceRowList = page
      .locator('tbody[role="rowgroup"] tr')
      .filter({ has: page.locator('.k-grid-InsuranceGridRemoveBtn') });
    this.policyNumberInput = page.getByRole('textbox', { name: /Policy No/i });
    this.idInput = page.getByRole('textbox', { name: /^ID$/i });
    this.groupPlanNumberInput = page.getByRole('textbox', { name: /Group\/Plan No/i });
    this.planProgramNameInput = page.getByRole('textbox', { name: /Plan\/program Name/i });
    this.subscriberNameInput = page.getByRole('textbox', { name: /^Name$/i }).last();
    this.subscriberMiddleInput = page.getByRole('textbox', { name: /^M$/i }).last();
    this.subscriberLastInput = page.getByRole('textbox', { name: /^Last$/i });
    this.subscriberDobInput = page.getByRole('combobox').nth(2);
    this.relationshipSelectButton = page.getByRole('button', { name: 'select' }).nth(5);
    this.relationshipListbox = page.getByRole('listbox', { name: /Relationship/i });
    this.genderListbox = page.getByRole('listbox', { name: /Sex/i });
    this.genderOptions = page.locator('#PatientInsuranceSexDropDown_listbox li');
    this.telephoneInput = page.getByRole('textbox', { name: /^Telephone$/i });
    this.emailInput = page.getByRole('textbox', { name: /^Email$/i });
    this.addressInput = page.getByRole('textbox', { name: /^Address$/i });
    this.aptSuiteInput = page.getByRole('textbox', { name: /Apt\/Suite/i }).last();
    this.cityInput = page.getByRole('textbox', { name: /^City$/i }).last();
    this.stateButton = page.locator("span[aria-owns='PatientInsuranceStateDropDown_listbox'] button");
    this.stateValue = page.locator("span[aria-owns='PatientInsuranceStateDropDown_listbox'] .k-input-value-text").first();
    this.stateOptions = page.locator('#PatientInsuranceStateDropDown_listbox li');
    this.zipCodeInput = page.getByRole('textbox', { name: /Zip Code/i });
    this.deductibleAmountInput = page.getByRole('spinbutton', { name: /Deductible Amount/i });
    this.coInsuranceInput = page.locator('input[data-bind*="copayFixed"]');
    this.maxOutOfPocketInput = page.locator('input[data-bind*="copayLimit"]');
    this.usedVisitInput = page.locator('#PatientInsuranceCopayUsedVisit');
    this.appliedChargesInput = page.getByRole('spinbutton', { name: /Applied Charges/i });
    this.selfOverwriteDialogText = page.getByText(/overwrite current insured information with patient'?s information\?/i);
  }

  async openInsuranceTab() {
    await expect(this.insuranceTabButton).toBeVisible({ timeout: 30000 });
    await this.insuranceTabButton.click();
    await expect(this.addInsuranceButton).toBeVisible({ timeout: 30000 });
  }

  async expectInsuranceRowsCount(expectedCount) {
    await expect(this.insuranceRowList).toHaveCount(expectedCount, { timeout: 30000 });
  }

  async expectInsuranceRowContains(index, carrierName) {
    const row = this.insuranceRowList.nth(index);
    await expect(row).toBeVisible({ timeout: 30000 });
    await expect(row).toContainText(new RegExp(carrierName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), { timeout: 10000 });
  }

  async readBlankFormState() {
    const policyNumber = await this.policyNumberInput.inputValue().catch(() => '');
    const insuranceId = await this.idInput.inputValue().catch(() => '');
    const groupPlanNumber = await this.groupPlanNumberInput.inputValue().catch(() => '');
    const planProgramName = await this.planProgramNameInput.inputValue().catch(() => '');

    return {
      policyNumber: String(policyNumber).trim(),
      insuranceId: String(insuranceId).trim(),
      groupPlanNumber: String(groupPlanNumber).trim(),
      planProgramName: String(planProgramName).trim()
    };
  }

  async isInsuranceFormBlank() {
    const formState = await this.readBlankFormState();
    return Object.values(formState).every((value) => !value);
  }

  async waitForBlankInsuranceForm(timeout = 4000) {
    try {
      await expect.poll(() => this.isInsuranceFormBlank(), { timeout }).toBe(true);
      return true;
    } catch {
      return false;
    }
  }

  async findBlankInsuranceRowIndex() {
    const rowCount = await this.insuranceRowList.count();

    for (let index = rowCount - 1; index >= 0; index--) {
      const row = this.insuranceRowList.nth(index);
      const firstCellText = ((await row.getByRole('gridcell').first().textContent()) || '').trim();

      if (!firstCellText) {
        return index;
      }
    }

    return -1;
  }

  async getActiveInsuranceRow() {
    const blankRowIndex = await this.findBlankInsuranceRowIndex();
    if (blankRowIndex !== -1) {
      return this.insuranceRowList.nth(blankRowIndex);
    }

    return this.insuranceRowList.last();
  }

  async clickBlankInsuranceRowIfPresent() {
    const blankRowIndex = await this.findBlankInsuranceRowIndex();
    if (blankRowIndex === -1) {
      return false;
    }

    const blankRow = this.insuranceRowList.nth(blankRowIndex);
    const rowCells = blankRow.getByRole('gridcell');
    await rowCells.first().scrollIntoViewIfNeeded().catch(() => {});
    await rowCells.first().click({ force: true }).catch(async () => {
      await rowCells.nth(1).click({ force: true });
    });
    await this.workspace.settleUi(400);
    return true;
  }

  async activateNewInsuranceForm() {
    if (await this.waitForBlankInsuranceForm()) {
      return;
    }

    await this.workspace.settleUi(350);
    if (await this.waitForBlankInsuranceForm(2500)) {
      return;
    }

    const clickedBlankRow = await this.clickBlankInsuranceRowIfPresent();
    if (clickedBlankRow && await this.waitForBlankInsuranceForm(4000)) {
      return;
    }

    await this.workspace.settleUi(600);
    if (await this.waitForBlankInsuranceForm(3000)) {
      return;
    }

    const formState = await this.readBlankFormState();
    throw new Error(`Unable to activate a blank insurance form after clicking Add New Insurance. Current form state: ${JSON.stringify(formState)}`);
  }

  async addNewInsurance() {
    await expect(this.addInsuranceButton).toBeVisible({ timeout: 30000 });
    await this.addInsuranceButton.click();
    await this.workspace.settleUi(600);
    await this.activateNewInsuranceForm();
  }

  async selectInsuranceCarrier(carrierName) {
    const carrierCell = (await this.getActiveInsuranceRow()).getByRole('gridcell').first();
    await carrierCell.scrollIntoViewIfNeeded().catch(() => {});
    await expect(carrierCell).toBeVisible({ timeout: 30000 });
    await carrierCell.click({ force: true });
    await this.workspace.settleUi(150);

    const options = this.page.getByRole('option');
    await expect(options.nth(1)).toBeVisible({ timeout: 30000 });
    await options.nth(1).click();
    await this.workspace.settleUi(150);

    const escapedCarrierName = carrierName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const carrier = this.page.getByRole('option', { name: new RegExp(`^${escapedCarrierName}`, 'i') }).last();
    await expect(carrier).toBeVisible({ timeout: 30000 });
    await carrier.click();
    await this.workspace.settleUi(300);
  }

  async selectDateWithCalendar(buttonIndex, dayLabel) {
    const button = this.page.getByRole('button', { name: 'select' }).nth(buttonIndex);
    await expect(button).toBeVisible({ timeout: 30000 });
    await button.click();
    await this.workspace.settleUi(150);

    const day = this.page.getByRole('link', { name: dayLabel }).last();
    await expect(day).toBeVisible({ timeout: 30000 });
    await day.click();
    await this.workspace.settleUi(150);
  }

  async respondToSelfOverwriteDialog(decision = 'accept') {
    const dialogVisible = await this.selfOverwriteDialogText.isVisible({ timeout: 5000 }).catch(() => false);
    if (!dialogVisible) {
      return false;
    }

    const acceptButton = this.page.getByRole('button', { name: /^(Yes|OK)$/i }).last();
    const declineButton = this.page.getByRole('button', { name: /^(No|Cancel)$/i }).last();

    if (decision === 'accept') {
      await expect(acceptButton).toBeVisible({ timeout: 10000 });
      await acceptButton.click();
    } else {
      await expect(declineButton).toBeVisible({ timeout: 10000 });
      await declineButton.click();
    }

    await expect(this.selfOverwriteDialogText).toBeHidden({ timeout: 10000 });
    await this.workspace.settleUi(300);
    return true;
  }

  async selectRelationship(relationship, options = {}) {
    await this.workspace.selectPickerOptionByText(
      this.relationshipSelectButton,
      this.page.getByRole('option'),
      relationship
    );

    if (/^self$/i.test(relationship)) {
      const overwriteDecision = options.overwriteDecision || null;
      if (overwriteDecision) {
        await this.respondToSelfOverwriteDialog(overwriteDecision);
      }
    }
  }

  async selectSex(sex) {
    const sexDropdown = this.page.locator('#PatientInsuranceSexDropDown').locator('..').first();
    await expect(sexDropdown).toBeVisible({ timeout: 30000 });
    await sexDropdown.click();
    await this.workspace.settleUi(150);
    await this.genderOptions.filter({ hasText: new RegExp(`^${sex}$`, 'i') }).first().click();
    await this.workspace.settleUi(150);
  }

  async selectSubscriberState(state) {
    await this.workspace.selectPickerOptionByText(this.stateButton, this.stateOptions, state, this.stateValue);
  }

  async readSubscriberDetails() {
    const relationshipText = ((await this.relationshipListbox.textContent().catch(() => '')) || '').replace(/select/gi, '').trim();
    const sexText = ((await this.genderListbox.textContent().catch(() => '')) || '').replace(/select/gi, '').trim();

    return {
      subscriberFirstName: (await this.subscriberNameInput.inputValue().catch(() => '')).trim(),
      subscriberMiddleInitial: (await this.subscriberMiddleInput.inputValue().catch(() => '')).trim(),
      subscriberLastName: (await this.subscriberLastInput.inputValue().catch(() => '')).trim(),
      subscriberDateOfBirth: (await this.subscriberDobInput.inputValue().catch(() => '')).trim(),
      relationship: relationshipText,
      sex: sexText,
      telephone: (await this.telephoneInput.inputValue().catch(() => '')).trim(),
      email: (await this.emailInput.inputValue().catch(() => '')).trim(),
      address: (await this.addressInput.inputValue().catch(() => '')).trim(),
      aptSuite: (await this.aptSuiteInput.inputValue().catch(() => '')).trim(),
      city: (await this.cityInput.inputValue().catch(() => '')).trim(),
      state: ((await this.stateValue.textContent().catch(() => '')) || '').trim(),
      zipCode: (await this.zipCodeInput.inputValue().catch(() => '')).trim()
    };
  }

  async expectSubscriberDetails(expectedDetails) {
    const actualDetails = await this.readSubscriberDetails();

    for (const [key, expectedValue] of Object.entries(expectedDetails)) {
      if (expectedValue === undefined) {
        continue;
      }

      expect(actualDetails[key], `Unexpected insured field for ${key}`).toBe(String(expectedValue).trim());
    }
  }

  async fillPolicyDetails({
    carrierName,
    policyNumber,
    insuranceId,
    groupPlanNumber,
    planProgramName,
    effectiveDay,
    expiryDay
  }) {
    if (carrierName) await this.selectInsuranceCarrier(carrierName);
    await this.workspace.settleUi(300);

    if (policyNumber) await this.workspace.setStableValue(this.policyNumberInput, policyNumber);
    if (insuranceId) await this.workspace.setStableValue(this.idInput, insuranceId);
    if (groupPlanNumber) await this.workspace.setStableValue(this.groupPlanNumberInput, groupPlanNumber);
    if (planProgramName) await this.workspace.setStableValue(this.planProgramNameInput, planProgramName);
    if (effectiveDay) await this.selectDateWithCalendar(2, effectiveDay);
    if (expiryDay) await this.selectDateWithCalendar(3, expiryDay);
    await this.workspace.settleUi(350);
  }

  async fillSubscriberDetails({
    subscriberFirstName,
    subscriberMiddleInitial,
    subscriberLastName,
    subscriberDateOfBirth,
    relationship,
    sex,
    telephone,
    email,
    address,
    aptSuite,
    city,
    state,
    zipCode,
    overwriteDecision
  }) {
    if (subscriberFirstName) await this.workspace.setStableValue(this.subscriberNameInput, subscriberFirstName);
    if (subscriberMiddleInitial) await this.workspace.setStableValue(this.subscriberMiddleInput, subscriberMiddleInitial);
    if (subscriberLastName) await this.workspace.setStableValue(this.subscriberLastInput, subscriberLastName);
    if (subscriberDateOfBirth) await this.workspace.typeDateOfBirth(this.subscriberDobInput, subscriberDateOfBirth);
    if (relationship) await this.selectRelationship(relationship, { overwriteDecision });
    if (sex) await this.selectSex(sex);
    if (telephone) await this.workspace.setStableValue(this.telephoneInput, telephone);
    if (email) await this.workspace.setStableValue(this.emailInput, email);
    if (address) await this.workspace.setStableValue(this.addressInput, address);
    if (aptSuite) await this.workspace.setStableValue(this.aptSuiteInput, aptSuite);
    if (city) await this.workspace.setStableValue(this.cityInput, city);
    if (state) await this.selectSubscriberState(state);
    if (zipCode) await this.workspace.setStableValue(this.zipCodeInput, zipCode);
    await this.workspace.settleUi(400);
  }

  async fillCopayDetails({
    deductibleAmount,
    coInsuranceAmount,
    maxOutOfPocketAmount,
    usedVisit,
    appliedCharges
  }) {
    if (deductibleAmount) await this.workspace.setStableNumericValue(this.deductibleAmountInput, deductibleAmount);
    if (coInsuranceAmount) await this.workspace.setStableNumericValue(this.coInsuranceInput, coInsuranceAmount);
    if (maxOutOfPocketAmount) await this.workspace.setStableNumericValue(this.maxOutOfPocketInput, maxOutOfPocketAmount);
    if (usedVisit) await this.workspace.setStableNumericValue(this.usedVisitInput, usedVisit);
    if (appliedCharges) await this.workspace.setStableNumericValue(this.appliedChargesInput, appliedCharges);
    await this.workspace.settleUi(400);
  }

  async fillInsuranceDetails(details) {
    await this.fillPolicyDetails(details);
    await this.fillSubscriberDetails(details);
    await this.fillCopayDetails(details);
  }

  async addMultipleInsuranceDetails(map) {
    const insuranceValues = String(map.Company || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    for (const insuranceValue of insuranceValues) {
      await this.workspace.settleUi(250);
      await this.addNewInsurance();
      await this.workspace.settleUi(300);
      await this.selectInsuranceCarrier(insuranceValue);
      await this.workspace.saveNewPatient();
      await this.workspace.settleUi(600);
    }
  }
}

module.exports = { InsuranceTab };
