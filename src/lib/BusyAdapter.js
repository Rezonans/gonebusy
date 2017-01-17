import gonebusy, {
  // BookingsController
  CreateBookingBody
} from 'gonebusy-nodejs-client/lib';

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

  static getBookingsPromise() {
    return BookingsController.getBookingsAsync({ authorization });
  }

  static createBookingPromise() {
    const params = {
      // serviceId: service_id,
      service_id,
      date: '2017-01-13',
      time: '13:15'
      // , duration: 30

      // resource_id,
      // user_id,
    };

    const createBookingBody = new CreateBookingBody(params);


    // {
    // service_id: 7891245607,
    // date: '2017-01-14',
    // time: '11:30',
    // duration: 30
    // }

    return BookingsController.createBookingAsync({ authorization, createBookingBody });

    // const request = Object.assign({ authorization }, params);
    // console.log(request);

    // return new Promise((resolve)=>{
    //   resolve(false);
    // });
    // return BookingsController.createBookingAsync(request);
  }

  static cancelBookingPromise(id) {
    return BookingsController.cancelBookingByIdAsync({ authorization, id });
  }
}

export default BusyWrapper;
