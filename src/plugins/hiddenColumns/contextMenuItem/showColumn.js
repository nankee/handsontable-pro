import {rangeEach} from 'handsontable/helpers/number';

export function showColumnItem() {
  const beforeHiddenColumns = [];
  const afterHiddenColumns = [];

  return {
    key: 'hidden_columns_show',
    name: 'Show column',
    callback: () => {
      let {from, to} = this.hot.getSelectedRange();
      let start = from.col;
      let end = to.col;

      if (end < start) {
        start = to.col;
        end = from.col;
      }

      if (start === end) {
        if (beforeHiddenColumns.length === start) {
          this.showColumns(beforeHiddenColumns);
          beforeHiddenColumns.length = 0;
        }
        if (afterHiddenColumns.length === this.hot.countCols() - (start + 1)) {
          this.showColumns(afterHiddenColumns);
          afterHiddenColumns.length = 0;
        }

      } else {
        rangeEach(start, end, (i) => this.showColumn(this.getLogicalColumnIndex(i)));
      }

      this.hot.render();
    },
    disabled: false,
    hidden: () => {
      if (!this.hiddenColumns.length) {
        return true;
      }

      if (!this.hot.selection.selectedHeader.cols) {
        return true;
      }

      beforeHiddenColumns.length = 0;
      afterHiddenColumns.length = 0;

      let {from, to} = this.hot.getSelectedRange();
      let start = from.col;
      let end = to.col;
      let hiddenInSelection = false;

      if (start === end) {
        let totalColumnLength = this.hot.countCols();

        rangeEach(0, totalColumnLength, (i) => {
          let partedHiddenLength = beforeHiddenColumns.length + afterHiddenColumns.length;

          if (partedHiddenLength === this.hiddenColumns.length) {
            return false;
          }

          if (i < start) {
            if (this.hiddenColumns.indexOf(this.getLogicalColumnIndex(i)) > -1) {
              beforeHiddenColumns.push(this.getLogicalColumnIndex(i));
            }
          } else {
            if (this.hiddenColumns.indexOf(this.getLogicalColumnIndex(i)) > -1) {
              afterHiddenColumns.push(this.getLogicalColumnIndex(i));
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
          if (this.isHidden(this.getLogicalColumnIndex(i))) {
            hiddenInSelection = true;

            return false;
          }
        });
      }

      return !hiddenInSelection;
    }
  };
}

