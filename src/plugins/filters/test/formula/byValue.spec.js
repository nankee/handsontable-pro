describe('Filters formula (`by_value`)', function() {
  it('should filter matching values', function() {
    var formula = getFilterFormula('by_value');
    var data = dateRowFactory();

    expect(formula(data(4), [[4]])).toBe(true);
    expect(formula(data(4), [[4, 4]])).toBe(true);
    expect(formula(data(4), [[1, 2, 3, 4, 5, 6, 7, 8]])).toBe(true);
    expect(formula(data('4'), [['5', '4']])).toBe(true);
    expect(formula(data('2015'), [['2019', '2014', '2015']])).toBe(true);
    expect(formula(data('foo'), [['foo', 'bar', 'baz']])).toBe(true);
    expect(formula(data(-1), [[-9, -3, -1]])).toBe(true);
  });

  it('should filter not matching values', function() {
    var formula = getFilterFormula('by_value');
    var data = dateRowFactory();

    expect(formula(data(4), [[1, 9]])).toBe(false);
    expect(formula(data(4), [[1, 1, 2, 3, 4.8]])).toBe(false);
    expect(formula(data(4), [[1, 2, 3, 5, 6, 7, 8]])).toBe(false);
    expect(formula(data('4'), [['5', '4:)']])).toBe(false);
    expect(formula(data('2015'), [['2019.', '2014.', '2015.']])).toBe(false);
    expect(formula(data('foo'), [['fooo', 'bar', 'baz']])).toBe(false);
    expect(formula(data(-1), [[-9, -3, -1.1]])).toBe(false);
  });
});
