const { workerData, parentPort } = require('worker_threads');



parentPort.postMessage('This should be called once completed')