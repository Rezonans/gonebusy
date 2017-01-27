// const m = jest.genMockFromModule('../BusyAdapter');

const mockData = require('./BusyAdapter.test.data');

class BusyAdapterMock {

  static getServiceInfoAsync() {
    return new Promise((resolve) => {
      resolve(mockData.serviceInfo);
    });
  }

  static getSlotsAsync(date) {
    return new Promise((resolve) => {
      resolve(mockData.slotsReturned);
    });
  }
}

export default BusyAdapterMock;
