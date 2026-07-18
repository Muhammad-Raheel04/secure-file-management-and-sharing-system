import { parentPort, workerData } from 'worker_threads';
import { parseExcelFile } from '../services/excelParserService.js';

const { workbookId, filePath } = workerData;

parseExcelFile(workbookId, filePath)
  .then(result => {
    parentPort.postMessage({ success: true, result });
  })
  .catch(error => {
    parentPort.postMessage({ success: false, error: error.message });
  });