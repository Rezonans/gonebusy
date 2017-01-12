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
    let { startPicking } = s;
    const { endPicking, startVal, endVal } = s;
    if (!(startPicking || endPicking)) {
      startPicking = true;
      this.add({ startPicking });
    }

    const pickedSideChanged = (this.privateState.startPicking !== startPicking);

    const val = startPicking ? startVal : endVal;
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

  prepareDaysFrame() {
    const s = this.virtualState();
    let { daysFrameStart, dayPicked } = s;
    const { daysFrameChanged } = s;

    daysFrameStart = daysFrameStart || dayPicked || Scheduler.getUtcTodayString();
    let daysFrame = Scheduler.getDaysFrame(daysFrameStart);
    if (dayPicked && !daysFrame.find(item => item.val === dayPicked)) {
      if (daysFrameChanged)
        dayPicked = daysFrame[0].val;
      else {
        daysFrameStart = dayPicked;
        daysFrame = Scheduler.getDaysFrame(daysFrameStart);
      }
    }

    dayPicked = dayPicked || daysFrameStart;
    daysFrame.forEach((item) => {
      item.current = (item.val === dayPicked);
    });

    const forbidDayBack = Scheduler.previousIsPast(daysFrame[0].val, 0, true);
    this.add({ daysFrameStart, dayPicked, daysFrame, forbidDayBack });
  }

  prepareHoursFrame() {
    const s = this.virtualState();
    const { hoursFrameChanged, dayPicked } = s;
    let { hoursFrameStart, hourPicked } = s;
    const dayPickedData = this.getDataForDate(dayPicked);

    const firstPresentHour = dayPickedData.presentHours.find(
      hour => (!Scheduler.isPast(dayPicked, hour))
    );
    const currentHour = Scheduler.getCurrentHour();
    if (Scheduler.getUtcTodayString() === dayPicked) {
      if (hoursFrameStart < currentHour)
        hoursFrameStart = undefined;
      if (hourPicked < currentHour)
        hourPicked = undefined;
    }

    hoursFrameStart = hoursFrameStart || firstPresentHour || currentHour;

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
      item.disabled = Scheduler.isPast(item.day, item.hour) ||
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

    const forbidHourBack = Scheduler.previousIsPast(hoursFrame[0].day, hoursFrame[0].hour, false);

    this.add({ hoursFrameStart, hoursFrame, hourPicked, forbidHourBack });
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
    const defaultEndText = (startNotEnd => (`choose ${startNotEnd ? 'start' : 'end'}`));

    const s = this.virtualState();
    let { startValStr, endValStr, startVal, endVal } = s;
    const { startPicking, dayPicked, hourPicked, minutesIdxPicked } = s;

    const pickedVal = Scheduler.getRangeEndValue(dayPicked, hourPicked, minutesIdxPicked);
    if (startPicking)
      startVal = pickedVal;
    else
      endVal = pickedVal;

    startValStr = startVal ? Scheduler.getRangeEndFormatted(startVal) : defaultEndText(true);
    endValStr = endVal ? Scheduler.getRangeEndFormatted(endVal) : defaultEndText(false);

    this.add({ startValStr, endValStr, startVal, endVal });
  }

  cleanupDiff() {
    const p = this.privateDiff;
    ['rangeEndValEntered', 'daysFrameChanged', 'hoursFrameChanged']
      .forEach((key) => { delete p[key]; });
    // afterall, to make virtualState consistent
    this.add({});
  }

  adjust() {
    this.setFlags();
    this.rangeSwitchPickedEnd();
    this.readRangeEndValEntered();
    this.prepareDaysFrame();
    this.prepareHoursFrame();
    this.setMinutesFrameAndIdx();
    this.updateRange();
    this.cleanupDiff();
  }
}

export default StateUpdaterForDatePicker;
