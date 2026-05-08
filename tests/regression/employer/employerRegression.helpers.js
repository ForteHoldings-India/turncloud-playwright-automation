const { LoginPage } = require('../../../framework/pages/loginTabScreen/loginPage');
const { loginData } = require('../../../framework/data/loginData');

function buildPrimaryPatient(index) {
  const suffix = `${Date.now()}${index}`.slice(-6);

  return {
    firstName: `Emp${index}${suffix.slice(0, 2)}`,
    lastName: `Reg${suffix.slice(2)}`
  };
}

function buildEmployer(index) {
  const suffix = `${Date.now()}${index}`.slice(-4);

  return {
    employerName: `Employer ${index} ${suffix}`,
    occupation: index % 2 === 0 ? 'Operations Manager' : 'Clinical Analyst',
    companyAddress: `${index}20 Market Square`,
    aptSuite: `Suite ${10 + index}`,
    city: index % 2 === 0 ? 'Irving' : 'Dallas',
    state: 'AK',
    zip: index % 2 === 0 ? '75062' : '75063',
    telephone: index % 2 === 0 ? '(469) 555-1842' : '(469) 555-1931',
    extension: index % 2 === 0 ? '31842' : '31931',
    fax: index % 2 === 0 ? '(214) 555-0911' : '(214) 555-1012',
    website: index % 2 === 0 ? 'www.northwindclinical.com' : 'www.contosohealth.com'
  };
}

async function loginToPatients(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto(loginData.url);
  await loginPage.login(loginData);
  await loginPage.assertLoginSucceeded();
}

async function createAndSaveMinimalPatient(patientTab, patient) {
  await patientTab.openAddPatient();
  await patientTab.expectNewPatientHeader();
  await patientTab.fillNewPatientForm(patient);
  await patientTab.saveNewPatient();
  await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
}

async function openExistingPatientForEmployer(patientTab, accountNumber) {
  await patientTab.returnToPatientLookup();
  await patientTab.ensureLookupRowsLoaded();
  await patientTab.openExistingPatientByLookupCellText(accountNumber, { doubleClick: true });
  await patientTab.activatePatientTabContaining(accountNumber);
}

module.exports = {
  buildPrimaryPatient,
  buildEmployer,
  loginToPatients,
  createAndSaveMinimalPatient,
  openExistingPatientForEmployer
};
