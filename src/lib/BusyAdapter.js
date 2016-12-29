import gonebusy from 'gonebusy-nodejs-client/lib';
import { Promise } from 'bluebird';

import Scheduler from './Scheduler';

const ServicesController = Promise.promisifyAll(gonebusy.ServicesController);

const config = {
  baseUri: 'http://sandbox.gonebusy.com/api/v1',
  // original
  // token: 'Token ac98ed08b5b0a9e7c43a233aeba841ce',

  // сервис Алексея с заполненным календарем
  token: 'Token af9094c6d46658e60cde12e34ad26979',
};

class BusyWrapper {
  constructor() {
    gonebusy.configuration.BASEURI = config.baseUri;
  }

  getServiceNamePromise() {
    return ServicesController.getServicesAsync({ authorization: config.token });
  }

  getMockScheduleForDay(day) {
    return new Promise(resolve => {
      const slots = Scheduler.generateMorning(day).service.resources[0].available_slots.slots;
      const parsedSlots = Scheduler.parseSlots(slots);
      setTimeout(() => { resolve(parsedSlots) }, 200);
    });
  }

  getServiceAvailableSlotsByIdPromise(date) {
    return new Promise(resolve => {
      ServicesController.getServiceAvailableSlotsByIdAsync({
        authorization: config.token,
        id: 7891245607,
        date
      }).then(data => {
        console.log(data.service.resources[0].availableSlots[0].slots);
        resolve(Scheduler.parseSlots(data.service.resources[0].availableSlots[0].slots.split(', ')));
      });
    });
  }
}

const instance = new BusyWrapper();
Object.freeze(instance);

export default instance;
