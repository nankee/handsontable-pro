import BasePlugin from 'handsontable/plugins/_base';
import {registerPlugin} from 'handsontable/plugins';
import {DataManager} from './data/dataManager';
import {CollapsingUI} from './ui/collapsing';
import {HeadersUI} from './ui/headers';
import {ContextMenuUI} from './ui/contextMenu';

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
     * Reference to the Trim Rows plugin.
     *
     * @type {Object}
     */
    this.trimRowsPlugin = null;

    /**
     * Reference to the DataManager instance.
     *
     * @type {Object}
     */
    this.dataManager = null;

    /**
     * Reference to the HeadersUI instance.
     *
     * @type {Object}
     */
    this.headersUI = null;

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
    this.trimRowsPlugin = this.hot.getPlugin('trimRows');

    this.dataManager = new DataManager(this, this.hot, this.sourceData);
    this.collapsingUI = new CollapsingUI(this, this.hot, this.trimRowsPlugin);
    this.headersUI = new HeadersUI(this, this.hot);
    this.contextMenuUI = new ContextMenuUI(this, this.hot);

    this.addHook('modifyRowData', (row) => this.onModifyRowData(row));
    this.addHook('modifySourceLength', () => this.onModifySourceLength());
    this.addHook('beforeDataSplice', (index, amount, element) => this.onBeforeDataSplice(index, amount, element));
    this.addHook('beforeDataFilter', (index, amount, logicRows) => this.onBeforeDataFilter(index, amount, logicRows));
    this.addHook('afterContextMenuDefaultOptions', (defaultOptions) => this.onAfterContextMenuDefaultOptions(defaultOptions));
    this.addHook('afterGetRowHeader', (row, th) => this.onAfterGetRowHeader(row, th));
    this.addHook('beforeOnCellMouseDown', (event, coords, TD) => this.onBeforeOnCellMouseDown(event, coords, TD));
    this.addHook('afterInit', () => this.onAfterInit());

    this.addHook('afterAddChild', () => this.headersUI.updateRowHeaderWidth());
    this.addHook('afterDetachChild', () => this.headersUI.updateRowHeaderWidth());
    this.addHook('modifyRowHeaderWidth', (rowHeaderWidth) => this.onModifyRowHeaderWidth(rowHeaderWidth));

    if (!this.trimRowsPlugin.isEnabled()) {
      this.trimRowsPlugin.enablePlugin();
    }

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
   * beforeOnCellMousedown callback
   *
   * @private
   * @param {MouseEvent} event Mousedown event
   * @param {Object} coords Cell coords
   * @param {HTMLElement} TD clicked cell
   */
  onBeforeOnCellMouseDown(event, coords, TD) {
    this.collapsingUI.toggleState(event, coords, TD);
  }

  /**
   * The modifyRowData hook callback.
   *
   * @private
   * @param {Number} row Visual row index.
   */
  onModifyRowData(row) {
    return this.dataManager.getDataObject(row);
  }

  /**
   * Modify the source data length to match the length of the nested structure.
   *
   * @private
   * @returns {number}
   */
  onModifySourceLength() {
    return this.dataManager.countAllRows();
  }

  /**
   * @private
   * @param index
   * @param amount
   * @param element
   * @returns {boolean}
   */
  onBeforeDataSplice(index, amount, element) {
    this.dataManager.spliceData(index, amount, element);
    this.dataManager.refreshLevelCache();

    return false;
  }

  /**
   * Called before the source data filtering. Returning `false` stops the native filtering.
   *
   * @private
   * @param {Number} index
   * @param {Number} amount
   * @param {Array} logicRows
   * @returns {Boolean}
   */
  onBeforeDataFilter(index, amount, logicRows) {
    this.dataManager.filterData(index, amount, logicRows);
    this.dataManager.refreshLevelCache();

    return false;
  }

  /**
   * @private
   * @param defaultOptions
   */
  onAfterContextMenuDefaultOptions(defaultOptions) {
    return this.contextMenuUI.appendOptions(defaultOptions);
  }

  /**
   * `afterGetRowHeader` hook callback.
   *
   * @private
   * @param {Number} row Row index.
   * @param {HTMLElement} TH row header element.
   */
  onAfterGetRowHeader(row, TH) {
    this.headersUI.appendLevelIndicators(row, TH);
  }

  /**
   * `modifyRowHeaderWidth` hook callback.
   *
   * @private
   * @param {Number} rowHeaderWidth The initial row header width(s).
   * @returns {Number}
   */
  onModifyRowHeaderWidth(rowHeaderWidth) {
    return this.headersUI.rowHeaderWidthCache || rowHeaderWidth;
  }

  /**
   * `afterInit` hook callback.
   *
   * @private
   */
  onAfterInit() {
    this.dataManager.refreshLevelCache();

    let deepestLevel = Math.max(...this.dataManager.levelCache);

    if (deepestLevel > 0) {
      this.headersUI.updateRowHeaderWidth(deepestLevel);
    }
  }
}

export {NestedRows};

registerPlugin('nestedRows', NestedRows);
