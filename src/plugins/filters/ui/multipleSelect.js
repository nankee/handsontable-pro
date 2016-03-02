import {BaseUI} from './_base';
import {addClass} from 'handsontable/helpers/dom/element';
import {Menu} from 'handsontable/plugins/contextMenu/menu';
import {clone, extend} from 'handsontable/helpers/object';
import {arrayFilter, arrayMap, arrayEach} from 'handsontable/helpers/array';
import {startsWith} from 'handsontable/helpers/string';
import {InputUI} from './input';

const privatePool = new WeakMap();

/**
 * @class MultipleSelectUI
 * @util
 */
class MultipleSelectUI extends BaseUI {
  static get DEFAULTS() {
    return clone({
      value: []
    });
  }

  constructor(hotInstance, options) {
    privatePool.set(this, {});
    super(hotInstance, extend(MultipleSelectUI.DEFAULTS, options));
    /**
     * Input element.
     *
     * @type {InputUI}
     */
    this.searchInput = new InputUI(this.hot, {
      placeholder: 'Search...',
      className: 'htUIMultipleSelectSearch'
    });
    /**
     * List of available select options.
     *
     * @type {Array}
     */
    this.items = [];
    /**
     * Handsontable instance used as items list element.
     *
     * @type {Handsontable}
     */
    this.itemsBox = null;

    this.registerHooks();
  }

  /**
   * Register all necessary hooks.
   */
  registerHooks() {
    this.searchInput.addLocalHook('keyup', (event) => this.onInputKeyUp(event));
    this.searchInput.addLocalHook('blur', (event) => this.onInputBlur(event));
  }

  /**
   * Set available options.
   *
   * @param {Array} items Array of objects with `checked` and `label` property.
   */
  setItems(items) {
    this.items = items;

    if (this.itemsBox) {
      this.itemsBox.loadData(this.items);
    }
  }

  /**
   * Get all available options.
   *
   * @returns {Array}
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Get element value.
   *
   * @returns {Array} Array of selected values.
   */
  getValue() {
    return itemsToValue(this.items);
  }

  /**
   * Check if all values listed in element are selected.
   *
   * @returns {Boolean}
   */
  isSelectedAllValues() {
    return this.items.length === this.getValue().length;
  }

  /**
   * Build DOM structure.
   */
  build() {
    super.build();

    let itemsBoxWrapper = document.createElement('div');

    addClass(this._element, 'htUIMultipleSelect');

    this._element.appendChild(this.searchInput.element);
    this._element.appendChild(itemsBoxWrapper);

    let hotInitializer = (wrapper) => {
      if (!this._element) {
        return;
      }
      if (this.itemsBox) {
        this.itemsBox.destroy();
      }

      this.itemsBox = new Handsontable(wrapper, {
        data: valueToItems(this.items, this.options.value),
        columns: [
          {data: 'checked', type: 'checkbox', label: {property: 'value', position: 'after'}}
        ],
        colWidths: 150,
        height: 110,
        width: 168,
        copyPaste: false,
        disableVisualSelection: 'area',
        fillHandle: false,
        fragmentSelection: 'cell',
        tabMoves: {row: 1, col: 0},
      });
    };
    hotInitializer(itemsBoxWrapper);
    setTimeout(() => hotInitializer(itemsBoxWrapper), 100);

    this.update();
  }

  /**
   * Reset DOM structure.
   */
  reset() {
    this.searchInput.reset();
  }

  /**
   * Update DOM structure.
   */
  update() {
    if (!this.isBuilt()) {
      return;
    }
    this.itemsBox.loadData(valueToItems(this.items, this.options.value));
    super.update();
  }

  /**
   * Destroy instance.
   */
  destroy() {
    if (this.itemsBox) {
      this.itemsBox.destroy();
    }
    this.itemsBox = null;
    this.searchInput = null;
    this.items = null;
    super.destroy();
  }

  /**
   * 'keyup' event listener for input element.
   *
   * @private
   * @param {Event} event DOM event.
   */
  onInputKeyUp(event) {
    let value = this.searchInput.getValue().toLowerCase();
    let filteredItems;

    if (value === '') {
      filteredItems = [...this.items];
    } else {
      filteredItems = arrayFilter(this.items, (item) => (item.value + '').toLowerCase().indexOf(value) >= 0);
    }
    this.itemsBox.loadData(filteredItems);
  }

  /**
   * 'blur' event listener for input element.
   *
   * @private
   */
  onInputBlur() {
    this.itemsBox.listen();
    this.itemsBox.selectCell(0, 0);
  }
}

export {MultipleSelectUI};

function valueToItems(availableItems, selectedValue) {
  return arrayMap(availableItems, (item) => {
    item.checked = selectedValue.indexOf(item.value) !== -1;

    return item;
  });
}

function itemsToValue(availableItems) {
  let items = [];

  arrayEach(availableItems, (item) => {
    if (item.checked) {
      items.push(item.value);
    }
  });

  return items;
}
