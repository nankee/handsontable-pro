import {getComparisonFunction} from 'handsontable/helpers/feature';
import {arrayMap, arrayUnique, arrayEach} from 'handsontable/helpers/array';

const sortCompare = getComparisonFunction();

/**
 * Comparison function for sorting purposes.
 *
 * @param {*} a
 * @param {*} b
 * @returns {Number} Returns number from -1 to 1.
 */
export function sortComparison(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  return sortCompare(a, b);
}

/**
 * Convert raw value into visual value.
 *
 * @param {*} value
 * @returns {*}
 */
export function toVisualValue(value) {
  if (value === '') {
    value = '(Blank cells)';
  }

  return value;
}

/**
 * Unify column values (replace `null` and `undefined` values into empty string, unique values and sort them).
 *
 * @param {Array} values An array of values.
 * @returns {Array}
 */
export function unifyColumnValues(values) {
  values = arrayMap(values, (value) => value == null ? '' : value);
  values = arrayUnique(values);
  // sort numbers correctly then strings
  values = values.sort(sortComparison);

  return values;
}

/**
 * Intersect 'base' values with 'selected' values and return an array of object.
 *
 * @param {Array} base An array of base values.
 * @param {Array} selected An array of selected values.
 * @param {Function} [callback] A callback function which is invoked for every item in an array.
 * @returns {Array}
 */
export function intersectValues(base, selected, callback) {
  const result = [];

  arrayEach(base, (value) => {
    let checked = false;

    if (selected.indexOf(value) >= 0) {
      checked = true;
    }
    const item = {checked, value, visualValue: toVisualValue(value)};

    if (callback) {
      callback(item);
    }
    result.push(item);
  });

  return result;
}
