import {BaseUI} from './_base';
import {rangeEach} from 'handsontable/helpers/number';
import {arrayEach} from 'handsontable/helpers/array';

/**
 * Class responsible for the Context Menu entries for the Nested Rows plugin.
 *
 * @class
 * @private
 */
class ContextMenuUI extends BaseUI {
  constructor(nestedRowsPlugin, hotInstance) {
    super(nestedRowsPlugin, hotInstance);

    /**
     * Reference to the DataManager instance connected with the Nested Rows plugin.
     *
     * @type {DataManager}
     */
    this.dataManager = this.plugin.dataManager;
  }

  appendOptions(defaultOptions) {
    const newEntries = [
      {
        key: 'add_child',
        name: () => {
          return 'Insert child row';
        },
        callback: () => {
          const translatedRowIndex = this.dataManager.translateTrimmedRow(this.hot.getSelected()[0]);
          const parent = this.dataManager.getDataObject(translatedRowIndex);
          this.dataManager.addChild(parent);
        },
        disabled: () => {
          const selected = this.hot.getSelected();

          return !selected || selected[0] < 0 ||  this.hot.selection.selectedHeader.cols || this.hot.countRows() >= this.hot.getSettings().maxRows;
        }
      },
      {
        key: 'detach_from_parent',
        name: () => {
          return 'Detach from parent';
        },
        callback: () => {
          const translatedRowIndex = this.dataManager.translateTrimmedRow(this.hot.getSelected()[0]);
          const element = this.dataManager.getDataObject(translatedRowIndex);

          this.dataManager.detachFromParent(this.hot.getSelected());
        },
        disabled: () => {
          const selected = this.hot.getSelected();
          const translatedRowIndex = this.dataManager.translateTrimmedRow(selected[0]);
          let parent = this.dataManager.getRowParent(translatedRowIndex);

          return !parent || !selected || selected[0] < 0 ||  this.hot.selection.selectedHeader.cols || this.hot.countRows() >= this.hot.getSettings().maxRows;
        }
      },
      Handsontable.plugins.ContextMenu.SEPARATOR
    ];

    rangeEach(0, defaultOptions.items.length - 1, (i) => {
      if (i === 0) {
        arrayEach(newEntries, (val, j) => {
          defaultOptions.items.splice(i + j, 0, val);
        });

        return false;
      }
    });

    return defaultOptions;
  }
}

export {ContextMenuUI};
