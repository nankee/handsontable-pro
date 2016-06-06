import {registerFormula} from './../formulaRegisterer';

export const FORMULA_NAME = 'by_value';

function formula(dataRow, [value] = inputValues) {
  // Check value and type
  let result = value.indexOf(dataRow.value) >= 0;

  if (!result) {
    // Treat `null` and `undefined` as blank cell
    result = value.indexOf(dataRow.value == null ? '' : dataRow.value) >= 0;
  }

  return result;
}

registerFormula(FORMULA_NAME, formula, {
  name: 'By value',
  inputsCount: 0
});
