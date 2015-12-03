import {BaseUI} from './_base';
import {addClass} from 'handsontable/helpers/dom/element';
import {clone, extend} from 'handsontable/helpers/object';

const privatePool = new WeakMap();

/**
 * @class InputUI
 * @private
 */
class InputUI extends BaseUI {
  static get DEFAULTS() {
    return clone({
      placeholder: '',
      type: 'text',
    });
  }

  constructor(hotInstance, options) {
    privatePool.set(this, {});
    super(hotInstance, extend(InputUI.DEFAULTS, options));
    this.registerHooks();
  }

  /**
   * Register all necessary hooks.
   */
  registerHooks() {
    this.addLocalHook('click', (event) => this.onClick(event));
    this.addLocalHook('keyup', (event) => this.onKeyup(event));
  }

  /**
   * Build DOM structure.
   */
  build() {
    super.build();
    let priv = privatePool.get(this);
    let input = priv.input = document.createElement('input');
    let icon = document.createElement('div');

    addClass(this._element, 'htUIInput');
    addClass(icon, 'htUIInputIcon');
    input.placeholder = this.options.placeholder;
    input.type = this.options.type;
    input.value = this.options.value;

    if (this.options.className) {
      addClass(this._element, this.options.className);
    }
    this._element.appendChild(input);
    this._element.appendChild(icon);

    this.eventManager.addEventListener(this._element, 'click', (event) => this.runLocalHooks('click', event, this));
    this.eventManager.addEventListener(this._element, 'keyup', (event) => this.runLocalHooks('keyup', event, this));
    this.eventManager.addEventListener(this._element, 'keydown', (event) => this.runLocalHooks('keydown', event, this));
    this.update();
  }

  /**
   * Update element.
   */
  update() {
    if (!this.isBuilt()) {
      return;
    }
    let input = privatePool.get(this).input;

    input.type = this.options.type;
    input.value = this.options.value;
  }

  /**
   * Focus element.
   */
  focus() {
    if (this.isBuilt()) {
      privatePool.get(this).input.focus();
    }
  }

  /**
   * OnClick listener.
   *
   * @param {Event} event
   */
  onClick(event) {

  }

  /**
   * OnKeyup listener.
   *
   * @param {Event} event
   */
  onKeyup(event) {
    this.options.value = event.target.value;
  }
}

export {InputUI};
