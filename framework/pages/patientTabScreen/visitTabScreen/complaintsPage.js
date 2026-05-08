const { expect } = require('@playwright/test');

class ComplaintsPage {
  constructor(page, workspace) {
    this.page = page;
    this.workspace = workspace;

    // Complaints Tab
    this.complaintsTabButton = page.locator('#EHRTabStrip-tab-3').getByText('Complaints').first();

    // Complaints Fields
    this.complaintInput = page.getByRole('listitem').filter({ hasText: /Patient Stated Complaint/i }).getByRole('textbox').first();
    this.complaintsNotesInput = page.getByRole('textbox', { name: /Complaints Notes/i }).first();
  }

  async openComplaintsTab() {
    await expect(this.complaintsTabButton).toBeVisible({ timeout: 30000 });
    await this.complaintsTabButton.click();
    await this.workspace.settleUi(500);
  }

  async setComplaint(complaint) {
    await this.complaintInput.fill(complaint);
    await this.workspace.settleUi(200);
  }

  async setComplaintsNotes(notes) {
    await this.complaintsNotesInput.fill(notes);
    await this.workspace.settleUi(200);
  }

  async fillComplaintsData(complaints) {
    const { complaint, notes } = complaints;

    await this.openComplaintsTab();

    if (complaint) {
      await this.setComplaint(complaint);
    }

    if (notes) {
      await this.setComplaintsNotes(notes);
    }
  }
}

module.exports = { ComplaintsPage };
