const { test } = require('@playwright/test');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');
const {
  buildPrimaryPatient,
  buildCaseDetails,
  buildVisitHeaderDetails,
  loginToPatients,
  createAndSaveMinimalPatient
} = require('../visits/visitRegression.helpers');
const {
  buildCasePatientInsurances,
  buildDefaultCaseInsuranceLinks,
  addAndSavePatientInsurances
} = require('../../regression/cases/caseRegression.helpers');

async function createPatientWithInsuranceCaseVisit(page, index) {
  const patientTab = new PatientTab(page);
  const patient = buildPrimaryPatient(index);
  const patientInsurances = buildCasePatientInsurances();
  const caseDetails = buildCaseDetails(index);
  const caseInsuranceLinks = buildDefaultCaseInsuranceLinks();
  const visitHeader = buildVisitHeaderDetails(index);

  await loginToPatients(page);
  await createAndSaveMinimalPatient(patientTab, patient);

  await addAndSavePatientInsurances(patientTab, patient, patientInsurances);

  await patientTab.caseTab.openCasesTab();
  await patientTab.caseTab.selectExistingCaseRow(0);
  await patientTab.caseTab.fillCaseDetails(caseDetails);
  await patientTab.caseTab.addInsuranceForSelectedCase({
    patientInsurance: caseInsuranceLinks[0].patientInsurance,
    claimNumber: caseInsuranceLinks[0].claimNumber,
    verifyAvailablePatientInsurances: caseInsuranceLinks.map((link) => link.patientInsurance)
  });
  await patientTab.saveNewPatient();
  await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);

  await patientTab.visitTab.openVisitsTab();
  await patientTab.visitTab.addNewVisit();
  await patientTab.visitTab.fillVisitHeader({
    ...visitHeader,
    caseSelection: caseDetails.caseTypeName
  });
  await patientTab.visitTab.updateVisit();
  await patientTab.visitTab.verifyVisitSaved();

  await patientTab.editPostingTab.openEditPostingTab();

  return patientTab;
}

test.describe.serial('Edit Posting Tab - Functional Tests', () => {
  test.describe.configure({ timeout: 600000 });

  test('Positive: create patient with insurance case visit charge and payment in Edit Posting', async ({ page }) => {
    const patientTab = await createPatientWithInsuranceCaseVisit(page, 1);

    await patientTab.editPostingTab.addNewCharge();
    await patientTab.editPostingTab.expectInsuranceBalance(60);
    await patientTab.editPostingTab.addNewPayment({ amount: '30' });
    await patientTab.editPostingTab.expectInsuranceBalance(30);
  });

  test('Positive: add insurance and patient charges then verify balances in Edit Posting', async ({ page }) => {
    const patientTab = await createPatientWithInsuranceCaseVisit(page, 2);

    await patientTab.editPostingTab.addNewCharge({ chargeCode: 'Fee 8', saveAfter: false });
    await patientTab.editPostingTab.addNewCharge({ chargeCode: 'Fee 7', saveAfter: false });
    await patientTab.editPostingTab.saveChanges();

    await patientTab.editPostingTab.expectChargeRowValue('Fee 8', 60);
    await patientTab.editPostingTab.expectChargeRowPatientTotal('Fee 7', 80, 20);
    await patientTab.editPostingTab.expectPatientBalance(100);

    await patientTab.editPostingTab.addTypedPayment({ paymentType: 'Patient Check', amount: '40' });
    await patientTab.editPostingTab.expectPatientBalance(60);


    await patientTab.editPostingTab.addTypedPayment({ paymentType: 'Insurance Check', amount: '30' });
   
    await patientTab.editPostingTab.expectInsuranceBalance(30);

  });
});
