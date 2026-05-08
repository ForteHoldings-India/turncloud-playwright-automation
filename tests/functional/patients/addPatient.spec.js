const { test } = require('@playwright/test');
const { LoginPage } = require('../../../framework/pages/loginTabScreen/loginPage');
const { loginData } = require('../../../framework/data/loginData');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');

test('Open Add New Patient page', async ({ page }) => {
  test.setTimeout(180000);

  const loginPage = new LoginPage(page);
  const patientTab = new PatientTab(page);

  await loginPage.goto(loginData.url);
  await loginPage.login(loginData);
  await loginPage.assertLoginSucceeded();

  await patientTab.openAddPatient();
  await patientTab.fillNewPatientForm({
    firstName: 'Avery',
    middleInitial: 'J',
    lastName: 'Morgan',
    preferredName: 'Avery'
  });
  await patientTab.fillAdditionalPatientDetails({
    dateOfBirth: '03/22/1990',
    sex: 'F',
    maritalStatus: 'Married',
    spousePartner: 'Jordan Morgan',
    email: 'avery.morgan90@example.com',
    ssn: '412-58-6937',
    address1: '118 Willow Street',
    address2: 'Apt 12',
    mobilePhone: '(404) 555-0168',
    homePhone: '(678) 555-0141',
    city: 'Atlanta',
    state: 'GA',
    zip: '30303',
    referralType: 'Patient Referral',
    workPhone: '(470) 555-0117',
    referralUser1: 'intake source',
    referralUser1Value: 'social campaign',
    referralSource: 'health expo',
    referralUser2: 'care coordinator',
    referralUser2Value: 'tanya'
  });
  await patientTab.saveNewPatient();
});
