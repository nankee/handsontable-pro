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
          let parent = this.dataManager.getDataObject(this.hot.getSelected()[0]);
          this.dataManager.addChild(parent);
        },
        disabled: () => {
          let selected = this.hot.getSelected();

          return !selected || selected[0] < 0 ||  this.hot.selection.selectedHeader.cols || this.hot.countRows() >= this.hot.getSettings().maxRows;
        }
      },
      {
        key: 'detach_from_parent',
        name: () => {
          return 'Detach from parent';
        },
        callback: () => {
          let element = this.dataManager.getDataObject(this.hot.getSelected()[0]);
          this.dataManager.detachFromParent(this.hot.getSelected());
        },
        disabled: () => {
          let selected = this.hot.getSelected();
          let parent = this.dataManager.getRowParent(selected[0]);

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
