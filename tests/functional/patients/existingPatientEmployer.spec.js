const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../framework/pages/loginTabScreen/loginPage');
const { loginData } = require('../../../framework/data/loginData');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');

test('Update employer details for existing patient by account number', async ({ page }) => {
  test.setTimeout(240000);

  const loginPage = new LoginPage(page);
  const patientTab = new PatientTab(page);
  const employer = {
    employerName: 'Northwind Clinical Services',
    occupation: 'Lead Analyst',
    companyAddress: '920 Market Square',
    aptSuite: 'Suite 18B',
    city: 'Irving',
    state: 'AK',
    zip: '75062',
    telephone: '(469) 555-1842',
    extension: '31842',
    fax: '(214) 555-0911',
    website: 'www.northwindclinical.com'
  };

  await loginPage.goto(loginData.url);
  await loginPage.login(loginData);
  await loginPage.assertLoginSucceeded();

  await patientTab.returnToPatientLookup();
  await patientTab.ensureLookupRowsLoaded();
  await patientTab.openExistingPatientByLookupCellText('22791', { doubleClick: true });
  await patientTab.activatePatientTabContaining('22791');

  const headerText = await patientTab.getPatientHeaderTabText();
  await patientTab.employerTab.openEmployerTab();
  await patientTab.employerTab.fillEmployerDetails(employer);
  await patientTab.saveNewPatient();
  await expect.poll(() => patientTab.getPatientHeaderTabText(), { timeout: 30000 }).toBe(headerText);
});
