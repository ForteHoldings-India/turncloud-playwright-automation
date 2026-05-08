const { test } = require('@playwright/test');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');
const {
  buildPatient,
  loginToPatients,
  createAndSavePatient
} = require('./patientAccountHeader.helpers');

test.describe.serial('Patient Account Header Negative Regression', () => {
  test.describe.configure({ timeout: 300000 });

  test('Negative: header stays NEW and does not show patient name before first save', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPatient(4);

    await loginToPatients(page);
    await patientTab.openAddPatient();
    await patientTab.expectNewPatientHeader();

    await patientTab.fillNewPatientForm({
      firstName: patient.firstName,
      middleInitial: patient.middleInitial,
      lastName: patient.lastName,
      preferredName: patient.preferredName
    });

    await patientTab.expectNewPatientHeader();
    await patientTab.expectPatientHeaderNotToContain(patient.firstName);
    await patientTab.expectPatientHeaderNotToContain(patient.lastName);
  });

  test('Negative: second new patient header does not show the first saved patient name', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const firstPatient = buildPatient(5);
    const secondPatient = buildPatient(6);

    await loginToPatients(page);

    await createAndSavePatient(patientTab, firstPatient);
    await patientTab.returnToPatientLookup();
    await patientTab.openAddPatient();
    await patientTab.expectNewPatientHeader();
    await patientTab.expectPatientHeaderNotToContain(firstPatient.firstName);
    await patientTab.expectPatientHeaderNotToContain(firstPatient.lastName);
    await patientTab.expectPatientHeaderNotToContain(secondPatient.firstName);
  });
});
