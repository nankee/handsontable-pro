import {rangeEach} from 'handsontable/helpers/number';
import {objectEach} from 'handsontable/helpers/object';
import {arrayEach} from 'handsontable/helpers/array';

/**
 * Class responsible for making data operations.
 *
 * @class
 * @private
 */
class DataManager {
  constructor(nestedRowsPlugin, hotInstance, sourceData) {
    /**
     * Main Handsontable instance reference.
     *
     * @type {Object}
     */
    this.hot = hotInstance;
    /**
     * Reference to the source data object.
     *
     * @type {Object}
     */
    this.data = sourceData;
    /**
     * Reference to the NestedRows plugin.
     *
     * @type {Object}
     */
    this.plugin = nestedRowsPlugin;
    /**
     * Map of row object parents.
     *
     * @type {WeakMap}
     */
    this.parentReference = new WeakMap();
    /**
     * Array containing the level number for each row.
     *
     * @type {Array|null}
     */
    this.levelCache = null;
  }

  /**
   * Get the date for the provided visual row number.
   *
   * @param {Number} row Row index.
   */
  getDataObject(row) {
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
        __children: this.data
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
      rowObj = this.getDataObject(row);
    }

    let parent = this.getRowParent(row);

    if (parent == null) {
      return this.data.indexOf(rowObj);

    } else {
      return parent.__children.indexOf(rowObj);
    }
  }

  /**
   * Count all rows (including all parents and children).
   */
  countAllRows() {
    let rootNodeMock = {
      __children: this.data
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
      parent = this.getDataObject(parent);
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
      rowObject = this.getDataObject(row);
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
      rowObject = this.getDataObject(row);
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
   * Check if the provided row/row element has children.
   *
   * @param {Number|Object} row Row number or row element.
   * @returns {Boolean}
   */
  hasChildren(row) {
    if (!isNaN(row)) {
      row = this.getDataObject(row);
    }

    return (row.__children && row.__children.length);
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

    this.refreshLevelCache();
    this.hot.render();

    this.hot.runHooks('afterAddChild', parent, element);
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
        this.data.push(element);
      }
    }

    this.refreshLevelCache();
    this.hot.render();

    this.hot.runHooks('afterDetachChild', parent, element);
  }

  /**
   * Filter the data by the `logicRows` array.
   *
   * @param {Number} index Index of the first row to remove.
   * @param {Number} amount Number of elements to remove.
   * @param {Array} logicRows Array of indexes to remove.
   */
  filterData(index, amount, logicRows) {
    const elementsToRemove = [];

    arrayEach(logicRows, (elem, ind) => {
      elementsToRemove.push(this.getDataObject(elem));
    });

    arrayEach(elementsToRemove, (elem, ind) => {
      const indexWithinParent = this.getRowIndexWithinParent(elem);
      const tempParent = this.getRowParent(elem);

      if (tempParent === null) {
        this.data.splice(indexWithinParent, 1);
      } else {
        tempParent.__children.splice(indexWithinParent, 1);
      }
    });
  }

  /**
   * Used to splice the source data. Needed to properly modify the nested structure, which wouldn't work with the default script.
   *
   * @private
   * @param {Number} index Index of the element at the splice beginning.
   * @param {Number} amount Number of elements to be removed.
   * @param {Object} element Row to add.
   */
  spliceData(index, amount, element) {
    let previousElement = this.getDataObject(index - 1);
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
      this.data.splice(indexWithinParent, amount, element);
    }
  }

  /**
   * Refresh the nesting level depth cache.
   *
   * @private
   */
  refreshLevelCache() {
    this.levelCache = [];

    rangeEach(0, this.countAllRows(), (i) => {
      this.levelCache[i] = this.getRowLevel(i);
    });
  }
}

export {DataManager};
