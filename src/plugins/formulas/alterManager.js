import {arrayEach} from 'handsontable/helpers/array';
import {mixin} from 'handsontable/helpers/object';
import {localHooks} from 'handsontable/mixins/localHooks';
import {CellValue} from './cell/value';
import {isFormulaExpression} from './utils';
import {ExpressionModifier} from './expressionModifier';

/**
 * @class AlterManager
 * @util
 */
class AlterManager {
  constructor(sheet) {
    /**
     * Instance of {@link Sheet}.
     *
     * @type {Sheet}
     */
    this.sheet = sheet;
    /**
     * Instance of {@link DataProvider}.
     *
     * @type {DataProvider}
     */
    this.dataProvider = sheet.dataProvider;
    /**
     * Instance of {@link Matrix}.
     *
     * @type {Matrix}
     */
    this.matrix = sheet.matrix;
  }

  /**
   * Insert row action.
   *
   * @param {Number} row Row index.
   * @param {Number} amount An amount of rows to add.
   * @param {Boolean} [modifyFormula=true] Indicate if alter operation should change formula expressions.
   */
  insertRow(row, amount, modifyFormula) {
    this._alter('insert', 'row', row, amount, modifyFormula);
  }

  /**
   * Remove row action.
   *
   * @param {Number} row Row index.
   * @param {Number} amount An amount of rows to remove.
   * @param {Boolean} [modifyFormula=true] Indicate if alter operation should change formula expressions.
   */
  removeRow(row, amount, modifyFormula) {
    this._alter('remove', 'row', row, -amount, modifyFormula);
  }

  /**
   * Insert column action.
   *
   * @param {Number} column Column index.
   * @param {Number} amount An amount of columns to add.
   * @param {Boolean} [modifyFormula=true] Indicates if alter operation should change formula expressions.
   */
  insertColumn(column, amount, modifyFormula) {
    this._alter('insert', 'column', column, amount, modifyFormula);
  }

  /**
   * Remove column action.
   *
   * @param {Number} column Column index.
   * @param {Number} amount An amount of columns to remove.
   * @param {Boolean} [modifyFormula=true] Indicate if alter operation should change formula expressions.
   */
  removeColumn(column, amount, modifyFormula) {
    this._alter('remove', 'column', column, -amount, modifyFormula);
  }

  /**
   * Alter sheet.
   *
   * @private
   * @param {String} action Action to perform.
   * @param {String} axis For what axis action will be performed (`row` or `column`).
   * @param {Number} start Index which from action will be applied.
   * @param {Number} amount An amount of items to add/remove.
   * @param {Boolean} [modifyFormula=true] Indicate if alter operation should change formula expressions.
   */
  _alter(action, axis, start, amount, modifyFormula = true) {
    const startCoord = (cell) => {
      return {
        row: axis === 'row' ? start : cell.row,
        column: axis === 'column' ? start : cell.column,
      };
    };
    const translateCellRefs = (row, column) => {
      arrayEach(this.matrix.cellReferences, (cell) => {
        if (cell[axis] >= start) {
          cell.translateTo(row, column);
        }
      });
    };

    const translate = [];
    const indexOffset = Math.abs(amount) - 1;

    if (axis === 'row') {
      translate.push(amount, 0);

    } else if (axis === 'column') {
      translate.push(0, amount);
    }

    if (action === 'remove') {
      let removedCellRef = this.matrix.removeCellRefsAtRange({[axis]: start}, {[axis]: start + indexOffset});
      let toRemove = [];

      arrayEach(this.matrix.data, (cell) => {
        arrayEach(removedCellRef, (cellRef) => {
          if (!cell.hasPrecedent(cellRef)) {
            return;
          }

          cell.removePrecedent(cellRef);
          cell.setState(CellValue.STATE_OUT_OFF_DATE);

          arrayEach(this.sheet.getCellDependencies(cell.row, cell.column), (cellValue) => {
            cellValue.setState(CellValue.STATE_OUT_OFF_DATE);
          });
        });

        if (cell[axis] >= start && cell[axis] <= (start + indexOffset)) {
          toRemove.push(cell);
        }
      });

      this.matrix.remove(toRemove);
    }

    translateCellRefs(...translate);

    arrayEach(this.matrix.data, (cell) => {
      const origRow = cell.row;
      const origColumn = cell.column;

      if (cell[axis] >= start) {
        cell.translateTo(...translate);
        cell.setState(CellValue.STATE_OUT_OFF_DATE);
      }

      if (modifyFormula) {
        const row = cell.row;
        const column = cell.column;
        const value = this.dataProvider.getSourceDataAtCell(row, column);

        if (isFormulaExpression(value)) {
          const expModifier = new ExpressionModifier(value);

          expModifier.translate(startCoord({row: origRow, column: origColumn}), {[axis]: amount});

          this.dataProvider.updateSourceData(row, column, expModifier.toString());
        }
      }
    });
    this.runLocalHooks('afterAlter', action, axis, start, amount);
  }

  /**
   * Destroy class.
   */
  destroy() {
    this.sheet = null;
    this.dataProvider = null;
    this.matrix = null;
  }
}

mixin(AlterManager, localHooks);

export {AlterManager};
