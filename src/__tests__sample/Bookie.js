jest.dontMock('../Bookie.jsx');

describe('Bookie', function () {
  var React = require('react');
  var ReactDOM = require('react-dom');
  var TestUtils = require('react-addons-test-utils');

  var Bookie;

  beforeEach(function () {
    Bookie = require('../Bookie').default;
  });

  it('should exists', function () {
    // Render into document
    var bookie = TestUtils.renderIntoDocument(<Bookie />);
    expect(TestUtils.isCompositeComponent(bookie)).toBeTruthy();
  });
});