const { test } = require('@playwright/test');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');
const {
  buildPrimaryPatient,
  buildCaseDetails,
  buildCasePatientInsurances,
  buildDefaultCaseInsuranceLinks,
  buildReassignedCaseInsuranceLinks,
  loginToPatients,
  createAndSaveMinimalPatient,
  addAndSavePatientInsurances
} = require('./caseRegression.helpers');

test.describe.serial('Cases Positive Regression', () => {
  test.describe.configure({ timeout: 300000 });

  test('Positive: default generated case row can be completed and saved by case type name', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(1);
    const caseDetails = buildCaseDetails(1);

    await loginToPatients(page);
    await createAndSaveMinimalPatient(patientTab, patient);

    await patientTab.caseTab.openCasesTab();
    await patientTab.caseTab.selectExistingCaseRow(0);
    await patientTab.caseTab.fillCaseDetails(caseDetails);
    await patientTab.saveNewPatient();

    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
    await patientTab.caseTab.openCasesTab();
    await patientTab.caseTab.selectExistingCaseRow(0);
    await patientTab.caseTab.expectSelectedCaseType(caseDetails.caseTypeName);
  });

  test('Positive: case can attach two different patient insurances with default primary and secondary order', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(2);
    const caseDetails = buildCaseDetails(2);
    const patientInsurances = buildCasePatientInsurances();
    const caseInsuranceLinks = buildDefaultCaseInsuranceLinks();

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
    await patientTab.caseTab.addInsuranceForSelectedCase({
      patientInsurance: caseInsuranceLinks[1].patientInsurance,
      claimNumber: caseInsuranceLinks[1].claimNumber
    });
    await patientTab.saveNewPatient();

    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
    await patientTab.caseTab.openCasesTab();
    await patientTab.caseTab.selectExistingCaseRow(0);
    await patientTab.caseTab.expectSelectedCaseType(caseDetails.caseTypeName);
    await patientTab.caseTab.expectCaseInsuranceRow(0, caseInsuranceLinks[0]);
    await patientTab.caseTab.expectCaseInsuranceRow(1, caseInsuranceLinks[1]);
  });

  test('Positive: case insurance order can be reassigned from primary secondary to tertiary primary', async ({ page }) => {
    const patientTab = new PatientTab(page);
    const patient = buildPrimaryPatient(3);
    const caseDetails = buildCaseDetails(3);
    const patientInsurances = buildCasePatientInsurances();
    const caseInsuranceLinks = buildReassignedCaseInsuranceLinks();

    await loginToPatients(page);
    await createAndSaveMinimalPatient(patientTab, patient);
    await addAndSavePatientInsurances(patientTab, patient, patientInsurances);

    await patientTab.caseTab.openCasesTab();
    await patientTab.caseTab.selectExistingCaseRow(0);
    await patientTab.caseTab.fillCaseDetails(caseDetails);

    await patientTab.caseTab.addInsuranceForSelectedCase({
      patientInsurance: caseInsuranceLinks.initial[0].patientInsurance,
      claimNumber: caseInsuranceLinks.initial[0].claimNumber,
      verifyAvailablePatientInsurances: caseInsuranceLinks.initial.map((link) => link.patientInsurance)
    });
    await patientTab.caseTab.addInsuranceForSelectedCase({
      patientInsurance: caseInsuranceLinks.initial[1].patientInsurance,
      claimNumber: caseInsuranceLinks.initial[1].claimNumber
    });
    await patientTab.caseTab.updateInsuranceTypeForSelectedCase(0, caseInsuranceLinks.final[0].insuranceType);
    await patientTab.caseTab.updateInsuranceTypeForSelectedCase(1, caseInsuranceLinks.final[1].insuranceType);
    await patientTab.saveNewPatient();

    await patientTab.waitForPatientNameInHeader(patient.firstName, patient.lastName);
    await patientTab.caseTab.openCasesTab();
    await patientTab.caseTab.selectExistingCaseRow(0);
    await patientTab.caseTab.expectSelectedCaseType(caseDetails.caseTypeName);
    await patientTab.caseTab.expectCaseInsuranceRow(0, caseInsuranceLinks.final[0]);
    await patientTab.caseTab.expectCaseInsuranceRow(1, caseInsuranceLinks.final[1]);
  });
});
