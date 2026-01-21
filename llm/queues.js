const RequestScheduler = require('./requestScheduler');

const HistoryQueue = new RequestScheduler();
const GPUQueue = new RequestScheduler();

module.exports = { HistoryQueue, GPUQueue };