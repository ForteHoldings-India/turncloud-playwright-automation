const { expect } = require('@playwright/test');

class EmployerTab {
  constructor(page, workspace) {
    this.page = page;
    this.workspace = workspace;

    this.employerTabButton = page.locator('span').filter({ hasText: 'Employer' }).first();
    this.employerNameInput = page.getByRole('textbox', { name: /^Name$/i });
    this.occupationInput = page.getByRole('textbox', { name: /Occupation/i });
    this.companyAddressInput = page.getByRole('textbox', { name: /Company Address/i });
    this.aptSuiteInput = page.getByRole('textbox', { name: /Apt\/Suite/i });
    this.cityInput = page.getByRole('textbox', { name: /^City$/i });
    this.stateButton = page.locator("//div[@id='EmployerForm']//label[text()='State']/following-sibling::span[contains(@class,'k-picker')]");
    this.stateOptions = page.locator('div.k-list.k-list-md ul li');
    this.zipInput = page.getByRole('textbox', { name: /^Zip$/i });
    this.telephoneInput = page.getByRole('textbox', { name: /Telephone/i });
    this.extensionInput = page.getByRole('textbox', { name: /Ext\./i });
    this.faxInput = page.getByRole('textbox', { name: /^Fax$/i });
    this.websiteInput = page.getByRole('textbox', { name: /Website/i });
  }

  async openEmployerTab() {
    await expect(this.employerTabButton).toBeVisible({ timeout: 30000 });
    await this.employerTabButton.click();
    await expect(this.employerNameInput).toBeVisible({ timeout: 30000 });
  }

  async selectEmployerState(state) {
    await this.workspace.selectPickerOptionByText(this.stateButton, this.stateOptions, state);
  }

  async fillEmployerIdentityDetails({ employerName, occupation }) {
    await expect(this.employerNameInput).toBeVisible({ timeout: 30000 });

    if (employerName) await this.workspace.setStableValue(this.employerNameInput, employerName);
    if (occupation) await this.workspace.setStableValue(this.occupationInput, occupation);
    await this.workspace.settleUi(500);
  }

  async fillEmployerAddressDetails({ companyAddress, aptSuite, city, state, zip }) {
    if (companyAddress) await this.workspace.setStableValue(this.companyAddressInput, companyAddress);
    if (aptSuite) await this.workspace.setStableValue(this.aptSuiteInput, aptSuite);
    if (city) await this.workspace.setStableValue(this.cityInput, city);
    if (state) await this.selectEmployerState(state);
    if (zip) await this.workspace.setStableValue(this.zipInput, zip);
    await this.workspace.settleUi(500);
  }

  async fillEmployerContactDetails({ telephone, extension, fax, website }) {
    if (telephone) await this.workspace.setStableValue(this.telephoneInput, telephone);
    if (extension) await this.workspace.setStableValue(this.extensionInput, extension);
    if (fax) await this.workspace.setStableValue(this.faxInput, fax);
    if (website) await this.workspace.setStableValue(this.websiteInput, website);
  }

  async fillEmployerDetails(details) {
    await this.fillEmployerIdentityDetails(details);
    await this.fillEmployerAddressDetails(details);
    await this.fillEmployerContactDetails(details);
  }
}

module.exports = { EmployerTab };

