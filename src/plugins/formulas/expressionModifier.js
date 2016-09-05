import Handsontable from '../../browser';
import {arrayEach, arrayFilter} from 'handsontable/helpers/array';
import {startsWith} from 'handsontable/helpers/string';
import {mixin} from 'handsontable/helpers/object';
import {localHooks} from 'handsontable/mixins/localHooks';
import {toUpperCaseFormula} from './utils';
import {toLabel, extractLabel, error, ERROR_REF} from 'hot-formula-parser';

const BARE_CELL_STRICT_REGEX = /^\$?[A-Z]+\$?\d+$/;
const BARE_CELL_REGEX = /\$?[A-Z]+\$?\d+/;
const CELL_REGEX = /(?:[^0-9A-Z$: ]|^)\s*(\$?[A-Z]+\$?\d+)\s*(?![0-9A-Z_: ])/g;
const RANGE_REGEX = /\$?[A-Z]+\$?\d+\s*:\s*\$?[A-Z]+\$?\d+/g;
const CELL_AND_RANGE_REGEX = /((?:[^0-9A-Z$: ]|^)\s*(\$?[A-Z]+\$?\d+)\s*(?![0-9A-Z_: ]))|(\$?[A-Z]+\$?\d+\s*:\s*\$?[A-Z]+\$?\d+)/g;

/**
 * @class ExpressionModifier
 * @util
 */
class ExpressionModifier {
  constructor(expression) {
    /**
     * Formula expression to modify.
     *
     * @type {String}
     */
    this.expression = '';
    /**
     * Extracted cells and cells ranges.
     *
     * @type {Array}
     */
    this.cells = [];

    if (typeof expression === 'string') {
      this.setExpression(expression);
    }
  }

  /**
   * Set formula expression to modify.
   *
   * @param {String} expression Formula expression to process.
   * @returns {ExpressionModifier}
   */
  setExpression(expression) {
    this.cells.length = 0;
    this.expression = toUpperCaseFormula(expression);

    this._extractCells();
    this._extractCellsRange();

    return this;
  }

  /**
   * Translate formula expression cells.
   *
   * @param {Object} baseCoord Coordinates which translation will be applied from.
   * @param {Object} [delta={row: undefined, column: undefined}] Distance to move in proper direction.
   * @returns {ExpressionModifier}
   */
  translate({row: baseRow, column: baseColumn}, {row: deltaRow, column: deltaColumn}) {
    arrayEach(this.cells, (cell) => {
      if (deltaRow != null) {
        this._translateCell(cell, 'row', baseRow, deltaRow);
      }
      if (deltaColumn != null) {
        this._translateCell(cell, 'column', baseColumn, deltaColumn);
      }
    });

    return this;
  }

  /**
   * Translate object into string representation.
   *
   * @returns {String}
   */
  toString() {
    let expression = this.expression.replace(CELL_AND_RANGE_REGEX, (match, p1, p2) => {
      const isSingleCell = match.indexOf(':') === -1;
      let result = match;
      let cellLabel = match;
      let translatedCellLabel = null;

      if (isSingleCell) {
        cellLabel = BARE_CELL_STRICT_REGEX.test(p1) ? p1 : p2;
      }
      const cell = this._searchCell(cellLabel);

      if (cell) {
        translatedCellLabel = cell.refError ? error(ERROR_REF) : cell.toLabel();

        if (isSingleCell) {
          result = match.replace(cellLabel, translatedCellLabel);
        } else {
          result = translatedCellLabel;
        }
      }

      return result;
    });

    if (!startsWith(expression, '=')) {
      expression = '=' + expression;
    }

    return expression;
  }

  /**
   * Translate single cell.
   *
   * @param {Object} cell Cell object.
   * @param {String} property Property to change.
   * @param {Number} baseIndex Base index which translation will be applied from.
   * @param {Number} delta Distance to move.
   * @private
   */
  _translateCell(cell, property, baseIndex = 0, delta = 0) {
    const {type, start, end} = cell;
    let startIndex = start[property].index;
    let endIndex = end[property].index;
    let deltaStart = delta;
    let deltaEnd = delta;
    let refError = false;
    const indexOffset = Math.abs(delta) - 1;

    // Adding new items
    if (delta > 0) {
      if (baseIndex > startIndex) {
        deltaStart = 0;
      }
      if (baseIndex > endIndex) {
        deltaEnd = 0;
      }
    } else { // Removing items
      if (startIndex >= baseIndex && endIndex <= baseIndex + indexOffset) {
        refError = true;
      }
      if (!refError && type === 'cell') {
        if (baseIndex >= startIndex) {
          deltaStart = 0;
          deltaEnd = 0;
        }
      }
      if (!refError && type === 'range') {
        if (baseIndex >= startIndex) {
          deltaStart = 0;
        }
        if (baseIndex > endIndex) {
          deltaEnd = 0;

        } else if (endIndex <= baseIndex + indexOffset) {
          deltaEnd -= Math.min(endIndex - (baseIndex + indexOffset), 0);
        }
      }
    }

    if (deltaStart && !refError) {
      start[property].index = Math.max(startIndex + deltaStart, 0);
    }
    if (deltaEnd && !refError) {
      end[property].index = Math.max(endIndex + deltaEnd, 0);
    }
    if (refError) {
      cell.refError = true;
    }
  }

  /**
   * Extract all cells from the formula expression.
   *
   * @private
   */
  _extractCells() {
    const matches = this.expression.match(CELL_REGEX);

    if (!matches) {
      return;
    }
    arrayEach(matches, (coord) => {
      coord = coord.match(BARE_CELL_REGEX);

      if (!coord) {
        return;
      }
      const [row, column] = extractLabel(coord[0]);

      this.cells.push(this._createCell({row, column}, {row, column}, coord[0]));
    });
  }

  /**
   * Extract all cells range from the formula expression.
   *
   * @private
   */
  _extractCellsRange() {
    const matches = this.expression.match(RANGE_REGEX);

    if (!matches) {
      return;
    }
    arrayEach(matches, (match) => {
      const [start, end] = match.split(':');
      const [startRow, startColumn] = extractLabel(start);
      const [endRow, endColumn] = extractLabel(end);
      const startCell = {
        row: startRow,
        column: startColumn,
      };
      const endCell = {
        row: endRow,
        column: endColumn,
      };

      this.cells.push(this._createCell(startCell, endCell, match));
    });
  }

  /**
   * Search cell by its label.
   *
   * @param {String} label Cell label eq. `B4` or `$B$6`.
   * @returns {Object|null}
   * @private
   */
  _searchCell(label) {
    const [cell] = arrayFilter(this.cells, (cell) => cell.origLabel === label);

    return cell || null;
  }

  /**
   * Create object cell.
   *
   * @param {Object} start Start coordinates (top-left).
   * @param {Object} end End coordinates (bottom-right).
   * @param {String} label Original label name.
   * @returns {Object}
   * @private
   */
  _createCell(start, end, label) {
    return {
      start,
      end,
      origLabel: label,
      type: label.indexOf(':') === -1 ? 'cell' : 'range',
      refError: false,
      toLabel: function() {
        let label = toLabel(this.start.row, this.start.column);

        if (this.type === 'range') {
          label += ':' + toLabel(this.end.row, this.end.column);
        }

        return label;
      }
    };
  }
}

mixin(ExpressionModifier, localHooks);

export {ExpressionModifier};

// temp for tests only!
Handsontable.utils.FormulasUtils = Handsontable.utils.FormulasUtils || {};
Handsontable.utils.FormulasUtils.ExpressionModifier = ExpressionModifier;
