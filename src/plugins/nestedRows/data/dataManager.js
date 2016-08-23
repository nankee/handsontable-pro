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
     * Nested structure cache.
     *
     * @type {Object}
     */
    this.cache = {
      levels: [],
      levelCount: 0,
      rows: [],
      nodeInfo: new WeakMap()
    };

    this.rowCounter = 0;
  }

  /**
   * Rewrite the nested structure cache.
   *
   * @private
   */
  rewriteCache() {
    this.cache = {
      levels: [],
      levelCount: 0,
      rows: [],
      nodeInfo: new WeakMap()
    };

    rangeEach(0, this.data.length - 1, (i) => {
      this.cacheNode(this.data[i], 0, null);
    });
  }

  /**
   * Cache a data node.
   *
   * @private
   * @param {Object} node Node to cache.
   * @param {Number} level Level of the node.
   * @param {Object} parent Parent of the node.
   */
  cacheNode(node, level, parent) {
    if (!this.cache.levels[level]) {
      this.cache.levels[level] = [];
      this.cache.levelCount++;
    }
    this.cache.levels[level].push(node);
    this.cache.rows.push(node);
    this.cache.nodeInfo.set(node, {
      parent: parent,
      row: this.cache.rows.length - 1,
      level: level
    });

    if (this.hasChildren(node)) {
      arrayEach(node.__children, (elem, i) => {
        this.cacheNode(elem, level + 1, node);
      });
    }
  }

  /**
   * Get the date for the provided visual row number.
   *
   * @param {Number} row Row index.
   */
  getDataObject(row) {
    return row == null ? null : this.cache.rows[row];
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
   * Update the parent reference map.
   *
   * @private
   */
  updateParentReference() {
    this.readTreeNodes({__children: this.data}, 0, this.hot.countRows());
  }

  /**
   * Mock a parent node.
   *
   * @private
   * @returns {*}
   */
  mockParent() {
    let fakeParent = this.mockNode();

    fakeParent.__children = this.data;

    return fakeParent;
  }

  /**
   * Mock a data node.
   *
   * @private
   * @returns {{}}
   */
  mockNode() {
    let fakeNode = {};

    objectEach(this.data[0], (val, key) => {
      fakeNode[key] = null;
    });

    return fakeNode;
  }

  /**
   * Get the row index for the provided row object.
   *
   * @param {Object} rowObj The row object.
   * @returns {Number} Row index.
   */
  getRowIndex(rowObj) {
    return rowObj == null ? null : this.cache.nodeInfo.get(rowObj).row;
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

    return this.cache.nodeInfo.get(rowObject).parent;
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
    return rowObject == null ? null : this.cache.nodeInfo.get(rowObject).level;
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

    return !!(row.__children && row.__children.length);
  }

  isParent(row) {
    if (!isNaN(row)) {
      row = this.getDataObject(row);
    }

    return !!(row.hasOwnProperty('__children'));
  }

  /**
   * Add a child to the provided parent. It's optional to add a row object as the "element"
   *
   * @param {Object} parent The parent row object.
   * @param {Object} [element] The element to add as a child.
   */
  addChild(parent, element) {
    this.hot.runHooks('beforeAddChild', parent, element);
    let functionalParent = parent;

    if (!parent) {
      functionalParent = this.mockParent();
    }
    if (!functionalParent.__children) {
      functionalParent.__children = [];
    }

    if (!element) {
      element = this.mockNode();
    }

    functionalParent.__children.push(element);

    this.rewriteCache();

    const newRowIndex = this.getRowIndex(element);
    this.hot.runHooks('afterCreateRow', newRowIndex, 1);
    this.hot.runHooks('afterAddChild', parent, element);
  }

  /**
   * Add a child node to the provided parent at a specified index.
   *
   * @param {Object} parent Parent node.
   * @param {Number} index Index to insert the child element at.
   * @param {Object} [element] Element (node) to insert.
   */
  addChildAtIndex(parent, index, element) {
    this.hot.runHooks('beforeAddChild', parent, element, index);
    let functionalParent = parent;

    if (!parent) {
      functionalParent = this.mockParent();
    }

    if (!functionalParent.__children) {
      functionalParent.__children = [];
    }

    if (!element) {
      element = this.mockNode();
    }

    functionalParent.__children.splice(index, null, element);

    this.rewriteCache();

    this.hot.runHooks('afterCreateRow', index + 1, 1);
    this.hot.runHooks('afterAddChild', parent, element, index);
  }

  /**
   * Add a sibling element at the specified index.
   *
   * @param {Number} index New element sibling's index.
   * @param {('above'|'below')} where Direction in which the sibling is to be created.
   */
  addSibling(index, where = 'below') {
    const translatedIndex = this.translateTrimmedRow(index);
    const parent = this.getRowParent(translatedIndex);
    const indexWithinParent = this.getRowIndexWithinParent(translatedIndex);

    switch (where) {
      case 'below':
        this.addChildAtIndex(parent, indexWithinParent + 1);
        break;
      case 'above':
        this.addChildAtIndex(parent, indexWithinParent);
        break;
    }
  }

  /**
   * Detach the provided element from its parent and add it right after it.
   *
   * @param {Object|Array} elements Row object or an array of selected coordinates.
   * @param {Boolean} [forceRender=true] If true (default), it triggers render after finished.
   */
  detachFromParent(elements, forceRender = true) {
    let element = null;
    let rowObjects = [];

    if (Array.isArray(elements)) {
      rangeEach(elements[0], elements[2], (i) => {
        let translatedIndex = this.translateTrimmedRow(i);
        rowObjects.push(this.getDataObject(translatedIndex));
      });

      rangeEach(0, rowObjects.length - 2, (i) => {
        this.detachFromParent(rowObjects[i], false);
      });

      element = rowObjects[rowObjects.length - 1];
    } else {
      element = elements;
    }

    const indexWithinParent = this.getRowIndexWithinParent(element);
    const parent = this.getRowParent(element);
    const grandparent = this.getRowParent(parent);

    this.hot.runHooks('beforeDetachChild', parent, element);

    if (indexWithinParent != null) {
      parent.__children.splice(indexWithinParent, 1);

      if (grandparent) {
        grandparent.__children.push(element);
      } else {
        this.data.push(element);
      }
    }

    this.rewriteCache();

    if (forceRender) {
      this.hot.render();
    }

    this.hot.runHooks('afterDetachChild', parent, element);
  }

  /**
   * Filter the data by the `logicRows` array.
   *
   * @private
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

    this.rewriteCache();
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
    index = this.translateTrimmedRow(index);

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
      if (element) {
        newRowParent.__children.splice(indexWithinParent, amount, element);
      } else {
        newRowParent.__children.splice(indexWithinParent, amount);
      }
    } else {
      if (element) {
        this.data.splice(indexWithinParent, amount, element);

      } else {
        this.data.splice(indexWithinParent, amount);
      }
    }

    this.rewriteCache();
  }

  moveRow(fromIndex, toIndex) {
    let targetIsParent = this.isParent(toIndex);
    // let nextToTargetIsParent = this.isParent(toIndex + 1);

    let fromParent = this.getRowParent(fromIndex);
    let indexInFromParent = this.getRowIndexWithinParent(fromIndex);

    // let toParent = targetIsParent ? this.getDataObject(toIndex) : this.getRowParent(toIndex);
    let toParent = this.getRowParent(toIndex);

    if (toParent == null) {
      toParent = this.getRowParent(toIndex - 1);
    }

    if (toParent == null) {
      toParent = this.getDataObject(toIndex - 1);
    }

    if (!toParent) {
      toParent = this.getDataObject(toIndex);
      toParent.__children = [];
    }

    // let indexInToParent = targetIsParent ? 0 : this.getRowIndexWithinParent(toIndex);

    let previousToTargetParent = this.getRowParent(toIndex - 1);
    let indexInToParent = targetIsParent ? this.countChildren(previousToTargetParent) : this.getRowIndexWithinParent(toIndex);

    let elemToMove = fromParent.__children.slice(indexInFromParent, indexInFromParent + 1);

    fromParent.__children.splice(indexInFromParent, 1);
    toParent.__children.splice(indexInToParent, 0, elemToMove[0]);

    // let elemToMove = this.getDataObject(fromIndex);
    // this.spliceData(fromIndex, 1);
    // this.addChildAtIndex(toParent, indexInToParent, elemToMove);
  }

  /**
   * Translate the row index according to the `TrimRows` plugin.
   *
   * @private
   * @param {Number} row Row index.
   * @returns {Number}
   */
  translateTrimmedRow(row) {
    if (this.plugin.collapsingUI) {
      return this.plugin.collapsingUI.translateTrimmedRow(row);
    } else {
      return row;
    }
  }
}

export {DataManager};
