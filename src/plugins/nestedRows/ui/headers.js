import {BaseUI} from './_base';
import {rangeEach} from 'handsontable/helpers/number';
import {addClass} from 'handsontable/helpers/dom/element';

/**
 * Class responsible for the UI in the Nested Rows' row headers.
 *
 * @class
 * @private
 */
class HeadersUI extends BaseUI {
  /**
   * CSS classes used in the row headers.
   *
   * @type {Object}
   */
  static get CSS_CLASSES() {
    return {
      indicatorContainer: 'ht_nestingLevels',
      indicator: 'ht_nestingLevel',
      emptyIndicator: 'ht_nestingLevel_empty',
      button: 'ht_nestingButton',
      expandButton: 'ht_nestingExpand',
      collapseButton: 'ht_nestingCollapse'
    };
  }

  constructor(nestedRowsPlugin, hotInstance) {
    super(nestedRowsPlugin, hotInstance);
    /**
     * Reference to the DataManager instance connected with the Nested Rows plugin.
     *
     * @type {DataManager}
     */
    this.dataManager = this.plugin.dataManager;
    /**
     * Level cache array.
     *
     * @type {Array}
     */
    this.levelCache = this.dataManager.levelCache;
    /**
     * Reference to the CollapsingUI instance connected with the Nested Rows plugin.
     *
     * @type {CollapsingUI}
     */
    this.collapsingUI = this.plugin.collapsingUI;
    /**
     * Cache for the row headers width.
     *
     * @type {null|Number}
     */
    this.rowHeaderWidthCache = null;
    /**
     * Reference to the TrimRows instance connected with the Nested Rows plugin.
     *
     * @type {TrimRows}
     */
    this.trimRowsPlugin = nestedRowsPlugin.trimRowsPlugin;
  }

  /**
   * Append nesting indicators and buttons to the row headers.
   *
   * @param {Number} row Row index.
   * @param {HTMLElement} TH TH element.
   */
  appendLevelIndicators(row, TH) {
    row = this.trimRowsPlugin.rowsMapper.getValueByIndex(row);

    let rowLevel = this.levelCache ? this.levelCache[row] : this.dataManager.getRowLevel(row);
    let rowObject = this.dataManager.getDataObject(row);
    let innerDiv = TH.getElementsByTagName('DIV')[0];
    let previousIndicators = innerDiv.querySelector('.' + HeadersUI.CSS_CLASSES.indicatorContainer);
    let previousButtons = innerDiv.querySelector('.' + HeadersUI.CSS_CLASSES.button);

    if (previousIndicators) {
      innerDiv.removeChild(previousIndicators);
    }

    if (previousButtons) {
      innerDiv.removeChild(previousButtons);
    }

    addClass(TH, HeadersUI.CSS_CLASSES.indicatorContainer);

    if (rowLevel) {
      const indicatorsContainer = document.createElement('DIV');
      addClass(indicatorsContainer, HeadersUI.CSS_CLASSES.indicatorContainer);

      rangeEach(0, rowLevel - 2, (i) => {
        const levelIndicator = document.createElement('SPAN');
        addClass(levelIndicator, HeadersUI.CSS_CLASSES.emptyIndicator);
        indicatorsContainer.appendChild(levelIndicator);
      });

      const levelIndicator = document.createElement('SPAN');
      addClass(levelIndicator, HeadersUI.CSS_CLASSES.indicator);
      indicatorsContainer.appendChild(levelIndicator);

      innerDiv.appendChild(indicatorsContainer);
    }

    if (this.dataManager.hasChildren(rowObject)) {
      const buttonsContainer = document.createElement('DIV');

      if (this.collapsingUI.areChildrenHidden(row)) {
        addClass(buttonsContainer, HeadersUI.CSS_CLASSES.button + ' ' + HeadersUI.CSS_CLASSES.expandButton);

      } else {
        addClass(buttonsContainer, HeadersUI.CSS_CLASSES.button + ' ' + HeadersUI.CSS_CLASSES.collapseButton);
      }

      innerDiv.appendChild(buttonsContainer);
    }
  }

  /**
   * Update the row header width according to number of levels in the dataset.
   *
   * @private
   * @param {Number} deepestLevel Cached deepest level of nesting.
   */
  updateRowHeaderWidth(deepestLevel) {
    if (!deepestLevel) {
      deepestLevel = Math.max(...this.dataManager.levelCache);
    }
    this.rowHeaderWidthCache = Math.max(50, 20 + 20 * deepestLevel);

    this.hot.render();
  }
}

export {HeadersUI};
