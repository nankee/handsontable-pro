describe('FormulaCollection', function() {
  var id = 'testContainer';

  function getFormulaCollection() {
    return handsontable({filters: true}).getPlugin('filters').formulaCollection;
  }

  beforeEach(function() {
    this.$container = $('<div id="' + id + '"></div>').appendTo('body');
  });

  afterEach(function () {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  it('should be initialized and accessible from the plugin', function() {
    var formulaCollection = getFormulaCollection();

    expect(formulaCollection).toBeDefined();
  });

  it('should create empty bucket for formulas and empty orderStack', function() {
    var formulaCollection = getFormulaCollection();

    expect(formulaCollection.formulas).toEqual({});
    expect(formulaCollection.orderStack).toEqual([]);
  });

  describe('isEmpty', function() {
    it('should return `true` when order stack is equal to 0', function() {
      var formulaCollection = getFormulaCollection();

      expect(formulaCollection.isEmpty()).toBe(true);

      formulaCollection.orderStack.push(1);

      expect(formulaCollection.isEmpty()).toBe(false);
    });
  });

  describe('isMatch', function() {
    it('should check is value is matched to the formulas at specified column index', function() {
      var formulaCollection = getFormulaCollection();
      var formulaMock = {};

      spyOn(formulaCollection, 'isMatchInFormulas').andReturn(true);
      spyOn(formulaCollection, 'getFormulas').andReturn(formulaMock);

      var result = formulaCollection.isMatch('foo', 3);

      expect(formulaCollection.getFormulas).toHaveBeenCalledWith(3);
      expect(formulaCollection.isMatchInFormulas).toHaveBeenCalledWith(formulaMock, 'foo');
      expect(result).toBe(true);
    });

    it('should check is value is matched to the formulas for all columns', function() {
      var formulaCollection = getFormulaCollection();
      var formulaMock = {};
      var formulaMock2 = {};

      formulaCollection.formulas['3'] = [formulaMock];
      formulaCollection.formulas['13'] = [formulaMock2];

      spyOn(formulaCollection, 'isMatchInFormulas').andReturn(true);
      spyOn(formulaCollection, 'getFormulas').andReturn(formulaMock);

      var result = formulaCollection.isMatch('foo');

      expect(formulaCollection.getFormulas).not.toHaveBeenCalled();
      expect(formulaCollection.isMatchInFormulas.calls[0].args).toEqual([[formulaMock], 'foo']);
      expect(formulaCollection.isMatchInFormulas.calls[1].args).toEqual([[formulaMock2], 'foo']);
      expect(result).toBe(true);
    });

    it('should break checking value when current formula is not matched to the rules', function() {
      var formulaCollection = getFormulaCollection();
      var formulaMock = {};
      var formulaMock2 = {};

      formulaCollection.formulas['3'] = [formulaMock];
      formulaCollection.formulas['13'] = [formulaMock2];

      spyOn(formulaCollection, 'isMatchInFormulas').andReturn(false);
      spyOn(formulaCollection, 'getFormulas').andReturn(formulaMock);

      var result = formulaCollection.isMatch('foo');

      expect(formulaCollection.getFormulas).not.toHaveBeenCalled();
      expect(formulaCollection.isMatchInFormulas.calls.length).toBe(1);
      expect(formulaCollection.isMatchInFormulas.calls[0].args).toEqual([[formulaMock], 'foo']);
      expect(result).toBe(false);
    });
  });

  describe('isMatchInFormulas', function() {
    it('should check if array of formulas is matched to the value', function() {
      var formulaCollection = getFormulaCollection();
      var formulaMock = {func: function() {return true}};
      var formulaMock2 = {func: function() {return true}};

      spyOn(formulaMock, 'func').andCallThrough();
      spyOn(formulaMock2, 'func').andCallThrough();

      var result = formulaCollection.isMatchInFormulas([formulaMock, formulaMock2], 'foo');

      expect(formulaMock.func.calls.length).toBe(1);
      expect(formulaMock.func).toHaveBeenCalledWith('foo');
      expect(formulaMock2.func.calls.length).toBe(1);
      expect(formulaMock2.func).toHaveBeenCalledWith('foo');
      expect(result).toBe(true);
    });

    it('should break checking value when formula is not matched to the value', function() {
      var formulaCollection = getFormulaCollection();
      var formulaMock = {func: function() {return false}};
      var formulaMock2 = {func: function() {return true}};

      spyOn(formulaMock, 'func').andCallThrough();
      spyOn(formulaMock2, 'func').andCallThrough();

      var result = formulaCollection.isMatchInFormulas([formulaMock, formulaMock2], 'foo');

      expect(formulaMock.func.calls.length).toBe(1);
      expect(formulaMock.func).toHaveBeenCalledWith('foo');
      expect(formulaMock2.func.calls.length).toBe(0);
      expect(result).toBe(false);
    });
  });

  describe('addFormula', function() {
    it('should add column index to the orderStack without duplicate values', function() {
      var formulaCollection = getFormulaCollection();
      var formulaMock = {args: [], command: {key: 'eq'}};

      formulaCollection.addFormula(3, formulaMock);
      formulaCollection.addFormula(3, formulaMock);
      formulaCollection.addFormula(3, formulaMock);

      expect(formulaCollection.orderStack).toEqual([3]);
    });

    it('should add formula to the collection at specified column index.', function() {
      var formulaCollection = getFormulaCollection();
      var formulaMock = {args: [1], command: {key: 'eq'}};
      var formulaFn = function() {};

      formulaCollection.addFormula(3, formulaMock);

      expect(formulaCollection.formulas['3'].length).toBe(1);
      expect(formulaCollection.formulas['3'][0].name).toEqual('eq');
      expect(formulaCollection.formulas['3'][0].func).toBeFunction();
    });

    it('should replace formula under the same name and column index.', function() {
      var formulaCollection = getFormulaCollection();
      var formulaMock = {args: [1], command: {key: 'eq'}};
      var formulaMock2 = {args: [2], command: {key: 'eq'}};

      formulaCollection.addFormula(3, formulaMock);
      var previousFunction = formulaCollection.formulas['3'][0].func;
      formulaCollection.addFormula(3, formulaMock2);

      expect(formulaCollection.formulas['3'].length).toBe(1);
      expect(formulaCollection.formulas['3'][0].name).toEqual('eq');
      expect(formulaCollection.formulas['3'][0].func).not.toBe(previousFunction);
    });
  });

  describe('getFormulas', function() {
    it('should return formulas at specified index otherwise should return empty array', function() {
      var formulaCollection = getFormulaCollection();
      var formulaMock = {};

      formulaCollection.formulas['3'] = [formulaMock];

      expect(formulaCollection.getFormulas(2)).toEqual([]);
      expect(formulaCollection.getFormulas(3)).toEqual([formulaMock]);
    });
  });

  describe('removeFormulas', function() {
    it('should remove formula from collection and column index from orderStack', function() {
      var formulaCollection = getFormulaCollection();
      var formulaMock = {};

      spyOn(formulaCollection, 'clearFormulas');
      formulaCollection.orderStack = [3];
      formulaCollection.formulas['3'] = [formulaMock];

      formulaCollection.removeFormulas(3);

      expect(formulaCollection.orderStack).toEqual([]);
      expect(formulaCollection.clearFormulas).toHaveBeenCalledWith(3);
    });
  });

  describe('clearFormulas', function() {
    it('should clear all formulas at specified column index', function() {
      var formulaCollection = getFormulaCollection();
      var formulasMock = [{}, {}];

      spyOn(formulaCollection, 'getFormulas').andReturn(formulasMock);

      formulaCollection.clearFormulas(3);

      expect(formulaCollection.getFormulas).toHaveBeenCalledWith(3);
      expect(formulasMock.length).toBe(0);
    });
  });

  describe('hasFormulas', function() {
    it('should return `true` if at specified column index formula were found', function() {
      var formulaCollection = getFormulaCollection();
      var formulasMock = [{}, {}];

      spyOn(formulaCollection, 'getFormulas').andReturn(formulasMock);

      var result = formulaCollection.hasFormulas(3);

      expect(formulaCollection.getFormulas).toHaveBeenCalledWith(3);
      expect(result).toBe(true);
    });

    it('should return `false` if at specified column index no formulas were found', function() {
      var formulaCollection = getFormulaCollection();
      var formulasMock = [];

      spyOn(formulaCollection, 'getFormulas').andReturn(formulasMock);

      var result = formulaCollection.hasFormulas(3);

      expect(formulaCollection.getFormulas).toHaveBeenCalledWith(3);
      expect(result).toBe(false);
    });

    it('should return `true` if at specified column index formula were found under its name', function() {
      var formulaCollection = getFormulaCollection();
      var formulasMock = [{name: 'lte'}, {name: 'eq'}];

      spyOn(formulaCollection, 'getFormulas').andReturn(formulasMock);

      var result = formulaCollection.hasFormulas(3, 'eq');

      expect(formulaCollection.getFormulas).toHaveBeenCalledWith(3);
      expect(result).toBe(true);
    });

    it('should return `false` if at specified column index no formulas were found under its name', function() {
      var formulaCollection = getFormulaCollection();
      var formulasMock = [{name: 'lte'}, {name: 'eq'}];

      spyOn(formulaCollection, 'getFormulas').andReturn(formulasMock);

      var result = formulaCollection.hasFormulas(3, 'between');

      expect(formulaCollection.getFormulas).toHaveBeenCalledWith(3);
      expect(result).toBe(false);
    });
  });

  describe('clear', function() {
    it('should clear formula collection and orderStack', function() {
      var formulaCollection = getFormulaCollection();

      formulaCollection.formulas = {0: []};
      formulaCollection.formulas = [1, 2, 3, 4];

      formulaCollection.clear();

      expect(formulaCollection.formulas).toEqual({});
      expect(formulaCollection.orderStack.length).toBe(0);
    });
  });

  describe('destroy', function() {
    it('should nullable all properties', function() {
      var formulaCollection = getFormulaCollection();

      formulaCollection.formulas = {0: []};
      formulaCollection.formulas = [1, 2, 3, 4];

      formulaCollection.destroy();

      expect(formulaCollection.formulas).toBeNull();
      expect(formulaCollection.orderStack).toBeNull();
    });
  });
});
