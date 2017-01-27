import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

jest.mock('../lib/BusyAdapter');
jest.mock('../lib/Scheduler');

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
