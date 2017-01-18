import Scheduler from './Scheduler';
import StateUpdaterBase from './StateUpdaterBase';

class StateUpdaterForDatePicker extends StateUpdaterBase {
  getDataForDate(date) {
    const { dayData, daysToFetch } = this.virtualState();
    let result = dayData[date];
    if (!result) {
      if (!~daysToFetch.indexOf(date))
        this.add({ daysToFetch: [...daysToFetch, date] });
      result = {
        presentSlots: {},
        presentHours: []
      };
    }
    return result;
  }

  setFlags() {
    const [vs, ps] = [this.virtualState(), this.privateState];
    const daysFrameChanged = vs.daysFrameStart !== ps.daysFrameStart;
    const hoursFrameChanged = vs.hoursFrameStart !== ps.hoursFrameStart;
    this.add({ daysFrameChanged, hoursFrameChanged });
  }

  rangeSwitchPickedEnd() {
    const s = this.virtualState();
    const { pickingStartNotEnd, startVal, endVal } = s;
    const pickedSideChanged = (this.privateState.pickingStartNotEnd !== pickingStartNotEnd);
    const val = pickingStartNotEnd ? startVal : endVal;
    // sets picked data
    if (pickedSideChanged)
      this.add(Scheduler.parseEnteredDateOrUndefined(val));
  }

  readRangeEndValEntered() {
    const s = this.virtualState();
    const { rangeEndValEntered } = s;

    if (undefined !== rangeEndValEntered) {
      const parsedValue = Scheduler.parseEnteredDate(rangeEndValEntered);
      if (parsedValue)
        this.add(parsedValue);
    }
  }

  setMinMaxDateScope() {
    const s = this.virtualState();
    const { pickingStartNotEnd, startVal, endVal } = s;
    const curDateTime = Scheduler.getNowStr();

    let scopeMin;
    let scopeMax;

    if (pickingStartNotEnd) {
      scopeMax = endVal;
      scopeMin = curDateTime;
    } else
      scopeMin = startVal || curDateTime;

    this.add({ scopeMin, scopeMax });
  }

  getMinMaxDateTimes() {
    const { scopeMin, scopeMax } = this.virtualState();
    const [minDayStr, minHour] = [Scheduler.getDayStr(scopeMin), Scheduler.getHour(scopeMin)];
    const [maxDayStr, maxHour] = scopeMax ?
      [Scheduler.getDayStr(scopeMax), Scheduler.getHour(scopeMax)]
      :
      [undefined, undefined];
    return { minDayStr, minHour, maxDayStr, maxHour };
  }

  prepareDaysFrame() {
    const s = this.virtualState();
    let { daysFrameStart, dayPicked } = s;
    const { daysFrameChanged } = s;
    const { minDayStr, maxDayStr } = this.getMinMaxDateTimes();

    if (dayPicked) {
      if (Scheduler.isAfter(dayPicked, 0, minDayStr))
        dayPicked = minDayStr;
      if (maxDayStr && Scheduler.isAfter(maxDayStr, 0, dayPicked))
        dayPicked = maxDayStr;
    }

    daysFrameStart = daysFrameStart || dayPicked || minDayStr;
    let daysFrame = Scheduler.getDaysFrame(daysFrameStart);
    if (dayPicked && !daysFrame.find(item => item.val === dayPicked)) {
      if (daysFrameChanged)
        dayPicked = daysFrame[0].val;
      else {
        daysFrameStart = dayPicked;
        daysFrame = Scheduler.getDaysFrame(daysFrameStart);
      }
    }

    dayPicked = dayPicked || minDayStr;
    daysFrame.forEach((item) => {
      item.current = (item.val === dayPicked);
      if (
        (maxDayStr && Scheduler.isAfter(maxDayStr, 0, item.val))
        ||
        Scheduler.isAfter(item.val, 0, minDayStr)
      )
        item.disabled = true;
    });

    const forbidDayBack = Scheduler.previousIsAfter(daysFrame[0].val, 0, true, minDayStr);
    const forbidDayForward = maxDayStr &&
      Scheduler.previousIsAfter(maxDayStr, 0, true, daysFrame[daysFrame.length - 1].val);

    this.add({ daysFrameStart, dayPicked, daysFrame, forbidDayBack, forbidDayForward });
  }

  prepareHoursFrame() {
    const s = this.virtualState();
    const { hoursFrameChanged, dayPicked, scopeMin, scopeMax } = s;
    let { hoursFrameStart, hourPicked } = s;
    const dayPickedData = this.getDataForDate(dayPicked);
    const { minDayStr, minHour, maxDayStr, maxHour } = this.getMinMaxDateTimes();

    const firstPresentHour = dayPickedData.presentHours.find(
      hour => (!Scheduler.isAfter(dayPicked, hour, scopeMin))
    );

    if (minDayStr === dayPicked) {
      if (hoursFrameStart < minHour)
        hoursFrameStart = undefined;
      if (hourPicked < minHour)
        hourPicked = undefined;
    }

    if (scopeMax && maxDayStr === dayPicked) {
      if (hourPicked > maxHour)
        hourPicked = undefined;
    }

    hoursFrameStart = hoursFrameStart || firstPresentHour || minHour;

    // consider the case when data's present and picked is not within the frame
    let hoursFrame = Scheduler.getHoursFrame(dayPicked, hoursFrameStart);
    if (~dayPickedData.presentHours.indexOf(hourPicked)) {
      if (!hoursFrame.find(item =>
        item.day === dayPicked && item.hour === hourPicked
      )) {
        if (hoursFrameChanged)
          hourPicked = undefined;
        else {
          hoursFrameStart = hourPicked;
          hoursFrame = Scheduler.getHoursFrame(dayPicked, hoursFrameStart);
        }
      }
    } else
      hourPicked = undefined;

    // disable what's missing
    hoursFrame.forEach((item) => {
      item.disabled =
        (scopeMax && Scheduler.isAfter(scopeMax, -item.hour, item.day)) ||
        Scheduler.isAfter(item.day, item.hour, scopeMin) ||
        !this.getDataForDate(item.day).presentSlots[item.hour];
    });

    if (undefined === hourPicked) {
      const firstEnabledItem = hoursFrame.find(item => !item.disabled && item.day === dayPicked);
      if (firstEnabledItem)
        hourPicked = firstEnabledItem.hour;
    }

    (hoursFrame.find(
      item => (item.day === dayPicked && item.hour === hourPicked)
    ) || {}).current = true;

    const forbidHourBack =
      Scheduler.previousIsAfter(hoursFrame[0].day, hoursFrame[0].hour, false, scopeMin);
    const lastHourItem = hoursFrame[hoursFrame.length - 1];
    const forbidHourForward = scopeMax &&
      Scheduler.previousIsAfter(scopeMax, -lastHourItem.hour, false, lastHourItem.day);
    this.add({ hoursFrameStart, hoursFrame, hourPicked, forbidHourBack, forbidHourForward });
  }

  setMinutesFrameAndIdx() {
    const qMinutesStr = ['00', '15', '30', '45'];
    const qMinutesInt = [0, 15, 30, 45];

    const s = this.state();
    const { dayPicked, hourPicked } = s;
    let { minutesIdxPicked } = s;

    const qMinuteList = this.getDataForDate(dayPicked).presentSlots[hourPicked] || [];

    if (undefined === minutesIdxPicked && qMinuteList.length)
      minutesIdxPicked = qMinutesInt.indexOf(qMinuteList[0]);
    else if (!qMinuteList.length)
      minutesIdxPicked = undefined;
    this.add({
      minutesIdxPicked,
      qMinutesFrame: qMinutesInt.map((item, idx) => ({
        title: qMinutesStr[idx],
        disabled: !~qMinuteList.indexOf(item),
        current: idx === minutesIdxPicked
      }))
    });
  }

  updateRange() {
    const s = this.virtualState();
    let { startValStr, endValStr, startVal, endVal } = s;
    const { pickingStartNotEnd, dayPicked, hourPicked, minutesIdxPicked } = s;

    const pickedVal = Scheduler.getRangeEndValue(dayPicked, hourPicked, minutesIdxPicked);
    if (pickingStartNotEnd) {
      startVal = pickedVal;
      // cleanup picked range end value if range start gets undefined
      if (!startVal)
        endVal = undefined;
    } else
      endVal = pickedVal;

    const defaultEndText = (startNotEnd => (`choose ${startNotEnd ? 'start' : 'end'}`));
    startValStr = startVal ? Scheduler.getRangeEndFormatted(startVal) : defaultEndText(true);
    endValStr = endVal ? Scheduler.getRangeEndFormatted(endVal) : defaultEndText(false);

    this.add({ startValStr, endValStr, startVal, endVal });
  }

  cleanupDiff() {
    const p = this.privateDiff;
    [
      // necessary to cleanup
      ...['rangeEndValEntered'],
      // the list of synthetic parameters we use
      ...['daysFrameChanged', 'hoursFrameChanged',
        'scopeMin', 'scopeMax', 'minDayStr', 'minHour', 'maxDayStr', 'maxHour']
    ].forEach((key) => { delete p[key]; });
    this.add({});
  }


  adjust() {
    this.setFlags();
    this.rangeSwitchPickedEnd();
    this.readRangeEndValEntered();
    this.setMinMaxDateScope();
    this.prepareDaysFrame();
    this.prepareHoursFrame();
    this.setMinutesFrameAndIdx();
    this.updateRange();
    this.cleanupDiff();
  }
}

export default StateUpdaterForDatePicker;
