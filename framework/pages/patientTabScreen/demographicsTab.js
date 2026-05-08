const { expect } = require('@playwright/test');

class DemographicsTab {
  constructor(page, workspace) {
    this.page = page;
    this.workspace = workspace;

    this.firstNameInput = page.locator('input[placeholder="First Name"]:visible').first();
    this.middleInitialInput = page.locator('input[placeholder="MI"]:visible').first();
    this.lastNameInput = page.locator('input[placeholder="Last Name"]:visible').first();
    this.preferredNameInput = page.locator('input[placeholder="Preferred Name"]:visible').first();
    this.dateOfBirthInput = page.locator('#PatientDemographicsDOB:visible').first();
    this.sexListbox = page.getByRole('listbox', { name: /Sex/i });
    this.maritalStatusListbox = page.getByRole('listbox', { name: /Marital Status/i });
    this.stateListbox = page.getByRole('listbox').nth(3);
    this.spousePartnerInput = page.locator('input[placeholder="Spouse/Partner"]:visible').first();
    this.emailInput = page.locator('input[placeholder="name@domain.com"]:visible').first();
    this.ssnInput = page.locator('input[placeholder="000-00-0000"]:visible').first();
    this.address1Input = page.locator('input[placeholder="Address"]:visible').first();
    this.address2Input = page.locator('input[placeholder="Apt/Suite"]:visible').first();
    this.cityInput = page.locator('input[placeholder="City"]:visible').first();
    this.zipInput = page.locator('input[placeholder="Zip"]:visible').first();
    this.referralSourceInput = page.locator('input[placeholder="Referral Source"]:visible').first();
    this.mobilePhoneInput = page.locator('input[placeholder="(000) 000-0000"]:visible').nth(0);
    this.homePhoneInput = page.locator('input[placeholder="(000) 000-0000"]:visible').nth(1);
    this.workPhoneInput = page.locator('input[placeholder="(000) 000-0000"]:visible').nth(2);
    this.userField1Input = page.locator('li:has-text("User Field 1")').getByRole('textbox').first();
    this.userField1ValueInput = page.locator('li:has-text("User Field 1")').getByRole('textbox').nth(1);
    this.userField2Input = page.locator('li:has-text("User Field 2")').getByRole('textbox').first();
    this.userField2ValueInput = page.locator('li:has-text("User Field 2")').getByRole('textbox').nth(1);
    this.demographicsTreeItem = page.getByRole('treeitem', { name: /Demographics/i });
  }

  async fillNewPatientForm({ firstName, middleInitial, lastName, preferredName }) {
    await expect(this.firstNameInput).toBeVisible({ timeout: 30000 });
    await this.workspace.setStableValue(this.firstNameInput, firstName);

    if (middleInitial) {
      await this.workspace.setStableValue(this.middleInitialInput, middleInitial);
    }

    await this.workspace.setStableValue(this.lastNameInput, lastName);

    if (preferredName) {
      await this.workspace.setStableValue(this.preferredNameInput, preferredName);
    }
  }

  async openDemographics() {
    await expect(this.demographicsTreeItem).toBeVisible({ timeout: 30000 });
    await this.demographicsTreeItem.click();
    await expect(this.firstNameInput).toBeVisible({ timeout: 30000 });
  }

  async getCurrentPatientName() {
    return {
      firstName: await this.firstNameInput.inputValue(),
      lastName: await this.lastNameInput.inputValue()
    };
  }

  async expectCurrentPatientName(firstName, lastName) {
    await expect(this.firstNameInput).toHaveValue(firstName, { timeout: 30000 });
    await expect(this.lastNameInput).toHaveValue(lastName, { timeout: 30000 });
  }

  async updateExistingPatientName({ firstName, lastName }) {
    await expect(this.firstNameInput).toBeVisible({ timeout: 30000 });
    await this.workspace.setStableValue(this.firstNameInput, firstName);
    await expect(this.firstNameInput).toHaveValue(firstName, { timeout: 30000 });
    await this.workspace.settleUi(500);

    await expect(this.lastNameInput).toBeVisible({ timeout: 30000 });
    await this.workspace.setStableValue(this.lastNameInput, lastName);
    await expect(this.lastNameInput).toHaveValue(lastName, { timeout: 30000 });
    await this.workspace.settleUi(500);

    await this.lastNameInput.press('Tab');
    await this.workspace.settleUi(1000);
    await this.expectCurrentPatientName(firstName, lastName);
  }

  async saveExistingPatientAfterNameUpdate(firstName, lastName) {
    await this.expectCurrentPatientName(firstName, lastName);
    await this.workspace.settleUi(1500);
    await this.workspace.saveNewPatient();
  }

  async fillDemographicIdentityDetails({ dateOfBirth, sex, maritalStatus, spousePartner, ssn }) {
    if (dateOfBirth) await this.workspace.setStableDateValue(this.dateOfBirthInput, dateOfBirth);

    if (sex) {
      await this.workspace.selectListOption(this.sexListbox, new RegExp(`^${sex}$`, 'i'));
    }

    if (maritalStatus) {
      await this.workspace.selectListOption(this.maritalStatusListbox, new RegExp(`^${maritalStatus}$`, 'i'));
    }

    if (spousePartner) await this.workspace.setStableValue(this.spousePartnerInput, spousePartner);
    if (ssn) await this.workspace.setStableValue(this.ssnInput, ssn);
    await this.workspace.settleUi(500);
  }

  async fillDemographicContactDetails({ email, address1, address2, city, state, zip, mobilePhone, homePhone, workPhone }) {
    if (email) await this.workspace.setStableValue(this.emailInput, email);
    if (address1) await this.workspace.setStableValue(this.address1Input, address1);
    if (address2) await this.workspace.setStableValue(this.address2Input, address2);
    if (city) await this.workspace.setStableValue(this.cityInput, city);

    if (state) {
      await this.workspace.selectListOption(this.stateListbox, new RegExp(`^${state}$`, 'i'));
    }

    if (zip) await this.workspace.setStableValue(this.zipInput, zip);
    if (mobilePhone) await this.workspace.setStableValue(this.mobilePhoneInput, mobilePhone);
    if (homePhone) await this.workspace.setStableValue(this.homePhoneInput, homePhone);
    if (workPhone) await this.workspace.setStableValue(this.workPhoneInput, workPhone);
    await this.workspace.settleUi(500);
  }

  async fillDemographicReferralDetails({ referralType, referralUser1, referralUser1Value, referralSource, referralUser2, referralUser2Value }) {
    if (referralType) {
      await this.workspace.selectListOption(
        this.page.getByRole('listbox', { name: /Referral Type/i }),
        new RegExp(referralType, 'i')
      );
    }

    if (referralUser1) await this.workspace.setStableValue(this.userField1Input, referralUser1);
    if (referralUser1Value) await this.workspace.setStableValue(this.userField1ValueInput, referralUser1Value);
    if (referralSource) await this.workspace.setStableValue(this.referralSourceInput, referralSource);
    if (referralUser2) await this.workspace.setStableValue(this.userField2Input, referralUser2);
    if (referralUser2Value) await this.workspace.setStableValue(this.userField2ValueInput, referralUser2Value);
  }

  async fillAdditionalPatientDetails(details) {
    await this.fillDemographicIdentityDetails(details);
    await this.fillDemographicContactDetails(details);
    await this.fillDemographicReferralDetails(details);
  }
}

module.exports = { DemographicsTab };
