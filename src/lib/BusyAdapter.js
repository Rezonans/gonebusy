import gonebusy, { CreateBookingBody } from 'gonebusy-nodejs-client/lib';

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
      startDate: date,
      endDate: Scheduler.getNextDayString(date)
    }).then((data) => {
      const slotData = [];
      data.service.resources[0].availableSlots.forEach((x) => {
        slotData.push(...x.slots.split(', '));
      });
      return slotData;
    });
  }

  static getBookingsPromise() {
    return BookingsController.getBookingsAsync({ authorization });
  }

  static createBookingPromise({ date, time, duration }) {
    const params = {
      service_id,
      date,
      time
    };
    if (undefined !== duration)
      params.duration = duration;

    console.log(params);

    const createBookingBody = new CreateBookingBody(params);
    return BookingsController.createBookingAsync({ authorization, createBookingBody });
  }

  static cancelBookingPromise(id) {
    return BookingsController.cancelBookingByIdAsync({ authorization, id });
  }
}

export default BusyWrapper;
