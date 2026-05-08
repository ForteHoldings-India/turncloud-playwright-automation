const { PatientCommon } = require('./patientCommon');
const { DemographicsTab } = require('./demographicsTab');
const { EmployerTab } = require('./employerTab');
const { InsuranceTab } = require('./insuranceTab');
const { CaseTab } = require('./caseTab');
const { VisitTab } = require('./visitTab');
const { EditPostingTab } = require('./editPostingTab');

function copyPrototypeMethods(target, source) {
  let prototype = Object.getPrototypeOf(source);

  while (prototype && prototype !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(prototype)) {
      if (key === 'constructor' || typeof source[key] !== 'function' || key in target) {
        continue;
      }

      target[key] = source[key].bind(source);
    }

    prototype = Object.getPrototypeOf(prototype);
  }
}

function registerTab(target, propertyName, TabClass, page) {
  const tab = new TabClass(page, target);
  target[propertyName] = tab;
  Object.assign(target, tab);
  copyPrototypeMethods(target, tab);
}

class PatientTab {
  constructor(page) {
    const patientCommon = new PatientCommon(page);
    Object.assign(this, patientCommon);
    copyPrototypeMethods(this, patientCommon);

    registerTab(this, 'demographicsTab', DemographicsTab, page);
    registerTab(this, 'employerTab', EmployerTab, page);
    registerTab(this, 'insuranceTab', InsuranceTab, page);
    registerTab(this, 'caseTab', CaseTab, page);
    registerTab(this, 'visitTab', VisitTab, page);
    registerTab(this, 'editPostingTab', EditPostingTab, page);
  }
}

module.exports = { PatientTab };
