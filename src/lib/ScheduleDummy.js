import moment from 'moment';
import defaults from './defaults';

class ScheduleDummy {
  constructor() {
    moment.locale(moment.locale(), {
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
}

const instance = new ScheduleDummy();
Object.freeze(instance);

export default instance;
