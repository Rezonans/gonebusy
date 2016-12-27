import gonebusy from 'gonebusy-nodejs-client/lib';
import { Promise } from 'bluebird';

const ServicesController = Promise.promisifyAll(gonebusy.ServicesController);

const config = {
  baseUri: 'http://sandbox.gonebusy.com/api/v1',
  token: 'Token ac98ed08b5b0a9e7c43a233aeba841ce',
};

export const busyDefaults = {
  defaultServiceName: 'Shauna\'s Best in Show Dog Walking Service',
};

class BusyWrapper {
  constructor() {
    gonebusy.configuration.BASEURI = config.baseUri;
  }

  setServiceName(component) {
    ServicesController.getServicesAsync({ authorization: config.token }).then((response) => {
      component.setState({ serviceName: response.services[0].name });
    });
  }
}

const instance = new BusyWrapper();
Object.freeze(instance);

export default instance;
