describe('NestedRows', function() {
  var id = 'testContainer';

  beforeEach(function() {
    this.$container = $('<div id="' + id + '"></div>').appendTo('body');
    this.complexData = [
      {
        a: 'a0',
        b: 'b0',
        __children: [
          {
            a: 'a0-a0',
            b: 'b0-b0'
          },
          {
            a: 'a0-a1',
            b: 'b0-b1',
            __children: [
              {
                a: 'a0-a1-a0',
                b: 'b0-b1-b0',
                __children: [
                  {
                    a: 'a0-a1-a0-a0',
                    b: 'b0-b1-b0-b0'
                  }
                ]
              }
            ]
          },
          {
            a: 'a0-a2',
            b: 'b0-b2'
          }
        ]
      },
      {
        a: 'a1',
        b: 'b1'
      },
      {
        a: 'a2',
        b: 'b2',
        __children: [
          {
            a: 'a2-a0',
            b: 'b2-b0',
            __children: []
          },
          {
            a: 'a2-a1',
            b: 'b2-b1',
            __children: [
              {
                a: 'a2-a1-a0',
                b: 'b2-b1-b0',
                __children: []
              },
              {
                a: 'a2-a1-a1',
                b: 'b2-b1-b1'
              }
            ]
          }
        ]
      }
    ];
  });

  afterEach(function() {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  describe('Displaying a nested structure', function() {
    it('should display as many rows as there are overall elements in a nested structure', function() {
      var hot = handsontable({
        data: this.complexData,
        nestedRows: true
      });

      expect(hot.countRows()).toEqual(12);
    });

    it('should display all nested structure elements in correct order (parent, its children, its children children, next parent etc)', function() {
      var hot = handsontable({
        data: this.complexData,
        nestedRows: true
      });

      var dataInOrder = [
        ['a0', 'b0'],
        ['a0-a0', 'b0-b0'],
        ['a0-a1', 'b0-b1'],
        ['a0-a1-a0', 'b0-b1-b0'],
        ['a0-a1-a0-a0', 'b0-b1-b0-b0'],
        ['a0-a2', 'b0-b2'],
        ['a1', 'b1'],
        ['a2', 'b2'],
        ['a2-a0', 'b2-b0'],
        ['a2-a1', 'b2-b1'],
        ['a2-a1-a0', 'b2-b1-b0'],
        ['a2-a1-a1', 'b2-b1-b1']
      ];

      expect(hot.getData()).toEqual(dataInOrder);
    });
  });

  describe('API', function() {
    describe('getVisualRowObject', function() {
      it('should return the data source object corresponding to the provided visual row number', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.getVisualRowObject(-5)).toEqual(null);
        expect(plugin.getVisualRowObject(0)).toEqual(this.complexData[0]);
        expect(plugin.getVisualRowObject(2)).toEqual(this.complexData[0].__children[1]);
        expect(plugin.getVisualRowObject(3)).toEqual(this.complexData[0].__children[1].__children[0]);
        expect(plugin.getVisualRowObject(5)).toEqual(this.complexData[0].__children[2]);
        expect(plugin.getVisualRowObject(10)).toEqual(this.complexData[2].__children[1].__children[0]);
        expect(plugin.getVisualRowObject(15)).toEqual(null);

      });
    });

    describe('getRowIndex', function() {
      it('should return a visual row index for the provided source data row object', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.getRowIndex(this.complexData[0])).toEqual(0);
        expect(plugin.getRowIndex(this.complexData[0].__children[1])).toEqual(2);
        expect(plugin.getRowIndex(this.complexData[0].__children[1].__children[0])).toEqual(3);
        expect(plugin.getRowIndex(this.complexData[0].__children[2])).toEqual(5);
        expect(plugin.getRowIndex(this.complexData[2].__children[1].__children[0])).toEqual(10);

      });
    });

    describe('getRowIndexWithinParent', function() {
      it('should return an index of the provided source data row object withing its parent', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.getRowIndexWithinParent(-5)).toEqual(-1);
        expect(plugin.getRowIndexWithinParent(0)).toEqual(0);
        expect(plugin.getRowIndexWithinParent(2)).toEqual(1);
        expect(plugin.getRowIndexWithinParent(3)).toEqual(0);
        expect(plugin.getRowIndexWithinParent(5)).toEqual(2);
        expect(plugin.getRowIndexWithinParent(10)).toEqual(0);
        expect(plugin.getRowIndexWithinParent(15)).toEqual(-1);

      });
    });

    describe('countAllRows', function() {
      it('should return a number of all row objects within the data set', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.countAllRows()).toEqual(12);

      });
    });

    describe('countChildren', function() {
      it('should return a number of children (and children\'s children) of the row provided as an index', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.countChildren(-5)).toEqual(0);
        expect(plugin.countChildren(0)).toEqual(5);
        expect(plugin.countChildren(2)).toEqual(2);
        expect(plugin.countChildren(3)).toEqual(1);
        expect(plugin.countChildren(5)).toEqual(0);
        expect(plugin.countChildren(10)).toEqual(0);
        expect(plugin.countChildren(15)).toEqual(0);

      });

      it('should return a number of children (and children\'s children) of the row provided as a row object from the data source', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.countChildren(this.complexData[0])).toEqual(5);
        expect(plugin.countChildren(this.complexData[0].__children[1])).toEqual(2);
        expect(plugin.countChildren(this.complexData[0].__children[1].__children[0])).toEqual(1);
        expect(plugin.countChildren(this.complexData[0].__children[2])).toEqual(0);
        expect(plugin.countChildren(this.complexData[2].__children[1].__children[0])).toEqual(0);

      });
    });

    describe('getRowParent', function() {
      it('should return a row object from the data source, being the parent node for the provided row index', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.getRowParent(-5)).toEqual(null);
        expect(plugin.getRowParent(0)).toEqual(null);
        expect(plugin.getRowParent(2)).toEqual(this.complexData[0]);
        expect(plugin.getRowParent(3)).toEqual(this.complexData[0].__children[1]);
        expect(plugin.getRowParent(5)).toEqual(this.complexData[0]);
        expect(plugin.getRowParent(10)).toEqual(this.complexData[2].__children[1]);
        expect(plugin.getRowParent(15)).toEqual(null);

      });

      it('should return a row object from the data source, being the parent node for the provided row object', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.getRowParent(this.complexData[0])).toEqual(null);
        expect(plugin.getRowParent(this.complexData[0].__children[1])).toEqual(this.complexData[0]);
        expect(plugin.getRowParent(this.complexData[0].__children[1].__children[0])).toEqual(this.complexData[0].__children[1]);
        expect(plugin.getRowParent(this.complexData[0].__children[2])).toEqual(this.complexData[0]);
        expect(plugin.getRowParent(this.complexData[2].__children[1].__children[0])).toEqual(this.complexData[2].__children[1]);

      });
    });

    describe('getRowLevel', function() {
      it('should return the nesting level of the row, provided as an index', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.getRowLevel(-5)).toEqual(null);
        expect(plugin.getRowLevel(0)).toEqual(0);
        expect(plugin.getRowLevel(2)).toEqual(1);
        expect(plugin.getRowLevel(3)).toEqual(2);
        expect(plugin.getRowLevel(5)).toEqual(1);
        expect(plugin.getRowLevel(10)).toEqual(2);
        expect(plugin.getRowLevel(15)).toEqual(null);

      });

      it('should return a row object from the data source, being the parent node for the provided row object', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.getRowLevel(this.complexData[0])).toEqual(0);
        expect(plugin.getRowLevel(this.complexData[0].__children[1])).toEqual(1);
        expect(plugin.getRowLevel(this.complexData[0].__children[1].__children[0])).toEqual(2);
        expect(plugin.getRowLevel(this.complexData[0].__children[2])).toEqual(1);
        expect(plugin.getRowLevel(this.complexData[2].__children[1].__children[0])).toEqual(2);

      });
    });

    describe('addChild', function() {
      it('should add an empty child to the provided parent, when the second method arguments is not declared', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var parentElement = this.complexData[0].__children[1];

        expect(plugin.countChildren(2)).toEqual(2);

        expect(parentElement.__children[0].a).toEqual('a0-a1-a0');
        expect(parentElement.__children[1]).toBeUndefined();

        plugin.addChild(parentElement);
        expect(plugin.countChildren(2)).toEqual(3);

        expect(parentElement.__children[0].a).toEqual('a0-a1-a0');
        expect(parentElement.__children[1].a).toEqual(null);
      });

      it('should add a provided row element as a child to the provided parent', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var parentElement = this.complexData[0].__children[1];
        var newElement = {
          a: 'test-a',
          b: 'test-b'
        };

        expect(plugin.countChildren(2)).toEqual(2);

        expect(parentElement.__children[0].a).toEqual('a0-a1-a0');
        expect(parentElement.__children[1]).toBeUndefined();

        plugin.addChild(parentElement, newElement);
        expect(plugin.countChildren(2)).toEqual(3);

        expect(parentElement.__children[0].a).toEqual('a0-a1-a0');
        expect(parentElement.__children[1].a).toEqual('test-a');
        expect(parentElement.__children[1].b).toEqual('test-b');
      });

    });

    describe('detachFromParent', function() {
      it('should detach a child node from it\'s parent and re-attach it to the parent of it\'s parent', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var parentElement = this.complexData[0].__children[1];
        var grandparent = plugin.getRowParent(parentElement) || this.complexData;
        var child = parentElement.__children[0];

        expect(parentElement.__children.length).toEqual(1);
        expect(grandparent.__children ? grandparent.__children.length :  this.complexData.length).toEqual(3);

        plugin.detachFromParent(child);

        expect(parentElement.__children.length).toEqual(0);
        expect(grandparent.__children ? grandparent.__children.length :  this.complexData.length).toEqual(4);
        expect(grandparent.__children ? grandparent.__children[3] :  this.complexData[3]).toEqual(child);

        parentElement = this.complexData[2];
        grandparent = plugin.getRowParent(parentElement) || this.complexData;
        child = parentElement.__children[1];

        expect(parentElement.__children.length).toEqual(2);
        expect(grandparent.__children ? grandparent.__children.length :  this.complexData.length).toEqual(3);

        plugin.detachFromParent(child);

        expect(parentElement.__children.length).toEqual(1);
        expect(grandparent.__children ? grandparent.__children.length :  this.complexData.length).toEqual(4);
        expect(grandparent.__children ? grandparent.__children[3] :  this.complexData[3]).toEqual(child);
      });
    });

    describe('hideChildren', function() {
      it('should hide all children nodes of the row provided as a number', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var hiddenRowsPlugin = hot.getPlugin('hiddenRows');

        for (var i = 0; i < plugin.countChildren(0); i++) {
          expect(hiddenRowsPlugin.isHidden(i + 1)).toEqual(false);
        }

        plugin.hideChildren(0);

        expect(hiddenRowsPlugin.isHidden(0)).toEqual(false);

        for (var i = 0; i < plugin.countChildren(0); i++) {
          expect(hiddenRowsPlugin.isHidden(i + 1)).toEqual(true);
        }

        expect(hiddenRowsPlugin.isHidden(plugin.countChildren(0) + 2)).toEqual(false);
      });

      it('should hide all children nodes of the row provided as an object', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var hiddenRowsPlugin = hot.getPlugin('hiddenRows');
        var child = this.complexData[0];

        for (var i = 0; i < plugin.countChildren(0); i++) {
          expect(hiddenRowsPlugin.isHidden(i + 1)).toEqual(false);
        }

        plugin.hideChildren(child);

        expect(hiddenRowsPlugin.isHidden(0)).toEqual(false);

        for (var i = 0; i < plugin.countChildren(0); i++) {
          expect(hiddenRowsPlugin.isHidden(i + 1)).toEqual(true);
        }

        expect(hiddenRowsPlugin.isHidden(plugin.countChildren(0) + 2)).toEqual(false);
      });
    });

    describe('showChildren', function() {
      it('should hide all children nodes of the row provided as a number', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var hiddenRowsPlugin = hot.getPlugin('hiddenRows');

        plugin.hideChildren(0);
        plugin.showChildren(0);

        for (var i = 0; i < plugin.countChildren(0); i++) {
          expect(hiddenRowsPlugin.isHidden(i + 1)).toEqual(false);
        }
      });

      it('should hide all children nodes of the row provided as an object', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var hiddenRowsPlugin = hot.getPlugin('hiddenRows');
        var child = this.complexData[0];

        plugin.hideChildren(0);
        plugin.showChildren(0);

        for (var i = 0; i < plugin.countChildren(0); i++) {
          expect(hiddenRowsPlugin.isHidden(i + 1)).toEqual(false);
        }
      });
    });
  });

});