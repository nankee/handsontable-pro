import BasePlugin from 'handsontable/plugins/_base';
import {registerPlugin} from 'handsontable/plugins';
import {rangeEach} from 'handsontable/helpers/number';
import {objectEach} from 'handsontable/helpers/object';
import {arrayEach} from 'handsontable/helpers/array';
import {
  addClass,
  hasClass,
  fastInnerHTML,
  closest
} from 'handsontable/helpers/dom/element';
import {EventManager} from 'handsontable/eventManager';
import {stopImmediatePropagation} from 'handsontable/helpers/dom/event';

/**
 * @plugin NestedRows
 *
 *
 * @description
 * Blank plugin template. It needs to inherit from the BasePlugin class.
 * @dependencies HiddenRows
 */
class NestedRows extends BasePlugin {

  constructor(hotInstance) {

    /**
     * Source data object.
     *
     * @type {Object}
     */
    this.sourceData = null;
    /**
     * Map of row object parents.
     *
     * @type {WeakMap}
     */
    this.parentReference = null;
    /**
     * Reference to the Hidden Rows plugin.
     *
     * @type {Object}
     */
    this.hiddenRowsPlugin = null;

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
    this.hiddenRowsPlugin = this.hot.getPlugin('hiddenRows');

    if (!this.hiddenRowsPlugin.isEnabled()) {
      this.hiddenRowsPlugin.enablePlugin();
    }

    this.addHook('modifyRowData', (row) => this.onModifyRowData(row));
    this.addHook('modifySourceLength', () => this.onModifySourceLength());
    this.addHook('beforeDataSplice', (index, amount, element) => this.onBeforeDataSplice(index, amount, element));
    this.addHook('afterContextMenuDefaultOptions', (defaultOptions) => this.onAfterContextMenuDefaultOptions(defaultOptions));
    this.addHook('afterGetRowHeader', (row, th) => this.onAfterGetRowHeader(row, th));
    this.addHook('beforeOnCellMouseDown', (row, th) => this.onBeforeOnCellMouseDown(row, th));

    //testing
    // this.addHook('afterRenderer', (td, row, col, prop, value, cellProperties) => this.onAfterRenderer(td, row, col, prop, value, cellProperties));

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
  getVisualRowObject(row) {
    let rowObjData = this.readTreeNodes(null, 0, row, null);
    return rowObjData ? rowObjData.result : null;
  }

  /**
   * Read the row tree in search for a specific row index or row object.
   *
   * @private
   * @param {Object} parent The initial parent object.
   * @param {Number} readCount Number of read nodes.
   * @param {Number} neededIndex The row index we search for.
   * @param {Object} neededObject The row object we search for.
   * @returns {Number|Object}
   */
  readTreeNodes(parent, readCount, neededIndex, neededObject) {
    let rootLevel = false;

    if (isNaN(readCount) && readCount.end) {
      return readCount;
    }

    if (!parent) {
      parent = {
        __children: this.sourceData
      };
      rootLevel = true;
      readCount--;
    }

    if (neededIndex != null && readCount === neededIndex) {
      return {result: parent, end: true};
    }

    if (neededObject != null && parent === neededObject) {
      return {result: readCount, end: true};
    }

    readCount++;

    if (parent.__children) {
      arrayEach(parent.__children, (val, i) => {

        this.parentReference.set(val, rootLevel ? null : parent);

        readCount = this.readTreeNodes(val, readCount, neededIndex, neededObject);

        if (isNaN(readCount) && readCount.end) {
          return false;
        }
      });
    }

    return readCount;
  }

  /**
   * Get the row index for the provided row object.
   *
   * @param {Object} rowObj The row object.
   * @returns {Number} Row index.
   */
  getRowIndex(rowObj) {
    return this.readTreeNodes(null, 0, null, rowObj).result;
  }

  /**
   * Get the index of the provided row index/row object within its parent.
   *
   * @param {Number|Object} row Row index / row object.
   * @returns {Number}
   */
  getRowIndexWithinParent(row) {
    let rowObj = null;

    if (isNaN(row)) {
      rowObj = row;
    } else {
      rowObj = this.getVisualRowObject(row);
    }

    let parent = this.getRowParent(row);

    if (parent == null) {
      return this.sourceData.indexOf(rowObj);

    } else {
      return parent.__children.indexOf(rowObj);
    }
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
   * @param {Object|Number} parent Parent node.
   * @returns {Number} Children count.
   */
  countChildren(parent) {
    let rowCount = 0;

    if (!isNaN(parent)) {
      parent = this.getVisualRowObject(parent);
    }

    if (!parent || !parent.__children) {
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
   * @param {Number|Object} row Row index.
   */
  getRowParent(row) {
    let rowObject;

    if (isNaN(row)) {
      rowObject = row;
    } else {
      rowObject = this.getVisualRowObject(row);
    }

    return this.getRowObjectParent(rowObject);
  }

  /**
   * Get the parent of the provided row object.
   *
   * @private
   * @param {Object} rowObject The row object (tree node).
   */
  getRowObjectParent(rowObject) {
    if (typeof rowObject !== 'object') {
      return null;
    }

    return this.parentReference.get(rowObject);
  }

  /**
   * Get the nesting level for the row with the provided row index.
   *
   * @param {Number} row Row index.
   * @returns {Number|null} Row level or null, when row doesn't exist.
   */
  getRowLevel(row) {
    let rowObject = null;

    if (isNaN(row)) {
      rowObject = row;
    } else {
      rowObject = this.getVisualRowObject(row);
    }

    return rowObject ? this.getRowObjectLevel(rowObject) : null;
  }

  /**
   * Get the nesting level for the row with the provided row index.
   *
   * @private
   * @param {Object} rowObject Row object.
   * @returns {Number} Row level.
   */
  getRowObjectLevel(rowObject) {
    let parentNode = this.getRowObjectParent(rowObject);
    let levelCount = 0;
    if (parentNode === null) {
      return 0;
    }

    while (parentNode != null) {
      parentNode = this.getRowObjectParent(parentNode);
      levelCount++;
    }

    return levelCount;
  }

  /**
   * Add a child to the provided parent. It's optional to add a row object as the "element"
   *
   * @param {Object} parent The parent row object.
   * @param {Object} [element] The element to add as a child.
   */
  addChild(parent, element) {
    if (!parent.__children) {
      parent.__children = [];
    }

    if (!element) {
      element = {};
      objectEach(parent, (val, prop) => {
        element[prop] = null;
      });

    }

    parent.__children.push(element);

    this.hot.render();
  }

  /**
   * Detach the provided element from its parent and add it right after it.
   *
   * @param {Object} element Row object.
   */
  detachFromParent(element) {
    const indexWithinParent = this.getRowIndexWithinParent(element);
    const parent = this.getRowParent(element);
    const grandparent = this.getRowParent(parent);

    if (indexWithinParent != null) {
      parent.__children.splice(indexWithinParent, 1);

      if (grandparent) {
        grandparent.__children.push(element);
      } else {
        this.sourceData.push(element);
      }
    }

    this.hot.render();
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
      rowObject = this.getVisualRowObject(row);
    }

    if (rowObject.__children && rowObject.__children.length) {
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
    const rowIndex = this.getRowIndex(rowObj);

    this.hiddenRowsPlugin.hideRow(rowIndex);

    if (rowObj.__children && rowObj.__children.length) {
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
      rowObject = this.getVisualRowObject(row);
    }

    if (rowObject.__children && rowObject.__children.length) {
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
    const rowIndex = this.getRowIndex(rowObj);

    this.hiddenRowsPlugin.showRow(rowIndex);

    if (rowObj.__children && rowObj.__children.length) {
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
      rowObj = this.getVisualRowObject(row);
    }

    if (rowObj.__children && rowObj.__children.length) {
      arrayEach(rowObj.__children, (elem, i) => {
        let rowIndex = this.getRowIndex(elem);

        if (!this.hiddenRowsPlugin.isHidden(rowIndex)) {
          allHidden = false;
          return false;
        }
      });
    }

    return allHidden;
  }

  /**
   * beforeOnCellMousedown callback
   *
   * @private
   * @param {MouseEvent} event Mousedown event
   * @param {Object} coords Cell coords
   * @param {HTMLElement} TD clicked cell
   */
  onBeforeOnCellMouseDown(event, coords, TD) {
    if (coords.col >= 0) {
      return;
    }

    if (hasClass(event.target, 'ht_nestedRowsButtons')) {
      if (this.areChildrenHidden(coords.row)) {
        this.showChildren(coords.row);
      } else {
        this.hideChildren(coords.row);
      }

      stopImmediatePropagation(event);
    }
  }

  /**
   * The modifyRowData hook callback.
   *
   * @private
   * @param {Number} row Visual row index.
   */
  onModifyRowData(row) {
    return this.getVisualRowObject(row);
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

  /**
   * @private
   * @param index
   * @param amount
   * @param element
   * @returns {boolean}
   */
  onBeforeDataSplice(index, amount, element) {
    let previousElement = this.getVisualRowObject(index - 1);
    let newRowParent = null;
    let indexWithinParent = null;

    if (previousElement && previousElement.__children && previousElement.__children.length === 0) {
      newRowParent = previousElement;
      indexWithinParent = 0;

    } else {
      newRowParent = this.getRowParent(index);
      indexWithinParent = this.getRowIndexWithinParent(index);
    }

    if (newRowParent) {
      newRowParent.__children.splice(indexWithinParent, amount, element);
    } else {
      this.sourceData.splice(indexWithinParent, amount, element);
    }

    return false;
  }

  /**
   * @private
   * @param defaultOptions
   */
  onAfterContextMenuDefaultOptions(defaultOptions) {
    const newEntries = [
      Handsontable.plugins.ContextMenu.SEPARATOR,
      {
        key: 'add_child',
        name: () => {
          return 'Insert child row';
        },
        callback: () => {
          let parent = this.getVisualRowObject(this.hot.getSelected()[0]);
          this.addChild(parent);
        }
      },
      {
        key: 'detach_from_parent',
        name: () => {
          return 'Detach from parent.';
        },
        callback: () => {
          let parent = this.getVisualRowObject(this.hot.getSelected()[0]);
          this.detachFromParent(parent);
        },
        disabled: () => {
          let parent = this.getRowParent(this.hot.getSelected()[0]);
          return !parent;
        }
      }
    ];

    rangeEach(0, defaultOptions.items.length - 1, (i) => {
      if (defaultOptions.items[i].name === Handsontable.plugins.ContextMenu.SEPARATOR.name && (i > 0 && defaultOptions.items[i - 1].key === 'row_below')) {

        arrayEach(newEntries, (val, j) => {
          defaultOptions.items.splice(i + j, 0, val);
        });

        return false;
      }
    });

    return defaultOptions;
  }

  /**
   * afterGetRowHeader callback.
   *
   * @private
   * @param {Number} row Row index.
   * @param {HTMLElement} TH row header element.
   */
  onAfterGetRowHeader(row, TH) {
    let rowLevel = this.getRowLevel(row);
    let rowObject = this.getVisualRowObject(row);
    let innerDiv = TH.getElementsByTagName('DIV')[0];
    let previousIndicators = innerDiv.querySelector('.ht_levelIndicators');
    let previousButtons = innerDiv.querySelector('.ht_nestedRowsButtons');

    if (previousIndicators) {
      innerDiv.removeChild(previousIndicators);
    }

    if (previousButtons) {
      innerDiv.removeChild(previousButtons);
    }

    addClass(TH, 'ht_levelIndicators');

    if (rowLevel) {
      let indicatorsContainer = document.createElement('DIV');
      addClass(indicatorsContainer, 'ht_levelIndicators');

      rangeEach(0, rowLevel - 1, (i) => {
        let levelIndicator = document.createElement('SPAN');
        addClass(levelIndicator, 'ht_levelIndicator');
        fastInnerHTML(levelIndicator, '&#9488;');

        indicatorsContainer.appendChild(levelIndicator);
      });

      innerDiv.appendChild(indicatorsContainer);
    }

    if (rowObject.__children && rowObject.__children.length > 0) {
      let buttonsContainer = document.createElement('DIV');
      addClass(buttonsContainer, 'ht_nestedRowsButtons');

      if (this.areChildrenHidden(row)) {
        fastInnerHTML(buttonsContainer, '+');

      } else {
        fastInnerHTML(buttonsContainer, '-');
      }

      innerDiv.appendChild(buttonsContainer);
    }
  }

  // testing
  onAfterRenderer(td, row, col, prop, value, cellProperties) {
    let rowLevel = this.getRowLevel(row);

    if (rowLevel) {
      td.style.paddingLeft = parseInt(15 * rowLevel, 10) + 'px';
    }
  }
}

export {NestedRows};

registerPlugin('nestedRows', NestedRows);
