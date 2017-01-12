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

  static getCurrentHour() {
    return moment().hour();
  }

  static getNextDayString(date) {
    return formatDayToString(moment.utc(date).add(1, 'day'));
  }

  static getStructuredIncrement(date, hour, unit, increment) {
    const m = moment.utc(date).add(hour, 'hours').add(increment, unit);
    return { day: formatDayToString(m), hour: m.hours() };
  }

  static getRangeEndValue(day, hour, qMinutesIdx) {
    if (undefined === day || undefined === hour || undefined === qMinutesIdx)
      return undefined;

    return moment.utc(day).add(hour, 'hours').add(15 * qMinutesIdx, 'minutes').format();
  }

  static getRangeEndFormatted(utcDateStr) {
    let result = '';
    if (utcDateStr) {
      const mVal = moment.utc(utcDateStr);
      const mToday = moment.utc();
      if (formatDayToString(mToday) === formatDayToString(mVal))
        result = mVal.format('ha:mm');
      else if (mToday.year() === mVal.year())
        result = mVal.format('MM-DD ha:mm');
      else
        result = mVal.format('YY-MM-DD ha:mm');
    }
    return result;
  }

  static isPast(date, hours) {
    return moment().isAfter(moment(date).add(hours, 'hours'), 'hours');
  }

  static previousIsPast(date, hours, dayNotHour) {
    const unit = dayNotHour ? 'day' : 'hour';
    const momentToCompare = moment(date).add(hours, 'hours').subtract(1, unit);
    return moment().isAfter(momentToCompare, unit);
  }

  static parseEnteredDate(strValue) {
    // also, format is valid: 2017-01-11T09:26:46Z
    const mVal = moment.utc(
      strValue,
      ['ha:mm', 'MM-DD ha:mm', 'YYYY-MM-DD ha:mm', 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm Z']
    );
    let result = false;
    if (mVal.isValid()) {
      const dayPicked = formatDayToString(mVal);
      const hourPicked = mVal.hour();
      const minutesIdxPicked = Math.trunc(mVal.minutes() / 15);
      result = { dayPicked, hourPicked, minutesIdxPicked };
    }
    return result;
  }

  static parseEnteredDateOrUndefined(value) {
    return Scheduler.parseEnteredDate(value) || {
      dayPicked: undefined,
      hourPicked: undefined,
      minutesIdxPicked: undefined
    };
  }

}

export default Scheduler;
