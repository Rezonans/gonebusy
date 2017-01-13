import gonebusy from 'gonebusy-nodejs-client/lib';
import { Promise } from 'bluebird';

import Scheduler from './Scheduler';

const ServicesController = Promise.promisifyAll(gonebusy.ServicesController);
const BookingsController = Promise.promisifyAll(gonebusy.BookingsController);

const config = {
  baseUri: 'http://sandbox.gonebusy.com/api/v1'
};

// @to-do log warning if no env variables provided
const { REACT_APP_SERVICE_ID: service_id, REACT_APP_GONEBUSY_TOKEN: authorization } = process.env;

gonebusy.configuration.BASEURI = config.baseUri;

class BusyWrapper {
  static getServiceNamePromise() {
    return ServicesController.getServicesAsync({ authorization });
  }

  static getServiceAvailableSlotsByIdPromise(date) {
    return ServicesController.getServiceAvailableSlotsByIdAsync({
      authorization,
      id: service_id,
      // date
      startDate: date,
      endDate: Scheduler.getNextDayString(date)
    }).then((data) => {
      // console.log(data);
      const slotData = [];
      data.service.resources[0].availableSlots.forEach((x) => {
        slotData.push(...x.slots.split(', '));
      });
      return slotData;
    });
  }
}

export default BusyWrapper;
