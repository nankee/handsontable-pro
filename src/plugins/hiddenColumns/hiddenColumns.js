import BasePlugin from 'handsontable/plugins/_base';
import {addClass} from 'handsontable/helpers/dom/element';
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
    this.addHook('afterGetCellMeta', (row, col, cellProperties) => this.onAfterGetCellMeta(row, col, cellProperties));
    this.addHook('modifyColWidth', (width, col) => this.onModifyColWidth(width, col));
    this.addHook('afterGetColHeader', (col, TH) => this.onAfterGetColHeader(col, TH));
    this.addHook('beforeSetRangeEnd', (coords) => this.onBeforeSetRangeEnd(coords));
    this.addHook('hiddenColumn', (column) => this.isHidden(column));

    super.enablePlugin();
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
   * @param {Number} col
   * @returns {Number}
   */
  getLogicalColumnIndex(col) {
    return this.hot.runHooks('modifyCol', col);
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

    } else if (this.settings.indicators && (this.isHidden(this.getLogicalColumnIndex(col + 1)) || this.isHidden(this.getLogicalColumnIndex(col - 1)))) {

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
      cellProperties.renderer = hiddenRenderer;

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

    if (this.isHidden(this.getLogicalColumnIndex(col + 1))) {
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
      let logicalCol = this.hot.runHooks('modifyCol', col);

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
   * Destroy the plugin.
   */
  destroy() {
    super.destroy();
  }

}

function hiddenRenderer(hotInstance, td) {
  td.textContent = '';
}

export {HiddenColumns};

registerPlugin('hiddenColumns', HiddenColumns);
