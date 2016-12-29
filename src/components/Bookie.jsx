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
      hourPicked: null,
      minutesIdxPicked: null,

      startVal: null,
      startPicking: true,
      endVal: null,
      endPicking: false,
    };

    this.fetchDayData();
  }

  pickHourMinsInDay(schedule) {
    const hourPicked = schedule.presentHours.length ? schedule.presentHours[0] : null;
    const minutesIdxPicked = (null == hourPicked) ? null : schedule[hourPicked].qmins.indexOf(true);
    return { hourPicked, minutesIdxPicked };
  }

  fetchDayData() {
    const s = this.state;
    let day = s.dayPicked || s.days[0].date;
    BusyAdapter.getScheduleForDay(day).then(parsedSlots => {
      this.setState(Object.assign(
        {
          dayPicked: day,
          loading: false,
          dayData: parsedSlots,
        },
        this.pickHourMinsInDay(parsedSlots.schedule)
      ));
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

  spawnObjLis(txts, curIdx) {
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
{
        // <ul className="pick-day">
        //   {this.spawnObjLis()}
        // </ul>
}

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
        <a onClick={ScheduleDummy.tryMoment}>link01</a>
      </div>;
  }
}

export default Bookie;
