const { expect } = require('@playwright/test');
const { LoginPage } = require('../../../framework/pages/loginTabScreen/loginPage');
const { loginData } = require('../../../framework/data/loginData');

function buildPatient(index) {
  const suffix = `${Date.now()}${index}`;
  const shortSuffix = suffix.slice(-6);

  return {
    firstName: `Auto${index}${shortSuffix.slice(0, 2)}`,
    middleInitial: index === 1 ? 'L' : 'M',
    lastName: `Patient${shortSuffix.slice(2, 6)}`,
    preferredName: `Auto${index}`,
    details: {
      dateOfBirth: index === 1 ? '04/18/1992' : '07/09/1989',
      sex: 'F',
      maritalStatus: index === 1 ? 'Single' : 'Married',
      spousePartner: index === 1 ? 'Nora Lane' : 'Chris Miles',
      email: `autopatient${suffix}@example.com`,
      ssn: index === 1 ? '521-48-6731' : '634-57-7824',
      address1: index === 1 ? '411 Oak Street' : '922 River Road',
      address2: index === 1 ? 'Unit 3A' : 'Suite 14',
      mobilePhone: index === 1 ? '(404) 555-0181' : '(404) 555-0182',
      homePhone: index === 1 ? '(678) 555-0101' : '(678) 555-0102',
      city: index === 1 ? 'Atlanta' : 'Savannah',
      state: 'GA',
      zip: index === 1 ? '30318' : '31401',
      referralType: 'Patient Referral',
      workPhone: index === 1 ? '(470) 555-0121' : '(470) 555-0122',
      referralUser1: index === 1 ? 'campaign a' : 'campaign b',
      referralUser1Value: index === 1 ? 'spring launch' : 'summer launch',
      referralSource: index === 1 ? 'wellness event' : 'returning patient',
      referralUser2: index === 1 ? 'owner a' : 'owner b',
      referralUser2Value: index === 1 ? 'casey' : 'jamie'
    }
  };
}

async function loginToPatients(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto(loginData.url);
  await loginPage.login(loginData);
  await loginPage.assertLoginSucceeded();
}

async function createAndSavePatient(patientTab, patient, previousAccountNumber = null) {
  await patientTab.openAddPatient();
  await patientTab.expectNewPatientHeader();

  await patientTab.fillNewPatientForm({
    firstName: patient.firstName,
    middleInitial: patient.middleInitial,
    lastName: patient.lastName,
    preferredName: patient.preferredName
  });

  await patientTab.fillAdditionalPatientDetails(patient.details);
  await patientTab.saveNewPatient();

  const accountNumber = await patientTab.waitForSavedAccountNumber(previousAccountNumber);
  expect(accountNumber).toMatch(/^\d+$/);
  await expect.poll(() => patientTab.getPatientHeaderTabText()).not.toContain('NEW');

  return accountNumber;
}

function buildUpdatedExistingPatientName(originalFirstName, originalLastName) {
  const suffix = Date.now().toString().slice(-2);

  return {
    firstName: `Upd${suffix}${originalFirstName.slice(0, 4)}`.slice(0, 12),
    lastName: `Edit${suffix}${originalLastName.slice(0, 4)}`.slice(0, 12)
  };
}

module.exports = {
  buildPatient,
  loginToPatients,
  createAndSavePatient,
  buildUpdatedExistingPatientName
};
