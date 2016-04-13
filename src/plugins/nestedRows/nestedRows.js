import BasePlugin from 'handsontable/plugins/_base';
import {registerPlugin} from 'handsontable/plugins';
import {rangeEach} from 'handsontable/helpers/number';
import {arrayEach} from 'handsontable/helpers/array';

/**
 * @plugin NestedRows
 *
 *
 * @description
 * Blank plugin template. It needs to inherit from the BasePlugin class.
 */
class NestedRows extends BasePlugin {

  constructor(hotInstance) {

    this.sourceData = null;
    this.parentReference = null;

    super(hotInstance);
  }

  /**
   * Checks if the plugin is enabled in the settings.
   */
  isEnabled() {
    return !!this.hot.getSettings().nestedRows;
  }

  /**
   * Enable the plugin.
   */
  enablePlugin() {
    this.sourceData = this.hot.getSourceData();
    this.parentReference = new WeakMap();

    this.addHook('modifyRowData', (row) => this.onModifyRowData(row));
    this.addHook('modifySourceLength', () => this.onModifySourceLength());

    //testing
    this.addHook('afterRenderer', (td,  row, col, prop, value, cellProperties) => this.onAfterRenderer(td,  row, col, prop, value, cellProperties));

    super.enablePlugin();
  }

  /**
   * Disable the plugin.
   */
  disablePlugin() {
    super.disablePlugin();
  }

  /**
   * Update the plugin.
   */
  updatePlugin() {
    this.disablePlugin();
    this.enablePlugin();

    super.updatePlugin();
  }

  /**
   * Get the date for the provided visual row number.
   *
   * @param {Number} row Row index.
   */
  getVisualRowData(row) {
    let rowObjData = this.getNthRowObject(this.sourceData, row);
    return rowObjData ? rowObjData.obj : null;
  }

  /**
   * Get the n-th row object by traversing the node tree.
   *
   * @private
   * @param {Array} rowArray Array of the row nodes.
   * @param {Number} row Index of the row to return the object for.
   * @param {Object} [parent] Row node parent.
   * @returns {Object}
   */
  getNthRowObject(rowArray, row, parent) {
    let r = 0;
    let childRowsProcessed = 0;

    while (r < rowArray.length) {
      let rowObj = rowArray[r];
      let rowData;

      this.parentReference.set(rowObj, parent || null);

      if (r === row) {
        return {
          obj: rowObj,
          rowsLeft: 0
        };
      }

      r++;

      if (rowObj.__children) {
        rowData = this.getNthRowObject(rowObj.__children, row - r, rowObj);
        childRowsProcessed += rowData.rowsLeft;
        row -= rowData.rowsLeft || 0;
      }

      if (rowData && rowData.obj) {
        return rowData;
      }
    }

    return {
      obj: null,
      rowsLeft: r + childRowsProcessed
    };
  }

  /**
   * Count all rows (including all parents and children).
   */
  countAllRows() {
    let rootNodeMock = {
      __children: this.sourceData
    };

    return this.countChildren(rootNodeMock);
  }

  /**
   * Count children of the provided parent.
   *
   * @param {Object} parent Parent node.
   * @returns {Number} Children count.
   */
  countChildren(parent) {
    let rowCount = 0;

    if (!parent.__children) {
      return 0;
    }

    arrayEach(parent.__children, (elem, i) => {
      rowCount++;
      if (elem.__children) {
        rowCount += this.countChildren(elem);
      }
    });

    return rowCount;
  }

  /**
   * Get the parent of the row at the provided index.
   *
   * @param {Number} row Row index.
   */
  getRowParent(row) {
    let rowObject = this.getVisualRowData(row);

    return this.getRowObjectParent(rowObject);
  }

  /**
   * Get the parent of the provided row object.
   *
   * @param {Object} rowObject The row object (tree node).
   */
  getRowObjectParent(rowObject) {
    return this.parentReference.get(rowObject);
  }

  /**
   * Get the nesting level for the row with the provided row index.
   *
   * @param {Number} row Row index.
   * @returns {Number|null} Row level or null, when row doesn't exist.
   */
  getRowLevel(row) {
    let rowObject = this.getVisualRowData(row);

    return rowObject ? this.getRowObjectLevel(rowObject) : null;
  }

  /**
   * Get the nesting level for the row with the provided row index.
   *
   * @param {Object} rowObject Row object.
   * @returns {Number} Row level.
   */
  getRowObjectLevel(rowObject) {
    let parentNode = this.getRowObjectParent(rowObject);
    let levelCount = 0;
    if (parentNode === null) {
      return 0;
    }

    while (parentNode !== null) {
      parentNode = this.getRowObjectParent(parentNode);
      levelCount++;
    }

    return levelCount;
  }

  /**
   * The modifyRowData hook callback.
   *
   * @private
   * @param {Number} row Visual row index.
   */
  onModifyRowData(row) {
    return this.getVisualRowData(row);
  }

  /**
   * Modify the source data length to match the length of the nested structure.
   *
   * @private
   * @returns {number}
   */
  onModifySourceLength() {
    return this.countAllRows();
  }

  // testing
  onAfterRenderer(td,  row, col, prop, value, cellProperties) {
    let rowLevel = this.getRowLevel(row);

    if (rowLevel) {
      td.style.paddingLeft = parseInt(15 * rowLevel, 10) + 'px';
    }
  }
}

export {NestedRows};

registerPlugin('nestedRows', NestedRows);
