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
    describe('getDataObject', function() {
      it('should return the data source object corresponding to the provided visual row number', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.dataManager.getDataObject(-5)).toEqual(null);
        expect(plugin.dataManager.getDataObject(0)).toEqual(this.complexData[0]);
        expect(plugin.dataManager.getDataObject(2)).toEqual(this.complexData[0].__children[1]);
        expect(plugin.dataManager.getDataObject(3)).toEqual(this.complexData[0].__children[1].__children[0]);
        expect(plugin.dataManager.getDataObject(5)).toEqual(this.complexData[0].__children[2]);
        expect(plugin.dataManager.getDataObject(10)).toEqual(this.complexData[2].__children[1].__children[0]);
        expect(plugin.dataManager.getDataObject(15)).toEqual(null);

      });
    });

    describe('getRowIndex', function() {
      it('should return a visual row index for the provided source data row object', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.dataManager.getRowIndex(this.complexData[0])).toEqual(0);
        expect(plugin.dataManager.getRowIndex(this.complexData[0].__children[1])).toEqual(2);
        expect(plugin.dataManager.getRowIndex(this.complexData[0].__children[1].__children[0])).toEqual(3);
        expect(plugin.dataManager.getRowIndex(this.complexData[0].__children[2])).toEqual(5);
        expect(plugin.dataManager.getRowIndex(this.complexData[2].__children[1].__children[0])).toEqual(10);

      });
    });

    describe('getRowIndexWithinParent', function() {
      it('should return an index of the provided source data row object withing its parent', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.dataManager.getRowIndexWithinParent(-5)).toEqual(-1);
        expect(plugin.dataManager.getRowIndexWithinParent(0)).toEqual(0);
        expect(plugin.dataManager.getRowIndexWithinParent(2)).toEqual(1);
        expect(plugin.dataManager.getRowIndexWithinParent(3)).toEqual(0);
        expect(plugin.dataManager.getRowIndexWithinParent(5)).toEqual(2);
        expect(plugin.dataManager.getRowIndexWithinParent(10)).toEqual(0);
        expect(plugin.dataManager.getRowIndexWithinParent(15)).toEqual(-1);

      });
    });

    describe('countAllRows', function() {
      it('should return a number of all row objects within the data set', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.dataManager.countAllRows()).toEqual(12);

      });
    });

    describe('countChildren', function() {
      it('should return a number of children (and children\'s children) of the row provided as an index', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.dataManager.countChildren(-5)).toEqual(0);
        expect(plugin.dataManager.countChildren(0)).toEqual(5);
        expect(plugin.dataManager.countChildren(2)).toEqual(2);
        expect(plugin.dataManager.countChildren(3)).toEqual(1);
        expect(plugin.dataManager.countChildren(5)).toEqual(0);
        expect(plugin.dataManager.countChildren(10)).toEqual(0);
        expect(plugin.dataManager.countChildren(15)).toEqual(0);

      });

      it('should return a number of children (and children\'s children) of the row provided as a row object from the data source', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.dataManager.countChildren(this.complexData[0])).toEqual(5);
        expect(plugin.dataManager.countChildren(this.complexData[0].__children[1])).toEqual(2);
        expect(plugin.dataManager.countChildren(this.complexData[0].__children[1].__children[0])).toEqual(1);
        expect(plugin.dataManager.countChildren(this.complexData[0].__children[2])).toEqual(0);
        expect(plugin.dataManager.countChildren(this.complexData[2].__children[1].__children[0])).toEqual(0);

      });
    });

    describe('getRowParent', function() {
      it('should return a row object from the data source, being the parent node for the provided row index', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.dataManager.getRowParent(-5)).toEqual(null);
        expect(plugin.dataManager.getRowParent(0)).toEqual(null);
        expect(plugin.dataManager.getRowParent(2)).toEqual(this.complexData[0]);
        expect(plugin.dataManager.getRowParent(3)).toEqual(this.complexData[0].__children[1]);
        expect(plugin.dataManager.getRowParent(5)).toEqual(this.complexData[0]);
        expect(plugin.dataManager.getRowParent(10)).toEqual(this.complexData[2].__children[1]);
        expect(plugin.dataManager.getRowParent(15)).toEqual(null);

      });

      it('should return a row object from the data source, being the parent node for the provided row object', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.dataManager.getRowParent(this.complexData[0])).toEqual(null);
        expect(plugin.dataManager.getRowParent(this.complexData[0].__children[1])).toEqual(this.complexData[0]);
        expect(plugin.dataManager.getRowParent(this.complexData[0].__children[1].__children[0])).toEqual(this.complexData[0].__children[1]);
        expect(plugin.dataManager.getRowParent(this.complexData[0].__children[2])).toEqual(this.complexData[0]);
        expect(plugin.dataManager.getRowParent(this.complexData[2].__children[1].__children[0])).toEqual(this.complexData[2].__children[1]);

      });
    });

    describe('getRowLevel', function() {
      it('should return the nesting level of the row, provided as an index', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.dataManager.getRowLevel(-5)).toEqual(null);
        expect(plugin.dataManager.getRowLevel(0)).toEqual(0);
        expect(plugin.dataManager.getRowLevel(2)).toEqual(1);
        expect(plugin.dataManager.getRowLevel(3)).toEqual(2);
        expect(plugin.dataManager.getRowLevel(5)).toEqual(1);
        expect(plugin.dataManager.getRowLevel(10)).toEqual(2);
        expect(plugin.dataManager.getRowLevel(15)).toEqual(null);

      });

      it('should return a row object from the data source, being the parent node for the provided row object', function() {
        var hot = handsontable({
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');

        expect(plugin.dataManager.getRowLevel(this.complexData[0])).toEqual(0);
        expect(plugin.dataManager.getRowLevel(this.complexData[0].__children[1])).toEqual(1);
        expect(plugin.dataManager.getRowLevel(this.complexData[0].__children[1].__children[0])).toEqual(2);
        expect(plugin.dataManager.getRowLevel(this.complexData[0].__children[2])).toEqual(1);
        expect(plugin.dataManager.getRowLevel(this.complexData[2].__children[1].__children[0])).toEqual(2);

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

        expect(plugin.dataManager.countChildren(2)).toEqual(2);

        expect(parentElement.__children[0].a).toEqual('a0-a1-a0');
        expect(parentElement.__children[1]).toBeUndefined();

        plugin.dataManager.addChild(parentElement);
        expect(plugin.dataManager.countChildren(2)).toEqual(3);

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

        expect(plugin.dataManager.countChildren(2)).toEqual(2);

        expect(parentElement.__children[0].a).toEqual('a0-a1-a0');
        expect(parentElement.__children[1]).toBeUndefined();

        plugin.dataManager.addChild(parentElement, newElement);
        expect(plugin.dataManager.countChildren(2)).toEqual(3);

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
        var grandparent = plugin.dataManager.getRowParent(parentElement) || this.complexData;
        var child = parentElement.__children[0];

        expect(parentElement.__children.length).toEqual(1);
        expect(grandparent.__children ? grandparent.__children.length :  this.complexData.length).toEqual(3);

        plugin.dataManager.detachFromParent(child);

        expect(parentElement.__children.length).toEqual(0);
        expect(grandparent.__children ? grandparent.__children.length :  this.complexData.length).toEqual(4);
        expect(grandparent.__children ? grandparent.__children[3] :  this.complexData[3]).toEqual(child);

        parentElement = this.complexData[2];
        grandparent = plugin.dataManager.getRowParent(parentElement) || this.complexData;
        child = parentElement.__children[1];

        expect(parentElement.__children.length).toEqual(2);
        expect(grandparent.__children ? grandparent.__children.length :  this.complexData.length).toEqual(3);

        plugin.dataManager.detachFromParent(child);

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
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var trimRowsPlugin = hot.getPlugin('trimRows');
        var child = this.complexData[0];

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
          data: this.complexData,
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
          data: this.complexData,
          nestedRows: true
        });

        var plugin = hot.getPlugin('nestedRows');
        var trimRowsPlugin = hot.getPlugin('trimRows');
        var child = this.complexData[0];

        plugin.collapsingUI.hideChildren(0);
        plugin.collapsingUI.showChildren(0);

        for (var i = 0; i < plugin.dataManager.countChildren(0); i++) {
          expect(trimRowsPlugin.isTrimmed(i + 1)).toEqual(false);
        }
      });
    });
  });

});