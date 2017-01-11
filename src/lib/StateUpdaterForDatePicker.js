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

  setHoursFrameStart() {
    const s = this.virtualState();
    const dayPickedData = this.getDataForDate(s.dayPicked);

    let hoursFrameStart = 0;
    if (undefined !== s.hoursFrameStart)
      hoursFrameStart = s.hoursFrameStart;
    else if (dayPickedData && dayPickedData.presentHours.length)
      hoursFrameStart = dayPickedData.presentHours[0];
    this.add({ hoursFrameStart });
  }

  setPickedHour() {
    const s = this.state();
    let { hourPicked } = s;
    const { hoursFrame, dayPicked } = s;

    if (!hoursFrame.find(
      item => item.day === dayPicked && item.hour === hourPicked && !item.disabled
    )) {
      const entry = hoursFrame.find(
        item => !item.disabled && item.day === dayPicked
      ) || { hour: undefined };
      hourPicked = entry.hour;
    }
    this.add({ hourPicked });
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
    const defaultRamgeEndValue = (startNotEnd) => {
      return `choose ${startNotEnd ? 'start' : 'end'}`;
    };

    const s = this.virtualState();
    let { startPicking, startVal, endVal } = s;
    const { endPicking, dayPicked, hourPicked, minutesIdxPicked } = s;


    if (!(startPicking || endPicking))
      startPicking = true;

    if (startPicking)
      startVal = Scheduler.getRangeEndFormatted(dayPicked, hourPicked, minutesIdxPicked);
    startVal = startVal || defaultRamgeEndValue(true);

    if (endPicking)
      endVal = Scheduler.getRangeEndFormatted(dayPicked, hourPicked, minutesIdxPicked);
    endVal = endVal || defaultRamgeEndValue(false);

    this.add({ startPicking, startVal, endVal });
  }

  cleanupDiff() {
    delete this.privateDiff.rangeEndValueEntered;

    // afterall, to make virtualState consistent
    this.add({});
  }


  readRangeEndValueEntered() {
    const s = this.virtualState();
    const { rangeEndValueEntered } = s;

    if (undefined != rangeEndValueEntered) {
      const parsedValue = Scheduler.parseEnteredDate(rangeEndValueEntered);
      if (parsedValue) {
        console.log(parsedValue);
        this.add(parsedValue);
        // should happen if it's not inside frame
        this.add({ daysFrameStart: parsedValue.dayPicked, hoursFrameStart: parsedValue.hourPicked });
      }
    }
  }

  adjust() {
    this.readRangeEndValueEntered();

    let { daysFrameStart, dayPicked } = this.virtualState();

    // ensure day frame start
    daysFrameStart = daysFrameStart || Scheduler.getUtcTodayString();

    // fill day frame
    const daysFrame = Scheduler.getDaysFrame(daysFrameStart);

    // ensure picked date
    dayPicked = dayPicked || daysFrameStart;
    if (!daysFrame.find(item => (dayPicked === item.val))) {
      dayPicked = daysFrame[0].val;
      this.add({ hourPicked: undefined, minutesIdxPicked: undefined });
    }

    // fetch data have been here
    this.add({ daysFrameStart, daysFrame, dayPicked });

    // process day frame
    daysFrame.forEach((item) => { item.current = (item.val === dayPicked); });

    this.setHoursFrameStart();

    const hoursFrame = Scheduler.getHoursFrame(dayPicked, this.state().hoursFrameStart);

    this.add({ hoursFrame });

    // disable what's missing
    hoursFrame.forEach((item) => {
      item.disabled = !this.getDataForDate(item.day).presentSlots[item.hour];
    });

    this.setPickedHour();

    // set current hour
    (this.state().hoursFrame.find(
      item => (item.day === dayPicked && item.hour === this.state().hourPicked)
    ) || {}).current = true;

    const forbidDayBack = Scheduler.isPastOrToday(daysFrame[0].val);
    const forbidHourBack = Scheduler.isPastOrToday(hoursFrame[0].day);
    this.add({ forbidDayBack, forbidHourBack });

    this.setMinutesFrameAndIdx();
    this.updateRange();
    this.cleanupDiff();
  }
}

export default StateUpdaterForDatePicker;
