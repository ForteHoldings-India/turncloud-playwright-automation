const { test } = require('@playwright/test');
const { LoginPage } = require('../../../framework/pages/loginTabScreen/loginPage');
const { loginData } = require('../../../framework/data/loginData');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');

test('Create patient with primary details and save employer details', async ({ page }) => {
  test.setTimeout(240000);

  const loginPage = new LoginPage(page);
  const patientTab = new PatientTab(page);
  const suffix = Date.now().toString().slice(-6);
  const patient = {
    firstName: `Emp${suffix.slice(0, 3)}`,
    lastName: `Test${suffix.slice(3)}`
  };
  const employer = {
    employerName: `Employer ${suffix}`,
    occupation: 'Engineer',
    companyAddress: 'ABC Company',
    aptSuite: 'ADD',
    city: 'AD',
    state: 'AK',
    zip: '75063',
    telephone: '(454) 558-7455',
    extension: '24512',
    fax: '(215) 445-4545',
    website: 'www.abc.com'
  };

  await loginPage.goto(loginData.url);
  await loginPage.login(loginData);
  await loginPage.assertLoginSucceeded();

  await patientTab.openAddPatient();
  await patientTab.fillNewPatientForm(patient);
  await patientTab.saveNewPatient();
  await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);

  await patientTab.employerTab.openEmployerTab();
  await patientTab.employerTab.fillEmployerDetails(employer);
  await patientTab.saveNewPatient();
  await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
});


