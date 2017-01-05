import moment from 'moment';
import defaults from './defaults';


function formatDayToString(m) {
  return m.format('YYYY-MM-DD');
}

function formatHourTitle(h) {
  return moment('' + h, ['HH']).format('ha');
}

class Scheduler {
  constructor() {
    moment.updateLocale(moment.locale(), {
      calendar: {
        sameDay: '[Today]',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        lastDay: '[Yesterday]',
        lastWeek: '[last] dddd',
        sameElse: 'L'
      }
    });
  }

  wrapDummy(slots) {
    return {
      "service": {
        "id": 4183,
        "owner_id": 54,
        "resources": [
          {
            "id": 267,
            "available_slots": slots
          }
        ]
      }
    };
  }

  getDummySchedule() {
    return this.wrapDummy({
      "date": "2014-11-03",
      "slots": [
        "2014-11-03T16:00:00Z", "2014-11-03T16:15:00Z",
        "2014-11-03T16:30:00Z", "2014-11-03T16:45:00Z",
        "2014-11-03T17:00:00Z", "2014-11-03T17:15:00Z",
        "2014-11-03T17:30:00Z", "2014-11-03T17:45:00Z",
        "2014-11-03T18:00:00Z", "2014-11-03T18:15:00Z",
        "2014-11-03T18:30:00Z", "2014-11-03T18:45:00Z",
        "2014-11-03T19:00:00Z", "2014-11-03T19:15:00Z",
        "2014-11-03T19:30:00Z", "2014-11-03T19:45:00Z",
        "2014-11-03T20:00:00Z", "2014-11-03T20:15:00Z",
        "2014-11-03T20:30:00Z", "2014-11-03T20:45:00Z",
        "2014-11-03T21:00:00Z", "2014-11-03T21:15:00Z",
        "2014-11-03T21:30:00Z", "2014-11-03T21:45:00Z",
        "2014-11-03T22:00:00Z"]
    });
  }

  generateDaySchedule(date, filter) {
    const mdate = moment.utc(date);
    let slots = [];
    for (let hour = 0; hour < 24; ++hour)
      for (let qmin = 0; qmin < 4; ++qmin)
        if (filter(hour, qmin))
          slots.push(moment(mdate).add(hour, 'hours').add(15 * qmin, 'minutes').format());
    return this.wrapDummy({
      date: date,
      slots: slots
    });
  }

  generateBlankDay(date) {
    return this.generateDaySchedule(date, () => true);
  }

  generateFilledDay(date) {
    return this.generateDaySchedule(date, () => false);
  }

  generateMorning(date) {
    return this.generateDaySchedule(date, (h, q) => (h > 4 && h < 12));
  }

  getDaysFrame(frameStartDate) {
    const mbase = moment.utc(frameStartDate);
    let r = [];
    for (let d = 0; d < defaults.daysInList; ++d) {
      let m = moment(mbase).add(d, 'days');
      r.push({
        val: formatDayToString(m),
        title: m.calendar()
      });
    }
    return r;
  }

  getHoursFrame(dayPicked, hoursFrameStart, dayData) {
    const mOrg = moment.utc(dayPicked).add(hoursFrameStart, 'hours');

    let r = [];
    for (let diff = 0; diff < defaults.hoursInList; ++diff) {
      const m = mOrg.clone().add(diff, 'hours');
      const day = formatDayToString(m);
      const hour = m.hours();
      const presentSlots = (dayData[day] || {}).presentSlots || {};

      r.push({
        title: formatHourTitle(hour),
        disabled: !presentSlots[hour],
        day,
        hour
      });
    }
    return r;
  }

  getDayDataFromSlots(slots) {
    const result = {};
    let parsedDates = [];

    slots.forEach(slot => {
      const slotMoment = moment.utc(slot);
      const slotDate = formatDayToString(slotMoment);
      if (!result[slotDate]) {
        const newSlot = {
          presentSlots: {},
          presentHours: []
        };
        parsedDates.push(slotDate);
        result[slotDate] = newSlot;
      }
      const {presentSlots, presentHours} = result[slotDate];
      const h = slotMoment.hours();
      if (!presentSlots[h]) {
        presentSlots[h] = [];
        presentHours.push(h);
      }
      const presentMinutes = presentSlots[h];
      const m = slotMoment.minutes();
      if (!~presentMinutes.indexOf(m))
        presentMinutes.push(m);
    });

    result.parsedDates = parsedDates.sort();
    return result;
  }

  getUtcTodayString() {
    return formatDayToString(moment.utc());
  }

  getNextDayString(date) {
    return formatDayToString(moment.utc(date).add(1, 'day'));
  }

  getStructuredIncrement(date, hour, unit, increment) {
    const m = moment.utc(date).add(hour, 'hours').add(increment, unit);
    return { day: formatDayToString(m), hour: m.hours() };
  }
}

const instance = new Scheduler();
Object.freeze(instance);

export default instance;
