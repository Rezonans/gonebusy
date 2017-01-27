const moment = require('moment');
const schedulerInstance = require.requireActual('../Scheduler').default;

schedulerInstance.getCurrentMoment = (() => moment('2017-01-02 17:00'));

export default schedulerInstance;
