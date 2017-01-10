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

  adjust() {
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

    this.setMinutesFrameAndIdx();
  }

}

export default StateUpdaterForDatePicker;
