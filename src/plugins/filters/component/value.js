import {addClass} from 'handsontable/helpers/dom/element';
import {stopImmediatePropagation} from 'handsontable/helpers/dom/event';
import {arrayEach, arrayUnique, arrayFilter, arrayMap, arrayIncludes} from 'handsontable/helpers/array';
import {mergeSort} from 'handsontable/utils/sortingAlgorithms/mergeSort';
import {deepClone} from 'handsontable/helpers/object';
import {stringify} from 'handsontable/helpers/string';
import {unifyColumnValues, intersectValues, toEmptyString} from './../utils';
import {BaseComponent} from './_base';
import {isKey} from 'handsontable/helpers/unicode';
import {MultipleSelectUI} from './../ui/multipleSelect';
import {FORMULA_BY_VALUE, FORMULA_NONE} from './../constants';
import {getFormulaDescriptor} from './../formulaRegisterer';

/**
 * @class ValueComponent
 * @plugin Filters
 */
class ValueComponent extends BaseComponent {
  constructor(hotInstance) {
    super(hotInstance);

    this.elements.push(new MultipleSelectUI(this.hot));

    this.registerHooks();
  }

  /**
   * Register all necessary hooks.
   *
   * @private
   */
  registerHooks() {
    this.getMultipleSelectElement().addLocalHook('keydown', (event) => this.onInputKeyDown(event));
  }

  /**
   * Set state of the component.
   *
   * @param {Object} value
   */
  setState(value) {
    this.reset();

    if (value && value.command.key === FORMULA_BY_VALUE) {
      const select = this.getMultipleSelectElement();

      select.setItems(value.itemsSnapshot);
      select.setValue(value.args[0]);
    }
  }

  /**
   * Export state of the component (get selected filter and filter arguments).
   *
   * @returns {Object} Returns object where `command` key keeps used formula filter and `args` key its arguments.
   */
  getState() {
    const select = this.getMultipleSelectElement();
    const availableItems = select.getItems();

    return {
      command: {key: select.isSelectedAllValues() || !availableItems.length ? FORMULA_NONE : FORMULA_BY_VALUE},
      args: [select.getValue()],
      itemsSnapshot: availableItems
    };
  }

  /**
   * Update state of component.
   *
   * @param {Object} editedFormulaStack Formula stack for edited column.
   * @param {Object} dependentFormulaStacks Formula stacks of dependent formulas.
   * @param {Function} filteredRowsFactory Data factory
   */
  updateState(editedFormulaStack, dependentFormulaStacks, filteredRowsFactory) {
    const {column, formulas} = editedFormulaStack;

    const updateColumnState = (column, formulas, formulasStack) => {
      const [formula] = arrayFilter(formulas, formula => formula.name === FORMULA_BY_VALUE);
      const state = {};

      if (formula) {
        let rowValues = arrayMap(filteredRowsFactory(column, formulasStack), (row) => row.value);

        rowValues = unifyColumnValues(rowValues);

        const selectedValues = [];
        const itemsSnapshot = intersectValues(rowValues, formula.args[0], (item) => {
          if (item.checked) {
            selectedValues.push(item.value);
          }
        });

        state.args = [selectedValues];
        state.command = getFormulaDescriptor(FORMULA_BY_VALUE);
        state.itemsSnapshot = itemsSnapshot;

      } else {
        state.args = [];
        state.command = getFormulaDescriptor(FORMULA_NONE);
      }

      this.setCachedState(column, state);
    };

    updateColumnState(column, formulas);

    // Shallow deep update of component state
    if (dependentFormulaStacks.length) {
      const {column, formulas} = dependentFormulaStacks[0];

      updateColumnState(column, formulas, editedFormulaStack);
    }
  }

  /**
   * Add new value to component cache
   *
   * @private
   * @param {*} cachedState Cached state of ValueComponent
   * @param newValue Value which will be added to ValueComponent cache
   */
  addNewValueToComponentCache(cachedState, newValue) {
    cachedState.itemsSnapshot.push({
      checked: true,
      value: newValue,
      visualValue: newValue
    });
  }

  /**
   * Change value inside component cache
   *
   * @private
   * @param {*} cachedState Cached state of ValueComponent
   * @param {Array} valuesArray Array containing all cached values of ValueComponent
   * @param {*} originalValue Original value inside ValueComponent cache
   * @param {*} newValue New value which will change original value of ValueComponent cache
   */
  changeValueInsideComponentCache(cachedState, valuesArray, originalValue, newValue) {
    const indexOf = valuesArray.indexOf(originalValue);

    cachedState.itemsSnapshot[indexOf].value = newValue;
    cachedState.itemsSnapshot[indexOf].visualValue = newValue;
  }

  /**
   * Remove value from component cache
   *
   * @private
   * @param {*} cachedState Cached state of ValueComponent
   * @param {*} removedValue Value which will be removed from cache
   */
  removeValueFromComponentCache(cachedState, removedValue) {
    const valuesArray = cachedState.itemsSnapshot.map((item) => { return item.value; });

    if (arrayIncludes(valuesArray, removedValue)) {


    }
  }

  /**
   * Sort values of component cache
   *
   * @private
   * @param {*} cachedState Cached state of ValueComponent
   */
  sortValuesOfComponentCache(cachedState) {
    mergeSort(cachedState.itemsSnapshot, function(a, b) {
      if (typeof a.value === 'number' && typeof b.value === 'number') {
        return a.value - b.value;
      }

      if (a.value === b.value) {
        return 0;
      }

      return a.value > b.value ? 1 : -1;
    });
  }

  /**
   * Update cache of component basing on handled changes
   *
   * @private
   * @param columnIndex {Number} columnIndex Column index of changed cell
   * @param {Array} dataAtCol Array of column values from the data source. `col` is the __visible__ index of the column
   * @param {*} originalValue Original value of changed cell
   * @param {*} changedValue Changed value of the cell
   */
  updateComponentCache(columnIndex, dataAtCol, originalValue, changedValue) {
    const cachedState = this.getCachedState(columnIndex);

    if (cachedState && cachedState.args) {
      const args = cachedState.args[0] || [];
      const unifiedDataAtCol = unifyColumnValues(dataAtCol);
      const newCachedState = deepClone(cachedState);
      newCachedState.args[0] = unifiedDataAtCol;

      if (unifiedDataAtCol.length === args.length) {
        const valuesArray = newCachedState.itemsSnapshot.map((item) => { return item.value; });

        if (arrayIncludes(valuesArray, originalValue)) {
          if (arrayIncludes(valuesArray, changedValue)) {
            this.removeValueFromComponentCache(newCachedState, originalValue);

          } else {
            this.changeValueInsideComponentCache(newCachedState, valuesArray, originalValue, changedValue);
          }
        }

      } else if (unifiedDataAtCol.length > args.length) {
        this.addNewValueToComponentCache(newCachedState, changedValue);

      } else {
        this.removeValueFromComponentCache(newCachedState, originalValue);
      }

      this.sortValuesOfComponentCache(newCachedState);
      this.setCachedState(columnIndex, newCachedState);
    }
  }

  /**
   * Get multiple select element.
   *
   * @returns {MultipleSelectUI}
   */
  getMultipleSelectElement() {
    return this.elements.filter((element) => element instanceof MultipleSelectUI)[0];
  }

  /**
   * Get object descriptor for menu item entry.
   *
   * @returns {Object}
   */
  getMenuItemDescriptor() {
    return {
      key: 'filter_by_value',
      name: 'Filter by value',
      isCommand: false,
      disableSelection: true,
      hidden: () => this.isHidden(),
      renderer: (hot, wrapper, row, col, prop, value) => {
        addClass(wrapper.parentNode, 'htFiltersMenuValue');

        let label = document.createElement('div');

        addClass(label, 'htFiltersMenuLabel');
        label.textContent = 'Filter by value:';

        wrapper.appendChild(label);
        arrayEach(this.elements, (ui) => wrapper.appendChild(ui.element));

        return wrapper;
      }
    };
  }

  /**
   * Reset elements to their initial state.
   */
  reset() {
    let values = unifyColumnValues(this._getColumnVisibleValues());
    let items = intersectValues(values, values);

    this.getMultipleSelectElement().setItems(items);
    super.reset();
    this.getMultipleSelectElement().setValue(values);
  }

  /**
   * Key down listener.
   *
   * @private
   * @param {Event} event DOM event object.
   */
  onInputKeyDown(event) {
    if (isKey(event.keyCode, 'ESCAPE')) {
      this.runLocalHooks('cancel');
      stopImmediatePropagation(event);
    }
  }

  /**
   * Get data for currently selected column.
   *
   * @returns {Array}
   * @private
   */
  _getColumnVisibleValues() {
    let lastSelectedColumn = this.hot.getPlugin('filters').getSelectedColumn();

    return arrayMap(this.hot.getDataAtCol(lastSelectedColumn), (v) => toEmptyString(v));
  }
}

export {ValueComponent};
