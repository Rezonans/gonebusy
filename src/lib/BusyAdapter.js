import gonebusy, { CreateBookingBody } from 'gonebusy-nodejs-client/lib';
import { Promise } from 'bluebird';
import Scheduler from './Scheduler';

import gonebusyEnv from '../../config/gonebusy_env';

const ServicesController = Promise.promisifyAll(gonebusy.ServicesController);
const BookingsController = Promise.promisifyAll(gonebusy.BookingsController);

const {
  service_id,
  clientToken: authorization,
  clientApiEndpoint
} = gonebusyEnv;

gonebusy.configuration.BASEURI = clientApiEndpoint;

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

  static getBookingsPromise(args) {
    return BookingsController.getBookingsAsync(Object.assign(
      { authorization, states: 'awaiting_review' },
      args
    ));
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
