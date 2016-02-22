import {registerFormula} from './../formulaRegisterer';

export const FORMULA_NAME = 'by_value';

function formula(dataRow, [value] = inputValues) {
  return value.indexOf(dataRow.value) >= 0;
}

registerFormula(FORMULA_NAME, formula, {
  name: 'By value',
  inputsCount: 0
});
