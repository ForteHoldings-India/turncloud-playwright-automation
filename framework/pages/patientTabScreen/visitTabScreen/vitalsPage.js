const { expect } = require('@playwright/test');

class VitalsPage {
  constructor(page, workspace) {
    this.page = page;
    this.workspace = workspace;

    // Vitals Tab
    this.vitalsTabButton = page.locator('#EHRTabStrip-tab-2').getByText('Vitals').first();

    // Vital Sign Spinbuttons (numeric inputs)
    this.bpSystolicInput = page.getByRole('spinbutton').nth(0);
    this.bpDiastolicInput = page.getByRole('spinbutton').nth(1);
    this.temperatureInput = page.getByRole('spinbutton').nth(2);
    this.heartRateInput = page.getByRole('spinbutton').nth(3);
    this.respiratoryRateInput = page.getByRole('spinbutton').nth(4);
    this.weightInput = page.getByRole('spinbutton').nth(5);

    // Lab Value Inputs (numeric textbox)
    this.labValueInputs = page.locator('.k-numerictextbox.k-input.k-expand-padding.k-input-solid.k-input-md.k-rounded-md.k-hover > input:nth-child(2)');

    // Lab Note Textboxes
    this.potassiumNoteInput = page.getByRole('listitem').filter({ hasText: /Potassium mEq\/L Note/i }).getByRole('textbox').first();
    this.totalCholesterolNoteInput = page.getByRole('listitem').filter({ hasText: /Total mg\/dL Note/i }).getByRole('textbox').first();
    this.hdlNoteInput = page.getByRole('listitem').filter({ hasText: /HDL mg\/dL Note/i }).getByRole('textbox').first();
    this.ldlNoteInput = page.getByRole('listitem').filter({ hasText: /LDL mg\/dL Note/i }).getByRole('textbox').first();
    this.triglyceridesNoteInput = page.getByRole('listitem').filter({ hasText: /Triglycerides mg\/dL Note/i }).getByRole('textbox').first();

    // Vitals Notes
    this.vitalsNotesInput = page.getByRole('textbox', { name: /Notes/i }).first();
  }

  async openVitalsTab() {
    await expect(this.vitalsTabButton).toBeVisible({ timeout: 30000 });
    await this.vitalsTabButton.click();
    await this.workspace.settleUi(500);
  }

  async setVitalSign(inputLocator, value) {
    await expect(inputLocator).toBeVisible({ timeout: 10000 });
    await inputLocator.click();
    await inputLocator.fill(value);
    await this.workspace.settleUi(150);
  }

  async setBloodPressure(systolic, diastolic) {
    await this.setVitalSign(this.bpSystolicInput, systolic);
    await this.setVitalSign(this.bpDiastolicInput, diastolic);
  }

  async setTemperature(value) {
    await this.setVitalSign(this.temperatureInput, value);
  }

  async setHeartRate(value) {
    await this.setVitalSign(this.heartRateInput, value);
  }

  async setRespiratoryRate(value) {
    await this.setVitalSign(this.respiratoryRateInput, value);
  }

  async setWeight(value) {
    await this.setVitalSign(this.weightInput, value);
  }

  async setLabValue(index, value) {
    const input = this.labValueInputs.nth(index);
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.click();
    await input.fill(value);
    await this.workspace.settleUi(150);
  }

  async setPotassiumNote(note) {
    await this.potassiumNoteInput.fill(note);
    await this.workspace.settleUi(150);
  }

  async setTotalCholesterolNote(note) {
    await this.totalCholesterolNoteInput.fill(note);
    await this.workspace.settleUi(150);
  }

  async setHDLNote(note) {
    await this.hdlNoteInput.fill(note);
    await this.workspace.settleUi(150);
  }

  async setLDLNote(note) {
    await this.ldlNoteInput.fill(note);
    await this.workspace.settleUi(150);
  }

  async setTriglyceridesNote(note) {
    await this.triglyceridesNoteInput.fill(note);
    await this.workspace.settleUi(150);
  }

  async setVitalsNotes(notes) {
    await this.vitalsNotesInput.fill(notes);
    await this.workspace.settleUi(150);
  }

  async fillVitalsData(vitals) {
    const {
      bloodPressure,
      temperature,
      heartRate,
      respiratoryRate,
      weight,
      labValues,
      notes
    } = vitals;

    await this.openVitalsTab();

    if (bloodPressure) {
      await this.setBloodPressure(bloodPressure.systolic, bloodPressure.diastolic);
    }

    if (temperature) {
      await this.setTemperature(temperature);
    }

    if (heartRate) {
      await this.setHeartRate(heartRate);
    }

    if (respiratoryRate) {
      await this.setRespiratoryRate(respiratoryRate);
    }

    if (weight) {
      await this.setWeight(weight);
    }

    if (labValues && Array.isArray(labValues)) {
      for (let i = 0; i < labValues.length; i++) {
        await this.setLabValue(i, labValues[i]);
      }
    }

    if (notes) {
      await this.setVitalsNotes(notes);
    }
  }
}

module.exports = { VitalsPage };
