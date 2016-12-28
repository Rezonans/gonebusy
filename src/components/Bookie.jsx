import React, { Component } from 'react';
import { Image } from 'react-bootstrap';

import BusyAdapter from '../lib/BusyAdapter';
import ScheduleDummy from '../lib/ScheduleDummy';

import './Bookie.css';
import loadingImg from './loading.gif';

class Bookie extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      // loading: false,

      days: ScheduleDummy.getDatesAround(),

      dayPicked: null,
      dayData: null,

      startVal: null,
      startPicking: true,
      endVal: null,
      endPicking: false,
    };

    this.fetchDayData();
  }

  fetchDayData() {
    const s = this.state;
    let day = s.dayPicked || s.days[0].date;

    BusyAdapter.getScheduleForDay(day).then(x => {

      console.log(x);
      this.setState({
        dayPicked: day,
        loading: false,
        dayData: x,
      });
    });
  }

  abstractClick() {
    // console.log(BusyAdapter.getDummyDay().service.resources[0].available_slots.slots);

    console.log(ScheduleDummy.getDatesAround());

    if (this.state.loading) return;
    alert('clicked!');
  }

  spawnLis(txts, curIdx) {
    return txts.map((x, idx) => {
      return <li key={x} className={idx === curIdx ? 'current' : ''}>
        {/* <a onClick={this.tupoclick.bind(this)}>{x}</a> */}
        <a onClick={() => this.abstractClick()}>{x}</a>
      </li>;
    });
  }

  render() {
    // multiple classNames
    // editing; is-not-set etc.
    return this.state.loading ?
      <Image src={loadingImg} responsive thumbnail onClick={() => this.abstractClick()} />
      :
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
        <div className="range">
          <span className="start pick">11:00am</span>
          <span>&nbsp;&mdash;&nbsp;</span>
          <span className="end pick">choose end</span>
        </div>
      </div>;
  }
}

export default Bookie;
