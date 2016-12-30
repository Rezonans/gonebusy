import moment from 'moment';
import defaults from './defaults';

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

  qMinutesInt = [0, 15, 30, 45];
  qMinutesStr = ['00', '15', '30', '45'];

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

  getDaysFrame(date) {
    const mbase = moment.utc(date).startOf('day');
    let r = [];
    for (let d = 0; d < defaults.daysInList; ++d) {
      let m = moment(mbase).add(d, 'days');
      r.push({
        val: m.format('YYYY-MM-DD'),
        title: m.calendar()
      });
    }
    return r;
  }

  // @fix-me will fail for next-day threshold :(
  getHoursFrame(hour, schedule) {
    if (null === hour)
      hour = 0;
    let r = [];
    for (let diff = 0; diff < defaults.hoursInList; ++diff) {
      const val = hour + diff;
      const s = schedule[val];
      r.push({
        title: s.title,
        disabled: !s.present,
        current: val === hour,
      });
    }
    return r;
  }

  parseSlots(slots) {
    const presentSlots = {};
    let presentHours = [];
    slots.forEach(slot => {
      const slotMoment = moment.utc(slot);
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

    presentHours = presentHours.sort((a, b) => a - b);

    const schedule = { presentHours };
    for (let h = 0; h < 24; ++h) {
      const present = !!presentSlots[h];
      schedule[h] = {
        title: moment('' + h, ['HH']).format('ha'),
        present,
        qmins: this.qMinutesInt.map(x => (present && !!~presentSlots[h].indexOf(x)))
      }
    }
    return { presentSlots, schedule };
  }

  todayUtc() {
    return moment.utc().startOf('day').format('YYYY-MM-DD');
  }
}

const instance = new Scheduler();
Object.freeze(instance);

export default instance;
