const { test } = require('@playwright/test');
const { LoginPage } = require('../../../framework/pages/loginTabScreen/loginPage');
const { loginData } = require('../../../framework/data/loginData');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');

test('Create patient and save insurance details', async ({ page }) => {
  test.setTimeout(300000);

  const loginPage = new LoginPage(page);
  const patientTab = new PatientTab(page);
  const suffix = Date.now().toString().slice(-6);
  const patient = {
    firstName: `Ins${suffix.slice(0, 3)}`,
    lastName: `Page${suffix.slice(3)}`
  };
  const insurance = {
    carrierName: 'American National Insurance Company',
    policyNumber: `Policy${suffix}`,
    insuranceId: '12',
    groupPlanNumber: 'Grp900',
    planProgramName: 'Family',
    effectiveDay: '3',
    expiryDay: '31',
    subscriberFirstName: 'Prashant',
    subscriberMiddleInitial: 'A',
    subscriberLastName: 'Test',
    subscriberDateOfBirth: '03/09/1980',
    relationship: 'Spouse',
    sex: 'M',
    telephone: '(941) 545-4555',
    email: 'test@gmail.com',
    address: 'add',
    aptSuite: 'add3',
    city: 'pune',
    state: 'CO',
    zipCode: '75063',
    deductibleAmount: '10',
    coInsuranceAmount: '5',
    maxOutOfPocketAmount: '100',
    usedVisit: '2',
    // appliedCharges: '5'
  };

  await loginPage.goto(loginData.url);
  await loginPage.login(loginData);
  await loginPage.assertLoginSucceeded();

  await patientTab.openAddPatient();
  await patientTab.fillNewPatientForm(patient);
  await patientTab.saveNewPatient();
  await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);

  await patientTab.insuranceTab.openInsuranceTab();
  await patientTab.insuranceTab.addNewInsurance();
  await patientTab.insuranceTab.fillInsuranceDetails(insurance);
  await patientTab.saveNewPatient();
  await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
});






