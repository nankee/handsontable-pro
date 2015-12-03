import {registerFormula, getFormula} from './../formulaRegisterer';
import {FORMULA_NAME as FORMULA_EMPTY} from './empty';

export const FORMULA_NAME = 'not_empty';

function formula(dataRow, inputValues) {
  return !getFormula(FORMULA_EMPTY, inputValues)(dataRow);
}

registerFormula(FORMULA_NAME, formula);
