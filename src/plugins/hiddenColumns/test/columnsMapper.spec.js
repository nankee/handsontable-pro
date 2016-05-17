describe('hiddenColumns -> ColumnsMapper', function() {
  it('should set hiddenColumns plugin while constructing', function() {
    var hiddenColumnsMock = {};
    var mapper = new Handsontable.utils.HiddenColumnsColumnMapper(hiddenColumnsMock);

    expect(mapper.hiddenColumns).toBe(hiddenColumnsMock);
  });

  it('should be mixed with arrayMapper object', function() {
    expect(Handsontable.utils.HiddenColumnsColumnMapper.MIXINS).toEqual(['arrayMapper']);
  });

  it('should destroy array after calling destroy method', function() {
    var mapper = new Handsontable.utils.HiddenColumnsColumnMapper();

    expect(mapper._arrayMap).toEqual([]);

    mapper.destroy();

    expect(mapper._arrayMap).toBe(null);
  });

  it('should create map with pairs index->value', function() {
    var hiddenColumnsMock = {};
    var mapper = new Handsontable.utils.HiddenColumnsColumnMapper(hiddenColumnsMock);

    mapper.createMap(6);

    expect(mapper._arrayMap[0]).toBe(0);
    expect(mapper._arrayMap[1]).toBe(1);
    expect(mapper._arrayMap[2]).toBe(2);
    expect(mapper._arrayMap[3]).toBe(3);
    expect(mapper._arrayMap[4]).toBe(4);
    expect(mapper._arrayMap[5]).toBe(5);
  });

});
