const React = require('react');
const ReactDOM = require('react-dom');
import ReactDOMServer from 'react-dom/server';

const TestUtils = require('react-addons-test-utils');
const Bookie = require('./Bookie').default;
const renderer = require('react-test-renderer');

const Scheduler = require('../lib/Scheduler').default;
const moment = require('moment');

jest.mock('../lib/BusyAdapter');

Scheduler.getCurrentMoment = (() => moment('2017-01-02 17:00'));

it('should exists', () => {
  const bookie = TestUtils.renderIntoDocument(<Bookie />);
  expect(TestUtils.isCompositeComponent(bookie)).toBeTruthy();
});

// it('markup matches snapshot', () => {
//   const tree = renderer.create(<Bookie />).toJSON();
//   expect(tree).toMatchSnapshot();
// });

describe('enabling bookie button', () => {
  // there's a gap on 2017-01-01 at 17:00-18:00
  const savedState = require('./Bookie.test.data').savedState;

  const createBookieWithState = function(state) {
    const result = TestUtils.renderIntoDocument(<Bookie />);
    result.setState(state);
    result.negotiateStateDiff({}, true);
    return result;
  }

  it('is enabled for valid range', () => {
    const bookieComponent = createBookieWithState(savedState);
    
    // ensure booking is enabled in state
    expect(bookieComponent.state.bookingAllowed).toBe(true);

    // ensure booking button is enabled
    expect(ReactDOM.findDOMNode(bookieComponent).querySelector('button').disabled).toBe(false);

    // check markup snapshot
    const reactElement = bookieComponent.render();
    const renderedMarkup = ReactDOMServer.renderToStaticMarkup(reactElement);
    expect(renderedMarkup).toMatchSnapshot();
  });

  it('is disabled for the range with a gap', () => {
    const state = Object.assign({}, savedState, {
      "hourPicked": 16,
      "minutesIdxPicked": 2,
      "endVal": "2017-01-01T18:15:00+02:00",
    });

    const bookieComponent = createBookieWithState(state);

    expect(bookieComponent.state.bookingAllowed).toBe(false);
    expect(ReactDOM.findDOMNode(bookieComponent).querySelector('button').disabled).toBe(true);

    const reactElement = bookieComponent.render();
    const renderedMarkup = ReactDOMServer.renderToStaticMarkup(reactElement);
    expect(renderedMarkup).toMatchSnapshot();
  });
});