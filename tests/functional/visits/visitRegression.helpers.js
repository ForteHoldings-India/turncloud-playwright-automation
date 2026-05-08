const { LoginPage } = require('../../../framework/pages/loginTabScreen/loginPage');
const { loginData } = require('../../../framework/data/loginData');

function buildPrimaryPatient(index) {
  const suffix = `${Date.now()}${index}`.slice(-6);
  const seed = Number(suffix) + index;
  const firstNames = ['Avery', 'Morgan', 'Jordan', 'Taylor', 'Casey', 'Riley'];
  const lastNames = ['Bennett', 'Hayes', 'Parker', 'Reed', 'Sullivan', 'Walker'];

  return {
    firstName: `${firstNames[seed % firstNames.length]}${suffix.slice(0, 2)}`,
    lastName: `${lastNames[(seed + index) % lastNames.length]}${suffix.slice(2)}`
  };
}

function buildCaseDetails(index) {
  const suffix = `${Date.now()}${index}`.slice(-4);

  return {
    caseTypeName: 'New Case new build',
    caseStatus: 'Active',
    referringOffice: 'New York Bureau of Emergency',
    initialComplaint: `Visit Case ${index}`,
    initialVisitDate: '04/29/2026',
    similarIllnessQualifier: 'Acute Manifestation Of',
    similarIllnessDate: '04/29/2026',
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

function buildVisitHeaderDetails(index) {
  return {
    visitType: 'Re-Exam12',
    caseSelection: `04/29/2026 - New Case new build`,
    doctor: 'Anagha Gangane',
    visitDate: '04/30/2026',
    onsetDate: '04/30/2026',
    status: 'Completed',
    complaint: `initial ${index}`
  };
}

function buildVitalsData(index) {
  return {
    bloodPressure: {
      systolic: '34',
      diastolic: '34'
    },
    temperature: '125',
    heartRate: '98',
    respiratoryRate: '34',
    weight: '5',
    notes: 'vital notes'
  };
}

function buildComplaintsData(index) {
  return {
    complaint: `Patient complaint for test ${index}`,
    notes: 'Complaint notes'
  };
}

async function loginToPatients(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto(loginData.url);
  await loginPage.login(loginData);
  await loginPage.assertLoginSucceeded();
}

async function createAndSaveMinimalPatient(patientTab, patient) {
  await patientTab.dismissReleaseNotesIfPresent?.();
  await patientTab.openAddPatient();
  await patientTab.dismissReleaseNotesIfPresent?.();
  await patientTab.expectNewPatientHeader();
  await patientTab.dismissReleaseNotesIfPresent?.();
  await patientTab.fillNewPatientForm(patient);
  await patientTab.dismissReleaseNotesIfPresent?.();
  await patientTab.saveNewPatient();
  await patientTab.dismissReleaseNotesIfPresent?.();
  await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
}

module.exports = {
  buildPrimaryPatient,
  buildCaseDetails,
  buildVisitHeaderDetails,
  buildVitalsData,
  buildComplaintsData,
  loginToPatients,
  createAndSaveMinimalPatient
};
