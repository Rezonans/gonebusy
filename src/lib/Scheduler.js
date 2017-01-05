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
