import {rangeEach} from 'handsontable/helpers/number';

export function hideColumnItem() {
  return {
    key: 'hidden_columns_hide',
    name: 'Hide column',
    callback: () => {
      let {from, to} = this.hot.getSelectedRange();
      let start = Math.min(from.col, to.col);
      let end = Math.max(from.col, to.col);

      rangeEach(start, end, (i) => this.hideColumn(this.getLogicalColumnIndex(i)));

      this.hot.render();
      this.hot.view.wt.wtOverlays.adjustElementsSize(true);

    },
    disabled: false,
    hidden: () => {
      return !this.hot.selection.selectedHeader.cols;
    }
  };
}
