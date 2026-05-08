const { test, expect } = require('@playwright/test');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');
const {
  buildPrimaryPatient,
  buildEmployer,
  loginToPatients,
  createAndSaveMinimalPatient,
  openExistingPatientForEmployer
} = require('./employerRegression.helpers');

test.describe.serial('Employer Positive Regression', () => {
  test.describe.configure({ timeout: 300000 });

  test('Positive: new patient employer save keeps the patient name in header', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(1);
    const employer = buildEmployer(1);

    await loginToPatients(page);
    await createAndSaveMinimalPatient(patientTab, patient);

    await patientTab.employerTab.openEmployerTab();
    await patientTab.employerTab.fillEmployerDetails(employer);
    await patientTab.saveNewPatient();

    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
    await patientTab.expectPatientHeaderNotToContain(employer.employerName);
  });

  test('Positive: existing patient employer save keeps the same header for account 22791', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const employer = buildEmployer(2);

    await loginToPatients(page);
    await openExistingPatientForEmployer(patientTab, '22791');

    const headerText = await patientTab.getPatientHeaderTabText();
    await patientTab.employerTab.openEmployerTab();
    await patientTab.employerTab.fillEmployerDetails(employer);
    await patientTab.saveNewPatient();

    await expect.poll(() => patientTab.getPatientHeaderTabText(), { timeout: 30000 }).toBe(headerText);
    await patientTab.expectPatientHeaderNotToContain(employer.employerName);
  });
});
