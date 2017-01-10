import moment from 'moment';
import defaults from './defaults';

function formatDayToString(m) {
  return m.format('YYYY-MM-DD');
}

function formatHourTitle(h) {
  return moment(String(h), ['HH']).format('ha');
}

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

class Scheduler {
  static getDaysFrame(frameStartDate) {
    const mbase = moment.utc(frameStartDate);
    const result = [];
    for (let diff = 0; diff < defaults.daysInList; ++diff) {
      const momentDay = moment(mbase).add(diff, 'days');
      result.push({
        val: formatDayToString(momentDay),
        title: momentDay.calendar()
      });
    }
    return result;
  }

  static getHoursFrame(dayPicked, hoursFrameStart) {
    const mOrg = moment.utc(dayPicked).add(hoursFrameStart, 'hours');

    const result = [];
    for (let diff = 0; diff < defaults.hoursInList; ++diff) {
      const hourItemMoment = mOrg.clone().add(diff, 'hours');
      const day = formatDayToString(hourItemMoment);
      const hour = hourItemMoment.hours();
      result.push({
        title: formatHourTitle(hour),
        day,
        hour
      });
    }
    return result;
  }

  static getDayDataFromSlots(slots) {
    const result = {};

    slots.forEach((slot) => {
      const slotMoment = moment.utc(slot);
      const slotDate = formatDayToString(slotMoment);
      if (!result[slotDate]) {
        const newSlot = {
          presentSlots: {},
          presentHours: []
        };
        result[slotDate] = newSlot;
      }
      const { presentSlots, presentHours } = result[slotDate];
      const h = slotMoment.hours();
      if (!presentSlots[h]) {
        presentSlots[h] = [];
        presentHours.push(h);
      }
      const presentMinutes = presentSlots[h];
      const minutes = slotMoment.minutes();
      if (!~presentMinutes.indexOf(minutes))
        presentMinutes.push(minutes);
    });

    return result;
  }

  static getUtcTodayString() {
    return formatDayToString(moment.utc());
  }

  static getNextDayString(date) {
    return formatDayToString(moment.utc(date).add(1, 'day'));
  }

  static getStructuredIncrement(date, hour, unit, increment) {
    const m = moment.utc(date).add(hour, 'hours').add(increment, unit);
    return { day: formatDayToString(m), hour: m.hours() };
  }

  static getRangeEndFormatted(day, hour, qMinutesIdx, startNotEnd) {
    if (undefined === day || undefined === hour || undefined === qMinutesIdx)
      return undefined;
    const minutes = 15 * (qMinutesIdx + (startNotEnd ? 0 : 1));
    const mVal = moment.utc(day).add(hour, 'hours').add(minutes, 'minutes');

    const mToday = moment.utc();
    let result = '';
    if (formatDayToString(mToday) === formatDayToString(mVal))
      result = mVal.format('ha:mm');
    else if (mToday.year() === mVal.year())
      result = mVal.format('MM-DD ha:mm');
    else
      result = mVal.format('YY-MM-DD ha:mm');
    return result;
  }

  static isPastOrToday(date) {
    return moment.utc().isSameOrAfter(moment.utc(date), 'day');
  }
}

export default Scheduler;
