import {rangeEach} from 'handsontable/helpers/number';

export function hideRowItem() {
  return {
    key: 'hidden_rows_hide',
    name: 'Hide row',
    callback: () => {
      let {from, to} = this.hot.getSelectedRange();
      let start = from.row;
      let end = to.row;

      if (end < start) {
        start = to.row;
        end = from.row;
      }

      rangeEach(start, end, (i) => this.hideRow(i));

      this.hot.render();
      this.hot.view.wt.wtOverlays.adjustElementsSize(true);

    },
    disabled: false,
    hidden: () => {
      return !this.hot.selection.selectedHeader.rows;
    }
  };
}
