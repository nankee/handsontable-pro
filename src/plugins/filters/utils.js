import {getComparisonFunction} from 'handsontable/helpers/feature';

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
