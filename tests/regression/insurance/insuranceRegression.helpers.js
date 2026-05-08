const { LoginPage } = require('../../../framework/pages/loginTabScreen/loginPage');
const { loginData } = require('../../../framework/data/loginData');

function buildPrimaryPatient(index) {
  const suffix = `${Date.now()}${index}`.slice(-6);

  return {
    firstName: `Ins${index}${suffix.slice(0, 2)}`,
    lastName: `Reg${suffix.slice(2)}`
  };
}

function buildPatientDemographics(index) {
  const suffix = `${Date.now()}${index}`.slice(-4);

  return {
    middleInitial: index % 2 === 0 ? 'Q' : 'R',
    dateOfBirth: index % 2 === 0 ? '08/14/1984' : '03/09/1980',
    sex: index % 2 === 0 ? 'F' : 'M',
    email: `patient.${index}.${suffix}@test.com`,
    address1: index % 2 === 0 ? '244 Patient Way' : '155 Demographic Ave',
    address2: index % 2 === 0 ? 'Suite 9' : 'Unit 3',
    city: index % 2 === 0 ? 'Austin' : 'Denver',
    state: index % 2 === 0 ? 'AK' : 'CO',
    zip: index % 2 === 0 ? '99501' : '80205',
    mobilePhone: index % 2 === 0 ? '(941) 545-4666' : '(941) 545-4555'
  };
}

function buildInsurance(index) {
  const suffix = `${Date.now()}${index}`.slice(-5);

  return {
    carrierName: index % 2 === 0 ? 'Blue Shield of California' : 'Aetna',
    policyNumber: `Policy${suffix}${index}`,
    insuranceId: `${20 + index}`,
    groupPlanNumber: `Grp9${suffix.slice(-2)}`,
    planProgramName: index % 2 === 0 ? 'Extended Family' : 'Family',
    effectiveDay: index % 2 === 0 ? '4' : '3',
    expiryDay: index % 2 === 0 ? '30' : '31',
    subscriberFirstName: index % 2 === 0 ? 'Avery' : 'Prashant',
    subscriberMiddleInitial: index % 2 === 0 ? 'B' : 'A',
    subscriberLastName: index % 2 === 0 ? 'Coverage' : 'Test',
    subscriberDateOfBirth: index % 2 === 0 ? '08/14/1984' : '03/09/1980',
    relationship: index % 2 === 0 ? 'Self' : 'Spouse',
    sex: index % 2 === 0 ? 'F' : 'M',
    telephone: index % 2 === 0 ? '(941) 545-4666' : '(941) 545-4555',
    email: index % 2 === 0 ? `insurance.two.${suffix}@test.com` : `insurance.one.${suffix}@test.com`,
    address: index % 2 === 0 ? 'add second' : 'add',
    aptSuite: index % 2 === 0 ? 'add4' : 'add3',
    city: index % 2 === 0 ? 'austin' : 'pune',
    state: index % 2 === 0 ? 'AK' : 'CO',
    zipCode: index % 2 === 0 ? '99501' : '75063',
    deductibleAmount: index % 2 === 0 ? '20' : '10',
    coInsuranceAmount: index % 2 === 0 ? '8' : '5',
    maxOutOfPocketAmount: index % 2 === 0 ? '150' : '100',
    usedVisit: index % 2 === 0 ? '3' : '2'
  };
}

function buildSelfOverwriteInsurance(index, overwriteDecision) {
  const insurance = buildInsurance(index);
  insurance.relationship = 'Self';
  insurance.overwriteDecision = overwriteDecision;
  return insurance;
}

function buildExpectedInsuredFromDemographics(patient, demographics) {
  return {
    subscriberFirstName: patient.firstName,
    subscriberLastName: patient.lastName,
    subscriberDateOfBirth: demographics.dateOfBirth,
    relationship: 'Self'
  };
}

function buildExpectedInsuredFromInsurance(insurance) {
  return {
    subscriberFirstName: insurance.subscriberFirstName,
    subscriberMiddleInitial: insurance.subscriberMiddleInitial,
    subscriberLastName: insurance.subscriberLastName,
    subscriberDateOfBirth: insurance.subscriberDateOfBirth,
    relationship: 'Self',
    sex: insurance.sex,
    telephone: insurance.telephone,
    email: insurance.email,
    address: insurance.address,
    aptSuite: insurance.aptSuite,
    city: insurance.city,
    state: insurance.state,
    zipCode: insurance.zipCode
  };
}

function buildExpectedBlankInsuredForRelationship(relationship) {
  return {
    subscriberFirstName: '',
    subscriberLastName: '',
    relationship,
    address: '',
    city: ''
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

async function createAndSavePatientWithDemographics(patientTab, patient, demographics) {
  await createAndSaveMinimalPatient(patientTab, patient);
  await patientTab.openDemographics();
  await patientTab.fillAdditionalPatientDetails(demographics);
  await patientTab.saveNewPatient();
  await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
}


module.exports = {
  buildPrimaryPatient,
  buildPatientDemographics,
  buildInsurance,
  buildSelfOverwriteInsurance,
  buildExpectedInsuredFromDemographics,
  buildExpectedInsuredFromInsurance,
  buildExpectedBlankInsuredForRelationship,
  loginToPatients,
  createAndSaveMinimalPatient,
  createAndSavePatientWithDemographics
};

