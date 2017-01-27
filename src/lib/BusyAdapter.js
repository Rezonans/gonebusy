import gonebusy, { CreateBookingBody } from 'gonebusy-nodejs-client/lib';
import { Promise } from 'bluebird';
import Scheduler from './Scheduler';

const ServicesController = Promise.promisifyAll(gonebusy.ServicesController);
const BookingsController = Promise.promisifyAll(gonebusy.BookingsController);

const { REACT_APP_TOKEN: authorization, REACT_APP_API_ENDPOINT: clientApiEndpoint } = process.env;

gonebusy.configuration.BASEURI = clientApiEndpoint;

let serviceInfo;

class BusyAdapter {
  static getServiceInfoAsync() {
    return new Promise((resolve) => {
      if (serviceInfo)
        resolve(serviceInfo);
      else {
        ServicesController
          .getServicesAsync({ authorization })
          .then((response) => {
            if (response.services && response.services.length) {
              const serviceEntry = response.services[0];
              serviceInfo = {
                name: serviceEntry.name,
                id: serviceEntry.id,
                max_duration: serviceEntry.max_duration,
              };
              resolve(serviceInfo);
            } else
              throw new Error('Failed to fetch service info');
          });
      }
    });
  }

  static getSlotsAsync(date) {
    return BusyAdapter
      .getServiceInfoAsync()
      .then(info => ServicesController.getServiceAvailableSlotsByIdAsync({
        authorization,
        id: info.id,
        startDate: date,
        endDate: Scheduler.getNextDayString(date)
      }))
      .then((data) => {
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
    return BusyAdapter
      .getServiceInfoAsync()
      .then((info) => {
        const params = {
          service_id: info.id,
          date,
          time
        };
        if (undefined !== duration)
          params.duration = duration;
        console.log(params);
        const createBookingBody = new CreateBookingBody(params);
        return BookingsController.createBookingAsync({ authorization, createBookingBody });
      });
  }

  static cancelBookingPromise(id) {
    return BookingsController.cancelBookingByIdAsync({ authorization, id });
  }
}

export default BusyAdapter;
