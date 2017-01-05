import React, { Component } from 'react';
import { Image } from 'react-bootstrap';

import BusyAdapter from '../lib/BusyAdapter';
import Scheduler from '../lib/Scheduler';
import StateUpdaterForDatePicker from '../lib/StateUpdaterForDatePicker';

import './Bookie.css';
import loadingImg from './loading.gif';

import PickerItemList from './PickerItemList.jsx';

class Bookie extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      initialized: false,

      dayData: undefined,
      // daysToFetch: [],

      daysFrameStart: undefined,
      hoursFrameStart: undefined,
      daysFrame: [],
      hoursFrame: [],
      qMinutesFrame: [],

      dayPicked: undefined,
      hourPicked: undefined,
      minutesIdxPicked: undefined,

      startVal: undefined,
      startPicking: undefined,
      endVal: undefined,
      endPicking: undefined,
    };
  }

  negotiateStateDiff(diff) {
    const updater = new StateUpdaterForDatePicker(this.state, diff);

    if (!this.state.loading) {
      this.setState({ loading: true });

      // ensure day frame start
      const daysFrameStart = updater.state().daysFrameStart || Scheduler.getUtcTodayString();

      // fill day frame
      const daysFrame = Scheduler.getDaysFrame(daysFrameStart);

      // ensure picked date
      let dayPicked = updater.state().dayPicked || daysFrameStart;
      if (!daysFrame.find(item => (dayPicked === item.val))) {
        dayPicked = daysFrame[0].val;
        updater.add({ hourPicked: undefined, minutesIdxPicked: undefined });
      }

      updater.add({ daysFrameStart, daysFrame, dayPicked });
      // fetch data
      BusyAdapter.getServiceAvailableSlotsByIdPromise(dayPicked)
        .then((slotData) => {
          const dayData = Scheduler.getDayDataFromSlots(slotData);

          updater.add({ dayData });

          // process day frame
          daysFrame.forEach(item => { item.current = (item.val === dayPicked); });

          updater.setHoursFrameStart();
          updater.add({ hoursFrame: Scheduler.getHoursFrame(dayPicked, updater.state().hoursFrameStart, dayData) });
          updater.setPickedHour();

          // and now we set the current hour inside frame
          (updater.state().hoursFrame.find((item) => (item.day === dayPicked && item.hour === updater.state().hourPicked)) || {}).current = true;

          // this.setMinutesIdxPicked(tracker);
          updater.setMinutesFrameAndIdx();

          this.setState(
            updater
              .add({ loading: false })
              .diff()
          );
        })
        .catch((ex) => {
          console.log('exception caught!', ex);
          this.setState({ loading: false });
        });
    }
  }

  componentWillMount() {
    this.negotiateStateDiff({ initialized: true });
  }

  clickQuarter(index) {
    this.negotiateStateDiff({ minutesIdxPicked: index });
  }

  clickHour(item) {
    const s = this.state;

    const dateShifter = (hourIncrement) => {
      const diff = Scheduler.getStructuredIncrement(s.dayPicked, s.hoursFrameStart, 'hours', hourIncrement);
      return { dayPicked: diff.day, hoursFrameStart: diff.hour };
    }

    if ('rev' === item.val) {
      this.negotiateStateDiff(dateShifter(-2));
    } else if ('fwd' === item.val) {
      this.negotiateStateDiff(dateShifter(2));
    } else {
      this.negotiateStateDiff({ dayPicked: item.day, hourPicked: item.hour, minutesIdxPicked: undefined });
    }
  }

  clickDay(item) {
    const s = this.state;

    const dayShifter = (hourDiff) => {
      const increment = Scheduler.getStructuredIncrement(s.daysFrameStart, 0, 'days', hourDiff);
      return { daysFrameStart: increment.day };
    }

    if ('rev' === item.val) {
      this.negotiateStateDiff(dayShifter(-1));
    } else if ('fwd' === item.val) {
      this.negotiateStateDiff(dayShifter(1));
    } else {
      this.negotiateStateDiff({ dayPicked: item.val, hourPicked: undefined, minutesIdxPicked: undefined });
    }
  }

  render() {
    const s = this.state;
    const isWaiting = (s.loading || !s.initialized);
    console.log(s);

    return isWaiting ?
      <Image src={loadingImg} responsive thumbnail />
      :
      <div className="bookie-container">
        <PickerItemList className="pick-day"
          items={s.daysFrame}
          onLiClicked={(item, index) => { this.clickDay(item); } }
          wrapWithArrows={true}
          />

        <PickerItemList className="pick-minutes"
          items={s.qMinutesFrame}
          onLiClicked={(item, index) => { this.clickQuarter(index); } }
          />

        <PickerItemList className="pick-hour"
          items={s.hoursFrame}
          onLiClicked={(item, index) => { this.clickHour(item); } }
          wrapWithArrows={true}
          />

        <div className="range">
          <span className="start pick">11:00am</span>
          <span>&nbsp;&mdash;&nbsp;</span>
          <span className="end pick">choose end</span>
        </div>
      </div>;
  }
}

export default Bookie;
