const { test, expect } = require('@playwright/test');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');
const {
  buildPrimaryPatient,
  buildEmployer,
  loginToPatients,
  createAndSaveMinimalPatient,
  openExistingPatientForEmployer
} = require('./employerRegression.helpers');

test.describe.serial('Employer Negative Regression', () => {
  test.describe.configure({ timeout: 300000 });

  test('Negative: new patient header does not switch to employer name before employer save', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(3);
    const employer = buildEmployer(3);

    await loginToPatients(page);
    await createAndSaveMinimalPatient(patientTab, patient);

    await patientTab.employerTab.openEmployerTab();
    await patientTab.employerTab.fillEmployerDetails(employer);

    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
    await patientTab.expectPatientHeaderNotToContain(employer.employerName);
  });

  test('Negative: existing patient employer save does not replace header with employer name for account 22791', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const employer = buildEmployer(4);

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
