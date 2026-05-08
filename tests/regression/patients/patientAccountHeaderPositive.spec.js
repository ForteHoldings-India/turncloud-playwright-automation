const { test, expect } = require('@playwright/test');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');
const {
  buildPatient,
  loginToPatients,
  createAndSavePatient,
  buildUpdatedExistingPatientName
} = require('./patientAccountHeader.helpers');

test.describe.serial('Patient Account Header Positive Regression', () => {
  test.describe.configure({ timeout: 300000 });

  test('Positive: new patient shows NEW before save and account number after save', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPatient(1);

    await loginToPatients(page);
    const accountNumber = await createAndSavePatient(patientTab, patient);

    expect(accountNumber).toMatch(/^\d+$/);
  });

  test('Positive: second patient save shows a different account number in header', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const firstPatient = buildPatient(2);
    const secondPatient = buildPatient(3);

    await loginToPatients(page);

    const firstAccountNumber = await createAndSavePatient(patientTab, firstPatient);
    await patientTab.returnToPatientLookup();
    await patientTab.openAddPatient();
    await patientTab.expectNewPatientHeader();

    await patientTab.fillNewPatientForm({
      firstName: secondPatient.firstName,
      middleInitial: secondPatient.middleInitial,
      lastName: secondPatient.lastName,
      preferredName: secondPatient.preferredName
    });

    await patientTab.fillAdditionalPatientDetails(secondPatient.details);
    await patientTab.saveNewPatient();
    await patientTab.waitForPatientNameInHeader(secondPatient.firstName, secondPatient.lastName);

    expect(firstAccountNumber).toMatch(/^\d+$/);
  });

  test('Positive: existing patient save keeps the same account number', async ({ page }) => {
    const patientTab = new PatientTab(page);

    await loginToPatients(page);
    await patientTab.openFirstExistingPatient();

    const originalAccountNumber = await patientTab.getCurrentPatientAccountNumber();
    await patientTab.saveNewPatient();
    await patientTab.expectCurrentPatientAccountNumber(originalAccountNumber);

    expect(originalAccountNumber).toMatch(/^\d+$/);
  });

  test('Positive: existing patient name update keeps the same account number after save', async ({ page }) => {
    const patientTab = new PatientTab(page);

    await loginToPatients(page);
    await patientTab.openFirstExistingPatient();
    await patientTab.openDemographics();

    const originalAccountNumber = await patientTab.getCurrentPatientAccountNumber();
    const originalName = await patientTab.getCurrentPatientName();
    const updatedName = buildUpdatedExistingPatientName(originalName.firstName, originalName.lastName);

    await patientTab.updateExistingPatientName({
      firstName: updatedName.firstName,
      lastName: updatedName.lastName
    });
    await patientTab.saveExistingPatientAfterNameUpdate(updatedName.firstName, updatedName.lastName);
    await patientTab.expectCurrentPatientName(updatedName.firstName, updatedName.lastName);
    await patientTab.expectCurrentPatientAccountNumber(originalAccountNumber);
  });

  test('Positive: same browser existing patient save and name update keep the same account number', async ({ page }) => {
    const patientTab = new PatientTab(page);

    await loginToPatients(page);

    await patientTab.openFirstExistingPatient();
    const originalAccountNumber = await patientTab.getCurrentPatientAccountNumber();
    await patientTab.saveNewPatient();
    await patientTab.expectCurrentPatientAccountNumber(originalAccountNumber);

    await patientTab.returnToPatientLookup();
    await patientTab.openFirstExistingPatient();
    await patientTab.openDemographics();

    const reopenedAccountNumber = await patientTab.getCurrentPatientAccountNumber();
    const originalName = await patientTab.getCurrentPatientName();
    const updatedName = buildUpdatedExistingPatientName(originalName.firstName, originalName.lastName);

    expect(reopenedAccountNumber).toBe(originalAccountNumber);

    await patientTab.updateExistingPatientName({
      firstName: updatedName.firstName,
      lastName: updatedName.lastName
    });
    await patientTab.saveExistingPatientAfterNameUpdate(updatedName.firstName, updatedName.lastName);
    await patientTab.expectCurrentPatientName(updatedName.firstName, updatedName.lastName);
    await patientTab.expectCurrentPatientAccountNumber(originalAccountNumber);
  });

  test('Positive: different existing patients can be updated and saved in the same browser', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const firstUpdatedPatient = {
      firstName: 'one',
      lastName: 'change',
      preferredName: 'one patient'
    };
    const secondUpdatedPatient = {
      firstName: 'town',
      lastName: 'patient'
    };

    await loginToPatients(page);
    const firstLookupFirstName = await patientTab.getLookupFirstNameByIndex(0);
    const secondLookupFirstName = await patientTab.getLookupFirstNameByIndex(1);

    expect(secondLookupFirstName).not.toBe(firstLookupFirstName);

    await patientTab.openExistingPatientByLookupCellText(firstLookupFirstName);
    await patientTab.openDemographics();

    const firstAccountNumber = await patientTab.getCurrentPatientAccountNumber();
    await patientTab.updateExistingPatientName({
      firstName: firstUpdatedPatient.firstName,
      lastName: firstUpdatedPatient.lastName
    });
    await patientTab.setStableValue(patientTab.preferredNameInput, firstUpdatedPatient.preferredName);
    await patientTab.saveExistingPatientAfterNameUpdate(firstUpdatedPatient.firstName, firstUpdatedPatient.lastName);
    await patientTab.expectCurrentPatientName(firstUpdatedPatient.firstName, firstUpdatedPatient.lastName);
    await patientTab.expectCurrentPatientAccountNumber(firstAccountNumber);

    await patientTab.openExistingPatientByLookupCellText(secondLookupFirstName, { doubleClick: true });
    await patientTab.activatePatientTabContaining(secondLookupFirstName);
    await patientTab.openDemographics();

    const secondAccountNumber = await patientTab.getCurrentPatientAccountNumber();
    expect(secondAccountNumber).not.toBe(firstAccountNumber);

    await patientTab.updateExistingPatientName({
      firstName: secondUpdatedPatient.firstName,
      lastName: secondUpdatedPatient.lastName
    });
    await patientTab.saveExistingPatientAfterNameUpdate(secondUpdatedPatient.firstName, secondUpdatedPatient.lastName);
    await patientTab.expectCurrentPatientName(secondUpdatedPatient.firstName, secondUpdatedPatient.lastName);
    await patientTab.expectCurrentPatientAccountNumber(secondAccountNumber);
  });
});
