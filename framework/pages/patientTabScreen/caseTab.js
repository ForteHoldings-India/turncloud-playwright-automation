const { expect } = require('@playwright/test');
const { DiagnosisSection } = require('./diagnosisSection');

class CaseTab {
  constructor(page, workspace) {
    this.page = page;
    this.workspace = workspace;

    // Initialize DiagnosisSection
    this.diagnosisSection = new DiagnosisSection(page, workspace);

    this.casesTreeItem = page.getByRole('treeitem', { name: /Cases/i });
    this.patientCaseHeading = page.getByText('Patient Case(s)').first();
    this.caseGridRows = page
      .locator('main [role="row"]:visible')
      .filter({ has: page.locator('[role="gridcell"]') })
      .filter({ hasText: /\d{2}\/\d{2}\/\d{4}/ });

    this.caseTypeListbox = page.getByRole('listbox', { name: /^Case Type:/i });
    this.caseStatusListbox = page.getByRole('listbox', { name: /^Case Status:/i });
    this.initialComplaintInput = page.getByRole('textbox', { name: /Initial Complaint:/i });
    this.initialVisitDateInput = page.getByRole('combobox', { name: /Initial Visit Date:/i });
    this.similarIllnessQualifierListbox = page.getByRole('listbox', { name: /Similar Illness Qualifier:/i });
    this.similarIllnessDateInput = page.getByRole('combobox', { name: /Similar Illness Date:/i });
    this.additionalClaimInfoInput = page.getByRole('textbox', { name: /Additional Claim Information:/i });
    this.priorAuthInput = page.getByRole('textbox', { name: /Prior Auth No:/i });
    this.allowedAmountInput = page.getByRole('spinbutton').first();

    this.caseInsuranceHeading = page.getByText('Insurance for Selected Case').first();
    this.caseInsuranceSection = this.caseInsuranceHeading.locator('..').locator('..').first();
    this.caseInsuranceAddButton = this.caseInsuranceHeading.locator('..').getByRole('button', { name: /^.*Add$/i }).first();
    this.caseInsuranceRows = page
      .locator('main [role="row"]:visible')
      .filter({ hasText: /(Primary|Secondary|Tertiary|American National|Anthem|Claim|is required)/i })
      .filter({ has: page.locator('[role="gridcell"]') });

    this.referringHeading = page.getByText('Referring Doctor').first();
    this.referringSection = this.referringHeading.locator('..').locator('..').first();
    this.referringClearButton = page.locator('#PatientCaseRefDoctorClearButton');
    this.referringLookupToggle = page.locator('#PatientCaseRefDrBlock').getByRole('button', { name: /expand combobox/i });
    this.referringLookupCombobox = page.getByRole('combobox', { name: /Type a Doctor name or pick from the list/i });
    this.referringFirstInput = this.referringSection.getByRole('textbox', { name: /^First$/i });
    this.referringMiddleInput = this.referringSection.getByRole('textbox', { name: /^M$/i });
    this.referringLastInput = this.referringSection.getByRole('textbox', { name: /^Last$/i });
    this.referringAddressInput = this.referringSection.getByRole('textbox', { name: /^Address$/i });
    this.referringAptSuiteInput = this.referringSection.getByRole('textbox', { name: /Apt\/Suite/i });
    this.referringCityInput = this.referringSection.getByRole('textbox', { name: /^City$/i });
    this.referringStateListbox = this.referringSection.getByRole('listbox').first();
    this.referringZipInput = this.referringSection.getByRole('textbox', { name: /^Zip$/i });
    this.referringEmailInput = page.locator('#PatientCasesRefProviderEmailAddress');
    this.referringPrimaryPhoneInput = page.locator('#PatientCasesRefProviderPrimaryPhone');
    this.referringWorkPhoneInput = page.locator('#PatientCasesRefProviderWorkPhone');
    this.referringFaxInput = page.locator('#PatientCasesRefProviderFax');
    this.referringQualifierListbox = this.referringSection.getByRole('listbox', { name: /Qualifier/i });
    this.referringTaxonomyInput = page.locator('#PatientCasesRefProviderTaxonomyCode');
    this.referringDoctorIdInput = this.referringSection.getByRole('textbox', { name: /Doctor Id No\./i });
    this.referringIndividualNpiInput = this.referringSection.getByRole('textbox', { name: /Individual NPI/i });
    this.referringGroupNpiInput = this.referringSection.getByRole('textbox', { name: /Group NPI/i });

    this.attorneyHeading = page.getByText('Attorney Information').first();
    this.attorneySection = this.attorneyHeading.locator('..').locator('..').first();
    this.attorneyClearButton = page.locator('#PatientCaseAttorneyClearButton');
    this.attorneyLookupToggle = page.locator('#PatientCaseAttrorneyBlock').getByRole('button', { name: /expand combobox/i });
    this.attorneyLookupCombobox = page.getByRole('combobox', { name: /Type an Attorney name or pick from the list/i });
    this.attorneyFirmNameInput = this.attorneySection.getByRole('textbox', { name: /Firm Name/i });
    this.attorneyFirstInput = this.attorneySection.getByRole('textbox', { name: /^Name$/i });
    this.attorneyMiddleInput = this.attorneySection.getByRole('textbox', { name: /^MI$/i });
    this.attorneyLastInput = this.attorneySection.getByRole('textbox', { name: /^Last$/i });
    this.attorneyAddressInput = page.locator('#PatientCasesAttorneyAddress');
    this.attorneyAptSuiteInput = page.locator('#PatientCasesAttorneyAddress2');
    this.attorneyCityInput = page.locator('#PatientCasesAttorneyCity');
    this.attorneyStateListbox = this.attorneySection.getByRole('listbox').first();
    this.attorneyZipInput = this.attorneySection.getByRole('textbox', { name: /Zip Code/i });
    this.attorneyEmailInput = page.locator('#PatientCasesAttorneyEmail');
    this.attorneyPhoneInput = page.locator('#PatientCasesAttorneyPhone');
    this.attorneyFaxInput = page.locator('#PatientCasesAttorneyFax');

    this.overwriteDialogText = page.getByText(/overwrite/i).first();
  }

  escapeRegex(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getLabeledSection(labelText) {
    return this.page
      .getByText(new RegExp(`^${this.escapeRegex(labelText)}$`, 'i'))
      .locator('..')
      .first();
  }

  getLabeledListbox(labelText) {
    return this.getLabeledSection(labelText).getByRole('listbox').first();
  }

  getLabeledTextbox(labelText) {
    return this.getLabeledSection(labelText).getByRole('textbox').first();
  }

  getLabeledCombobox(labelText) {
    return this.getLabeledSection(labelText).getByRole('combobox').first();
  }

  getCaseInsuranceRow(index) {
    return this.caseInsuranceRows.nth(index);
  }

  getSectionConfig(section) {
    return section === 'attorney'
      ? {
          section: this.attorneySection,
          clearButton: this.attorneyClearButton,
          lookupToggle: this.attorneyLookupToggle,
          lookupCombobox: this.attorneyLookupCombobox
        }
      : {
          section: this.referringSection,
          clearButton: this.referringClearButton,
          lookupToggle: this.referringLookupToggle,
          lookupCombobox: this.referringLookupCombobox
        };
  }

  async scrollCaseInsuranceIntoView(row = null) {
    await this.caseInsuranceSection.scrollIntoViewIfNeeded().catch(() => {});
    await this.workspace.settleUi(200);

    if (row) {
      await row.scrollIntoViewIfNeeded().catch(() => {});
      await this.workspace.settleUi(200);
    }
  }

  async scrollSectionIntoView(section, row = null) {
    const config = this.getSectionConfig(section);
    await config.section.scrollIntoViewIfNeeded().catch(() => {});
    await this.workspace.settleUi(200);

    if (row) {
      await row.scrollIntoViewIfNeeded().catch(() => {});
      await this.workspace.settleUi(150);
    }
  }

  async openCasesTab() {
    await expect(this.casesTreeItem).toBeVisible({ timeout: 30000 });
    await this.casesTreeItem.click();
    await expect(this.patientCaseHeading).toBeVisible({ timeout: 30000 });
    await expect(this.caseGridRows.first()).toBeVisible({ timeout: 30000 });
    await this.workspace.settleUi(150);
  }

  async selectExistingCaseRow(index = 0) {
    const row = this.caseGridRows.nth(index);
    await expect(row).toBeVisible({ timeout: 30000 });
    await row.getByRole('gridcell').first().click({ force: true });
    await this.workspace.settleUi(250);
  }

  async selectListboxOption(listbox, optionText) {
    const toggle = listbox.getByRole('button', { name: /select/i });
    await expect(toggle).toBeVisible({ timeout: 30000 });
    await toggle.click();
    await this.workspace.settleUi(250);

    const optionPattern = new RegExp(this.escapeRegex(optionText), 'i');
    // Scope option search to the visible dropdown container (Kendo UI renders options in a container)
    const dropdownContainer = this.page.locator('.k-animation-container:visible').first();
    const option = dropdownContainer.getByRole('option', { name: optionPattern }).first();
    await expect(option).toBeVisible({ timeout: 30000 });
    await option.click();
    await this.workspace.settleUi(250);
  }

  async expectListboxValue(listbox, valueText) {
    await expect(listbox).toContainText(new RegExp(this.escapeRegex(valueText), 'i'), { timeout: 10000 });
  }

  async expectRowContainsCaseType(caseTypeName, index = 0) {
    const row = this.caseGridRows.nth(index);
    await expect(row).toContainText(new RegExp(this.escapeRegex(caseTypeName), 'i'), { timeout: 10000 });
  }

  async fillCaseDetails(details) {
    const {
      caseTypeName,
      caseStatus,
      referringOffice,
      initialComplaint,
      initialVisitDate,
      similarIllnessQualifier,
      similarIllnessDate,
      additionalClaimInformation,
      priorAuthNo,
      outsideLab,
      allowedAmount,
      mcResubmissionCode,
      accidentClaimNumber,
      illnessDate,
      illnessQualifier,
      conditionRelatedTo,
      state
    } = details;

    if (caseTypeName) await this.selectListboxOption(this.caseTypeListbox, caseTypeName);
    if (caseStatus) await this.selectListboxOption(this.caseStatusListbox, caseStatus);
    if (referringOffice) await this.selectListboxOption(this.getLabeledListbox('Other Service Facility:'), referringOffice);
    if (initialComplaint) await this.workspace.setStableValue(this.initialComplaintInput, initialComplaint);
    if (initialVisitDate) await this.workspace.setStableDateValue(this.initialVisitDateInput, initialVisitDate);
    if (similarIllnessQualifier) await this.selectListboxOption(this.similarIllnessQualifierListbox, similarIllnessQualifier);
    if (similarIllnessDate) await this.workspace.setStableDateValue(this.similarIllnessDateInput, similarIllnessDate);
    if (additionalClaimInformation) await this.workspace.setStableValue(this.additionalClaimInfoInput, additionalClaimInformation);
    if (priorAuthNo) await this.workspace.setStableValue(this.priorAuthInput, priorAuthNo);
    if (outsideLab) await this.selectListboxOption(this.getLabeledListbox('Outside Lab:'), outsideLab);
    if (allowedAmount !== undefined && allowedAmount !== null) await this.workspace.setStableNumericValue(this.allowedAmountInput, allowedAmount);
    if (mcResubmissionCode) await this.workspace.setStableValue(this.getLabeledTextbox('MC Resubmission Code:'), mcResubmissionCode);
    if (accidentClaimNumber) await this.workspace.setStableValue(this.getLabeledTextbox('MC Reference Number:'), accidentClaimNumber);
    if (illnessDate) await this.workspace.setStableDateValue(this.getLabeledCombobox('Illness Date:'), illnessDate);
    if (illnessQualifier) await this.selectListboxOption(this.getLabeledListbox('Illness Qualifier:'), illnessQualifier);
    if (conditionRelatedTo) await this.selectListboxOption(this.getLabeledListbox('Patient Condition Related To Accident:'), conditionRelatedTo);
    if (state) await this.selectListboxOption(this.getLabeledListbox('Accident State:'), state);
  }

  async setCaseInsuranceClaimNumber(row, claimNumber) {
    await this.scrollCaseInsuranceIntoView(row);
    const claimCell = row.getByRole('gridcell').nth(2);
    await claimCell.click({ force: true });
    await this.workspace.settleUi(150);
    await claimCell.dblclick({ force: true }).catch(() => {});
    await this.workspace.settleUi(150);
    await this.page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A').catch(() => {});
    await this.page.keyboard.press('Backspace').catch(() => {});
    await this.page.keyboard.type(claimNumber, { delay: 50 });
    await this.page.keyboard.press('Tab').catch(() => {});
    await this.workspace.settleUi(300);
    await expect(row).toContainText(new RegExp(this.escapeRegex(claimNumber), 'i'), { timeout: 10000 });
  }

  async expectCaseInsuranceDropdownOptions(optionNames) {
    for (const optionName of optionNames) {
      const option = this.page.getByRole('option', { name: new RegExp(this.escapeRegex(optionName), 'i') }).first();
      await expect(option).toBeVisible({ timeout: 30000 });
    }
  }

  async openCaseInsuranceDropdown(row) {
    await this.scrollCaseInsuranceIntoView(row);
    const listbox = row.getByRole('listbox').first();
    const toggle = listbox.getByRole('button', { name: /select/i });

    if (await toggle.isVisible().catch(() => false)) {
      await toggle.scrollIntoViewIfNeeded().catch(() => {});
      await this.workspace.settleUi(150);
      await toggle.click({ force: true });
      await this.workspace.settleUi(600);
      return;
    }

    const insuranceCell = row.getByRole('gridcell').first();
    await insuranceCell.scrollIntoViewIfNeeded().catch(() => {});
    await this.workspace.settleUi(150);
    await insuranceCell.click({ force: true });
    await this.workspace.settleUi(600);
  }

  async openCaseInsuranceTypeDropdown(row) {
    await this.scrollCaseInsuranceIntoView(row);
    const typeCell = row.getByRole('gridcell').nth(1);
    await typeCell.scrollIntoViewIfNeeded().catch(() => {});
    await this.workspace.settleUi(150);
    await typeCell.click({ force: true });
    await this.workspace.settleUi(300);

    const typeListbox = typeCell.getByRole('listbox').first();
    const toggle = typeListbox.getByRole('button', { name: /select/i }).first();
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click({ force: true });
      await this.workspace.settleUi(500);
      return;
    }

    await typeCell.dblclick({ force: true }).catch(() => {});
    await this.workspace.settleUi(500);
  }

  async addInsuranceForSelectedCase({ patientInsurance, insuranceType, claimNumber, verifyAvailablePatientInsurances = [] }) {
    await this.scrollCaseInsuranceIntoView();
    await expect(this.caseInsuranceAddButton).toBeVisible({ timeout: 30000 });
    const previousCount = await this.caseInsuranceRows.count();
    await this.caseInsuranceAddButton.click();
    await this.workspace.settleUi(800);

    await expect.poll(async () => await this.caseInsuranceRows.count(), { timeout: 30000 }).toBe(previousCount + 1);
    const newRow = this.getCaseInsuranceRow(previousCount);
    await expect(newRow).toBeVisible({ timeout: 30000 });
    await this.scrollCaseInsuranceIntoView(newRow);
    await this.workspace.settleUi(500);

    await this.openCaseInsuranceDropdown(newRow);

    if (verifyAvailablePatientInsurances.length > 0) {
      await this.expectCaseInsuranceDropdownOptions(verifyAvailablePatientInsurances);
    }

    const insuranceOption = this.page.getByRole('option', { name: new RegExp(this.escapeRegex(patientInsurance), 'i') }).first();
    await expect(insuranceOption).toBeVisible({ timeout: 30000 });
    await insuranceOption.click();
    await this.workspace.settleUi(500);

    if (insuranceType) {
      await this.openCaseInsuranceTypeDropdown(newRow);
      const typeOption = this.page.getByRole('option', { name: new RegExp(`^${this.escapeRegex(insuranceType)}$`, 'i') }).first();
      if (await typeOption.isVisible().catch(() => false)) {
        await typeOption.click();
        await this.workspace.settleUi(300);
      }
    }

    if (claimNumber) {
      await this.setCaseInsuranceClaimNumber(newRow, claimNumber);
    }
  }

  async updateInsuranceTypeForSelectedCase(index, insuranceType) {
    const row = this.getCaseInsuranceRow(index);
    await this.openCaseInsuranceTypeDropdown(row);
    const typeOption = this.page.getByRole('option', { name: new RegExp(`^${this.escapeRegex(insuranceType)}$`, 'i') }).first();
    await expect(typeOption).toBeVisible({ timeout: 30000 });
    await typeOption.click();
    await this.workspace.settleUi(300);
  }

  async expectCaseInsuranceRow(index, expected) {
    const row = this.getCaseInsuranceRow(index);
    await this.scrollCaseInsuranceIntoView(row);
    await expect(row).toBeVisible({ timeout: 30000 });

    if (expected.patientInsurance) await expect(row).toContainText(new RegExp(this.escapeRegex(expected.patientInsurance), 'i'), { timeout: 10000 });
    if (expected.insuranceType) await expect(row).toContainText(new RegExp(`^.*${this.escapeRegex(expected.insuranceType)}.*$`, 'i'), { timeout: 10000 });
    if (expected.claimNumber) await expect(row).toContainText(new RegExp(this.escapeRegex(expected.claimNumber), 'i'), { timeout: 10000 });
  }

  async expectSelectedCaseType(caseTypeName) {
    await this.expectListboxValue(this.caseTypeListbox, caseTypeName);
    await this.expectRowContainsCaseType(caseTypeName, 0);
  }

  async respondToOverwriteDialog(decision = 'accept') {
    // Locate the alertdialog (scoped container)
    const dialog = this.page.getByRole('alertdialog');
    
    // Wait for dialog to be visible
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await this.workspace.settleUi(150);

    // Find button INSIDE the dialog only
    const buttonName = decision === 'accept' ? /^OK$/i : /^Cancel$/i;
    const button = dialog.getByRole('button', { name: buttonName });
    
    await expect(button).toBeVisible({ timeout: 10000 });
    await button.click();
    
    // Wait for dialog to close
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
    await this.workspace.settleUi(300);
    return true;
  }

  async fillReferringDoctorDetails(details) {
    await this.scrollSectionIntoView('referring');
    if (details.firstName) await this.workspace.setStableValue(this.referringFirstInput, details.firstName);
    if (details.middleInitial) await this.workspace.setStableValue(this.referringMiddleInput, details.middleInitial);
    if (details.lastName) await this.workspace.setStableValue(this.referringLastInput, details.lastName);
    if (details.address) await this.workspace.setStableValue(this.referringAddressInput, details.address);
    if (details.aptSuite) await this.workspace.setStableValue(this.referringAptSuiteInput, details.aptSuite);
    if (details.city) await this.workspace.setStableValue(this.referringCityInput, details.city);
    if (details.state) await this.selectListboxOption(this.referringStateListbox, details.state);
    if (details.zip) await this.workspace.setStableValue(this.referringZipInput, details.zip);
    if (details.email) await this.workspace.setStableValue(this.referringEmailInput, details.email);
    if (details.primaryPhone) await this.workspace.setStableValue(this.referringPrimaryPhoneInput, details.primaryPhone);
    if (details.workPhone) await this.workspace.setStableValue(this.referringWorkPhoneInput, details.workPhone);
    if (details.fax) await this.workspace.setStableValue(this.referringFaxInput, details.fax);
    if (details.qualifier) await this.selectListboxOption(this.referringQualifierListbox, details.qualifier);
    if (details.taxonomy) await this.workspace.setStableValue(this.referringTaxonomyInput, details.taxonomy);
    if (details.doctorId) await this.workspace.setStableValue(this.referringDoctorIdInput, details.doctorId);
    if (details.individualNpi) await this.workspace.setStableValue(this.referringIndividualNpiInput, details.individualNpi);
    if (details.groupNpi) await this.workspace.setStableValue(this.referringGroupNpiInput, details.groupNpi);
  }

  async fillAttorneyDetails(details) {
    await this.scrollSectionIntoView('attorney');
    if (details.firmName) await this.workspace.setStableValue(this.attorneyFirmNameInput, details.firmName);
    if (details.firstName) await this.workspace.setStableValue(this.attorneyFirstInput, details.firstName);
    if (details.middleInitial) await this.workspace.setStableValue(this.attorneyMiddleInput, details.middleInitial);
    if (details.lastName) await this.workspace.setStableValue(this.attorneyLastInput, details.lastName);
    if (details.address) await this.workspace.setStableValue(this.attorneyAddressInput, details.address);
    if (details.aptSuite) await this.workspace.setStableValue(this.attorneyAptSuiteInput, details.aptSuite);
    if (details.city) await this.workspace.setStableValue(this.attorneyCityInput, details.city);
    if (details.state) await this.selectListboxOption(this.attorneyStateListbox, details.state);
    if (details.zip) await this.workspace.setStableValue(this.attorneyZipInput, details.zip);
    if (details.email) await this.workspace.setStableValue(this.attorneyEmailInput, details.email);
    if (details.phone) await this.workspace.setStableValue(this.attorneyPhoneInput, details.phone);
    if (details.fax) await this.workspace.setStableValue(this.attorneyFaxInput, details.fax);
  }

  async selectReferringDoctorFromDropdown(name, options = {}) {
    await this.scrollSectionIntoView('referring');
    await expect(this.referringLookupToggle).toBeVisible({ timeout: 30000 });
    await this.referringLookupToggle.click();
    await this.workspace.settleUi(400);
    const option = this.page.getByText(new RegExp(this.escapeRegex(name), 'i')).first();
    await expect(option).toBeVisible({ timeout: 30000 });
    await option.click();
    await this.workspace.settleUi(300);
    if (options.overwriteDecision) await this.respondToOverwriteDialog(options.overwriteDecision);
  }

  async selectAttorneyFromDropdown(name, options = {}) {
    await this.scrollSectionIntoView('attorney');
    await expect(this.attorneyLookupToggle).toBeVisible({ timeout: 30000 });
    await this.attorneyLookupToggle.click();
    await this.workspace.settleUi(400);
    const option = this.page.getByText(new RegExp(this.escapeRegex(name), 'i')).first();
    await expect(option).toBeVisible({ timeout: 30000 });
    await option.click();
    await this.workspace.settleUi(300);
    if (options.overwriteDecision) await this.respondToOverwriteDialog(options.overwriteDecision);
  }

  async clearReferringDoctor(decision = 'accept') {
    await this.scrollSectionIntoView('referring');
    await expect(this.referringClearButton).toBeVisible({ timeout: 30000 });
    await this.referringClearButton.click();
    await this.workspace.settleUi(300);
    if (decision) await this.respondToOverwriteDialog(decision);
  }

  async clearAttorney(decision = 'accept') {
    await this.scrollSectionIntoView('attorney');
    await expect(this.attorneyClearButton).toBeVisible({ timeout: 30000 });
    await this.attorneyClearButton.click();
    await this.workspace.settleUi(300);
    if (decision) await this.respondToOverwriteDialog(decision);
  }

  async readReferringDoctorDetails() {
    await this.scrollSectionIntoView('referring');
    return {
      firstName: (await this.referringFirstInput.inputValue().catch(() => '')).trim(),
      middleInitial: (await this.referringMiddleInput.inputValue().catch(() => '')).trim(),
      lastName: (await this.referringLastInput.inputValue().catch(() => '')).trim(),
      address: (await this.referringAddressInput.inputValue().catch(() => '')).trim(),
      aptSuite: (await this.referringAptSuiteInput.inputValue().catch(() => '')).trim(),
      city: (await this.referringCityInput.inputValue().catch(() => '')).trim(),
      state: ((await this.referringStateListbox.locator('.k-input-value-text').textContent().catch(() => '')) || '').trim(),
      zip: (await this.referringZipInput.inputValue().catch(() => '')).trim(),
      email: (await this.referringEmailInput.inputValue().catch(() => '')).trim(),
      primaryPhone: (await this.referringPrimaryPhoneInput.inputValue().catch(() => '')).trim(),
      workPhone: (await this.referringWorkPhoneInput.inputValue().catch(() => '')).trim(),
      fax: (await this.referringFaxInput.inputValue().catch(() => '')).trim(),
      qualifier: ((await this.referringQualifierListbox.textContent().catch(() => '')) || '').replace(/select/gi, '').trim(),
      taxonomy: (await this.referringTaxonomyInput.inputValue().catch(() => '')).trim(),
      doctorId: (await this.referringDoctorIdInput.inputValue().catch(() => '')).trim(),
      individualNpi: (await this.referringIndividualNpiInput.inputValue().catch(() => '')).trim(),
      groupNpi: (await this.referringGroupNpiInput.inputValue().catch(() => '')).trim()
    };
  }

  async readAttorneyDetails() {
    await this.scrollSectionIntoView('attorney');
    return {
      firmName: (await this.attorneyFirmNameInput.inputValue().catch(() => '')).trim(),
      firstName: (await this.attorneyFirstInput.inputValue().catch(() => '')).trim(),
      middleInitial: (await this.attorneyMiddleInput.inputValue().catch(() => '')).trim(),
      lastName: (await this.attorneyLastInput.inputValue().catch(() => '')).trim(),
      address: (await this.attorneyAddressInput.inputValue().catch(() => '')).trim(),
      aptSuite: (await this.attorneyAptSuiteInput.inputValue().catch(() => '')).trim(),
      city: (await this.attorneyCityInput.inputValue().catch(() => '')).trim(),
      state: ((await this.attorneyStateListbox.textContent().catch(() => '')) || '').replace(/select/gi, '').trim(),
      zip: (await this.attorneyZipInput.inputValue().catch(() => '')).trim(),
      email: (await this.attorneyEmailInput.inputValue().catch(() => '')).trim(),
      phone: (await this.attorneyPhoneInput.inputValue().catch(() => '')).trim(),
      fax: (await this.attorneyFaxInput.inputValue().catch(() => '')).trim()
    };
  }

  async expectReferringDoctorDetails(expectedDetails) {
    const actualDetails = await this.readReferringDoctorDetails();
    for (const [key, expectedValue] of Object.entries(expectedDetails)) {
      if (expectedValue === undefined) continue;
      expect(actualDetails[key], `Unexpected referring doctor field for ${key}`).toBe(String(expectedValue).trim());
    }
  }

  async expectAttorneyDetails(expectedDetails) {
    const actualDetails = await this.readAttorneyDetails();
    for (const [key, expectedValue] of Object.entries(expectedDetails)) {
      if (expectedValue === undefined) continue;
      expect(actualDetails[key], `Unexpected attorney field for ${key}`).toBe(String(expectedValue).trim());
    }
  }

  async expectSelectedReferringDoctor(name) {
    const details = await this.readReferringDoctorDetails();
    // Verify the name appears in either first+last or across the form
    const fullName = `${details.firstName} ${details.lastName}`.trim();
    const hasName = fullName.toLowerCase().includes(name.toLowerCase()) || 
                    name.toLowerCase().includes(details.firstName?.toLowerCase() || '') ||
                    name.toLowerCase().includes(details.lastName?.toLowerCase() || '');
    
    expect(fullName, `Expected referring doctor name to contain "${name}", but got "${fullName}"`).toBeTruthy();
    expect(hasName).toBe(true);
  }

  async expectSelectedAttorney(name) {
    const details = await this.readAttorneyDetails();
    // Verify the name appears in either first+last or across the form
    const fullName = `${details.firstName} ${details.lastName}`.trim();
    const hasName = fullName.toLowerCase().includes(name.toLowerCase()) || 
                    name.toLowerCase().includes(details.firstName?.toLowerCase() || '') ||
                    name.toLowerCase().includes(details.lastName?.toLowerCase() || '');
    
    expect(fullName, `Expected attorney name to contain "${name}", but got "${fullName}"`).toBeTruthy();
    expect(hasName).toBe(true);
  }
}

module.exports = { CaseTab };

