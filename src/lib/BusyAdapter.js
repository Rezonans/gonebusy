import gonebusy from 'gonebusy-nodejs-client/lib';
import { Promise } from 'bluebird';

import Scheduler from './Scheduler';

const ServicesController = Promise.promisifyAll(gonebusy.ServicesController);

const config = {
  baseUri: 'http://sandbox.gonebusy.com/api/v1'
};

// @to-do log warning if no env variables provided
const { REACT_APP_SERVICE_ID: serviceId, REACT_APP_GONEBUSY_TOKEN: token } = process.env;

class BusyWrapper {
  constructor() {
    gonebusy.configuration.BASEURI = config.baseUri;
  }

  getServiceNamePromise() {
    return ServicesController.getServicesAsync({ authorization: token });
  }

  // getMockScheduleForDay(day) {
  //   return new Promise(resolve => {
  //     const slots = Scheduler.generateMorning(day).service.resources[0].available_slots.slots;
  //     const parsedSlots = Scheduler.parseSlots(slots);
  //     setTimeout(() => { resolve(parsedSlots) }, 200);
  //   });
  // }

  getServiceAvailableSlotsByIdPromise(date) {
    return ServicesController.getServiceAvailableSlotsByIdAsync({
      authorization: token,
      id: serviceId,
      // date
      startDate: date,
      endDate: Scheduler.getNextDayString(date)
    }).then(data => {
      // console.log(data);
      const slotData = [];
      data.service.resources[0].availableSlots.forEach(x => { slotData.push(...x.slots.split(', ')); });
      return slotData;
    });
  }
}

const instance = new BusyWrapper();
Object.freeze(instance);

export default instance;
