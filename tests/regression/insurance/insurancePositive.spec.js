const { test } = require('@playwright/test');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');
const {
  buildPrimaryPatient,
  buildPatientDemographics,
  buildInsurance,
  buildSelfOverwriteInsurance,
  buildExpectedInsuredFromDemographics,
  buildExpectedBlankInsuredForRelationship,
  loginToPatients,
  createAndSaveMinimalPatient,
  createAndSavePatientWithDemographics
} = require('./insuranceRegression.helpers');

test.describe.serial('Insurance Positive Regression', () => {
  test.describe.configure({ timeout: 300000 });

  test('Positive: first insurance save keeps the patient name in header', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(1);
    const insurance = buildInsurance(1);

    await loginToPatients(page);
    await createAndSaveMinimalPatient(patientTab, patient);

    await patientTab.insuranceTab.openInsuranceTab();
    await patientTab.insuranceTab.addNewInsurance();
    await patientTab.insuranceTab.fillInsuranceDetails(insurance);
    await patientTab.saveNewPatient();

    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
    await patientTab.expectPatientHeaderNotToContain(insurance.carrierName);
  });

  test('Positive: second insurance can be added and saved after the first insurance', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(2);
    const firstInsurance = buildInsurance(2);
    const secondInsurance = buildInsurance(3);

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
    await patientTab.saveNewPatient();

    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
    await patientTab.expectPatientHeaderNotToContain(firstInsurance.carrierName);
    await patientTab.expectPatientHeaderNotToContain(secondInsurance.carrierName);
  });

  test('Positive: Aetna Self relationship overwrites insured details from demographics', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(5);
    const demographics = buildPatientDemographics(5);
    const insurance = buildSelfOverwriteInsurance(7, 'accept');
    const expectedInsured = buildExpectedInsuredFromDemographics(patient, demographics);

    await loginToPatients(page);
    await createAndSavePatientWithDemographics(patientTab, patient, demographics);

    await patientTab.insuranceTab.openInsuranceTab();
    await patientTab.insuranceTab.addNewInsurance();
    await patientTab.insuranceTab.fillPolicyDetails(insurance);
    await patientTab.insuranceTab.fillSubscriberDetails(insurance);

    await patientTab.insuranceTab.expectSubscriberDetails(expectedInsured);
  });

  test('Positive: second insurance Self relationship overwrites insured details from demographics', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(9);
    const demographics = buildPatientDemographics(9);
    const firstInsurance = buildInsurance(11);
    const secondInsurance = buildSelfOverwriteInsurance(12, 'accept');
    const expectedInsured = buildExpectedInsuredFromDemographics(patient, demographics);

    await loginToPatients(page);
    await createAndSavePatientWithDemographics(patientTab, patient, demographics);

    await patientTab.insuranceTab.openInsuranceTab();
    await patientTab.insuranceTab.addNewInsurance();
    await patientTab.insuranceTab.fillInsuranceDetails(firstInsurance);
    await patientTab.saveNewPatient();
    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);

    await patientTab.insuranceTab.openInsuranceTab();
    await patientTab.insuranceTab.addNewInsurance();
    await patientTab.insuranceTab.fillPolicyDetails(secondInsurance);
    await patientTab.insuranceTab.fillSubscriberDetails({
      ...secondInsurance,
      relationship: null,
      overwriteDecision: null
    });
    await patientTab.insuranceTab.selectRelationship('Self', { overwriteDecision: 'accept' });

    await patientTab.insuranceTab.expectSubscriberDetails(expectedInsured);
  });

  test('Positive: existing dependent insurance switches to Self and overwrites insured details from demographics', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(10);
    const demographics = buildPatientDemographics(10);
    const insurance = {
      ...buildInsurance(13),
      relationship: 'Dependant',
      subscriberFirstName: 'Jordan',
      subscriberMiddleInitial: 'K',
      subscriberLastName: 'Dependent',
      subscriberDateOfBirth: '11/22/1991',
      address: '901 Other Address',
      aptSuite: 'Suite 44',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001'
    };
    const overwriteInsurance = buildSelfOverwriteInsurance(14, 'accept');
    const expectedInsured = buildExpectedInsuredFromDemographics(patient, demographics);
    const expectedPreOverwriteInsured = {
      subscriberFirstName: insurance.subscriberFirstName,
      subscriberLastName: insurance.subscriberLastName,
      subscriberDateOfBirth: insurance.subscriberDateOfBirth,
      relationship: insurance.relationship,
      address: insurance.address,
      city: insurance.city
    };

    await loginToPatients(page);
    await createAndSavePatientWithDemographics(patientTab, patient, demographics);

    await patientTab.insuranceTab.openInsuranceTab();
    await patientTab.insuranceTab.addNewInsurance();
    await patientTab.insuranceTab.fillInsuranceDetails(insurance);
    await patientTab.saveNewPatient();

    await patientTab.insuranceTab.openInsuranceTab();
    await patientTab.insuranceTab.insuranceRowList.first().getByRole('gridcell').first().click({ force: true });
    await patientTab.settleUi(250);
    await patientTab.insuranceTab.expectSubscriberDetails(expectedPreOverwriteInsured);
    await patientTab.insuranceTab.fillSubscriberDetails({
      ...overwriteInsurance,
      relationship: null,
      overwriteDecision: null
    });
    await patientTab.insuranceTab.selectRelationship('Self', { overwriteDecision: 'accept' });

    await patientTab.insuranceTab.expectSubscriberDetails(expectedInsured);
  });

  test('Positive: Spouse save does not prefill insured details from demographics', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(7);
    const demographics = buildPatientDemographics(7);
    const insurance = buildInsurance(9);
    const expectedInsured = {
      subscriberFirstName: '',
      subscriberLastName: '',
      address: '',
      city: ''
    };

    await loginToPatients(page);
    await createAndSavePatientWithDemographics(patientTab, patient, demographics);

    await patientTab.insuranceTab.openInsuranceTab();
    await patientTab.insuranceTab.addNewInsurance();
    await patientTab.insuranceTab.fillPolicyDetails(insurance);
    await patientTab.insuranceTab.selectRelationship('Spouse');
    await patientTab.saveNewPatient();

    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
    const savedInsuranceRow = await patientTab.insuranceTab.getActiveInsuranceRow();
    await savedInsuranceRow.getByRole('gridcell').first().click({ force: true });
    await patientTab.settleUi(250);
    await patientTab.insuranceTab.expectSubscriberDetails(expectedInsured);
  });

});
