const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../framework/pages/loginTabScreen/loginPage');
const { loginData } = require('../../../framework/data/loginData');
const { PatientTab } = require('../../../framework/pages/patientTabScreen/patientTab');

const EXISTING_ACCOUNT_NUMBER = '25480';
const EXISTING_CASE_INDEX = 0;
const MAIN_PAGE_URL = 'https://my.turncloud.com/1034/main.html';

async function dismissReleaseNotesIfPresent(page) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const releaseNotesDialog = page.getByRole('dialog', { name: /Turncloud Release Notes/i });
    const closeButton = releaseNotesDialog.getByRole('button', { name: /^Close$/i });

    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(1000);
    }

    if (!(await releaseNotesDialog.isVisible().catch(() => false))) {
      return;
    }

    await page.waitForTimeout(1000);
  }
}

async function openExistingPatientFromLookup(page, patientTab) {
  await dismissReleaseNotesIfPresent(page);

  await patientTab.openExistingPatientByLookupCellText(EXISTING_ACCOUNT_NUMBER, { doubleClick: true });
  await patientTab.activatePatientTabContaining(EXISTING_ACCOUNT_NUMBER);
}

async function loginAndOpenExistingCase(page) {
  const loginPage = new LoginPage(page);
  const patientTab = new PatientTab(page);

  await loginPage.goto(loginData.url);
  await loginPage.login(loginData);
  await loginPage.assertLoginSucceeded();
  await patientTab.waitForPatientReady();
  await dismissReleaseNotesIfPresent(page);
  await openExistingPatientFromLookup(page, patientTab);
  await patientTab.caseTab.openCasesTab();
  await patientTab.caseTab.selectExistingCaseRow(EXISTING_CASE_INDEX);
  await patientTab.caseTab.diagnosisSection.scrollToDiagnosisSection();

  return patientTab;
}

test.describe.serial('Diagnosis Section Automation', () => {
  test('Add single diagnosis to existing case', async ({ page }) => {
    test.setTimeout(600000);

    const patientTab = await loginAndOpenExistingCase(page);

    await patientTab.caseTab.diagnosisSection.addSingleDiagnosis({
      diagnosis: 'ACC WATERCRAFT CAUS',
      startDate: '13',
      order: 3
    });

    await patientTab.caseTab.diagnosisSection.expectDiagnosisInGrid('ACC WATERCRAFT CAUS');
    await patientTab.saveNewPatient();
  });

  test('Add multiple diagnoses to existing case', async ({ page }) => {
    test.setTimeout(600000);

    const patientTab = await loginAndOpenExistingCase(page);

    await patientTab.caseTab.diagnosisSection.addMultipleDiagnosis([
      'Acquired clawfoot',
      'cervical disc injury w/o myelopathy',
      'Dislocation of left ankle joint, initial encounter',
      'Fatigue fx vert, sacr/sacrocygl rgn, 7thG'
    ]);

    await patientTab.caseTab.diagnosisSection.expectDiagnosisInGrid('Acquired clawfoot');
    await patientTab.caseTab.diagnosisSection.expectDiagnosisInGrid('cervical disc injury w/o myelopathy');
    await patientTab.caseTab.diagnosisSection.expectDiagnosisInGrid('Dislocation of left ankle joint, initial encounter');
    await patientTab.caseTab.diagnosisSection.expectDiagnosisInGrid('Fatigue fx vert, sacr/sacrocygl rgn, 7thG');
    await patientTab.saveNewPatient();
  });
});
