const { expect } = require('@playwright/test');

class VisitTab {
  constructor(page, workspace) {
    this.page = page;
    this.workspace = workspace;

    // Visit Tab Navigation
    this.visitsTreeItem = page.locator('span').filter({ hasText: 'Visits / EHR' }).first();
    this.addNewVisitButton = page.getByRole('button', { name: /Add New Visit/i });
    this.updateButton = page.getByRole('button', { name: /Update/i });
    this.saveButton = page.getByRole('button', { name: /Save/i });
    this.visitDialog = page.locator('.k-window:visible').filter({ hasText: /Visit View/i }).last();

    // Visit Grid
    this.visitGridRows = page
      .locator('main [role="row"]:visible')
      .filter({ has: page.locator('[role="gridcell"]') })
      .filter({ hasText: /\d{2}\/\d{2}\/\d{4}/ });

    // ============ VISIT HEADER SECTION ============
    this.visitDateInput = this.visitDialog.getByRole('combobox').nth(0);
    this.onsetDateInput = this.visitDialog.getByRole('combobox').nth(1);

    this.caseListbox = this.visitDialog.getByRole('listbox').nth(0);
    this.caseToggle = this.caseListbox.getByRole('button', { name: /select/i });

    this.doctorListbox = this.visitDialog.getByRole('listbox').nth(1);
    this.doctorToggle = this.doctorListbox.getByRole('button', { name: /select/i });

    this.visitTypeListbox = this.visitDialog.getByRole('listbox').nth(2);
    this.visitTypeToggle = this.visitTypeListbox.getByRole('button', { name: /select/i });
    this.visibleDropdownOptions = page.locator('.k-animation-container:visible [role="option"]');

    this.statusListbox = this.visitDialog.getByRole('listbox').nth(3);
    this.statusToggle = this.statusListbox.getByRole('button', { name: /select/i });
    this.complaintInput = this.visitDialog.getByRole('textbox').first();

    // ============ VITALS SECTION ============
    this.vitalsTab = this.visitDialog.locator('#EHRTabStrip-tab-2').getByText('Vitals').first();
    this.vitalsHeading = page.getByText('Vitals').first();
    this.vitalsSpinbuttons = this.visitDialog.getByRole('spinbutton');
    this.labValueInputs = this.visitDialog.locator('.k-numerictextbox input:nth-child(2)');
    
    this.heightInput = page.getByRole('textbox', { name: /Height/i }).first();
    this.weightInput = page.getByRole('textbox', { name: /Weight/i }).first();
    this.temperatureInput = page.getByRole('textbox', { name: /Temperature/i }).first();
    this.heartRateInput = page.getByRole('textbox', { name: /Heart Rate/i }).first();
    this.respirationInput = page.getByRole('textbox', { name: /Respiration/i }).first();
    this.oxygenLevelInput = page.getByRole('textbox', { name: /Oxygen Level/i }).first();
    this.oxygenConcentrationInput = page.getByRole('textbox', { name: /Oxygen Concentration/i }).first();
    
    this.potassiumInput = page.locator('input[data-bind*="potassium"]').first();
    this.potassiumNoteInput = page.getByRole('listitem').filter({ hasText: /Potassium mEq\/L Note/i }).getByRole('textbox').first();
    
    this.bpSystolicInput = page.getByRole('textbox', { name: /Sitting Blood Pressure/i }).first();
    this.bpDiastolicInput = page.locator('input[data-bind*="bpDiastolic"]').first();
    
    this.supineBpSystolicInput = page.getByRole('textbox', { name: /Supine Blood Pressure/i }).first();
    this.supineBpDiastolicInput = page.locator('input[data-bind*="supineBp"]').nth(1);
    
    this.totalCholesterolInput = page.getByRole('textbox', { name: /Total.*mg\/dL/i }).first();
    this.totalCholesterolNote = page.getByRole('listitem').filter({ hasText: /Total mg\/dL Note/i }).getByRole('textbox').first();
    
    this.hdlInput = page.getByRole('textbox', { name: /HDL.*mg\/dL/i }).first();
    this.hdlNote = page.getByRole('listitem').filter({ hasText: /HDL mg\/dL Note/i }).getByRole('textbox').first();
    
    this.ldlInput = page.getByRole('textbox', { name: /LDL.*mg\/dL/i }).first();
    this.ldlNote = page.getByRole('listitem').filter({ hasText: /LDL mg\/dL Note/i }).getByRole('textbox').first();
    
    this.triglyceridesInput = page.getByRole('textbox', { name: /Triglycerides.*mg\/dL/i }).first();
    this.triglyceridesNote = page.getByRole('listitem').filter({ hasText: /Triglycerides mg\/dL Note/i }).getByRole('textbox').first();
    
    this.vitalsNotesInput = page.getByRole('textbox', { name: /Notes/i }).first();

    // ============ MEDICAL HISTORY SECTION ============
    this.allergiesHeading = page.getByText('Allergies').first();
    this.addAllergyButton = page.getByRole('button', { name: /Add New Allergy/i }).first();
    
    this.surgeriesHeading = page.getByText('Surgeries').first();
    this.addSurgeryButton = page.getByRole('button', { name: /Add New Surgery/i }).first();
    
    this.medicalHistoryHeading = page.getByText('Medical History').first();
    this.addMedicalHistoryButton = page.getByRole('button', { name: /Add New Medical History/i }).first();

    // ============ ADJUSTMENTS SECTION ============
    this.adjustmentsHeading = page.getByText('Adjustments').first();

    // Success/Confirmation Messages
    this.successMessage = page.getByText(/visit.*saved|saved successfully/i);
  }

  escapeRegex(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async openVisitsTab() {
    await expect(this.visitsTreeItem).toBeVisible({ timeout: 30000 });
    await this.visitsTreeItem.click();
    await expect(this.addNewVisitButton).toBeVisible({ timeout: 30000 });
    await this.workspace.settleUi(150);
  }

  async addNewVisit() {
    await expect(this.addNewVisitButton).toBeVisible({ timeout: 30000 });
    await this.addNewVisitButton.click();
    await this.workspace.settleUi(500);
    await expect(this.visitDialog).toBeVisible({ timeout: 30000 });
    await expect(this.visitDateInput).toBeVisible({ timeout: 30000 });
  }

  // ============ VISIT HEADER METHODS ============
  async selectVisitType(visitTypeName) {
    await this.selectHeaderListboxOption(this.visitTypeListbox, visitTypeName);
  }

  async selectCase(caseText) {
    await this.selectHeaderListboxOption(this.caseListbox, caseText);
  }

  async selectDoctor(doctorName) {
    await this.selectHeaderListboxOption(this.doctorListbox, doctorName);
  }

  async selectStatus(statusName) {
    await this.selectHeaderListboxOption(this.statusListbox, statusName);
  }

  async selectHeaderListboxOption(listbox, optionText) {
    const toggle = listbox.getByRole('button', { name: /select/i }).first();
    await expect(toggle).toBeVisible({ timeout: 30000 });
    await toggle.click();
    await this.workspace.settleUi(300);

    const option = this.visibleDropdownOptions
      .filter({ hasText: new RegExp(this.escapeRegex(optionText), 'i') })
      .first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
    await this.workspace.settleUi(250);
  }

  async fillVisitHeader(details) {
    const {
      visitType,
      caseSelection,
      case: legacyCaseSelection,
      doctor,
      visitDate,
      onsetDate,
      status,
      complaint
    } = details;

    if (visitType) await this.selectVisitType(visitType);
    if (caseSelection || legacyCaseSelection) await this.selectCase(caseSelection || legacyCaseSelection);
    if (doctor) await this.selectDoctor(doctor);
    if (visitDate) await this.workspace.setStableDateValue(this.visitDateInput, visitDate);
    if (onsetDate) await this.workspace.setStableDateValue(this.onsetDateInput, onsetDate);
    if (status) await this.selectStatus(status);
    if (complaint) await this.workspace.setStableValue(this.complaintInput, complaint);
  }

  // ============ VITALS SECTION METHODS ============
  async scrollToVitalsSection() {
    await expect(this.vitalsTab).toBeVisible({ timeout: 30000 });
    await this.vitalsTab.click();
    await this.workspace.settleUi(300);
  }

  async fillVitals() {
    await this.scrollToVitalsSection();
    await this.workspace.settleUi(200);
  }

  // ============ MEDICAL HISTORY SECTION METHODS ============
  async scrollToMedicalHistorySection() {
    await this.allergiesHeading.scrollIntoViewIfNeeded().catch(() => {});
    await this.workspace.settleUi(300);
  }

  async addAllergy() {
    await this.scrollToMedicalHistorySection();
    await expect(this.addAllergyButton).toBeVisible({ timeout: 10000 });
    await this.addAllergyButton.click();
    await this.workspace.settleUi(300);
  }

  async addSurgery() {
    await this.scrollToMedicalHistorySection();
    await expect(this.addSurgeryButton).toBeVisible({ timeout: 10000 });
    await this.addSurgeryButton.click();
    await this.workspace.settleUi(300);
  }

  async addMedicalHistory() {
    await this.scrollToMedicalHistorySection();
    await expect(this.addMedicalHistoryButton).toBeVisible({ timeout: 10000 });
    await this.addMedicalHistoryButton.click();
    await this.workspace.settleUi(300);
  }

  // ============ UPDATE/SAVE METHODS ============
  async updateVisit() {
    await expect(this.updateButton).toBeVisible({ timeout: 30000 });
    await this.updateButton.click();
    await this.workspace.settleUi(1000);
  }

  async verifyVisitSaved() {
    try {
      await expect(this.successMessage).toBeVisible({ timeout: 10000 });
    } catch {
      await expect(this.visitGridRows.first()).toBeVisible({ timeout: 10000 });
    }
  }

  async getVisitRowCount() {
    return await this.visitGridRows.count();
  }

  async expectVisitRowsCount(expectedCount) {
    await expect(this.visitGridRows).toHaveCount(expectedCount, { timeout: 30000 });
  }
}

module.exports = { VisitTab };
