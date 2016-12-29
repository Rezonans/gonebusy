import moment from 'moment';
import defaults from './defaults';

class ScheduleDummy {
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

  //r.map(x => x.calendar(null, {lastDay: '[last]', sameDay: '[Today]'}))

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
    // m.utc().startOf('day').add(3, 'hours').add(33, 'minutes').format();
    // m.utc('2014-11-03').format()
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

  getDatesAround(date) {
    const mbase = moment.utc(date).startOf('day');
    let r = [];
    for (let d = 0; d < defaults.daysInList; ++d) {
      let m = moment(mbase).add(d, 'days');
      r.push({
        date: m.format('YYYY-MM-DD'),
        title: m.calendar()
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

    presentHours = presentHours.sort();

    const schedule = { presentHours };
    for (let h = 0; h < 24; ++h) {
      const present = !!presentSlots[h];
      schedule[h] = {
        title: moment('' + h, ['HH']).format('ha'),
        present,
        qmins: [0, 15, 30, 45].map(x => (present && !!~presentSlots[h].indexOf(x)))
      }
    }
    return { presentSlots, schedule };
  }

  tryMoment() {
    // console.log('try');
    // const str = "2014-11-03T19:15:00Z";
    // const m = moment.utc(str);

    // const str = "2014-11-03T19:15:00Z";
    const m = moment;
    console.log(m);
    // m("0", ['HH']).format('ha')

    console.log(m);
  }
}

const instance = new ScheduleDummy();
Object.freeze(instance);

export default instance;
