class ScheduleDummy {
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
    let slots = [];
    for (let hour = 0; hour < 24; ++hour)
      for (let q = 0; q < 4; ++q)
        if (filter(hour, q))
          slots.push(date + 'T' + hour + ':' + q + ':00Z');
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
}

const instance = new ScheduleDummy();
Object.freeze(instance);

export default instance;
