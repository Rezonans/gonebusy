import React, { Component, PropTypes } from 'react';
import { Image } from 'react-bootstrap';

import BusyAdapter from '../lib/BusyAdapter';
import Scheduler from '../lib/Scheduler';
import StateUpdaterForDatePicker from '../lib/StateUpdaterForDatePicker';
import StateUpdaterForDateRange from '../lib/StateUpdaterForDateRange';

import './Bookie.css';
import loadingImg from './loading.gif';

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

      const rangeUpdater = new StateUpdaterForDateRange(this.state, pickerUpdater.diff());
      rangeUpdater.adjust();

      if (setLoading)
        this.setParentLoading(rangeUpdater.state().loading);
      this.setState(rangeUpdater.diff(), () => { this.pullMissingData(); });
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
      diff = isStartNotEnd ?
        {
          startIsFocused: false,
          startVal: value
        }
        :
        {
          endIsFocused: false,
          endVal: value
        };
    }

    this.negotiateStateDiff(diff);

    console.log(isStartNotEnd, eventName);
  }

  render() {
    const s = this.state;
    const isWaiting = (s.loading || !s.initialized);
    console.log(s);

    const {
      startPicking, endPicking, startVal, endVal, startIsFocused, endIsFocused
    } = this.state;

    return <div className="bookie-container">
      <PickerItemList className="pick-day"
        items={s.daysFrame}
        onClick={(item, index) => { this.clickDay(item); } }
        wrapWithArrows
        />

      <PickerItemList className="pick-minutes"
        items={s.qMinutesFrame}
        onClick={(item, index) => { this.clickQuarter(index); } }
        />

      <PickerItemList className="pick-hour"
        items={s.hoursFrame}
        onClick={(item, index) => { this.clickHour(item); } }
        wrapWithArrows
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
