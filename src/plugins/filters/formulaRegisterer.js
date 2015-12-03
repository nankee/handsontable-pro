const formulas = {};

/**
 * Get formula closure with pre-bound arguments.
 *
 * @param {String} name Formula name.
 * @param {Array} args Formula arguments.
 * @returns {Function}
 */
export function getFormula(name, args) {
  return function(dataRow) {
    if (!formulas[name]) {
      throw new Error(`Filter formula "${name}" does not exist.`);
    }

    return formulas[name].apply(dataRow.meta.instance, [].concat([dataRow], [args]));
  };
}

/**
 * Formula registerer.
 *
 * @param {String} name Formula name.
 * @param {Function} formula Formula function
 */
export function registerFormula(name, formula) {
  formulas[name] = formula;
}

// For tests only! TEMP solution!
Handsontable.utils = Handsontable.utils || {};
Handsontable.utils.FiltersFormulaRegisterer = {getFormula, registerFormula, formulas};
