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
}

const instance = new BusyWrapper();
Object.freeze(instance);

export const busyDefaults = {
  defaultServiceName: "Shauna's Best in Show Dog Walking Service",
};

export default instance;
