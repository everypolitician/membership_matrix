describe('getQueryParams', function() {
  it('should work with a single parameter from the query string', function() {
    assert.deepEqual({term: 'na2007'}, getQueryParams('?term=na2007'));
  });
  it('should return the empty object for the empty string', function() {
    assert.deepEqual({}, getQueryParams(''));
  });
  it('should return the empty object for a single question mark', function() {
    assert.deepEqual({}, getQueryParams('?'));
  });
  it('should work multiple parameters', function() {
    assert.deepEqual({foo: 'bar', quux: 'xzyzzy'}, getQueryParams('?quux=xzyzzy&foo=bar'));
  });
  it('should get the last instance same key multiple times', function() {
    assert.deepEqual({animal: 'cow'}, getQueryParams('?animal=horse&animal=cow'));
  });
});

describe('getAreasForDisplay', function() {
  it('should return all areas if term is null', function() {
    var exampleAreas = [
      {name: 'Ambridge'}, {name: 'Borchester'}
    ];
    assert.deepEqual(exampleAreas, getAreasForDisplay(exampleAreas, null));
  });
  it('should return all areas if none have session attributes, even if term is set', function() {
    var exampleAreas = [
      {name: 'Ambridge'}, {name: 'Borchester'}
    ];
    assert.deepEqual(exampleAreas, getAreasForDisplay(exampleAreas, 's2013'));
  });
  it('should filter based on term if there are session attributes', function() {
    var exampleAreas = [
      {name: 'Ambridge', session: {slug: 's2013'}},
      {name: 'Borchester', session: {slug: 'na2007'}}
    ];
    assert.deepEqual(
      [{name: 'Ambridge', session: {slug: 's2013'}}],
      getAreasForDisplay(exampleAreas, 's2013')
    );
  });
});
