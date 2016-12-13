import {arrayEach} from 'handsontable/helpers/array';
import {deepClone} from 'handsontable/helpers/object';

/**
 * Class used to make all endpoint-related operations.
 *
 * @class Endpoints
 * @plugin ColumnSummary
 * @pro
 */
class Endpoints {
  constructor(plugin, settings) {
    /**
     * The main plugin instance.
     */
    this.plugin = plugin;
    /**
     * Handsontable instance.
     *
     * @type {Object}
     */
    this.hot = this.plugin.hot;
    /**
     * Array of declared plugin endpoints (calculation destination points).
     *
     * @type {Array}
     * @default {Array} Empty array.
     */
    this.endpoints = [];
    /**
     * The plugin settings, taken from Handsontable configuration.
     *
     * @type {Object|Function}
     * @default null
     */
    this.settings = settings;
    /**
     * Settings type. Can be either 'array' or 'function.
     *
     * @type {string}
     * @default {'array'}
     */
    this.settingsType = 'array';
    /**
     * The current endpoint (calculation destination point) in question.
     *
     * @type {Object}
     * @default null
     */
    this.currentEndpoint = null;
    /**
     * Array containing a list of changes to be applied.
     *
     * @private
     * @type {Array}
     * @default {[]}
     */
    this.cellsToSetCache = [];
  }

  /**
   * Get a single endpoint object.
   *
   * @param {Number} index Index of the endpoint.
   * @returns {Object}
   */
  getEndpoint(index) {
    if (this.settingsType === 'function') {
      return this.fillMissingEndpointData(this.settings)[index];
    } else {
      return this.endpoints[index];
    }
  }

  /**
   * Get an array with all the endpoints.
   *
   * @returns {Array}
   */
  getAllEndpoints() {
    if (this.settingsType === 'function') {
      return this.fillMissingEndpointData(this.settings);
    } else {
      return this.endpoints;
    }
  }

  /**
   * Used to fill the blanks in the endpoint data provided by a settings function.
   *
   * @private
   * @param {Function} func Function provided in the HOT settings.
   * @returns {Array} An array of endpoints.
   */
  fillMissingEndpointData(func) {
    return this.parseSettings(func.call(this));
  }

  /**
   * Parse plugin's settings.
   *
   * @param {Array} settings The settings array.
   */
  parseSettings(settings) {
    let endpointsArray = [];

    if (!settings && typeof this.settings === 'function') {
      this.settingsType = 'function';

      return;
    }

    if (!settings) {
      settings = this.settings;
    }

    arrayEach(settings, (val) => {
      let newEndpoint = {};

      this.assignSetting(val, newEndpoint, 'ranges', [[0, this.hot.countRows() - 1]]);
      this.assignSetting(val, newEndpoint, 'reversedRowCoords', false);
      this.assignSetting(val, newEndpoint, 'destinationRow', new Error('You must provide a destination row for the Column Summary plugin in order to work properly!'));
      this.assignSetting(val, newEndpoint, 'destinationColumn', new Error('You must provide a destination column for the Column Summary plugin in order to work properly!'));
      this.assignSetting(val, newEndpoint, 'sourceColumn', val.destinationColumn);
      this.assignSetting(val, newEndpoint, 'type', 'sum');
      this.assignSetting(val, newEndpoint, 'forceNumeric', false);
      this.assignSetting(val, newEndpoint, 'suppressDataTypeErrors', true);
      this.assignSetting(val, newEndpoint, 'suppressDataTypeErrors', true);
      this.assignSetting(val, newEndpoint, 'customFunction', null);
      this.assignSetting(val, newEndpoint, 'readOnly', true);
      this.assignSetting(val, newEndpoint, 'roundFloat', false);

      endpointsArray.push(newEndpoint);
    });

    return endpointsArray;
  }

  /**
   * Setter for the internal setting objects.
   *
   * @param {Object} settings Object with the settings.
   * @param {Object} endpoint Contains information about the endpoint for the the calculation.
   * @param {String} name Settings name.
   * @param defaultValue Default value for the settings.
   */
  assignSetting(settings, endpoint, name, defaultValue) {
    if (name === 'ranges' && settings[name] === void 0) {
      endpoint[name] = defaultValue;
      return;
    } else if (name === 'ranges' && settings[name].length === 0) {
      return;
    }

    if (settings[name] === void 0) {
      if (defaultValue instanceof Error) {
        throw defaultValue;

      }

      endpoint[name] = defaultValue;

    } else {
      if (name === 'destinationRow' && endpoint.reversedRowCoords) {
        endpoint[name] = this.hot.countRows() - settings[name] - 1;

      } else {
        endpoint[name] = settings[name];
      }
    }
  }

  /**
   * Resets the endpoint setup before the structure alteration (like inserting or removing rows/columns). Used for settings provided as a function.
   *
   * @private
   * @param {String} action Type of the action performed.
   * @param {Number} index Row/column index.
   * @param {Number} number Number of rows/columns added/removed.
   * @param {Array} [logicRows] Array of the logical indexes.
   * @param {String} [source] Source of change.
   */
  resetSetupBeforeStructureAlteration(action, index, number, logicRows, source) {
    if (this.settingsType !== 'function') {
      return;
    }

    const type = action.indexOf('row') > -1 ? 'row' : 'col';
    const endpoints = this.getAllEndpoints();

    arrayEach(endpoints, (val, key, obj) => {
      if (type === 'row' && val.destinationRow >= index) {
        if (action === 'insert_row') {
          val.alterRowOffset = number;
        } else if (action === 'remove_row') {
          val.alterRowOffset = (-1) * number;
        }
      }

      if (type === 'col' && val.destinationColumn >= index) {
        if (action === 'insert_col') {
          val.alterColumnOffset = number;
        } else if (action === 'remove_col') {
          val.alterColumnOffset = (-1) * number;
        }
      }
    });

    this.resetAllEndpoints(endpoints, false);
  }

  /**
   * afterCreateRow/afterCreateRow/afterRemoveRow/afterRemoveCol hook callback. Reset and reenables the summary functionality
   * after changing the table structure.
   *
   * @private
   * @param {String} action Type of the action performed.
   * @param {Number} index Row/column index.
   * @param {Number} number Number of rows/columns added/removed.
   * @param {Array} [logicRows] Array of the logical indexes.
   * @param {String} [source] Source of change.
   */
  resetSetupAfterStructureAlteration(action, index, number, logicRows, source) {
    if (this.settingsType === 'function') {

      // We need to run it on a next avaiable hook, because the TrimRows' `afterCreateRow` hook triggers after this one,
      // and it needs to be run to properly calculate the endpoint value.
      const beforeRenderCallback = () => {
        this.hot.removeHook('beforeRender', beforeRenderCallback);
        return this.refreshAllEndpoints(true);
      };
      this.hot.addHookOnce('beforeRender', beforeRenderCallback);
      return;
    }

    let type = action.indexOf('row') > -1 ? 'row' : 'col';
    let multiplier = action.indexOf('insert') > -1 ? 1 : -1;
    let endpoints = this.getAllEndpoints();
    let rowOffset = 0;
    let columnOffset = 0;

    if (type === 'row') {
      rowOffset = multiplier * number;
    } else if (type === 'col') {
      columnOffset = multiplier * number;
    }

    arrayEach(endpoints, (val, key, obj) => {
      if (type === 'row' && val.destinationRow >= index) {
        val.alterRowOffset = multiplier * number;
      }

      if (type === 'col' && val.destinationColumn >= index) {
        val.alterColumnOffset = multiplier * number;
      }
    });

    this.resetAllEndpoints(endpoints);

    arrayEach(endpoints, (val, key, obj) => {
      this.shiftEndpointCoordinates(val, index, rowOffset, columnOffset);
    });

    this.refreshAllEndpoints(true);
  }

  /**
   * Shifts the endpoint coordinates by the defined offset.
   *
   * @private
   * @param {Object} endpoint Endpoint object.
   * @param {Number} offsetStartIndex Index of the performed change (if the change is located after the endpoint, nothing about the endpoint has to be changed.
   */
  shiftEndpointCoordinates(endpoint, offsetStartIndex) {
    if (endpoint.alterRowOffset && endpoint.alterRowOffset !== 0) {
      endpoint.destinationRow += endpoint.alterRowOffset || 0;

      arrayEach(endpoint.ranges, (element, i) => {
        arrayEach(element, (subElement, j) => {
          if (subElement >= offsetStartIndex) {
            element[j] += endpoint.alterRowOffset || 0;
          }
        });
      });

    } else if (endpoint.alterColumnOffset && endpoint.alterColumnOffset !== 0) {
      endpoint.destinationColumn += endpoint.alterColumnOffset || 0;
      endpoint.sourceColumn += endpoint.alterColumnOffset || 0;
    }
  }

  /**
   * Resets (removes) the endpoints from the table.
   *
   * @param {Array} endpoints Array containing the endpoints.
   * @param {Boolean} [useOffset=true] Use the cell offset value.
   */
  resetAllEndpoints(endpoints, useOffset = true) {
    this.cellsToSetCache = [];

    if (!endpoints) {
      endpoints = this.getAllEndpoints();
    }

    arrayEach(endpoints, (value) => {
      this.resetEndpointValue(value, useOffset);
    });

    this.hot.setDataAtCell(this.cellsToSetCache, 'columnSummary');

    this.cellsToSetCache = [];
  }

  /**
   * Calculate and refresh all defined endpoints.
   *
   * @param {Boolean} init `true` if it's the initial call.
   */
  refreshAllEndpoints(init) {
    this.cellsToSetCache = [];

    arrayEach(this.getAllEndpoints(), (value) => {
      this.currentEndpoint = value;
      this.plugin.calculate(value);
      this.setEndpointValue(value, 'init');
    });
    this.currentEndpoint = null;

    this.hot.setDataAtCell(this.cellsToSetCache, 'columnSummary');

    this.cellsToSetCache = [];
  }

  /**
   * Calculate and refresh endpoints only in the changed columns.
   *
   * @param {Array} changes Array of changes from the `afterChange` hook.
   */
  refreshChangedEndpoints(changes) {
    let needToRefresh = [];
    this.cellsToSetCache = [];

    arrayEach(changes, (value, key, changes) => {
      // if nothing changed, dont update anything
      if ((value[2] || '') + '' === value[3] + '') {
        return;
      }

      arrayEach(this.getAllEndpoints(), (value, j) => {
        if (this.hot.propToCol(changes[key][1]) === value.sourceColumn && needToRefresh.indexOf(j) === -1) {
          needToRefresh.push(j);
        }
      });
    });

    arrayEach(needToRefresh, (value) => {
      this.refreshEndpoint(this.getEndpoint(value));
    });

    this.hot.setDataAtCell(this.cellsToSetCache, 'columnSummary');
    this.cellsToSetCache = [];
  }

  /**
   * Calculate and refresh a single endpoint.
   *
   * @param {Object} endpoint Contains the endpoint information.
   */
  refreshEndpoint(endpoint) {
    this.currentEndpoint = endpoint;
    this.plugin.calculate(endpoint);
    this.setEndpointValue(endpoint);
    this.currentEndpoint = null;
  }

  /**
   * Reset the endpoint value.
   *
   * @param {Object} endpoint Contains the endpoint information.
   * @param {Boolean} [useOffset=true] Use the cell offset value.
   */
  resetEndpointValue(endpoint, useOffset = true) {
    let alterRowOffset = endpoint.alterRowOffset || 0;
    let alterColOffset = endpoint.alterColumnOffset || 0;

    const visualEndpointRowIndex = this.getVisualRowIndex(endpoint.destinationRow);

    this.hot.setCellMeta(visualEndpointRowIndex, endpoint.destinationColumn, 'readOnly', false);
    this.hot.setCellMeta(visualEndpointRowIndex, endpoint.destinationColumn, 'className', '');
    this.cellsToSetCache.push([this.getVisualRowIndex(endpoint.destinationRow + (useOffset ? alterRowOffset : 0)), endpoint.destinationColumn + (useOffset ? alterColOffset : 0), '']);
  }

  /**
   * Set the endpoint value.
   *
   * @param {Object} endpoint Contains the endpoint information.
   * @param {String} [source] Source of the call information.
   * @param {Boolean} [render=false] `true` if it needs to render the table afterwards.
   */
  setEndpointValue(endpoint, source, render = false) {
    // We'll need the reversed offset values, because cellMeta will be shifted AGAIN afterwards.
    const reverseRowOffset = (-1) * endpoint.alterRowOffset || 0;
    const reverseColOffset = (-1) * endpoint.alterColumnOffset || 0;
    const visualEndpointRowIndex = this.getVisualRowIndex(endpoint.destinationRow);

    const cellMeta = this.hot.getCellMeta(this.getVisualRowIndex(endpoint.destinationRow + reverseRowOffset), endpoint.destinationColumn + reverseColOffset);

    if (visualEndpointRowIndex > this.hot.countRows() ||
      endpoint.destinationColumn > this.hot.countCols()) {
      this.throwOutOfBoundsWarning();
      return;
    }

    if (source === 'init' || cellMeta.readOnly !== endpoint.readOnly) {
      cellMeta.readOnly = endpoint.readOnly;
      cellMeta.className = 'columnSummaryResult';
    }

    if (endpoint.roundFloat && !isNaN(endpoint.result)) {
      endpoint.result = endpoint.result.toFixed(endpoint.roundFloat);
    }

    if (render) {
      this.hot.setDataAtCell(visualEndpointRowIndex, endpoint.destinationColumn, endpoint.result, 'columnSummary');
    } else {
      this.cellsToSetCache.push([visualEndpointRowIndex, endpoint.destinationColumn, endpoint.result]);
    }

    endpoint.alterRowOffset = void 0;
    endpoint.alterColumnOffset = void 0;
  }

  /**
   * Get the visual row index for the provided row. Uses the `umodifyRow` hook.
   *
   * @private
   * @param {Number} row Row index.
   * @returns {Number}
   */
  getVisualRowIndex(row) {
    return this.hot.runHooks('unmodifyRow', row, 'columnSummary');
  }

  /**
   * Throw an error for the calculation range being out of boundaries.
   *
   * @private
   */
  throwOutOfBoundsWarning() {
    console.warn('One of the  Column Summary plugins\' destination points you provided is beyond the table boundaries!');
  }
}

export {Endpoints};
