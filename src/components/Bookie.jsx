import React, { Component, PropTypes } from 'react';

import BusyAdapter from '../lib/BusyAdapter';
import Scheduler from '../lib/Scheduler';
import StateUpdaterForDatePicker from '../lib/StateUpdaterForDatePicker';
// import StateUpdaterForDateRange from '../lib/StateUpdaterForDateRange';

import './Bookie.css';

import PickerItemList from './PickerItemList.jsx';
import PickerDateRange from './PickerDateRange.jsx';

class Bookie extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      initialized: false,

      dayData: {},
      daysToFetch: [],

      daysFrameStart: undefined,
      hoursFrameStart: undefined,
      daysFrame: [],
      hoursFrame: [],
      qMinutesFrame: [],

      dayPicked: undefined,
      hourPicked: undefined,
      minutesIdxPicked: undefined,

      forbidDayBack: false,
      forbidHourBack: false,

      startVal: undefined,
      startPicking: undefined,
      startIsFocused: false,
      endVal: undefined,
      endPicking: undefined,
      endIsFocused: false,
    };
  }

  setParentLoading(loading) {
    if (this.props.onSetLoading)
      this.props.onSetLoading(loading);
  }

  negotiateStateDiff(diff, setLoading = false) {
    if (!this.state.loading || setLoading) {
      const pickerUpdater = new StateUpdaterForDatePicker(this.state, diff);
      pickerUpdater.adjust();
      if (setLoading)
        this.setParentLoading(pickerUpdater.state().loading);
      this.setState(pickerUpdater.diff(), () => { this.pullMissingData(); });
    }
  }

  pullMissingData() {
    if (!this.state.loading) {
      const { daysToFetch } = this.state;

      console.log('days2fetch: ', daysToFetch);

      if (daysToFetch.length) {
        const dayToFetch = daysToFetch[0];

        this.setParentLoading(true);
        this.setState({ loading: true }, () => {
          BusyAdapter.getServiceAvailableSlotsByIdPromise(dayToFetch)
            .then((slotData) => {
              let { daysToFetch, dayData } = this.state;
              const parsedData = Scheduler.getDayDataFromSlots(slotData);

              Object.assign(dayData, parsedData);
              daysToFetch = daysToFetch.filter(val => !dayData[val]);

              this.negotiateStateDiff({ dayData, daysToFetch, loading: false }, true);
            })
            .catch((ex) => {
              console.log('exception caught!', ex);
              this.negotiateStateDiff({ loading: false }, true);
            });
        });
      }
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

  onPickerDateRangeEvent(isStartNotEnd, eventName, value) {
    let diff = {};
    if ('click' === eventName) {
      diff = isStartNotEnd ?
        { startIsFocused: true, startPicking: true, endPicking: false }
        :
        { endIsFocused: true, endPicking: true, startPicking: false };
    } else if ('blur' === eventName) {
      diff = isStartNotEnd ? { startIsFocused: false } : { endIsFocused: false };
      diff.rangeEndValueEntered = value;
    }

    this.negotiateStateDiff(diff);

    console.log(isStartNotEnd, eventName);
  }

  render() {
    const s = this.state;

    console.log(s);

    const {
      startPicking, endPicking, startVal, endVal, startIsFocused, endIsFocused
    } = this.state;

    return <div className="bookie-container">
      <PickerItemList className="pick-day"
        items={s.daysFrame}
        onClick={(item, index) => { this.clickDay(item); } }
        wrapWithArrows
        forbidBack={s.forbidDayBack}
        />

      <PickerItemList className="pick-minutes"
        items={s.qMinutesFrame}
        onClick={(item, index) => { this.clickQuarter(index); } }
        />

      <PickerItemList className="pick-hour"
        items={s.hoursFrame}
        onClick={(item, index) => { this.clickHour(item); } }
        wrapWithArrows
        forbidBack={s.forbidHourBack}
        />

      <PickerDateRange
        data={{ startPicking, endPicking, startVal, endVal, startIsFocused, endIsFocused }}
        onEvent={(isStart, eventName, value) => { this.onPickerDateRangeEvent(isStart, eventName, value) } }
        />
    </div>;
  }
}

Bookie.propTypes = {
  onSetLoading: PropTypes.func
};

export default Bookie;
