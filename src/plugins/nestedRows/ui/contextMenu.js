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
      Handsontable.plugins.ContextMenu.SEPARATOR,
      {
        key: 'add_child',
        name: () => {
          return 'Insert child row';
        },
        callback: () => {
          let parent = this.dataManager.getDataObject(this.hot.getSelected()[0]);
          this.dataManager.addChild(parent);
        }
      },
      {
        key: 'detach_from_parent',
        name: () => {
          return 'Detach from parent.';
        },
        callback: () => {
          let parent = this.dataManager.getDataObject(this.hot.getSelected()[0]);
          this.dataManager.detachFromParent(parent);
        },
        disabled: () => {
          let parent = this.dataManager.getRowParent(this.hot.getSelected()[0]);
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
}

export {ContextMenuUI};
