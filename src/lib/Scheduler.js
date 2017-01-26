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
  static getCurrentMoment() {
    return moment();
  }

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

  static getNowStr() {
    return Scheduler.getCurrentMoment().startOf('minute').format();
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
    return moment(day).add(hour, 'hours').add(15 * qMinutesIdx, 'minutes').format();
  }

  static getRangeEndFormatted(dateStr) {
    let result = '';
    if (dateStr) {
      const mVal = moment(dateStr);
      const mToday = Scheduler.getCurrentMoment();
      if (formatDayToString(mToday) === formatDayToString(mVal))
        result = mVal.format('ha:mm');
      else if (mToday.year() === mVal.year())
        result = mVal.format('MM-DD ha:mm');
      else
        result = mVal.format('YY-MM-DD ha:mm');
    }
    return result;
  }

  static isAfterHour(date, hours, base) {
    const momentToCompare = moment(date).add(hours, 'hours');
    return moment(base).isAfter(momentToCompare, 'hour');
  }

  static isAfterMin(date, hours, minutes, base) {
    const momentToCompare = moment(date).add(hours, 'hours').add(minutes, 'minutes');
    return moment(base).isAfter(momentToCompare, 'minute');
  }

  static previousIsAfter(date, hours, dayNotHour, base) {
    const unit = dayNotHour ? 'day' : 'hour';
    const momentToCompare = moment(date).add(hours, 'hours').subtract(1, unit);
    return moment(base).isAfter(momentToCompare, unit);
  }

  static parseEnteredDate(strValue) {
    // also, format is valid: 2017-01-11T09:26:46Z
    const mVal = moment(
      strValue,
      ['ha:mm', 'MM-DD ha:mm', 'YYYY-MM-DD ha:mm', 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm Z']
    );
    let result = false;
    if (mVal.isValid()) {
      const day = formatDayToString(mVal);
      const hour = mVal.hour();
      const qMinIdx = Math.trunc(mVal.minutes() / 15);
      result = { day, hour, qMinIdx };
    }
    return result;
  }

  static parseEnteredDateAsArray(strValue) {
    const { day, hour, qMinIdx } = this.parseEnteredDate(strValue);
    return [day, hour, qMinIdx];
  }

  static parseEnteredDatePicked(strValue) {
    const r = this.parseEnteredDate(strValue);
    return r ? {
      dayPicked: r.day,
      hourPicked: r.hour,
      minutesIdxPicked: r.qMinIdx
    } : false;
  }

  static parseEnteredDateOrUndefined(value) {
    return Scheduler.parseEnteredDatePicked(value) || {
      dayPicked: undefined,
      hourPicked: undefined,
      minutesIdxPicked: undefined
    };
  }

  static getDayStr(dateTimeStr) {
    return formatDayToString(moment(dateTimeStr));
  }

  static getHour(dateTimeStr) {
    return moment(dateTimeStr).hour();
  }

  static composeBookingData(startVal, endVal, settingDelay) {
    const mStart = moment(startVal);
    const mEnd = moment(endVal);
    // '2017-01-13'
    const date = formatDayToString(mStart);
    // '13:15'
    const time = mStart.format('HH:mm');
    // length in minutes
    const duration = settingDelay ?
      moment.duration(mEnd.diff(mStart)).asMinutes()
      :
      undefined;

    const daysToFetch = [formatDayToString(mStart)];
    if (endVal) {
      while (mStart.add(1, 'day').isSameOrBefore(mEnd, 'day'))
        daysToFetch.push(formatDayToString(mStart));
    }

    return [{ date, time, duration }, daysToFetch];
  }
}

export default Scheduler;
