const { LoginPage } = require('../../../framework/pages/loginTabScreen/loginPage');
const { loginData } = require('../../../framework/data/loginData');

function buildPrimaryPatient(index) {
  const suffix = `${Date.now()}${index}`.slice(-6);

  return {
    firstName: `Case${index}${suffix.slice(0, 2)}`,
    lastName: `Reg${suffix.slice(2)}`
  };
}

function buildCaseDetails(index) {
  const suffix = `${Date.now()}${index}`.slice(-4);

  return {
    caseTypeName: 'Latest Build 31 Case',
    caseStatus: 'Active',
    referringOffice: 'New York Bureau of Emergency',
    initialComplaint: `Case ${index}`,
    initialVisitDate: '03/03/2026',
    similarIllnessQualifier: 'Acute Manifestation Of',
    similarIllnessDate: '03/02/2026',
    additionalClaimInformation: `Add${suffix.slice(-2)}`,
    priorAuthNo: `Prio${suffix}`,
    outsideLab: 'Yes',
    allowedAmount: '125',
    mcResubmissionCode: `mc${suffix}`,
    accidentClaimNumber: `MC${suffix}`,
    illnessDate: '03/01/2026',
    illnessQualifier: '431 - Onset of Current',
    conditionRelatedTo: 'Employment related (EM)',
    state: 'AK'
  };
}

function buildCasePatientInsurances() {
  return [
    { carrierName: 'American National Insurance Company' },
    { carrierName: 'Anthem' }
  ];
}

function buildDefaultCaseInsuranceLinks() {
  return [
    { patientInsurance: 'American National', insuranceType: 'Primary', claimNumber: '02154' },
    { patientInsurance: 'Anthem', insuranceType: 'Secondary', claimNumber: '02155' }
  ];
}

function buildReassignedCaseInsuranceLinks() {
  return {
    initial: [
      { patientInsurance: 'American National', insuranceType: 'Primary', claimNumber: '03154' },
      { patientInsurance: 'Anthem', insuranceType: 'Secondary', claimNumber: '03155' }
    ],
    final: [
      { patientInsurance: 'American National', insuranceType: 'Tertiary', claimNumber: '03154' },
      { patientInsurance: 'Anthem', insuranceType: 'Primary', claimNumber: '03155' }
    ]
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

async function addAndSavePatientInsurances(patientTab, patient, insurances) {
  await patientTab.insuranceTab.openInsuranceTab();

  for (const insurance of insurances) {
    await patientTab.insuranceTab.addNewInsurance();
    await patientTab.insuranceTab.fillPolicyDetails(insurance);
    await patientTab.saveNewPatient();
    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
    await patientTab.insuranceTab.openInsuranceTab();
  }

  await patientTab.insuranceTab.expectInsuranceRowsCount(insurances.length);

  for (const [index, insurance] of insurances.entries()) {
    await patientTab.insuranceTab.expectInsuranceRowContains(index, insurance.carrierName);
  }
}

function buildReferringDoctorDetails() {
  return {
    firstName: 'detailsa',
    middleInitial: 'a',
    lastName: 'test',
    address: 'ssds',
    aptSuite: 'ddd',
    city: 'dfs',
    state: 'AL',
    zip: '75063',
    email: 'a@gmail.com',
    primaryPhone: '(485) 148-5584',
    workPhone: '(454) 854-5545',
    fax: '(215) 454-5554',
    qualifier: 'DK - Ordering Provider',
    taxonomy: 'rer',
    doctorId: 'sed3',
    individualNpi: 'bfffr',
    groupNpi: 'grp34'
  };
}

function buildAttorneyDetails() {
  return {
    firmName: 'fdfgd',
    firstName: 'test',
    middleInitial: 'd',
    lastName: 'sdd',
    address: 'dfdf',
    aptSuite: 'dffdf',
    city: 'dfdf',
    state: 'AK',
    zip: '75063',
    email: 'aganagha@gmail.com',
    phone: '(554) 552-5555',
    fax: '(215) 455-5422'
  };
}

function buildReferringDoctorDropdownData() {
  return {
    overwriteName: 'Abhira sharma',
    cancelName: 'Chase Carpenter,DC'
  };
}

function buildAttorneyDropdownData() {
  return {
    overwriteName: 'Potdar',
    cancelName: 'Potdar'
  };
}

module.exports = {
  buildPrimaryPatient,
  buildCaseDetails,
  buildCasePatientInsurances,
  buildDefaultCaseInsuranceLinks,
  buildReassignedCaseInsuranceLinks,
  buildReferringDoctorDetails,
  buildAttorneyDetails,
  buildReferringDoctorDropdownData,
  buildAttorneyDropdownData,
  loginToPatients,
  createAndSaveMinimalPatient,
  addAndSavePatientInsurances
};
