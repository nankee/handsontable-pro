import {clone} from 'handsontable/helpers/object';
import {arrayEach} from 'handsontable/helpers/array';
import {SEPARATOR} from 'handsontable/plugins/contextMenu/predefinedItems';

import {FORMULA_NAME as FORMULA_NONE} from './formula/none';
import {FORMULA_NAME as FORMULA_EMPTY} from './formula/empty';
import {FORMULA_NAME as FORMULA_NOT_EMPTY} from './formula/notEmpty';
import {FORMULA_NAME as FORMULA_EQUAL} from './formula/equal';
import {FORMULA_NAME as FORMULA_NOT_EQUAL} from './formula/notEqual';
import {FORMULA_NAME as FORMULA_GREATER_THAN} from './formula/greaterThan';
import {FORMULA_NAME as FORMULA_GREATER_THAN_OR_EQUAL} from './formula/greaterThanOrEqual';
import {FORMULA_NAME as FORMULA_LESS_THAN} from './formula/lessThan';
import {FORMULA_NAME as FORMULA_LESS_THAN_OR_EQUAL} from './formula/lessThanOrEqual';
import {FORMULA_NAME as FORMULA_BETWEEN} from './formula/between';
import {FORMULA_NAME as FORMULA_NOT_BETWEEN} from './formula/notBetween';
import {FORMULA_NAME as FORMULA_BEGINS_WITH} from './formula/beginsWith';
import {FORMULA_NAME as FORMULA_ENDS_WITH} from './formula/endsWith';
import {FORMULA_NAME as FORMULA_CONTAINS} from './formula/contains';
import {FORMULA_NAME as FORMULA_NOT_CONTAINS} from './formula/notContains';
import {FORMULA_NAME as FORMULA_DATE_BEFORE} from './formula/date/before';
import {FORMULA_NAME as FORMULA_DATE_AFTER} from './formula/date/after';
import {FORMULA_NAME as FORMULA_TOMORROW} from './formula/date/tomorrow';
import {FORMULA_NAME as FORMULA_TODAY} from './formula/date/today';
import {FORMULA_NAME as FORMULA_YESTERDAY} from './formula/date/yesterday';
import {FORMULA_NAME as FORMULA_BY_VALUE} from './formula/byValue';

export {
  FORMULA_NONE,
  FORMULA_EMPTY,
  FORMULA_NOT_EMPTY,
  FORMULA_EQUAL,
  FORMULA_NOT_EQUAL,
  FORMULA_GREATER_THAN,
  FORMULA_GREATER_THAN_OR_EQUAL,
  FORMULA_LESS_THAN,
  FORMULA_LESS_THAN_OR_EQUAL,
  FORMULA_BETWEEN,
  FORMULA_NOT_BETWEEN,
  FORMULA_BEGINS_WITH,
  FORMULA_ENDS_WITH,
  FORMULA_CONTAINS,
  FORMULA_NOT_CONTAINS,
  FORMULA_DATE_BEFORE,
  FORMULA_DATE_AFTER,
  FORMULA_TOMORROW,
  FORMULA_TODAY,
  FORMULA_YESTERDAY,
  FORMULA_BY_VALUE
};

export const TYPE_NUMERIC = 'numeric';
export const TYPE_TEXT = 'text';
export const TYPE_DATE = 'date';
/**
 * Default types and order for filter conditions.
 *
 * @type {Object}
 */
export const TYPES = {
  [TYPE_NUMERIC]: [
    FORMULA_NONE,
    SEPARATOR,
    FORMULA_EMPTY,
    FORMULA_NOT_EMPTY,
    SEPARATOR,
    FORMULA_EQUAL,
    FORMULA_NOT_EQUAL,
    SEPARATOR,
    FORMULA_GREATER_THAN,
    FORMULA_GREATER_THAN_OR_EQUAL,
    FORMULA_LESS_THAN,
    FORMULA_LESS_THAN_OR_EQUAL,
    FORMULA_BETWEEN,
    FORMULA_NOT_BETWEEN,
  ],
  [TYPE_TEXT]: [
    FORMULA_NONE,
    SEPARATOR,
    FORMULA_EMPTY,
    FORMULA_NOT_EMPTY,
    SEPARATOR,
    FORMULA_EQUAL,
    FORMULA_NOT_EQUAL,
    SEPARATOR,
    FORMULA_BEGINS_WITH,
    FORMULA_ENDS_WITH,
    SEPARATOR,
    FORMULA_CONTAINS,
    FORMULA_NOT_CONTAINS,
  ],
  [TYPE_DATE]: [
    FORMULA_NONE,
    SEPARATOR,
    FORMULA_EMPTY,
    FORMULA_NOT_EMPTY,
    SEPARATOR,
    FORMULA_EQUAL,
    FORMULA_NOT_EQUAL,
    SEPARATOR,
    FORMULA_DATE_BEFORE,
    FORMULA_DATE_AFTER,
    FORMULA_BETWEEN,
    SEPARATOR,
    FORMULA_TOMORROW,
    FORMULA_TODAY,
    FORMULA_YESTERDAY,
  ],
};

/**
 * Get options list for conditional filter by data type (e.q: `'text'`, `'numeric'`, `'date'`).
 *
 * @returns {Object}
 */
export function getOptionsList(type) {
  const items = [];

  if (!TYPES[type]) {
    type = TYPE_TEXT;
  }
  arrayEach(TYPES[type], (type) => {
    let option = clone(_selectOptions[type]);

    items.push(option);
  });

  return items;
}

const _selectOptions = {
  [SEPARATOR]: {
    name: SEPARATOR,
  },
  [FORMULA_NONE]: {
    key: FORMULA_NONE,
    name: 'None',
    inputsCount: 0,
  },
  [FORMULA_EMPTY]: {
    key: FORMULA_EMPTY,
    name: 'Is empty',
    inputsCount: 0,
  },
  [FORMULA_NOT_EMPTY]: {
    key: FORMULA_NOT_EMPTY,
    name: 'Is not empty',
    inputsCount: 0,
  },
  [FORMULA_EQUAL]: {
    key: FORMULA_EQUAL,
    name: 'Is equal to',
    inputsCount: 1,
  },
  [FORMULA_NOT_EQUAL]: {
    key: FORMULA_NOT_EQUAL,
    name: 'Is not equal to',
    inputsCount: 1,
  },
  [FORMULA_GREATER_THAN]: {
    key: FORMULA_GREATER_THAN,
    name: 'Greater than',
    inputsCount: 1,
  },
  [FORMULA_GREATER_THAN_OR_EQUAL]: {
    key: FORMULA_GREATER_THAN_OR_EQUAL,
    name: 'Greater than or equal to',
    inputsCount: 1,
  },
  [FORMULA_LESS_THAN]: {
    key: FORMULA_LESS_THAN,
    name: 'Less than',
    inputsCount: 1,
  },
  [FORMULA_LESS_THAN_OR_EQUAL]: {
    key: FORMULA_LESS_THAN_OR_EQUAL,
    name: 'Less than or equal to',
    inputsCount: 1,
  },
  [FORMULA_BETWEEN]: {
    key: FORMULA_BETWEEN,
    name: 'Is between',
    inputsCount: 2,
  },
  [FORMULA_NOT_BETWEEN]: {
    key: FORMULA_NOT_BETWEEN,
    name: 'Is not between',
    inputsCount: 2,
  },
  [FORMULA_BEGINS_WITH]: {
    key: FORMULA_BEGINS_WITH,
    name: 'Begins with',
    inputsCount: 1,
  },
  [FORMULA_ENDS_WITH]: {
    key: FORMULA_ENDS_WITH,
    name: 'Ends with',
    inputsCount: 1,
  },
  [FORMULA_CONTAINS]: {
    key: FORMULA_CONTAINS,
    name: 'Contains',
    inputsCount: 1,
  },
  [FORMULA_NOT_CONTAINS]: {
    key: FORMULA_NOT_CONTAINS,
    name: 'Does not contain',
    inputsCount: 1,
  },
  [FORMULA_DATE_BEFORE]: {
    key: FORMULA_DATE_BEFORE,
    name: 'Before',
    inputsCount: 1,
  },
  [FORMULA_DATE_AFTER]: {
    key: FORMULA_DATE_AFTER,
    name: 'After',
    inputsCount: 1,
  },
  [FORMULA_TOMORROW]: {
    key: FORMULA_TOMORROW,
    name: 'Tomorrow',
    inputsCount: 0,
  },
  [FORMULA_TODAY]: {
    key: FORMULA_TODAY,
    name: 'Today',
    inputsCount: 0,
  },
  [FORMULA_YESTERDAY]: {
    key: FORMULA_YESTERDAY,
    name: 'Yesterday',
    inputsCount: 0,
  },
};
