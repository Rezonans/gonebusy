import gonebusy from 'gonebusy-nodejs-client/lib';
import { Promise } from 'bluebird';

import ScheduleDummy from './ScheduleDummy';

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

  getDummyDay() {
    return ScheduleDummy.generateMorning('2016-12-28');
  }

  getScheduleForDay(day) {
    return new Promise(resolve => {
      const slots = ScheduleDummy.generateMorning(day).service.resources[0].available_slots.slots;
      const parsedSlots = ScheduleDummy.parseSlots(slots);
      // setTimeout(() => {resolve(parsedSlots)}, 2500);
      setTimeout(() => { resolve(parsedSlots) }, 200);
      // resolve(slots);
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
        resolve(ScheduleDummy.parseSlots(data.service.resources[0].availableSlots[0].slots.split(', ')));
      });
    });
  }
}

const instance = new BusyWrapper();
Object.freeze(instance);

export default instance;
