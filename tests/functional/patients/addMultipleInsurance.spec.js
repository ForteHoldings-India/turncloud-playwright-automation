const { test } = require('@playwright/test');
const { LoginPage } = require('../../../framework/pages/loginTabScreen/loginPage');
const { loginData } = require('../../../framework/data/loginData');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');

function buildPatient(suffix, label) {
  return {
    firstName: `Ins${label}${suffix.slice(0, 2)}`,
    lastName: `Case${suffix.slice(2)}`
  };
}

function buildInsuranceWithDetails(index, suffix) {
  const carriers = ['Aetna', 'Blue Shield of California'];

  return {
    carrierName: carriers[index - 1],
    policyNumber: `Policy${suffix}${index}`,
    insuranceId: `${10 + index}`,
    groupPlanNumber: `Grp90${index}`,
    planProgramName: index === 1 ? 'Family' : 'Extended Family',
    effectiveDay: index === 1 ? '1' : '12',
    expiryDay: index === 1 ? '12' : '18',
    deductibleAmount: index === 1 ? '21' : '11',
    coInsuranceAmount: index === 1 ? '3' : '4',
    maxOutOfPocketAmount: index === 1 ? '23' : '19',
    usedVisit: index === 1 ? '2' : '1',
    appliedCharges: index === 1 ? '31' : '14'
  };
}

function buildCarrierOnlyInsurance(carrierName) {
  return { carrierName };
}

async function loginAndCreatePatient(page, patientTab, patient) {
  const loginPage = new LoginPage(page);

  await loginPage.goto(loginData.url);
  await loginPage.login(loginData);
  await loginPage.assertLoginSucceeded();

  await patientTab.openAddPatient();
  await patientTab.fillNewPatientForm(patient);
  await patientTab.saveNewPatient();
  await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
}

async function addInsuranceAndSave(patientTab, insurance) {
  await patientTab.insuranceTab.openInsuranceTab();
  await patientTab.insuranceTab.addNewInsurance();
  await patientTab.insuranceTab.fillInsuranceDetails(insurance);
  await patientTab.saveNewPatient();
  await patientTab.settleUi(1500);
}

test.describe.serial('Multiple Insurance Workflows', () => {
  test.describe.configure({ timeout: 300000 });

  test('Add and save 2 insurances with details', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const suffix = Date.now().toString().slice(-6);
    const patient = buildPatient(suffix, 'Two');
    const firstInsurance = buildInsuranceWithDetails(1, suffix);
    const secondInsurance = buildInsuranceWithDetails(2, suffix);

    await loginAndCreatePatient(page, patientTab, patient);

    await addInsuranceAndSave(patientTab, firstInsurance);
    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);

    await addInsuranceAndSave(patientTab, secondInsurance);
    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
  });

  test('Add and save 3 insurances where the third has no details', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const suffix = Date.now().toString().slice(-6);
    const patient = buildPatient(suffix, 'Thr');
    const firstInsurance = buildInsuranceWithDetails(1, suffix);
    const secondInsurance = {
      carrierName: 'Blue Cross Blue Shield of New',
      policyNumber: '1',
      insuranceId: '1',
      groupPlanNumber: '3',
      planProgramName: '13'
    };
    const thirdInsurance = buildCarrierOnlyInsurance('Centene');

    await loginAndCreatePatient(page, patientTab, patient);

    await addInsuranceAndSave(patientTab, firstInsurance);
    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);

    await addInsuranceAndSave(patientTab, secondInsurance);
    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);

    await addInsuranceAndSave(patientTab, thirdInsurance);
    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
  });
});
