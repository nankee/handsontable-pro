import {rangeEach} from 'handsontable/helpers/number';

export function showRowItem() {
  const beforeHiddenRows = [];
  const afterHiddenRows = [];

  return {
    key: 'hidden_rows_show',
    name: 'Show row',
    callback: () => {
      let {from, to} = this.hot.getSelectedRange();
      let start = Math.min(from.row, to.row);
      let end = Math.max(from.row, to.row);

      if (start === end) {
        if (beforeHiddenRows.length === start) {
          this.showRows(beforeHiddenRows);
          beforeHiddenRows.length = 0;
        }
        if (afterHiddenRows.length === this.hot.countSourceRows() - (start + 1)) {
          this.showRows(afterHiddenRows);
          afterHiddenRows.length = 0;
        }

      } else {
        rangeEach(start, end, (i) => this.showRow(i));
      }

      this.hot.render();
    },
    disabled: false,
    hidden: () => {
      if (!this.hiddenRows.length) {
        return true;
      }

      if (!this.hot.selection.selectedHeader.rows) {
        return true;
      }

      beforeHiddenRows.length = 0;
      afterHiddenRows.length = 0;

      let {from, to} = this.hot.getSelectedRange();
      let start = Math.min(from.row, to.row);
      let end = Math.max(from.row, to.row);

      let hiddenInSelection = false;

      if (start === end) {
        let totalRowsLength = this.hot.countSourceRows();

        rangeEach(0, totalRowsLength, (i) => {
          let partedHiddenLength = beforeHiddenRows.length + afterHiddenRows.length;

          if (partedHiddenLength === this.hiddenRows.length) {
            return false;
          }

          if (i < start) {
            if (this.hiddenRows.indexOf(i) > -1) {
              beforeHiddenRows.push(i);
            }
          } else {
            if (this.hiddenRows.indexOf(i) > -1) {
              afterHiddenRows.push(i);
            }
          }
        });

        totalRowsLength = totalRowsLength - 1;

        if ((beforeHiddenRows.length === start && start > 0) ||
          (afterHiddenRows.length === totalRowsLength - start && start < totalRowsLength)) {
          hiddenInSelection = true;
        }

      } else {
        start = Math.min(from.row, to.row);
        end = Math.max(from.row, to.row);

        rangeEach(start, end, (i) => {
          if (this.isHidden(i)) {
            hiddenInSelection = true;

            return false;
          }
        });
      }

      return !hiddenInSelection;
    }
  };
}
