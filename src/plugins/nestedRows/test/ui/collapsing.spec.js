describe('NestedRows Collapsing UI', function() {
  var id = 'testContainer';

  beforeEach(function() {
    this.$container = $('<div id="' + id + '"></div>').appendTo('body');
    this.complexData = function() { return getNestedData() };
  });

  afterEach(function() {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  describe("API", function() {
    describe('collapseChildren', function() {
      it('should collapse all children nodes of the row provided as a number', function() {
        var hot = handsontable({
          data: this.complexData(),
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var trimRowsPlugin = hot.getPlugin('trimRows');

        for (var i = 0; i < plugin.dataManager.countChildren(0); i++) {
          expect(trimRowsPlugin.isTrimmed(i + 1)).toEqual(false);
        }

        plugin.collapsingUI.collapseChildren(0);

        expect(trimRowsPlugin.isTrimmed(0)).toEqual(false);

        for (var i = 0; i < plugin.dataManager.countChildren(0); i++) {
          expect(trimRowsPlugin.isTrimmed(i + 1)).toEqual(true);
        }

        expect(trimRowsPlugin.isTrimmed(plugin.dataManager.countChildren(0) + 2)).toEqual(false);
      });

      it('should collapse all children nodes of the row provided as an object', function() {
        var hot = handsontable({
          data: this.complexData(),
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var trimRowsPlugin = hot.getPlugin('trimRows');
        var child = hot.getSourceData()[0];

        for (var i = 0; i < plugin.dataManager.countChildren(0); i++) {
          expect(trimRowsPlugin.isTrimmed(i + 1)).toEqual(false);
        }

        plugin.collapsingUI.collapseChildren(child);

        expect(trimRowsPlugin.isTrimmed(0)).toEqual(false);

        for (var i = 0; i < plugin.dataManager.countChildren(0); i++) {
          expect(trimRowsPlugin.isTrimmed(i + 1)).toEqual(true);
        }

        expect(trimRowsPlugin.isTrimmed(plugin.dataManager.countChildren(0) + 2)).toEqual(false);
      });
    });

    describe('expandChildren', function() {
      it('should collapse all children nodes of the row provided as a number', function() {
        var hot = handsontable({
          data: this.complexData(),
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var trimRowsPlugin = hot.getPlugin('trimRows');

        plugin.collapsingUI.collapseChildren(0);
        plugin.collapsingUI.expandChildren(0);

        for (var i = 0; i < plugin.dataManager.countChildren(0); i++) {
          expect(trimRowsPlugin.isTrimmed(i + 1)).toEqual(false);
        }
      });

      it('should collapse all children nodes of the row provided as an object', function() {
        var hot = handsontable({
          data: this.complexData(),
          nestedRows: true,
        });

        var plugin = hot.getPlugin('nestedRows');
        var trimRowsPlugin = hot.getPlugin('trimRows');
        var child = hot.getSourceData()[0];

        plugin.collapsingUI.collapseChildren(0);
        plugin.collapsingUI.expandChildren(0);

        for (var i = 0; i < plugin.dataManager.countChildren(0); i++) {
          expect(trimRowsPlugin.isTrimmed(i + 1)).toEqual(false);
        }
      });
    });

    describe('expandRows', function() {
      it("Should make the rows provided in the arguments visible", function() {
        var hot = handsontable({
          data: this.complexData(),
          nestedRows: true,
          rowHeaders: true,
          trimRows: [1, 2, 3, 4], // "collapse" rows using the trimRows plugin
        });

        expect(hot.countRows()).toEqual(8);

        var plugin = hot.getPlugin('nestedRows');
        plugin.collapsingUI.expandRows([2]);
        hot.render();

        waits(100);

        runs(function() {
          expect(hot.countRows()).toEqual(11);
        });

      });
    });

    describe('expandChildren', function() {
      it("Should make the child rows of the provided element visible", function() {
        var hot = handsontable({
          data: this.complexData(),
          nestedRows: true,
          trimRows: [3, 4], // "collapse" rows using the trimRows plugin
        });

        expect(hot.countRows()).toEqual(10);

        var plugin = hot.getPlugin('nestedRows');
        plugin.collapsingUI.expandChildren(2);
        hot.render();

        waits(100);

        runs(function() {
          expect(hot.countRows()).toEqual(12);
        });

      });

      it("Should make the child rows of the provided element visible, even if some of them are already visible", function() {
        var hot = handsontable({
          data: this.complexData(),
          nestedRows: true,
          trimRows: [3, 4], // "collapse" rows using the trimRows plugin
        });

        expect(hot.countRows()).toEqual(10);

        var plugin = hot.getPlugin('nestedRows');
        plugin.collapsingUI.expandChildren(0);
        hot.render();

        waits(100);

        runs(function() {
          expect(hot.countRows()).toEqual(12);
        });

      });
    });

  });
});