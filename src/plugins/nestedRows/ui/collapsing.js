import {BaseUI} from './_base';
import {stopImmediatePropagation} from 'handsontable/helpers/dom/event';
import {arrayEach} from 'handsontable/helpers/array';
import {rangeEach} from 'handsontable/helpers/number';
import {hasClass} from 'handsontable/helpers/dom/element';
import {HeadersUI} from './headers';

/**
 * Class responsible for the UI for collapsing and expanding groups.
 *
 * @class
 * @private
 */
class CollapsingUI extends BaseUI {
  constructor(nestedRowsPlugin, hotInstance) {
    super(nestedRowsPlugin, hotInstance);

    /**
     * Reference to the Trim Rows plugin.
     */
    this.trimRowsPlugin = nestedRowsPlugin.trimRowsPlugin;
    this.dataManager = this.plugin.dataManager;
    this.collapsedRows = [];
  }

  /**
   * Collapse the children of the row passed as an argument.
   *
   * @param {Number|Object} row The parent row.
   * @param {Boolean} [forceRender=true] Whether to render the table after the function ends.
   */
  collapseChildren(row, forceRender = true) {
    let rowObject = null;
    let rowIndex = null;

    if (isNaN(row)) {
      rowObject = row;
      rowIndex = this.dataManager.getRowIndex(rowObject);
    } else {
      rowObject = this.dataManager.getDataObject(row);
      rowIndex = row;
    }

    if (this.dataManager.hasChildren(rowObject)) {
      arrayEach(rowObject.__children, (elem, i) => {
        this.collapseNode(elem);
      });
    }

    if (forceRender) {
      this.renderAndAdjust();
    }

    if (this.collapsedRows.indexOf(rowIndex) === -1) {
      this.collapsedRows.push(rowIndex);
    }
  }

  /**
   * Collapse a row node and its children.
   *
   * @private
   * @param {Object} rowObj Row object.
   */
  collapseNode(rowObj) {
    const rowIndex = this.dataManager.getRowIndex(rowObj);

    this.trimRowsPlugin.trimRow(rowIndex);

    if (this.dataManager.hasChildren(rowObj)) {
      arrayEach(rowObj.__children, (elem, i) => {
        this.collapseNode(elem);
      });
    }
  }

  /**
   * Expand rows provided as an argument.
   *
   * @param {Array} rows Rows to expand.
   */
  expandRows(rows) {
    arrayEach(rows, (elem, i) => {
      let rowObj = elem;
      if (!isNaN(elem)) {
        rowObj = this.dataManager.getDataObject(elem);
      }

      this.expandNode(rowObj);
    });
  }

  /**
   * Collapse rows provided as an argument.
   *
   * @param {Array} rows Rows to expand.
   */
  collapseRows(rows) {
    arrayEach(rows, (elem, i) => {
      let rowObj = elem;
      if (!isNaN(elem)) {
        rowObj = this.dataManager.getDataObject(elem);
      }

      this.collapseNode(rowObj);
    });
  }

  /**
   * Expand the children of the row passed as an argument.
   *
   * @param {Number|Object} row Parent row.
   * @param {Boolean} [forceRender=true] Whether to render the table after the function ends.
   */
  expandChildren(row, forceRender = true) {
    let rowObject = null;
    let rowIndex = null;

    if (isNaN(row)) {
      rowObject = row;
      rowIndex = this.dataManager.getRowIndex(row);
    } else {
      rowObject = this.dataManager.getDataObject(row);
      rowIndex = row;
    }

    this.collapsedRows.splice(this.collapsedRows.indexOf(rowIndex), 1);

    if (this.dataManager.hasChildren(rowObject)) {
      arrayEach(rowObject.__children, (elem, i) => {
        this.expandNode(elem);
      });
    }

    if (forceRender) {
      this.renderAndAdjust();
    }
  }

  /**
   * Collapse all collapsable rows.
   */
  collapseAll() {
    const sourceData = this.hot.getSourceData();

    arrayEach(sourceData, (elem, i) => {
      if (this.dataManager.hasChildren(elem)) {
        this.collapseChildren(elem, false);
      }
    });

    this.renderAndAdjust();
  }

  /**
   * Expand all collapsable rows.
   */
  expandAll() {
    const sourceData = this.hot.getSourceData();

    arrayEach(sourceData, (elem, i) => {
      if (this.dataManager.hasChildren(elem)) {
        this.expandChildren(elem, false);
      }
    });

    this.renderAndAdjust();
  }

  /**
   * Expand a row node and its children.
   *
   * @private
   * @param {Object} rowObj Row object.
   */
  expandNode(rowObj) {
    const rowIndex = this.dataManager.getRowIndex(rowObj);

    if (!this.isAnyParentCollapsed(rowObj)) {
      this.trimRowsPlugin.untrimRow(rowIndex);
    }

    if (this.dataManager.hasChildren(rowObj)) {
      this.expandChildren(rowObj);
    }
  }

  /**
   * Check if all child rows are collapsed.
   *
   * @param {Number|Object} row The parent row.
   * @private
   */
  areChildrenCollapsed(row) {
    let rowObj = null;
    let allCollapsed = true;

    if (isNaN(row)) {
      rowObj = row;
    } else {
      rowObj = this.dataManager.getDataObject(row);
    }

    if (this.dataManager.hasChildren(rowObj)) {
      arrayEach(rowObj.__children, (elem, i) => {
        let rowIndex = this.dataManager.getRowIndex(elem);

        if (!this.trimRowsPlugin.isTrimmed(rowIndex)) {
          allCollapsed = false;
          return false;
        }
      });
    }

    return allCollapsed;
  }

  /**
   * Check if any of the row object parents are collapsed.
   *
   * @private
   * @param {Object} rowObj Row object.
   * @returns {Boolean}
   */
  isAnyParentCollapsed(rowObj) {
    let parent = rowObj;

    while (parent !== null) {
      parent = this.dataManager.getRowParent(parent);
      let parentIndex = this.dataManager.getRowIndex(parent);

      if (this.collapsedRows.indexOf(parentIndex) > -1) {
        return true;
      }
    }

    return false;
  }

  /**
   * Toggle collapsed state. Callback for the `beforeOnCellMousedown` hook.
   *
   * @private
   * @param {MouseEvent} event `mousedown` event
   * @param {Object} coords Coordinates of the clicked cell/header.
   * @param {HTMLElement} TD Clicked cell/header.
   */
  toggleState(event, coords, TD) {
    if (coords.col >= 0) {
      return;
    }

    const row = this.translateTrimmedRow(coords.row);

    if (hasClass(event.target, HeadersUI.CSS_CLASSES.button)) {
      if (this.areChildrenCollapsed(row)) {
        this.expandChildren(row);
      } else {
        this.collapseChildren(row);
      }

      stopImmediatePropagation(event);
    }
  }

  /**
   * Translate physical row after trimming to physical base row index.
   *
   * @private
   * @param {Number} row Row index.
   * @returns {Number} Base row index.
   */
  translateTrimmedRow(row) {
    return this.trimRowsPlugin.rowsMapper.getValueByIndex(row);
  }

  /**
   * Helper function to render the table and call the `adjustElementsSize` method.
   *
   * @private
   */
  renderAndAdjust() {
    this.hot.render();

    // Dirty workaround to prevent scroll height not adjusting to the table height. Needs refactoring in the future.
    this.hot.view.wt.wtOverlays.adjustElementsSize();
  }
}

export {CollapsingUI};
