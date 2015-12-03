import {arrayEach, arrayMap, arrayFilter} from 'handsontable/helpers/array';
import {objectEach} from 'handsontable/helpers/object';
import {getFormula} from './formulaRegisterer';

/**
 * @class FormulaCollection
 * @plugin Filters
 */
class FormulaCollection {
  constructor() {
    /**
     * Formulas collection grouped by column index.
     *
     * @type {Object}
     */
    this.formulas = Object.create(null);
    /**
     * Order of added formula filters.
     *
     * @type {Array}
     */
    this.orderStack = [];
  }

  /**
   * Check if formula collection is empty (so no needed to filter data).
   *
   * @returns {Boolean}
   */
  isEmpty() {
    return !this.orderStack.length;
  }

  /**
   * Check if value is matched to the criteria of formulas chain.
   *
   * @param {Object} value Object with `value` and `meta` keys.
   * @param {Number} [column] Column index.
   * @returns {Boolean}
   */
  isMatch(value, column) {
    let result = true;

    if (column === void 0) {
      objectEach(this.formulas, (formulas) => {
        result = this.isMatchInFormulas(formulas, value);

        return result;
      });

    } else {
      result = this.isMatchInFormulas(this.getFormulas(column), value);
    }

    return result;
  }

  /**
   * Check if the value is matches the formulas.
   *
   * @param {Array} formulas List of formulas.
   * @param {Object} value Object with `value` and `meta` keys.
   * @returns {Boolean}
   */
  isMatchInFormulas(formulas, value) {
    let result = false;

    arrayEach(formulas, (formula) => result = formula.func(value));

    return result;
  }

  /**
   * Add formula to the collection.
   *
   * @param {Number} column Column index.
   * @param {Object} formulaDefinition Object with keys:
   *  * `command` Object, Command object with formula name as `key` property.
   *  * `args` Array, Formula arguments.
   */
  addFormula(column, formulaDefinition) {
    let args = arrayMap(formulaDefinition.args, (v) => typeof v === 'string' ? v.toLowerCase() : v);
    let name = formulaDefinition.command.key;

    if (this.orderStack.indexOf(column) === -1) {
      this.orderStack.push(column);
    }
    if (this.hasFormulas(column, name)) {
      // Update formula
      arrayEach(this.getFormulas(column), (formula) => {
        if (formula.name === name) {
          formula.func = getFormula(formula.name, args);

          return false;
        }
      });
    } else {
      // Add formula
      this.getFormulas(column).push({
        name,
        func: getFormula(name, args)
      });
    }
  }

  /**
   * Get all added formulas from the collection at specified column index.
   *
   * @param {Number} column Column index.
   * @returns {Array} Returns formulas collection as an array.
   */
  getFormulas(column) {
    if (!this.formulas[column]) {
      this.formulas[column] = [];
    }

    return this.formulas[column];
  }

  /**
   * Remove formulas at given column index.
   *
   * @param {Number} column Column index.
   */
  removeFormulas(column) {
    if (this.orderStack.indexOf(column) >= 0) {
      this.orderStack.splice(this.orderStack.indexOf(column), 1);
    }
    this.clearFormulas(column);
  }

  /**
   * Clear formulas at specified column index but without clearing stack order.
   *
   * @param {Number }column Column index.
   */
  clearFormulas(column) {
    this.getFormulas(column).length = 0;
  }

  /**
   * Check if at least one formula was added at specified column index. And if second parameter is passed then additionally
   * check if formula exists under its name.
   *
   * @param {Number} column Column index.
   * @param {String} [name] Formula name.
   * @returns {Boolean}
   */
  hasFormulas(column, name) {
    let result = false;
    let formulas = this.getFormulas(column);

    if (name) {
      result = arrayFilter(formulas, (formula) => formula.name === name).length > 0;
    } else {
      result = formulas.length > 0;
    }

    return result;
  }

  /**
   * Clear formulas collection.
   */
  clear() {
    this.formulas = Object.create(null);
    this.orderStack.length = 0;
  }

  /**
   * Destroy object.
   */
  destroy() {
    this.formulas = null;
    this.orderStack = null;
  }
}

export {FormulaCollection};
