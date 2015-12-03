describe('registerFormula', function() {
  var registerer = Handsontable.utils.FiltersFormulaRegisterer;

  it('should register formula function under its name', function() {
    var formulaMock = function() {};

    expect(registerer.formulas['my_formula']).not.toBeDefined();

    registerer.registerFormula('my_formula', formulaMock);

    expect(registerer.formulas['my_formula']).toBe(formulaMock);
  });

  it('should overwrite formula under the same name', function() {
    var formulaMockOrg = function() {};
    var formulaMock = function() {};

    registerer.formulas['my_formula'] = formulaMockOrg;
    expect(registerer.formulas['my_formula']).toBe(formulaMockOrg);

    registerer.registerFormula('my_formula', formulaMock);

    expect(registerer.formulas['my_formula']).toBe(formulaMock);
  });
});

describe('getFormula', function() {
  var registerer = Handsontable.utils.FiltersFormulaRegisterer;

  it('should return formula as a closure', function() {
    var formulaMock = function() {};

    registerer.formulas['my_formula'] = formulaMock;

    var formula = registerer.getFormula('my_formula');

    expect(formula).toBeFunction();
  });

  it('should throw exception if formula not exists', function() {
    var formula = registerer.getFormula('my_formula');

    expect(function() {
      formula();
    }).toThrow();
  });

  it('should return `true`', function() {
    var formulaMock = jasmine.createSpy();
    var dataRow = {
      meta: {instance: {}},
      value: 'foo',
    };

    formulaMock.andReturn(true);
    registerer.formulas['my_formula'] = formulaMock;

    var formula = registerer.getFormula('my_formula', 'baz')(dataRow);

    expect(formulaMock).toHaveBeenCalledWith(dataRow, 'baz');
    expect(formula).toBe(true);
  });
});

