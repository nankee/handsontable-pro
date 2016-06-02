import {rangeEach} from 'handsontable/helpers/number';

export function showColumnItem(hiddenColumnsPlugin) {
  const beforeHiddenColumns = [];
  const afterHiddenColumns = [];

  return {
    key: 'hidden_columns_show',
    name: 'Show column',
    callback: function() {
      let {from, to} = this.getSelectedRange();
      let start = from.col;
      let end = to.col;

      if (end < start) {
        start = to.col;
        end = from.col;
      }

      if (start === end) {
        if (beforeHiddenColumns.length === start) {
          hiddenColumnsPlugin.showColumns(beforeHiddenColumns);
          beforeHiddenColumns.length = 0;
        }
        if (afterHiddenColumns.length === this.countCols() - (start + 1)) {
          hiddenColumnsPlugin.showColumns(afterHiddenColumns);
          afterHiddenColumns.length = 0;
        }

      } else {
        rangeEach(start, end, (i) => hiddenColumnsPlugin.showColumn(hiddenColumnsPlugin.getLogicalColumnIndex(i)));
      }

      this.render();
    },
    disabled: false,
    hidden: function() {
      if (!hiddenColumnsPlugin.hiddenColumns.length) {
        return true;
      }

      if (!this.selection.selectedHeader.cols) {
        return true;
      }

      beforeHiddenColumns.length = 0;
      afterHiddenColumns.length = 0;

      let {from, to} = this.getSelectedRange();
      let start = from.col;
      let end = to.col;
      let hiddenInSelection = false;

      if (start === end) {
        let totalColumnLength = this.countCols();

        rangeEach(0, totalColumnLength, (i) => {
          let partedHiddenLength = beforeHiddenColumns.length + afterHiddenColumns.length;

          if (partedHiddenLength === hiddenColumnsPlugin.hiddenColumns.length) {
            return false;
          }

          if (i < start) {
            if (hiddenColumnsPlugin.isHidden(hiddenColumnsPlugin.getLogicalColumnIndex(i))) {
              beforeHiddenColumns.push(hiddenColumnsPlugin.getLogicalColumnIndex(i));
            }
          } else {
            if (hiddenColumnsPlugin.isHidden(hiddenColumnsPlugin.getLogicalColumnIndex(i))) {
              afterHiddenColumns.push(hiddenColumnsPlugin.getLogicalColumnIndex(i));
            }
          }
        });

        totalColumnLength = totalColumnLength - 1;

        if ((beforeHiddenColumns.length === start && start > 0) ||
          (afterHiddenColumns.length === totalColumnLength - start && start < totalColumnLength)) {
          hiddenInSelection = true;
        }

      } else {
        if (end < start) {
          start = to.col;
          end = from.col;
        }

        rangeEach(start, end, (i) => {
          if (hiddenColumnsPlugin.isHidden(hiddenColumnsPlugin.getLogicalColumnIndex(i))) {
            hiddenInSelection = true;

            return false;
          }
        });
      }

      return !hiddenInSelection;
    }
  };
}

