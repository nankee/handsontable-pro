import Handsontable from '../../browser';
import {arrayMapper} from 'handsontable/mixins/arrayMapper';
import {mixin} from 'handsontable/helpers/object';
import {rangeEach} from 'handsontable/helpers/number';

/**
 * @class ColumnsMapper
 * @plugin HiddenColumns
 * @pro
 */
class ColumnsMapper {
  constructor(hiddenColumns) {
    /**
     * Instance of hiddenColumns plugin.
     *
     * @type {hiddenColumns}
     */
    this.hiddenColumns = hiddenColumns;
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

mixin(ColumnsMapper, arrayMapper);

export {ColumnsMapper};

// For tests only!
Handsontable.utils.HiddenColumnsColumnMapper = ColumnsMapper;
