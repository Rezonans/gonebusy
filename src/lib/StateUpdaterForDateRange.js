import Scheduler from './Scheduler';
import StateUpdaterBase from './StateUpdaterBase';

class StateUpdaterForDateRange extends StateUpdaterBase {
  static getDefaultValue(startNotEnd) {
    return `choose ${startNotEnd ? 'start' : 'end'}`;
  }

  adjust() {
    const s = this.virtualState();
    let { startPicking, startVal, endVal } = s;
    const { endPicking, dayPicked, hourPicked, minutesIdxPicked } = s;


    if (!(startPicking || endPicking))
      startPicking = true;

    if (startPicking)
      startVal = Scheduler.getRangeEndFormatted(dayPicked, hourPicked, minutesIdxPicked, true);
    startVal = startVal || StateUpdaterForDateRange.getDefaultValue(true);

    if (endPicking)
      endVal = Scheduler.getRangeEndFormatted(dayPicked, hourPicked, minutesIdxPicked, false);
    endVal = endVal || StateUpdaterForDateRange.getDefaultValue(false);

    this.add({ startPicking, startVal, endVal });
  }
}

export default StateUpdaterForDateRange;
