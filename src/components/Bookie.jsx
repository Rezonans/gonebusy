import React, { Component } from 'react';
import { Image } from 'react-bootstrap';

import './Bookie.css';
import loadingImg from './loading.gif';

class Bookie extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
    };
  }

  tupoclick() {
    alert('tupo clicked!');
  }

  spawnLis(txts, curIdx) {
    return txts.map((x, idx) => {
      return <li key={x} className={idx === curIdx ? 'current' : ''}>
        <a onClick={this.tupoclick}>{x}</a>
      </li>;
    });
  }

  render() {
    return (
      <div className="bookie-container">
        <ul className="pick-day">
          {this.spawnLis(['<<', 'Today', 'Tomorrow', 'Weekend', '>>'], 1)}
        </ul>
        <ul className="pick-minutes">
          {this.spawnLis(['00', '15', '30', '45'], 2)}
        </ul>
        <ul className="pick-hour">
          {this.spawnLis(['<<', '10am', '11am', '12pm', '1pm', '>>'], 3)}
        </ul>
        {
          // multiple classNames
          // editing; is-not-set etc.
        }
        <div className="range">
          <span className="start pick">11:00am</span>
          <span>&nbsp;&mdash;&nbsp;</span>
          <span className="end pick">choose end</span>
        </div>
        {this.state.loading ? <Image src={loadingImg} responsive thumbnail /> : null}
      </div>
    );
  }
}

export default Bookie;
