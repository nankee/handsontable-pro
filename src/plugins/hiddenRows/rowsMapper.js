import Handsontable from '../../browser';
import {arrayMapper} from 'handsontable/mixins/arrayMapper';
import {mixin} from 'handsontable/helpers/object';
import {rangeEach} from 'handsontable/helpers/number';

/**
 * @class RowsMapper
 * @plugin hiddenRows
 * @pro
 */
class RowsMapper {
  constructor(hiddenRows) {
    /**
     * Instance of hiddenRows plugin.
     *
     * @type {hiddenRows}
     */
    this.hiddenRows = hiddenRows;
  }

  /**
   * Reset current map array and create new one.
   *
   * @param {Number} [length] Custom generated map length.
   */
  createMap(length) {
    let rowOffset = 0;
    let originLength = length === void 0 ? this._arrayMap.length : length;

    this._arrayMap.length = 0;

    rangeEach(originLength - 1, (itemIndex) => {
      this._arrayMap[itemIndex - rowOffset] = itemIndex;
    });
  }

  /**
   * Destroy class.
   */
  destroy() {
    this._arrayMap = null;
  }
}

mixin(RowsMapper, arrayMapper);

export {RowsMapper};

// For tests only!
Handsontable.utils.HiddenRowsRowsMapper = RowsMapper;
