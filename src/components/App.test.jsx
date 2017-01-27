import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const Scheduler = require('../lib/Scheduler').default;
const moment = require('moment');
Scheduler.getCurrentMoment = (() => moment('2017-01-02 17:00'));

jest.mock('../lib/BusyAdapter');

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
