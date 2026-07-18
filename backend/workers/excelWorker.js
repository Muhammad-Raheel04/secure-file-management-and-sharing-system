import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { parseExcelFile } from '../services/excelParserService.js';
import { prisma } from '../config/prisma.js';
import { addEmailJob } from '../queues/emailQueue.js';

const excelWorker = new Worker(
  'excel-processing',
  async (job) => {
    try {
      const { workbookId } = job.data;

      const workbook = await prisma.workbook.findUnique({
        where: { id: workbookId },
        include: {
          file: {
            include: {
              owner: true
            }
          }
        }
      });
      if (!workbook) {
        throw new Error(`Workbook with ID ${workbookId} not found in DB`);
      }

      await parseExcelFile(workbookId, workbook.file.filePath, job);
      await addEmailJob(workbook.file.owner.name, workbook.file.owner.email, workbook.file.originalName);
      console.log(`Workbook ${workbookId} processed successfully`);
    } catch (error) {
      console.error(`Workbook ${workbookId} processing failed:`, error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
    limiter: {
      max: 1,
      duration: 5000
    },
    lockDuration: 15 * 60 * 1000,
    autorun: true,
    settings: {
      stalledInterval: 60 * 1000,
      maxStalledCount: 1
    }
  }
);

excelWorker.on('active', (job) => {
  console.log('Active job ID:', job.id);
  console.log('Active job data:', job.data);
});

excelWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

excelWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id || 'unknown'} failed:`, err);
  console.error('Error stack:', err.stack);
});

excelWorker.on('error', (error) => {
  console.error('Worker error:', error);
  console.error('Error stack:', error.stack);
});

excelWorker.on('waiting', (jobId) => {
  console.log('Job waiting in queue, ID:', jobId);
});

excelWorker.on('progress', (job, progress) => {
  console.log('Job ID:', job.id);
  console.log('Progress:', progress);
});

export default excelWorker;
