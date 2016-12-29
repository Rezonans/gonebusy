import React, { Component } from 'react';
import { Image } from 'react-bootstrap';

import BusyAdapter from '../lib/BusyAdapter';
import Scheduler from '../lib/Scheduler';

import './Bookie.css';
import loadingImg from './loading.gif';

class Bookie extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,

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

    const daysFrame = Scheduler.getDaysFrame(s.dayPicked);
    daysFrame.forEach(d => { d.current = (d.val === s.dayPicked); });

    const hoursFrame = Scheduler.getHoursFrame(hourPicked, schedule);
    return Object.assign({}, stateDiff, { hourPicked, minutesIdxPicked, daysFrame, hoursFrame });
  }

  fetchDayData() {
    const s = this.state;
    let dayPicked = s.dayPicked || Scheduler.todayUtc();

    const f = BusyAdapter.getServiceAvailableSlotsByIdPromise;
    // const f = BusyAdapter.getScheduleForDay;

    f(dayPicked).then(dayData => {
      const stateDiff = this.getFrameDataStateDiff({
        dayPicked,
        dayData
      });
      stateDiff.loading = false;
      this.setState(stateDiff);
    });
  }

  abstractClick() {
    console.log(Scheduler.getDaysFrame());
    // if (this.state.loading) return;
    // alert('clicked!');
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
    // editing; is-not-set etc.
    const s = this.state;
    const qmins = s.dayData ? s.dayData.schedule[s.hourPicked].qmins : [];

    return s.loading ?
      <Image src={loadingImg} responsive thumbnail onClick={() => this.abstractClick()} />
      :
      <div className="bookie-container">
        <ul className="pick-day">
          {this.spawnObjLis(this.wrapWithArrows(s.daysFrame))}
        </ul>

        <ul className="pick-minutes">
          {this.spawnObjLis(Scheduler.qMinutesStr.map((x, idx) => {
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

        <div className="range">
          <span className="start pick">11:00am</span>
          <span>&nbsp;&mdash;&nbsp;</span>
          <span className="end pick">choose end</span>
        </div>
      </div>;
  }
}

export default Bookie;
