import BasePlugin from 'handsontable/plugins/_base';
import {addClass, removeClass} from 'handsontable/helpers/dom/element';
import {rangeEach} from 'handsontable/helpers/number';
import {arrayEach} from 'handsontable/helpers/array';
import {registerPlugin, getPlugin} from 'handsontable/plugins';

/**
 * Plugin allowing hiding of certain columns.
 *
 * @plugin HiddenColumns
 * @pro
 */
class HiddenColumns extends BasePlugin {
  constructor(hotInstance) {
    super(hotInstance);
    /**
     * Cached plugin settings.
     *
     * @type {null|Object}
     */
    this.settings = {};
    /**
     * List of currently hidden columns
     *
     * @type {Boolean|Object}
     */
    this.hiddenColumns = [];
    /**
     * Last selected column index.
     *
     * @type {Number}
     * @default -1
     */
    this.lastSelectedColumn = -1;
  }

  /**
   * Check if plugin is enabled.
   *
   * @returns {Boolean}
   */
  isEnabled() {
    return !!this.hot.getSettings().hiddenColumns;
  }

  /**
   * Enable the plugin.
   */
  enablePlugin() {
    if (this.enabled) {
      return;
    }
    let settings = this.hot.getSettings().hiddenColumns;

    if (typeof settings === 'object') {
      this.settings = settings;

      if (settings.copyPasteEnabled === void 0) {
        settings.copyPasteEnabled = true;
      }
      if (Array.isArray(settings.columns)) {
        this.hideColumns(settings.columns);
      }
      if (!settings.copyPasteEnabled) {
        this.addHook('modifyCopyableRange', (ranges) => this.onModifyCopyableRange(ranges));
      }
    }
    this.addHook('afterContextMenuDefaultOptions', (options) => this.addToContextMenu(options));
    this.addHook('afterGetCellMeta', (row, col, cellProperties) => this.onAfterGetCellMeta(row, col, cellProperties));
    this.addHook('modifyColWidth', (width, col) => this.onModifyColWidth(width, col));
    this.addHook('afterGetColHeader', (col, TH) => this.onAfterGetColHeader(col, TH));
    this.addHook('beforeSetRangeEnd', (coords) => this.onBeforeSetRangeEnd(coords));
    this.addHook('hiddenColumn', (column) => this.isHidden(column));
    this.addHook('beforeStretchingColumnWidth', (width, column) => this.onBeforeStrethingColumnWidth(width, column));

    this.addHook('afterCreateCol', (index, amount) => this.recalculateHiddenColumns(index, amount, true));
    this.addHook('afterRemoveCol', (index, amount) => this.recalculateHiddenColumns(index, amount));

    super.enablePlugin();
  }

  /**
   *
   * @param {Number} index
   * @param {Number} amount
   * @param {Boolean} newcolumns True if add columns, otherwise false.
   */
  recalculateHiddenColumns(index, amount, newcolumns = false) {
    let tempHidden = [];

    arrayEach(this.hiddenColumns, (col) => {
      if (col >= index) {
        if (newcolumns) {
          col += amount;
        } else {
          col -= amount;
        }
      }
      tempHidden.push(col);
    });
    this.hiddenColumns = tempHidden;
  }

  /**
   * Set width hidden columns on 0
   *
   * @param {Number} width Column width.
   * @param {Number} column Column index.
   * @returns {Number}
   */
  onBeforeStrethingColumnWidth(width, column) {
    if (this.hiddenColumns.indexOf(column) > -1) {
      width = 0;
    }
    return width;
  }
  /**
   * Called after updating the plugin settings.
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
    this.hiddenColumns = [];
    this.lastSelectedColumn = -1;

    super.disablePlugin();
    this.resetCellsMeta();
  }

  /**
   * Hide the columns provided in the array.
   *
   * @param {Array} columns Array of column indexes.
   */
  hideColumns(columns) {
    arrayEach(columns, (col) => {
      col = parseInt(col, 10);

      if (!this.isHidden(col)) {
        this.hiddenColumns.push(col);
      }
    });

  }

  /**
   * Hide a single column.
   *
   * @param {Number} column Column index.
   */
  hideColumn(...column) {
    this.hideColumns(column);
  }

  /**
   * Show the provided columns.
   *
   * @param {Array} columns Array of column indexes.
   */
  showColumns(columns) {
    arrayEach(columns, (col) => {
      col = parseInt(col, 10);

      if (this.isHidden(col)) {
        this.hiddenColumns.splice(this.hiddenColumns.indexOf(col), 1);
      }
    });
  }

  /**
   * Show a single column.
   *
   * @param {Number} column Column index.
   */
  showColumn(...column) {
    this.showColumns(column);
  }

  /**
   * Check if the provided column is hidden.
   *
   * @param {Number} column Column index.
   * @returns {Boolean}
   */
  isHidden(column) {
    return this.hiddenColumns.indexOf(column) > -1;
  }

  /**
   * Reset all rendered cells meta.
   *
   * @private
   */
  resetCellsMeta() {
    arrayEach(this.hot.getCellsMeta(), (meta) => {
      if (meta) {
        meta.skipColumnOnPaste = false;

        if (meta.baseRenderer !== null) {
          meta.renderer = meta.baseRenderer;
          meta.baseRenderer = null;
        }
      }
    });
  }

  /**
   * Get the logical index of the provided column.
   *
   * @param {Number} column
   * @returns {Number}
   */
  getLogicalColumnIndex(column) {
    return this.hot.runHooks('modifyCol', column);
  }

  /**
   * Add the additional column width for the hidden column indicators.
   *
   * @private
   * @param {Number} width
   * @param {Number} col
   * @returns {Number}
   */
  onModifyColWidth(width, col) {
    if (this.isHidden(this.getLogicalColumnIndex(col))) {
      return 0.1;

    } else if (this.settings.indicators && (this.isHidden(this.getLogicalColumnIndex(col + 1)) ||
               this.isHidden(this.getLogicalColumnIndex(col - 1)))) {

      // add additional space for hidden column indicator
      return width + (this.hot.hasColHeaders() ? 15 : 0);
    }
  }

  /**
   * Set the copy-related cell meta.
   *
   * @private
   * @param {Number} row
   * @param {Number} col
   * @param {Object} cellProperties
   */
  onAfterGetCellMeta(row, col, cellProperties) {
    if (this.settings.copyPasteEnabled === false && this.isHidden(col)) {
      cellProperties.skipColumnOnPaste = true;
    }

    if (this.isHidden(col)) {
      if (cellProperties.renderer !== hiddenRenderer) {
        cellProperties.baseRenderer = cellProperties.renderer;
      }

    } else {
      // We must pass undefined value too (for the purposes of inheritance cell/column settings).
      if (cellProperties.baseRenderer !== null) {
        cellProperties.renderer = cellProperties.baseRenderer;
        cellProperties.baseRenderer = null;
      }

    }

    if (this.isHidden(col - 1)) {
      let firstSectionHidden = true;
      let i = col - 1;

      cellProperties.className = cellProperties.className || ' afterHiddenColumn';

      do {
        if (!this.isHidden(i)) {
          firstSectionHidden = false;
          break;
        }
        i--;
      } while (i >= 0);

      if (firstSectionHidden && cellProperties.className.indexOf('firstVisible') === -1) {
        cellProperties.className += ' firstVisible';
      }
    } else {
      if (cellProperties.className) {
        let classArr = cellProperties.className.split(' ');
        if (classArr.length) {
          let containAfterHiddenColumn = classArr.indexOf('afterHiddenCsolumn');
          let containFirstVisible = classArr.indexOf('firstVisible');

          if (containAfterHiddenColumn > -1) {
            classArr.splice(containAfterHiddenColumn, 1);
          }
          if (containFirstVisible > -1) {
            classArr.splice(containFirstVisible, 1);
          }

          cellProperties.className = classArr.join(' ');
        }
      }
    }
  }

  /**
   * Modify the copyable range, accordingly to the provided config.
   *
   * @private
   * @param {Array} ranges
   * @returns {Array}
   */
  onModifyCopyableRange(ranges) {
    let newRanges = [];

    let pushRange = (startRow, endRow, startCol, endCol) => {
      newRanges.push({startRow, endRow, startCol, endCol});
    };

    arrayEach(ranges, (range) => {
      let isHidden = true;
      let rangeStart = 0;

      rangeEach(range.startCol, range.endCol, (col) => {
        if (this.isHidden(col)) {
          if (!isHidden) {
            pushRange(range.startRow, range.endRow, rangeStart, col - 1);
          }

          isHidden = true;

        } else {
          if (isHidden) {
            rangeStart = col;
          }

          if (col === range.endCol) {
            pushRange(range.startRow, range.endRow, rangeStart, col);
          }

          isHidden = false;
        }
      });
    });

    return newRanges;
  }

  /**
   * Add the needed classes to the headers.
   *
   * @private
   * @param {Number} col
   * @param {HTMLElement} TH
   */
  onAfterGetColHeader(col, TH) {
    if (!this.settings.indicators || this.isHidden(this.getLogicalColumnIndex(col))) {
      return;
    }

    if (this.isHidden(this.getLogicalColumnIndex(col - 1))) {
      addClass(TH, 'afterHiddenColumn');
    }

    if (this.isHidden(this.getLogicalColumnIndex(col + 1)) && col > -1) {
      addClass(TH, 'beforeHiddenColumn');
    }
  }

  /**
   * On before set range end listener.
   *
   * @private
   * @param {Object} coords Object with `row` and `col` properties.
   */
  onBeforeSetRangeEnd(coords) {
    if (this.hot.selection.selectedHeader.cols) {
      return;
    }

    let columnCount = this.hot.countCols();

    let getNextColumn = (col) => {
      let logicalCol = this.getLogicalColumnIndex(col);

      if (this.isHidden(logicalCol)) {
        if (this.lastSelectedColumn > col || coords.col === columnCount - 1) {
          col = getNextColumn(--col);
        } else {
          col = getNextColumn(++col);
        }
      }

      return col;
    };

    coords.col = getNextColumn(coords.col);
    this.lastSelectedColumn = coords.col;
  }

  /**
   * Add Show-hide columns to context menu.
   *
   * @private
   * @param {Object} options
   */
  addToContextMenu(options) {
    let beforeHiddenColumns = [];
    let afterHiddenColumns = [];

    options.items.push(
      Handsontable.plugins.ContextMenu.SEPARATOR,
      {
        key: 'hiddenColumnsHide',
        name: 'Hide column',
        callback: () => {
          let {from, to} = this.hot.getSelectedRange();
          let start = from.col;
          let end = to.col;

          if (end < start) {
            start = to.col;
            end = from.col;
          }

          rangeEach(start, end, (i) => this.hideColumn(i));

          this.hot.render();
          this.hot.view.wt.wtOverlays.adjustElementsSize(true);

          if (start < 1) {
            this.hot.scrollViewportTo(undefined, start);

          } else {
            this.hot.scrollViewportTo(undefined, start - 1);
          }
        },
        disabled: false,
        hidden: () => {
          return !this.hot.selection.selectedHeader.cols;
        }
      },
      {
        key: 'hiddenColumnsShow',
        name: 'Show column',
        callback: () => {
          let {from, to} = this.hot.getSelectedRange();
          let start = from.col;
          let end = to.col;

          if (end < start) {
            start = to.col;
            end = from.col;
          }

          if (start === end) {
            if (beforeHiddenColumns.length === start) {
              this.showColumns(beforeHiddenColumns);
              beforeHiddenColumns = [];
            }
            if (afterHiddenColumns.length === this.hot.countCols() - (start + 1)) {
              this.showColumns(afterHiddenColumns);
              afterHiddenColumns = [];
            }

          } else {
            rangeEach(start, end, (i) => this.showColumn(i));
          }

          this.hot.render();
        },
        disabled: false,
        hidden: () => {
          if (this.hot.selection.selectedHeader.cols) {
            let {from, to} = this.hot.getSelectedRange();
            let start = from.col;
            let end = to.col;

            let hiddenInSelection = false;

            if (start === end) {
              let sortedHiddenColumns = this.hiddenColumns.slice(0);

              sortedHiddenColumns.sort((a, b) => { return a - b; });

              arrayEach(sortedHiddenColumns, (value, index) => {
                if (value > start) {
                  beforeHiddenColumns = sortedHiddenColumns.slice(0, index);
                  afterHiddenColumns = sortedHiddenColumns.slice(index);

                  return false;
                }
              });

              if (!beforeHiddenColumns.length && !afterHiddenColumns.length) {
                beforeHiddenColumns = sortedHiddenColumns;
              }

              if (beforeHiddenColumns.length === start ||
                afterHiddenColumns.length === this.hot.countCols() - (start + 1)) {
                hiddenInSelection = true;
              }

            } else {
              if (end < start) {
                start = to.col;
                end = from.col;
              }

              rangeEach(start, end, (i) => {
                if (this.isHidden(i)) {
                  hiddenInSelection = true;
                }
              });
            }

            return !hiddenInSelection;
          }

          return true;
        }
      }
    );
  }

  /**
   * Destroy the plugin.
   */
  destroy() {
    super.destroy();
  }

}

function hiddenRenderer(hotInstance, td) {
  td.textContent = '';
  addClass(td, 'ht-hidden');
}

export {HiddenColumns};

registerPlugin('hiddenColumns', HiddenColumns);
