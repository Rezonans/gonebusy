// const m = jest.genMockFromModule('../BusyAdapter');

const mockData = require('./BusyAdapter.test.data');

let _hookedGetSlotsAsync;

class BusyAdapterMock {
  static getServiceInfoAsync() {
    return new Promise((resolve) => {
      resolve(mockData.serviceInfo);
    });
  }

  static getSlotsAsync(date) {
    _hookedGetSlotsAsync = new Promise((resolve) => {
      resolve(mockData.slotsReturned);
    });
    return _hookedGetSlotsAsync;
  }

  static _cleanUp() {
    _hookedGetSlotsAsync = undefined;
  }

  static _beholdGetGetSlots() {
    // return new Promise((resolve) => {
    //   if (!_hookedGetSlotsAsync)
    //     resolve(false);
    //   _hookedGetSlotsAsync.then(() => {
    //     BusyAdapterMock._cleanUp();
    //     resolve(true);
    //   });
    // });

    if (!_hookedGetSlotsAsync)
      return Promise.resolve(false);

    return _hookedGetSlotsAsync.then(() => {
      return new Promise((resolve) => {
        BusyAdapterMock._cleanUp();
        setTimeout(() => { resolve(true); }, 0);
      });
    });
  }

}

export default BusyAdapterMock;
