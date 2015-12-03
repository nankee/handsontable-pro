import {addClass} from 'handsontable/helpers/dom/element';
import {arrayEach, arrayMap, arrayUnique, arrayFilter} from 'handsontable/helpers/array';
import {BaseComponent} from './_base';
import {InputUI} from './../ui/input';
import {SelectUI} from './../ui/select';
import {MultipleSelectUI} from './../ui/multipleSelect';
import {FORMULA_BY_VALUE, FORMULA_NONE} from './../constants';

/**
 * @class ValueComponent
 * @private
 */
class ValueComponent extends BaseComponent {
  constructor(hotInstance) {
    super(hotInstance);

    this.elements.push(new MultipleSelectUI(this.hot));
  }

  /**
   * Set state of the component.
   *
   * @param {Object} value
   */
  setState(value) {
    this.reset();

    if (value) {
      this.getMultipleSelectElement().setValue(value.args[0]);
    }
  }

  /**
   * Export state of the component (get selected filter and filter arguments).
   *
   * @returns {Object} Returns object where `command` key keeps used formula filter and `args` key its arguments.
   */
  getState() {
    let select = this.getMultipleSelectElement();

    return {
      command: {key: select.isSelectedAllValues() ? FORMULA_NONE : FORMULA_BY_VALUE},
      args: [select.getValue()],
    };
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
      name: '',
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
    if (!this.hot.getSelectedRange()) {
      return;
    }
    let values = this.hot.getSourceDataAtCol(this.hot.getSelectedRange().from.col);
    let items = [];

    values = arrayUnique(values);
    values = arrayFilter(values, (value) => !(value === null || value === void 0));
    values = values.sort();

    arrayEach(values, (value) => items.push({checked: true, value}));

    this.getMultipleSelectElement().setItems(items);
    super.reset();
    this.getMultipleSelectElement().setValue(values);
  }
}

export {ValueComponent};
