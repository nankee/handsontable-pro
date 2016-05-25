import BasePlugin from 'handsontable/plugins/_base';
import {addClass, removeClass} from 'handsontable/helpers/dom/element';
import {rangeEach} from 'handsontable/helpers/number';
import {arrayEach, arrayFilter} from 'handsontable/helpers/array';
import {registerPlugin, getPlugin} from 'handsontable/plugins';

/**
 * @plugin HiddenRows
 * @pro
 *
 * @description
 * Plugin allowing hiding of certain rows.
 *
 * Possible plugin settings:
 *  * `copyPasteEnabled` as `Boolean` (default `true`)
 *  * `rows` as `Array`
 *  * `indicators` as `Boolean` (default `false`)
 *
 * @example
 *
 * ```js
 * ...
 * var hot = new Handsontable(document.getElementById('example'), {
 *   date: getData(),
 *   hiddenRows: {
 *     copyPasteEnabled: true,
 *     indicators: true,
 *     rows: [1, 2, 5]
 *   }
 * });
 * // Access to hiddenRows plugin instance:
 * var hiddenRowsPlugin = hot.getPlugin('hiddenRows');
 *
 * // Show row programmatically:
 * hiddenRowsPlugin.showRow(1);
 * // Show rows
 * hiddenRowsPlugin.showRow(1, 2, 9);
 * // or
 * hiddenRowsPlugin.showRows([1, 2, 9]);
 * hot.render();
 * ...
 * // Hide row programmatically:
 * hiddenRowsPlugin.hideRow(1);
 * // Hide rows
 * hiddenRowsPlugin.hideRow(1, 2, 9);
 * // or
 * hiddenRowsPlugin.hideRows([1, 2, 9]);
 * hot.render();
 * ...
 * ```
 */
class HiddenRows extends BasePlugin {
  constructor(hotInstance) {
    super(hotInstance);
    /**
     * Cached settings from Handsontable settings.
     *
     * @type {Object}
     */
    this.settings = {};
    /**
     * List of hidden rows indexes.
     *
     * @type {Array}
     */
    this.hiddenRows = [];
    /**
     * Last selected row index.
     *
     * @type {Number}
     * @default -1
     */
    this.lastSelectedRow = -1;
  }

  /**
   * Check if plugin is enabled.
   *
   * @returns {Boolean}
   */
  isEnabled() {
    return !!this.hot.getSettings().hiddenRows;
  }

  /**
   * Enable the plugin.
   */
  enablePlugin() {
    if (this.enabled) {
      return;
    }
    let settings = this.hot.getSettings().hiddenRows;

    if (typeof settings === 'object') {
      this.settings = settings;

      if (settings.copyPasteEnabled === void 0) {
        settings.copyPasteEnabled = true;
      }
      if (Array.isArray(settings.rows)) {
        this.hideRows(settings.rows);
      }
      if (!settings.copyPasteEnabled) {
        this.addHook('modifyCopyableRange', (ranges) => this.onModifyCopyableRange(ranges));
      }
    }
    if (this.hot.hasRowHeaders()) {
      this.addHook('afterGetRowHeader', (row, TH) => this.onAfterGetRowHeader(row, TH));
    } else {
      this.addHook('afterRenderer', (TD, row) => this.onAfterGetRowHeader(row, TD));
    }

    this.addHook('afterContextMenuDefaultOptions', (options) => this.onAfterContextMenuDefaultOptions(options));
    this.addHook('afterGetCellMeta', (row, col, cellProperties) => this.onAfterGetCellMeta(row, col, cellProperties));
    this.addHook('modifyRowHeight', (height, row) => this.onModifyRowHeight(height, row));
    this.addHook('beforeSetRangeEnd', (coords) => this.onBeforeSetRangeEnd(coords));
    this.addHook('hiddenRow', (row) => this.isHidden(row));
    this.addHook('afterRowMove', (start, end) => this.onAfterRowMove(start, end));
    this.addHook('afterCreateRow', (index, amount) => this.onAfterCreateRow(index, amount));
    this.addHook('afterRemoveRow', (index, amount) => this.onAfterRemoveRow(index, amount));

    super.enablePlugin();
  }

  /**
   * Update plugin according to Handsontable settings.
   */
  updatePlugin() {
    this.disablePlugin();
    this.enablePlugin();

    super.updatePlugin();
  }

  /**
   * Disable the plugin.
   */
  disablePlugin() {
    this.settings = {};
    this.hiddenRows = [];
    this.lastSelectedRow = -1;

    super.disablePlugin();
    this.resetCellsMeta();
  }

  /**
   * Show the rows provided in the array.
   *
   * @param {Array} rows Array of row index.
   */
  showRows(rows) {
    arrayEach(rows, (row) => {
      row = parseInt(row, 10);

      if (this.isHidden(row)) {
        this.hiddenRows.splice(this.hiddenRows.indexOf(row), 1);
      }
    });
  }

  /**
   * Show the row provided as row index (counting from 0).
   *
   * @param {Number} row Row index.
   */
  showRow(...row) {
    this.showRows(row);
  }

  /**
   * Hide the rows provided in the array.
   *
   * @param {Array} rows Array of row index.
   */
  hideRows(rows) {
    arrayEach(rows, (row) => {
      row = parseInt(row, 10);

      if (!this.isHidden(row)) {
        this.hiddenRows.push(row);
      }
    });
  }

  /**
   * Hide the row provided as row index (counting from 0).
   *
   * @param {Number} row Row index.
   */
  hideRow(...row) {
    this.hideRows(row);
  }

  /**
   * Check if given row is hidden.
   *
   * @returns {Boolean}
   */
  isHidden(row) {
    return this.hiddenRows.indexOf(row) > -1;
  }

  /**
   * Reset all rendered cells meta.
   *
   * @private
   */
  resetCellsMeta() {
    arrayEach(this.hot.getCellsMeta(), (meta) => {
      if (meta) {
        meta.skipRowOnPaste = false;
      }
    });
  }

  /**
   * Set the copy-related cell meta.
   *
   * @private
   * @param {Number} row Row index.
   * @param {Number} col Column index.
   * @param {Object} cellProperties Cell meta object properties.
   */
  onAfterGetCellMeta(row, col, cellProperties) {
    if (this.settings.copyPasteEnabled === false && this.isHidden(row)) {
      cellProperties.skipRowOnPaste = true;
    } else {
      cellProperties.skipRowOnPaste = false;
    }
  }

  /**
   * Add the needed classes to the headers.
   *
   * @private
   * @param {Number} row Row index.
   * @param {HTMLElement} th Table header element.
   */
  onAfterGetRowHeader(row, th) {
    let tr = th.parentNode;

    if (tr) {
      if (this.isHidden(row)) {
        addClass(tr, 'hide');
      } else {
        removeClass(tr, 'hide');
      }
    }
    if (this.settings.indicators && this.hot.hasRowHeaders()) {
      if (this.isHidden(row - 1)) {
        addClass(th, 'afterHiddenRow');
      }
      if (this.isHidden(row + 1)) {
        addClass(th, 'beforeHiddenRow');
      }
    }
  }

  /**
   * Add the additional row height for the hidden row indicators.
   *
   * @private
   * @param {Number} height Row height.
   * @param {Number} row Row index.
   * @returns {Number}
   */
  onModifyRowHeight(height, row) {
    if (this.isHidden(row)) {
      return 0.1;
    }

    return height;
  }

  /**
   * On modify copyable range listener.
   *
   * @private
   * @param {Array} ranges Array of selected copyable text.
   * @returns {Array} Returns modyfied range.
   */
  onModifyCopyableRange(ranges) {
    let newRanges = [];

    let pushRange = (startRow, endRow, startCol, endCol) => {
      newRanges.push({startRow, endRow, startCol, endCol});
    };

    arrayEach(ranges, (range) => {
      let isHidden = true;
      let rangeStart = 0;

      rangeEach(range.startRow, range.endRow, (row) => {
        if (this.isHidden(row)) {
          if (!isHidden) {
            pushRange(rangeStart, row - 1, range.startCol, range.endCol);
          }
          isHidden = true;
        } else {
          if (isHidden) {
            rangeStart = row;
          }
          if (row === range.endRow) {
            pushRange(rangeStart, row, range.startCol, range.endCol);
          }
          isHidden = false;
        }
      });
    });

    return newRanges;
  }

  /**
   * On before set range end listener.
   *
   * @private
   * @param {Object} coords Object with `row` and `col` properties.
   */
  onBeforeSetRangeEnd(coords) {
    let rowCount = this.hot.countRows();

    let getNextRow = (row) => {
      if (this.isHidden(row)) {
        if (this.lastSelectedRow > row || coords.row === rowCount - 1) {
          row = getNextRow(--row);
        } else {
          row = getNextRow(++row);
        }
      }

      return row;
    };
    coords.row = getNextRow(coords.row);
    this.lastSelectedRow = coords.row;
  }

  /**
   * Add Show-hide columns to context menu.
   *
   * @private
   * @param {Object} options
   */
  onAfterContextMenuDefaultOptions(options) {
    let beforeHiddenRows = [];
    let afterHiddenRows = [];

    options.items.push(
      Handsontable.plugins.ContextMenu.SEPARATOR,
      {
        key: 'hidden_rows_hide',
        name: 'Hide row',
        callback: () => {
          let {from, to} = this.hot.getSelectedRange();
          let start = from.row;
          let end = to.row;

          if (end < start) {
            start = to.row;
            end = from.row;
          }

          rangeEach(start, end, (i) => this.hideRow(i));

          this.hot.render();
          this.hot.view.wt.wtOverlays.adjustElementsSize(true);

          if (start < 1) {
            this.hot.scrollViewportTo(start);

          } else {
            this.hot.scrollViewportTo(start - 1);
          }
        },
        disabled: false,
        hidden: () => {
          return !this.hot.selection.selectedHeader.rows;
        }
      },
      {
        key: 'hidden_rows_show',
        name: 'Show row',
        callback: () => {
          let {from, to} = this.hot.getSelectedRange();
          let start = from.row;
          let end = to.row;

          if (end < start) {
            start = to.row;
            end = from.row;
          }

          if (start === end) {
            if (beforeHiddenRows.length === start) {
              this.showRows(beforeHiddenRows);
              beforeHiddenRows = [];
            }
            if (afterHiddenRows.length === this.hot.countSourceRows() - (start + 1)) {
              this.showRows(afterHiddenRows);
              afterHiddenRows = [];
            }

          } else {
            rangeEach(start, end, (i) => this.showRow(i));
          }

          this.hot.render();
        },
        disabled: false,
        hidden: () => {
          if (!this.hiddenRows.length) {
            return true;
          }

          if (!this.hot.selection.selectedHeader.rows) {
            return true;
          }

          beforeHiddenRows = [];
          afterHiddenRows = [];

          let {from, to} = this.hot.getSelectedRange();
          let start = from.row;
          let end = to.row;

          let hiddenInSelection = false;

          if (start === end) {
            let totalRowsLength = this.hot.countSourceRows();

            rangeEach(0, totalRowsLength, (i) => {
              let partedHiddenLength = beforeHiddenRows.length + afterHiddenRows.length;

              if (partedHiddenLength === this.hiddenRows.length) {
                return false;
              }

              if (i < start) {
                if (this.hiddenRows.indexOf(i) > -1) {
                  beforeHiddenRows.push(i);
                }
              } else {
                if (this.hiddenRows.indexOf(i) > -1) {
                  afterHiddenRows.push(i);
                }
              }
            });

            totalRowsLength = totalRowsLength - 1;

            if ((beforeHiddenRows.length === start && start > 0) ||
              (afterHiddenRows.length === totalRowsLength - start && start < totalRowsLength)) {
              hiddenInSelection = true;
            }

          } else {
            if (end < start) {
              start = to.row;
              end = from.row;
            }

            rangeEach(start, end, (i) => {
              if (this.isHidden(i)) {
                hiddenInSelection = true;

                return false;
              }
            });
          }

          return !hiddenInSelection;
        }
      }
    );
  }

  /**
   * On row move listener. Recalculate hidden index on change
   *
   * @private
   * @param {Number} start
   * @param {Number} end
   */
  onAfterRowMove(start, end) {
    let tempHidden = [];

    arrayEach(this.hiddenRows, (col) => {
      if (end > start) {
        if (col > start && col < end) {
          col--;
        }
      } else {
        if (col < start && col > end) {
          col++;
        }
      }

      tempHidden.push(col);
    });

    this.hiddenRows = tempHidden;

    this.hot.render();
  }

  /**
   * Recalculate index of hidden rows after add row action
   *
   * @param {Number} index
   * @param {Number} amount
   */
  onAfterCreateRow(index, amount) {
    let tempHidden = [];

    arrayEach(this.hiddenRows, (col) => {
      if (col >= index) {
        col += amount;
      }
      tempHidden.push(col);
    });
    this.hiddenRows = tempHidden;
  }

  /**
   * Recalculate index of hidden rows after remove row action
   *
   * @param {Number} index
   * @param {Number} amount
   */
  onAfterRemoveRow(index, amount) {
    let tempHidden = [];

    arrayEach(this.hiddenRows, (col) => {
      if (col >= index) {
        col -= amount;
      }
      tempHidden.push(col);
    });
    this.hiddenRows = tempHidden;
  }

  /**
   * Destroy the plugin.
   */
  destroy() {
    super.destroy();
  }
}

export {HiddenRows};

registerPlugin('hiddenRows', HiddenRows);
