const { test } = require('@playwright/test');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');
const {
  buildPrimaryPatient,
  buildCaseDetails,
  buildVisitHeaderDetails,
  buildVitalsData,
  loginToPatients,
  createAndSaveMinimalPatient
} = require('./visitRegression.helpers');

async function dismissReleaseNotesIfPresent(page) {
  for (let attempt = 1; attempt <= 15; attempt++) {
    const releaseNotesDialog = page.getByRole('dialog', { name: /Turncloud Release Notes/i });
    const closeButton = releaseNotesDialog.getByRole('button', { name: /^Close$/i });
    const windowCloseButton = releaseNotesDialog.locator('button').first();

    await page.waitForTimeout(1000);

    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
      await releaseNotesDialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    } else if (await windowCloseButton.isVisible().catch(() => false)) {
      await windowCloseButton.click();
      await releaseNotesDialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    if (!(await releaseNotesDialog.isVisible().catch(() => false))) {
      return;
    }

    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(1000);
    if (!(await releaseNotesDialog.isVisible().catch(() => false))) {
      return;
    }
  }
}

async function loginAndDismissReleaseNotes(page) {
  await loginToPatients(page);
  await page.waitForTimeout(3000);
  await dismissReleaseNotesIfPresent(page);
}

async function createPatientAfterReleaseNotes(page, patientTab, patient) {
  await dismissReleaseNotesIfPresent(page);
  await createAndSaveMinimalPatient(patientTab, patient);
  await dismissReleaseNotesIfPresent(page);
}

test.describe.serial('Visit Tab - Functional Tests', () => {
  test.describe.configure({ timeout: 600000 });

  test('Positive: Create new patient - Fill case - Add visit with header only and save', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(1);
    const caseDetails = buildCaseDetails(1);
    const visitHeader = buildVisitHeaderDetails(1);

    // Login and create patient
    await loginAndDismissReleaseNotes(page);
    console.log('step: logged in');
    await createPatientAfterReleaseNotes(page, patientTab, patient);
    console.log('step: patient created');

    // Open Cases Tab and select default case row
    await patientTab.caseTab.openCasesTab();
    await patientTab.caseTab.selectExistingCaseRow(0);
    console.log('step: case row selected');
    
    // Fill case details and save
    await patientTab.caseTab.fillCaseDetails(caseDetails);
    await patientTab.saveNewPatient();
    console.log('step: case saved');

    // Verify patient header
    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);

    // Open Visits Tab
    await patientTab.visitTab.openVisitsTab();
    await patientTab.settleUi(500);
    console.log('step: visits tab opened');

    // Get initial visit count
    const initialVisitCount = await patientTab.visitTab.getVisitRowCount();
    console.log(`Initial visit count: ${initialVisitCount}`);

    // Add New Visit
    await patientTab.visitTab.addNewVisit();
    await patientTab.settleUi(500);

    // Fill Visit Header
    await patientTab.visitTab.fillVisitHeader(visitHeader);
    await patientTab.settleUi(300);

    // Update/Save visit
    await patientTab.visitTab.updateVisit();
    await patientTab.settleUi(1000);

    // Verify visit is saved
    await patientTab.visitTab.verifyVisitSaved();

    // Verify visit count increased
    const finalVisitCount = await patientTab.visitTab.getVisitRowCount();
    console.log(`Final visit count: ${finalVisitCount}`);
  });

  test('Positive: Create new patient - Fill case - Add visit with header and vitals and save', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(2);
    const caseDetails = buildCaseDetails(2);
    const visitHeader = buildVisitHeaderDetails(2);
    const vitalsData = buildVitalsData(2);

    // Login and create patient
    await loginAndDismissReleaseNotes(page);
    await createPatientAfterReleaseNotes(page, patientTab, patient);

    // Open Cases Tab and select default case row
    await patientTab.caseTab.openCasesTab();
    await patientTab.caseTab.selectExistingCaseRow(0);
    
    // Fill case details and save
    await patientTab.caseTab.fillCaseDetails(caseDetails);
    await patientTab.saveNewPatient();

    // Verify patient header
    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);

    // Open Visits Tab
    await patientTab.visitTab.openVisitsTab();
    await patientTab.settleUi(500);

    // Get initial visit count
    const initialVisitCount = await patientTab.visitTab.getVisitRowCount();
    console.log(`Initial visit count: ${initialVisitCount}`);

    // Add New Visit
    await patientTab.visitTab.addNewVisit();
    await patientTab.settleUi(500);
    console.log('step: visit dialog opened');

    // Fill Visit Header
    await patientTab.visitTab.fillVisitHeader(visitHeader);
    await patientTab.settleUi(300);
    console.log('step: visit header filled');

    // Fill Vitals (scroll down to vitals section)
    await patientTab.visitTab.fillVitals(vitalsData);
    await patientTab.settleUi(500);
    console.log('step: vitals filled');

    // Update/Save visit
    await patientTab.visitTab.updateVisit();
    await patientTab.settleUi(1000);
    console.log('step: visit updated');

    // Verify visit is saved
    await patientTab.visitTab.verifyVisitSaved();

    // Verify visit count increased
    const finalVisitCount = await patientTab.visitTab.getVisitRowCount();
    console.log(`Final visit count: ${finalVisitCount}`);
  });
});
