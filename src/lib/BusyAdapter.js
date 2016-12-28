import gonebusy from 'gonebusy-nodejs-client/lib';
import { Promise } from 'bluebird';

import ScheduleDummy from './ScheduleDummy';

const ServicesController = Promise.promisifyAll(gonebusy.ServicesController);

const config = {
  baseUri: 'http://sandbox.gonebusy.com/api/v1',
  token: 'Token ac98ed08b5b0a9e7c43a233aeba841ce',
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
      setTimeout(() => {resolve(slots)}, 2500);
      // resolve(slots);
    });
  }
}

const instance = new BusyWrapper();
Object.freeze(instance);

export default instance;
