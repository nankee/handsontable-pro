describe('Formulas expression modifier', function() {
  var id = 'testContainer';
  var modifier;

  beforeEach(function() {
    this.$container = $('<div id="' + id + '"></div>').appendTo('body');
    modifier = new Handsontable.utils.FormulasUtils.ExpressionModifier();
  });

  afterEach(function () {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
    modifier = null;
  });

  it('should correctly process formula expression and convert to string without changes', function() {
    expect(modifier.setExpression('=B1').toString()).toBe('=B1');
    expect(modifier.setExpression('$DD$99').toString()).toBe('=$DD$99');
    expect(modifier.setExpression('=B1/A$4').toString()).toBe('=B1/A$4');
    expect(modifier.setExpression('B1/A$4').toString()).toBe('=B1/A$4');
    expect(modifier.setExpression('=SUM(B10:G10, A1, B5, D10:$E$16)').toString()).toBe('=SUM(B10:G10, A1, B5, D10:$E$16)');
    expect(modifier.setExpression('SUM(B10:G10, A1, B5, D10:$E$16)').toString()).toBe('=SUM(B10:G10, A1, B5, D10:$E$16)');
    expect(modifier.setExpression('="SUM: "&SUM(B10:G10)').toString()).toBe('="SUM: "&SUM(B10:G10)');
    expect(modifier.setExpression('=IF(B28<64, "F", IF(B28<73, "D", IF(B28<85, "C", IF(B28<95, "B", "A"))))').toString())
      .toBe('=IF(B28<64, "F", IF(B28<73, "D", IF(B28<85, "C", IF(B28<95, "B", "A"))))');
  });

  it('should correctly translate formula expression (injecting 5 rows at row index 3)', function() {
    var at = {row: 3};
    var delta = {row: 5};

    expect(modifier.setExpression('=B1').translate(at, delta).toString()).toBe('=B1');
    expect(modifier.setExpression('$DD$99').translate(at, delta).toString()).toBe('=$DD$104');
    expect(modifier.setExpression('=B1/A$4').translate(at, delta).toString()).toBe('=B1/A$9');
    expect(modifier.setExpression('B1/A$4').translate(at, delta).toString()).toBe('=B1/A$9');
    expect(modifier.setExpression('=SUM(B10:G10, A1, B5, B3, D10:$E$16)').translate(at, delta).toString()).toBe('=SUM(B15:G15, A1, B10, B3, D15:$E$21)');
    expect(modifier.setExpression('="SUM: "&SUM(B10:G10)').translate(at, delta).toString()).toBe('="SUM: "&SUM(B15:G15)');
    expect(modifier.setExpression('=IF(B28<64, "F", IF(B28<73, "D", IF(B28<85, "C", IF(B28<95, "B", "A"))))').translate(at, delta).toString())
      .toBe('=IF(B33<64, "F", IF(B33<73, "D", IF(B33<85, "C", IF(B33<95, "B", "A"))))');
  });

  it('should correctly translate formula expression (removing 5 rows at row index 3)', function() {
    var at = {row: 3};
    var delta = {row: -5};

    expect(modifier.setExpression('=B1').translate(at, delta).toString()).toBe('=B1');
    expect(modifier.setExpression('$DD$99').translate(at, delta).toString()).toBe('=$DD$94');
    expect(modifier.setExpression('=B1/A$4').translate(at, delta).toString()).toBe('=B1/#REF!');
    expect(modifier.setExpression('B1/A$4').translate(at, delta).toString()).toBe('=B1/#REF!');
    expect(modifier.setExpression('=SUM(B10:G10, A1, B5, B3, D10:$E$16)').translate(at, delta).toString()).toBe('=SUM(B5:G5, A1, #REF!, B3, D5:$E$11)');
    expect(modifier.setExpression('="SUM: "&SUM(B10:G10)').translate(at, delta).toString()).toBe('="SUM: "&SUM(B5:G5)');
    expect(modifier.setExpression('=IF(B28<64, "F", IF(B28<73, "D", IF(B28<85, "C", IF(B28<95, "B", "A"))))').translate(at, delta).toString())
      .toBe('=IF(B23<64, "F", IF(B23<73, "D", IF(B23<85, "C", IF(B23<95, "B", "A"))))');
  });

  it('should correctly translate formula expression (injecting 5 columns at column index 3)', function() {
    var at = {column: 3};
    var delta = {column: 5};

    expect(modifier.setExpression('=B1').translate(at, delta).toString()).toBe('=B1');
    expect(modifier.setExpression('$DD$99').translate(at, delta).toString()).toBe('=$DI$99');
    expect(modifier.setExpression('=B1/A$4').translate(at, delta).toString()).toBe('=B1/A$4');
    expect(modifier.setExpression('B1/A$4').translate(at, delta).toString()).toBe('=B1/A$4');
    expect(modifier.setExpression('=SUM(B10:G10, A1, B5, B3, D10:$E$16)').translate(at, delta).toString()).toBe('=SUM(B10:L10, A1, B5, B3, I10:$J$16)');
    expect(modifier.setExpression('="SUM: "&SUM(B10:G10)').translate(at, delta).toString()).toBe('="SUM: "&SUM(B10:L10)');
    expect(modifier.setExpression('=IF(B28<64, "F", IF(B28<73, "D", IF(B28<85, "C", IF(B28<95, "B", "A"))))').translate(at, delta).toString())
      .toBe('=IF(B28<64, "F", IF(B28<73, "D", IF(B28<85, "C", IF(B28<95, "B", "A"))))');
  });

  it('should correctly translate formula expression (removing 5 columns at column index 3)', function() {
    var at = {column: 3};
    var delta = {column: -5};

    expect(modifier.setExpression('=B1').translate(at, delta).toString()).toBe('=B1');
    expect(modifier.setExpression('$DD$99').translate(at, delta).toString()).toBe('=$CY$99');
    expect(modifier.setExpression('=B1/A$4').translate(at, delta).toString()).toBe('=B1/A$4');
    expect(modifier.setExpression('B1/A$4').translate(at, delta).toString()).toBe('=B1/A$4');
    expect(modifier.setExpression('=SUM(B10:G10, A1, B5, B3, D10:$E$16)').translate(at, delta).toString()).toBe('=SUM(B10:C10, A1, B5, B3, #REF!)');
    expect(modifier.setExpression('="SUM: "&SUM(B10:G10)').translate(at, delta).toString()).toBe('="SUM: "&SUM(B10:C10)');
    expect(modifier.setExpression('=IF(B28<64, "F", IF(B28<73, "D", IF(B28<85, "C", IF(B28<95, "B", "A"))))').translate(at, delta).toString())
      .toBe('=IF(B28<64, "F", IF(B28<73, "D", IF(B28<85, "C", IF(B28<95, "B", "A"))))');
  });

  it('should correctly translate formula expression (mixed operations)', function() {
    var at = {row: 3, column: 3};
    var delta = {row: 5, column: -5};

    // expect(modifier.setExpression('=B1').translate(at, delta).toString()).toBe('=B1');
    // expect(modifier.setExpression('$DD$99').translate(at, delta).toString()).toBe('=$CY$104');
    // expect(modifier.setExpression('=B1/A$4').translate(at, delta).toString()).toBe('=B1/A$9');
    // expect(modifier.setExpression('B1/A$4').translate(at, delta).toString()).toBe('=B1/A$9');
    // expect(modifier.setExpression('=SUM(B10:G10, A1, B5, B3, D10:$E$16)').translate(at, delta).toString()).toBe('=SUM(B15:C15, A1, B10, B3, #REF!)');
    // expect(modifier.setExpression('="SUM: "&SUM(B10:G10)').translate(at, delta).toString()).toBe('="SUM: "&SUM(B15:C15)');
    // expect(modifier.setExpression('=IF(B28<64, "F", IF(B28<73, "D", IF(B28<85, "C", IF(B28<95, "B", "A"))))').translate(at, delta).toString())
    //   .toBe('=IF(B33<64, "F", IF(B33<73, "D", IF(B33<85, "C", IF(B33<95, "B", "A"))))');
  });
});
