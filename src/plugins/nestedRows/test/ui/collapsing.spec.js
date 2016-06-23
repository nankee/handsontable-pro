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
    describe('hideChildren', function() {
      it('should hide all children nodes of the row provided as a number', function() {
        var hot = handsontable({
          data: this.complexData(),
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var trimRowsPlugin = hot.getPlugin('trimRows');

        for (var i = 0; i < plugin.dataManager.countChildren(0); i++) {
          expect(trimRowsPlugin.isTrimmed(i + 1)).toEqual(false);
        }

        plugin.collapsingUI.hideChildren(0);

        expect(trimRowsPlugin.isTrimmed(0)).toEqual(false);

        for (var i = 0; i < plugin.dataManager.countChildren(0); i++) {
          expect(trimRowsPlugin.isTrimmed(i + 1)).toEqual(true);
        }

        expect(trimRowsPlugin.isTrimmed(plugin.dataManager.countChildren(0) + 2)).toEqual(false);
      });

      it('should hide all children nodes of the row provided as an object', function() {
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

        plugin.collapsingUI.hideChildren(child);

        expect(trimRowsPlugin.isTrimmed(0)).toEqual(false);

        for (var i = 0; i < plugin.dataManager.countChildren(0); i++) {
          expect(trimRowsPlugin.isTrimmed(i + 1)).toEqual(true);
        }

        expect(trimRowsPlugin.isTrimmed(plugin.dataManager.countChildren(0) + 2)).toEqual(false);
      });
    });

    describe('showChildren', function() {
      it('should hide all children nodes of the row provided as a number', function() {
        var hot = handsontable({
          data: this.complexData(),
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var trimRowsPlugin = hot.getPlugin('trimRows');

        plugin.collapsingUI.hideChildren(0);
        plugin.collapsingUI.showChildren(0);

        for (var i = 0; i < plugin.dataManager.countChildren(0); i++) {
          expect(trimRowsPlugin.isTrimmed(i + 1)).toEqual(false);
        }
      });

      it('should hide all children nodes of the row provided as an object', function() {
        var hot = handsontable({
          data: this.complexData(),
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var trimRowsPlugin = hot.getPlugin('trimRows');
        var child = hot.getSourceData()[0];

        plugin.collapsingUI.hideChildren(0);
        plugin.collapsingUI.showChildren(0);

        for (var i = 0; i < plugin.dataManager.countChildren(0); i++) {
          expect(trimRowsPlugin.isTrimmed(i + 1)).toEqual(false);
        }
      });
    });

    describe('showRows', function() {
      it("Should make the rows provided in the arguments visible", function() {
        var hot = handsontable({
          data: this.complexData(),
          nestedRows: true,
          trimRows: [1, 2, 3, 4], // "hide" rows using the trimRows plugin
        });

        expect(hot.countRows()).toEqual(8);

        var plugin = hot.getPlugin('nestedRows');
        plugin.collapsingUI.showRows([2]);
        hot.render();

        waits(100);

        runs(function() {
          expect(hot.countRows()).toEqual(11);
        });

      });
    });

    describe('showChildren', function() {
      it("Should make the child rows of the provided element visible", function() {
        var hot = handsontable({
          data: this.complexData(),
          nestedRows: true,
          trimRows: [3, 4], // "hide" rows using the trimRows plugin
        });

        expect(hot.countRows()).toEqual(10);

        var plugin = hot.getPlugin('nestedRows');
        plugin.collapsingUI.showChildren(2);
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
          trimRows: [3, 4], // "hide" rows using the trimRows plugin
        });

        expect(hot.countRows()).toEqual(10);

        var plugin = hot.getPlugin('nestedRows');
        plugin.collapsingUI.showChildren(0);
        hot.render();

        waits(100);

        runs(function() {
          expect(hot.countRows()).toEqual(12);
        });

      });
    });

  });
});