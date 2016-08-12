import {BaseCell} from './_base';
import {toLabel} from 'hot-formula-parser';

/**
 * @plugin Formulas
 * @pro
 */
class CellReference extends BaseCell {
  constructor(row, column) {
    super(row, column);
  }

  /**
   * Stringify object.
   *
   * @returns {String}
   */
  toString() {
    return toLabel(
      {index: this.row, isAbsolute: false},
      {index: this.column, isAbsolute: false}
    );
  }
}

export {CellReference};
