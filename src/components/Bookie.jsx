import React, { Component, PropTypes } from 'react';

import BusyAdapter from '../lib/BusyAdapter';
import Scheduler from '../lib/Scheduler';
import StateUpdaterForDatePicker from '../lib/StateUpdaterForDatePicker';

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
      forbidDayForward: false,
      forbidHourForward: false,

      startVal: undefined,
      startValStr: undefined,

      pickingStartNotEnd: true,
      isFocused: false,
      endVal: undefined,
      endValStr: undefined,
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
      console.log('applying diff', diff, pickerUpdater.diff());
      this.setState(pickerUpdater.diff(), () => { this.pullMissingData(); });
    }
  }

  pullMissingData() {
    if (!this.state.loading) {
      const { daysToFetch } = this.state;

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
    if ('click' === eventName)
      diff = { pickingStartNotEnd: isStartNotEnd, isFocused: true };
    else if ('blur' === eventName)
      diff = { isFocused: false, rangeEndValEntered: value };
    this.negotiateStateDiff(diff);
  }

  render() {
    const {
      forbidDayBack, forbidHourBack, forbidDayForward, forbidHourForward,
      daysFrame, hoursFrame, qMinutesFrame,
      pickingStartNotEnd, isFocused, startValStr, endValStr
    } = this.state;

    return <div className="bookie-container">
      <PickerItemList className="pick-day"
        items={daysFrame}
        onClick={(item, index) => { this.clickDay(item); } }
        wrapWithArrows
        forbidBack={forbidDayBack}
        forbidForward={forbidDayForward}
        />

      <PickerItemList className="pick-minutes"
        items={qMinutesFrame}
        onClick={(item, index) => { this.clickQuarter(index); } }
        />

      <PickerItemList className="pick-hour"
        items={hoursFrame}
        onClick={(item, index) => { this.clickHour(item); } }
        wrapWithArrows
        forbidBack={forbidHourBack}
        forbidForward={forbidHourForward}
        />

      <PickerDateRange {...{ pickingStartNotEnd, isFocused, startValStr, endValStr }}
        onEvent={(isStart, eventName, value) => { this.onPickerDateRangeEvent(isStart, eventName, value) } }
        />
    </div>;
  }
}

Bookie.propTypes = {
  onSetLoading: PropTypes.func
};

export default Bookie;
