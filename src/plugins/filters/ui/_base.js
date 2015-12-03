import {clone, extend, mixin} from 'handsontable/helpers/object';
import {localHooks} from 'handsontable/mixins/localHooks';
import {EventManager} from 'handsontable/eventManager';

const STATE_BUILT = 'built';
const STATE_BUILDING = 'building';

/**
 * @class
 * @private
 */
class BaseUI {
  static get DEFAULTS() {
    return clone({
      className: '',
      value: '',
    });
  }

  constructor(hotInstance, options) {
    /**
     * Instance of Handsontable.
     *
     * @type {Core}
     */
    this.hot = hotInstance;
    /**
     * Instance of EventManager.
     *
     * @type {EventManager}
     */
    this.eventManager = new EventManager(this);
    /**
     * List of element options.
     *
     * @type {Object}
     */
    this.options = extend(BaseUI.DEFAULTS, options);
    /**
     * Build root DOM element.
     *
     * @type {Element}
     * @private
     */
    this._element = document.createElement('div');
    /**
     * Flag which determines build state of element.
     *
     * @type {Boolean}
     */
    this.buildState = false;
  }

  /**
   * Set the element value.
   *
   * @returns {*}
   */
  setValue(value) {
    this.options.value = value;
    this.update();
  }

  /**
   * Get the element value.
   *
   * @returns {*}
   */
  getValue() {
    return this.options.value;
  }

  /**
   * Get element as a DOM object.
   *
   * @returns {Element}
   */
  get element() {
    if (this.buildState === STATE_BUILDING) {
      return this._element;
    }
    if (this.buildState === STATE_BUILT) {
      this.update();

      return this._element;
    }
    this.buildState = STATE_BUILDING;
    this.build();
    this.buildState = STATE_BUILT;

    return this._element;
  }

  /**
   * Check if element was built (built whole DOM structure).
   *
   * @returns {Boolean}
   */
  isBuilt() {
    return this.buildState === STATE_BUILT;
  }

  /**
   * Build DOM structure.
   */
  build() {
    if (!this.buildState) {
      this.buildState = STATE_BUILDING;
    }
  }

  /**
   * Update DOM structure.
   */
  update() {

  }

  /**
   * Reset to initial state.
   */
  reset() {
    this.options.value = '';
    this.update();
  }

  /**
   * Show element.
   */
  show() {
    this.element.style.display = '';
  }

  /**
   * Hide element.
   */
  hide() {
    this.element.style.display = 'none';
  }

  /**
   * Focus element.
   */
  focus() {

  }

  destroy() {
    this.eventManager.destroy();
    this.eventManager = null;
    this.hot = null;

    if (this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element = null;
  }
}

mixin(BaseUI, localHooks);

export {BaseUI};
