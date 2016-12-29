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

      // days: ScheduleDummy.getDatesAround(),

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

  getFrameDataStateDiff(stateDiff) {
    const s = Object.assign({}, this.state, stateDiff);
    const schedule = s.dayData.schedule;
    const hourPicked = schedule.presentHours.length ? schedule.presentHours[0] : null;
    const minutesIdxPicked = (null == hourPicked) ? null : schedule[hourPicked].qmins.indexOf(true);

    const daysFrame = ScheduleDummy.getDaysFrame(s.dayPicked);
    daysFrame.forEach(d => { d.current = (d.val === s.dayPicked); });

    const hoursFrame = ScheduleDummy.getHoursFrame(hourPicked, schedule);
    // console.log(daysFrame);

    return Object.assign({}, stateDiff, { hourPicked, minutesIdxPicked, daysFrame, hoursFrame });
  }

  fetchDayData() {
    const s = this.state;
    let dayPicked = s.dayPicked || ScheduleDummy.todayUtc();
    BusyAdapter.getScheduleForDay(dayPicked).then(dayData => {
      const stateDiff = this.getFrameDataStateDiff({
        dayPicked,
        dayData
      });
      stateDiff.loading = false;
      this.setState(stateDiff);
    });
  }

  abstractClick() {
    // console.log(BusyAdapter.getDummyDay().service.resources[0].available_slots.slots);

    console.log(ScheduleDummy.getDaysFrame());

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

  spawnObjLis(objs) {
    return objs.map((x, idx) => {
      let c = [];
      if (x.current)
        c.push('current');
      if (x.disabled)
        c.push('disabled');
      return <li key={idx} className={c.join(' ')}>
        <a onClick={() => this.abstractClick()}>{x.title}</a>
      </li>;
    });
  }

  wrapWithArrows(arr) {
    return [
      { title: '<<' },
      ...arr,
      { title: '>>' },
    ]
  }

  render() {
    // multiple classNames
    // editing; is-not-set etc.
    const s = this.state;
    const qmins = s.dayData ? s.dayData.schedule[s.hourPicked].qmins : [];

    return s.loading ?
      <Image src={loadingImg} responsive thumbnail onClick={() => this.abstractClick()} />
      :
      <div className="bookie-container">

        <h1>Rendered stuff</h1>
        <ul className="pick-day">
          {this.spawnObjLis(this.wrapWithArrows(s.daysFrame))}
        </ul>

        <ul className="pick-minutes">
          {this.spawnObjLis(['00', '15', '30', '45'].map((x, idx) => {
            return {
              title: x,
              disabled: !qmins[idx],
              current: s.minutesIdxPicked === idx,
            };
          }))}
        </ul>

        <ul className="pick-hour">
          {this.spawnObjLis(this.wrapWithArrows(s.hoursFrame))}
        </ul>

        <h1>Static stuff</h1>
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
