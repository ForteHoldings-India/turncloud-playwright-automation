const { test } = require('@playwright/test');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');
const {
  buildPrimaryPatient,
  buildCaseDetails,
  buildReferringDoctorDetails,
  buildAttorneyDetails,
  buildReferringDoctorDropdownData,
  buildAttorneyDropdownData,
  loginToPatients,
  createAndSaveMinimalPatient
} = require('./caseRegression.helpers');

async function openPreparedCase(patientTab, patient, caseDetails) {
  await createAndSaveMinimalPatient(patientTab, patient);
  await patientTab.caseTab.openCasesTab();
  await patientTab.caseTab.selectExistingCaseRow(0);
  await patientTab.caseTab.fillCaseDetails(caseDetails);
}

test.describe.serial('Cases Referring And Attorney Regression', () => {
  test.describe.configure({ timeout: 300000 });

  test('Positive: referring doctor manual entry saves successfully', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(21);
    const caseDetails = buildCaseDetails(21);
    const referring = buildReferringDoctorDetails();

    await loginToPatients(page);
    await openPreparedCase(patientTab, patient, caseDetails);
    await patientTab.caseTab.fillReferringDoctorDetails(referring);
    await patientTab.saveNewPatient();

    await patientTab.caseTab.openCasesTab();
    await patientTab.caseTab.selectExistingCaseRow(0);
    await patientTab.caseTab.expectReferringDoctorDetails(referring);
  });

  test('Positive: attorney manual entry saves successfully', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(22);
    const caseDetails = buildCaseDetails(22);
    const attorney = buildAttorneyDetails();

    await loginToPatients(page);
    await openPreparedCase(patientTab, patient, caseDetails);
    await patientTab.caseTab.fillAttorneyDetails(attorney);
    await patientTab.saveNewPatient();

    await patientTab.caseTab.openCasesTab();
    await patientTab.caseTab.selectExistingCaseRow(0);
    await patientTab.caseTab.expectAttorneyDetails(attorney);
  });

  test('Positive: referring doctor can be selected from dropdown and saved', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(23);
    const caseDetails = buildCaseDetails(23);
    const dropdown = buildReferringDoctorDropdownData();

    await loginToPatients(page);
    await openPreparedCase(patientTab, patient, caseDetails);
    await patientTab.caseTab.selectReferringDoctorFromDropdown(dropdown.overwriteName);
    await patientTab.saveNewPatient();

    await patientTab.caseTab.openCasesTab();
    await patientTab.caseTab.selectExistingCaseRow(0);
    await patientTab.caseTab.expectSelectedReferringDoctor(dropdown.overwriteName);
  });

  test('Positive: attorney can be selected from dropdown and saved', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(24);
    const caseDetails = buildCaseDetails(24);
    const dropdown = buildAttorneyDropdownData();

    await loginToPatients(page);
    await openPreparedCase(patientTab, patient, caseDetails);
    await patientTab.caseTab.selectAttorneyFromDropdown(dropdown.overwriteName);
    await patientTab.saveNewPatient();

    await patientTab.caseTab.openCasesTab();
    await patientTab.caseTab.selectExistingCaseRow(0);
    await patientTab.caseTab.expectSelectedAttorney(dropdown.overwriteName);
  });

  test('Positive: referring doctor overwrite OK replaces manual details with dropdown selection', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(25);
    const caseDetails = buildCaseDetails(25);
    const referring = buildReferringDoctorDetails();
    const dropdown = buildReferringDoctorDropdownData();

    await loginToPatients(page);
    await openPreparedCase(patientTab, patient, caseDetails);
    await patientTab.caseTab.fillReferringDoctorDetails(referring);
    await patientTab.caseTab.selectReferringDoctorFromDropdown(dropdown.overwriteName, { overwriteDecision: 'accept' });

    await patientTab.saveNewPatient();
    await patientTab.caseTab.openCasesTab();
    await patientTab.caseTab.selectExistingCaseRow(0);
    await patientTab.caseTab.expectSelectedReferringDoctor(dropdown.overwriteName);
  });

  test('Negative: referring doctor overwrite Cancel keeps manual details', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(26);
    const caseDetails = buildCaseDetails(26);
    const referring = buildReferringDoctorDetails();
    const dropdown = buildReferringDoctorDropdownData();

    await loginToPatients(page);
    await openPreparedCase(patientTab, patient, caseDetails);
    await patientTab.caseTab.fillReferringDoctorDetails(referring);
    await patientTab.caseTab.selectReferringDoctorFromDropdown(dropdown.cancelName, { overwriteDecision: 'decline' });

    await patientTab.caseTab.expectReferringDoctorDetails(referring);
  });

  test('Positive: attorney overwrite OK replaces manual details with dropdown selection', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(27);
    const caseDetails = buildCaseDetails(27);
    const attorney = buildAttorneyDetails();
    const dropdown = buildAttorneyDropdownData();

    await loginToPatients(page);
    await openPreparedCase(patientTab, patient, caseDetails);
    await patientTab.caseTab.fillAttorneyDetails(attorney);
    await patientTab.caseTab.selectAttorneyFromDropdown(dropdown.overwriteName, { overwriteDecision: 'accept' });

    await patientTab.saveNewPatient();
    await patientTab.caseTab.openCasesTab();
    await patientTab.caseTab.selectExistingCaseRow(0);
    await patientTab.caseTab.expectSelectedAttorney(dropdown.overwriteName);
  });

  test('Negative: attorney overwrite Cancel keeps manual details', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(28);
    const caseDetails = buildCaseDetails(28);
    const attorney = buildAttorneyDetails();
    const dropdown = buildAttorneyDropdownData();

    await loginToPatients(page);
    await openPreparedCase(patientTab, patient, caseDetails);
    await patientTab.caseTab.fillAttorneyDetails(attorney);
    await patientTab.caseTab.selectAttorneyFromDropdown(dropdown.cancelName, { overwriteDecision: 'decline' });

    await patientTab.caseTab.expectAttorneyDetails(attorney);
  });

  test('Positive: referring doctor clear works for manual entry and dropdown selection', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(29);
    const caseDetails = buildCaseDetails(29);
    const referring = buildReferringDoctorDetails();
    const dropdown = buildReferringDoctorDropdownData();

    await loginToPatients(page);
    await openPreparedCase(patientTab, patient, caseDetails);

    await patientTab.caseTab.fillReferringDoctorDetails(referring);
    await patientTab.caseTab.clearReferringDoctor('accept');
    await patientTab.caseTab.expectReferringDoctorCleared();

    await patientTab.caseTab.selectReferringDoctorFromDropdown(dropdown.overwriteName);
    await patientTab.caseTab.clearReferringDoctor('accept');
    await patientTab.caseTab.expectReferringDoctorCleared();
  });

  test('Positive: attorney clear works for manual entry and dropdown selection', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(30);
    const caseDetails = buildCaseDetails(30);
    const attorney = buildAttorneyDetails();
    const dropdown = buildAttorneyDropdownData();

    await loginToPatients(page);
    await openPreparedCase(patientTab, patient, caseDetails);

    await patientTab.caseTab.fillAttorneyDetails(attorney);
    await patientTab.caseTab.clearAttorney('accept');
    await patientTab.caseTab.expectAttorneyCleared();

    await patientTab.caseTab.selectAttorneyFromDropdown(dropdown.overwriteName);
    await patientTab.caseTab.clearAttorney('accept');
    await patientTab.caseTab.expectAttorneyCleared();
  });
});
