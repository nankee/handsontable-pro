import {rangeEach} from 'handsontable/helpers/number';

export function hideRowItem(hiddenRowsPlugin) {
  return {
    key: 'hidden_rows_hide',
    name: 'Hide row',
    callback: function() {
      let {from, to} = this.getSelectedRange();
      let start = from.row;
      let end = to.row;

      if (end < start) {
        start = to.row;
        end = from.row;
      }

      rangeEach(start, end, (i) => hiddenRowsPlugin.hideRow(i));

      this.render();
      this.view.wt.wtOverlays.adjustElementsSize(true);

    },
    disabled: false,
    hidden: function() {
      return !this.selection.selectedHeader.rows;
    }
  };
}
