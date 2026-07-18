import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const parseExcelInThread = (workbookId, filePath) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.join(__dirname, 'excelParserWorker.js'),
      {
        workerData: { workbookId, filePath }
      }
    );

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};