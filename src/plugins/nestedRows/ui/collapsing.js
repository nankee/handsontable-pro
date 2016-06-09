import {BaseUI} from './_base';
import {stopImmediatePropagation} from 'handsontable/helpers/dom/event';
import {arrayEach} from 'handsontable/helpers/array';
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
  }

  /**
   * Hide the children of the row passed as an argument.
   *
   * @param {Number|Object} row The parent row.
   */
  hideChildren(row) {
    let rowObject = null;

    if (isNaN(row)) {
      rowObject = row;
    } else {
      rowObject = this.dataManager.getDataObject(row);
    }

    if (this.dataManager.hasChildren(rowObject)) {
      arrayEach(rowObject.__children, (elem, i) => {
        this.hideNode(elem);
      });
    }

    this.hot.render();
  }

  /**
   * Hide a row node and its children.
   *
   * @private
   * @param {Object} rowObj Row object.
   */
  hideNode(rowObj) {
    const rowIndex = this.dataManager.getRowIndex(rowObj);

    this.trimRowsPlugin.trimRow(rowIndex);

    if (this.dataManager.hasChildren(rowObj)) {
      arrayEach(rowObj.__children, (elem, i) => {
        this.hideNode(elem);
      });
    }
  }

  /**
   * Show the children of the row passed as an argument.
   *
   * @param {Number|Object} row Parent row.
   */
  showChildren(row) {
    let rowObject = null;

    if (isNaN(row)) {
      rowObject = row;
    } else {
      rowObject = this.dataManager.getDataObject(row);
    }

    if (this.dataManager.hasChildren(rowObject)) {
      arrayEach(rowObject.__children, (elem, i) => {
        this.showNode(elem);
      });
    }

    this.hot.render();
  }

  /**
   * Show a row node and its children.
   *
   * @private
   * @param {Object} rowObj Row object.
   */
  showNode(rowObj) {
    const rowIndex = this.dataManager.getRowIndex(rowObj);

    this.trimRowsPlugin.untrimRow(rowIndex);

    if (this.dataManager.hasChildren(rowObj)) {
      arrayEach(rowObj.__children, (elem, i) => {
        this.showNode(elem);
      });
    }
  }

  /**
   * Check if all child rows are hidden.
   *
   * @param {Number|Object} row The parent row.
   * @private
   */
  areChildrenHidden(row) {
    let rowObj = null;
    let allHidden = true;

    if (isNaN(row)) {
      rowObj = row;
    } else {
      rowObj = this.dataManager.getDataObject(row);
    }

    if (this.dataManager.hasChildren(rowObj)) {
      arrayEach(rowObj.__children, (elem, i) => {
        let rowIndex = this.dataManager.getRowIndex(elem);

        if (!this.trimRowsPlugin.isTrimmed(rowIndex)) {
          allHidden = false;
          return false;
        }
      });
    }

    return allHidden;
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

    if (hasClass(event.target, HeadersUI.CSS_CLASSES.button)) {
      if (this.areChildrenHidden(coords.row)) {
        this.showChildren(coords.row);
      } else {
        this.hideChildren(coords.row);
      }

      stopImmediatePropagation(event);
    }
  }
}

export {CollapsingUI};
