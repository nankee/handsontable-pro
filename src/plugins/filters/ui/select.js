import {BaseUI} from './_base';
import {addClass, getWindowScrollTop, getWindowScrollLeft} from 'handsontable/helpers/dom/element';
import {Menu} from 'handsontable/plugins/contextMenu/menu';
import {clone, extend} from 'handsontable/helpers/object';
import {SEPARATOR} from 'handsontable/plugins/contextMenu/predefinedItems';

const privatePool = new WeakMap();

/**
 * @class SelectUI
 * @util
 */
class SelectUI extends BaseUI {
  static get DEFAULTS() {
    return clone({});
  }

  constructor(hotInstance, options) {
    privatePool.set(this, {});
    super(hotInstance, extend(SelectUI.DEFAULTS, options));
    /**
     * Instance of {@link Menu}.
     *
     * @type {Menu}
     */
    this.menu = null;
    /**
     * List of available select options.
     *
     * @type {Array}
     */
    this.items = [];

    this.registerHooks();
  }

  /**
   * Register all necessary hooks.
   */
  registerHooks() {
    this.addLocalHook('click', (event) => this.onClick(event));
  }

  /**
   * Set options which can be selected in the list.
   *
   * @param {Array} items Array of objects with required keys `key` and `name`.
   */
  setItems(items) {
    this.items = items;

    if (this.menu) {
      this.menu.setMenuItems(this.items);
    }
  }

  /**
   * Build DOM structure.
   */
  build() {
    super.build();
    this.menu = new Menu(this.hot, {
      className: 'htSelectUI htFiltersConditionsMenu',
      keepInViewport: false,
      standalone: true,
    });
    this.menu.setMenuItems(this.items);

    let caption = privatePool.get(this).caption = document.createElement('div');
    let dropdown = document.createElement('div');
    let label = document.createElement('div');

    addClass(this._element, 'htUISelect');
    addClass(caption, 'htUISelectCaption');
    addClass(dropdown, 'htUISelectDropdown');
    addClass(label, 'htFiltersMenuLabel');

    this._element.appendChild(caption);
    this._element.appendChild(dropdown);

    this.menu.addLocalHook('select', (command) => this.onMenuSelect(command));
    this.eventManager.addEventListener(this._element, 'click', (event) => this.runLocalHooks('click', event, this));
    this.update();
  }

  /**
   * Update DOM structure.
   */
  update() {
    if (!this.isBuilt()) {
      return;
    }
    privatePool.get(this).caption.textContent = this.options.value ? this.options.value.name : 'None';
    super.update();
  }

  /**
   * Open select dropdown menu with available options.
   */
  openOptions() {
    let rect = this.element.getBoundingClientRect();

    if (this.menu) {
      this.menu.open();
      this.menu.setPosition({
        left: rect.left - 5,
        top: rect.top,
        width: rect.width,
        height: rect.height
      });
    }
  }

  /**
   * Close select dropdown menu.
   */
  closeOptions() {
    if (this.menu) {
      this.menu.close();
    }
  }

  /**
   * On menu selected listener.
   *
   * @private
   * @param {Object} command Selected item
   */
  onMenuSelect(command) {
    if (command.name !== SEPARATOR) {
      this.options.value = command;
      this.closeOptions();
      this.update();
      this.runLocalHooks('select', this.options.value);
    }
  }

  /**
   * On element click listener.
   *
   * @private
   * @param {Event} event DOM Event
   */
  onClick(event) {
    this.openOptions();
  }

  /**
   * Destroy instance.
   */
  destroy() {
    if (this.menu) {
      this.menu.destroy();
      this.menu = null;
    }
    super.destroy();
  }
}

export {SelectUI};
