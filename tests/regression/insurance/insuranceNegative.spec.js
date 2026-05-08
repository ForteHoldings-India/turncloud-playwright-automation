const { test } = require('@playwright/test');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');
const {
  buildPrimaryPatient,
  buildPatientDemographics,
  buildInsurance,
  buildSelfOverwriteInsurance,
  buildExpectedInsuredFromInsurance,
  buildExpectedBlankInsuredForRelationship,
  loginToPatients,
  createAndSaveMinimalPatient,
  createAndSavePatientWithDemographics
} = require('./insuranceRegression.helpers');

test.describe.serial('Insurance Negative Regression', () => {
  test.describe.configure({ timeout: 300000 });

  test('Negative: unsaved first insurance details do not replace the patient header', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(3);
    const insurance = buildInsurance(4);

    await loginToPatients(page);
    await createAndSaveMinimalPatient(patientTab, patient);

    await patientTab.insuranceTab.openInsuranceTab();
    await patientTab.insuranceTab.addNewInsurance();
    await patientTab.insuranceTab.fillInsuranceDetails(insurance);

    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
    await patientTab.expectPatientHeaderNotToContain(insurance.carrierName);
  });

  test('Negative: unsaved second insurance details do not replace the patient header', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(4);
    const firstInsurance = buildInsurance(5);
    const secondInsurance = buildInsurance(6);

    await loginToPatients(page);
    await createAndSaveMinimalPatient(patientTab, patient);

    await patientTab.insuranceTab.openInsuranceTab();
    await patientTab.insuranceTab.addNewInsurance();
    await patientTab.insuranceTab.fillInsuranceDetails(firstInsurance);
    await patientTab.saveNewPatient();
    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);

    await patientTab.insuranceTab.openInsuranceTab();
    await patientTab.insuranceTab.addNewInsurance();
    await patientTab.insuranceTab.fillInsuranceDetails(secondInsurance);

    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
    await patientTab.expectPatientHeaderNotToContain(secondInsurance.carrierName);
  });

  test('Negative: Self relationship cancel keeps existing insured details without overwrite', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(6);
    const insurance = buildInsurance(10);
    const expectedInsured = {
      subscriberFirstName: insurance.subscriberFirstName,
      subscriberMiddleInitial: insurance.subscriberMiddleInitial,
      subscriberLastName: insurance.subscriberLastName,
      subscriberDateOfBirth: insurance.subscriberDateOfBirth,
      address: insurance.address,
      city: insurance.city
    };

    await loginToPatients(page);
    await createAndSaveMinimalPatient(patientTab, patient);

    await patientTab.insuranceTab.openInsuranceTab();
    await patientTab.insuranceTab.addNewInsurance();
    await patientTab.insuranceTab.fillPolicyDetails(insurance);
    await patientTab.insuranceTab.fillSubscriberDetails({
      ...insurance,
      relationship: 'Other',
      overwriteDecision: null
    });

    await patientTab.insuranceTab.selectRelationship('Self', { overwriteDecision: 'decline' });
    await patientTab.insuranceTab.expectSubscriberDetails(expectedInsured);
  });

  test('Negative: Spouse relationship does not prefill insured name or address from demographics', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(8);
    const demographics = buildPatientDemographics(8);
    const insurance = buildInsurance(9);
    const expectedInsured = buildExpectedBlankInsuredForRelationship('Spouse');

    await loginToPatients(page);
    await createAndSavePatientWithDemographics(patientTab, patient, demographics);

    await patientTab.insuranceTab.openInsuranceTab();
    await patientTab.insuranceTab.addNewInsurance();
    await patientTab.insuranceTab.fillPolicyDetails(insurance);
    await patientTab.insuranceTab.selectRelationship('Spouse');

    await patientTab.insuranceTab.expectSubscriberDetails(expectedInsured);
  });

});
