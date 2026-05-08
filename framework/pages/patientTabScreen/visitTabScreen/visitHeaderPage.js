const { expect } = require('@playwright/test');

class VisitHeaderPage {
  constructor(page, workspace) {
    this.page = page;
    this.workspace = workspace;

    // Visit Header Fields
    this.visitTypeDropdown = page.locator('#EHRVisitTypeDropDown > .k-input-value-text').first();
    this.visitTypeListbox = page.locator('#EHRVisitTypeDropDown_listbox');
    
    this.caseDropdown = page.locator('#EHRVisitCaseDropDown > .k-input-value-text').first();
    this.caseListbox = page.locator('#EHRVisitCaseDropDown_listbox');
    
    this.doctorDropdown = page.locator('#EHRVisitDoctorDropDown > .k-input-value-text').first();
    this.doctorListbox = page.locator('#EHRVisitDoctorDropDown_listbox');
    
    this.visitDateInput = page.locator('input[name*="VisitDate"]').first();
    this.onsetDateInput = page.locator('input[name*="OnsetDate"]').first();
    
    this.statusDropdown = page.getByRole('button', { name: /Pending|Completed/i }).first();
    this.statusOptions = page.getByRole('listitem').filter({ hasText: /Pending|Completed/i });
    
    this.complaintInput = page.getByRole('listitem').filter({ hasText: /Patient Stated Complaint/i }).getByRole('textbox').first();
    
    this.updateButton = page.getByRole('button', { name: /Update/i });
  }

  async selectVisitType(visitTypeName) {
    await this.visitTypeDropdown.click();
    await this.workspace.settleUi(300);
    const option = this.visitTypeListbox.getByText(new RegExp(visitTypeName, 'i')).first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
    await this.workspace.settleUi(250);
  }

  async selectCase(caseText) {
    await this.caseDropdown.click();
    await this.workspace.settleUi(300);
    const option = this.caseListbox.getByRole('option', { name: new RegExp(caseText, 'i') }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
    await this.workspace.settleUi(250);
  }

  async selectDoctor(doctorName) {
    await this.doctorDropdown.click();
    await this.workspace.settleUi(300);
    const option = this.doctorListbox.getByText(new RegExp(doctorName, 'i')).first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
    await this.workspace.settleUi(250);
  }

  async setVisitDate(date) {
    await this.visitDateInput.fill(date);
    await this.workspace.settleUi(200);
  }

  async setOnsetDate(date) {
    await this.onsetDateInput.fill(date);
    await this.workspace.settleUi(200);
  }

  async setStatus(statusName) {
    await this.statusDropdown.click();
    await this.workspace.settleUi(300);
    const option = this.page.getByRole('option', { name: new RegExp(statusName, 'i') }).first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
    await this.workspace.settleUi(250);
  }

  async setComplaint(complaint) {
    await this.complaintInput.fill(complaint);
    await this.workspace.settleUi(200);
  }

  async fillVisitHeader(details) {
    const {
      visitType,
      case: caseSelection,
      doctor,
      visitDate,
      onsetDate,
      status,
      complaint
    } = details;

    if (visitType) await this.selectVisitType(visitType);
    if (caseSelection) await this.selectCase(caseSelection);
    if (doctor) await this.selectDoctor(doctor);
    if (visitDate) await this.setVisitDate(visitDate);
    if (onsetDate) await this.setOnsetDate(onsetDate);
    if (status) await this.setStatus(status);
    if (complaint) await this.setComplaint(complaint);
  }

  async updateVisit() {
    await expect(this.updateButton).toBeVisible({ timeout: 30000 });
    await this.updateButton.click();
    await this.workspace.settleUi(1000);
  }
}

module.exports = { VisitHeaderPage };
