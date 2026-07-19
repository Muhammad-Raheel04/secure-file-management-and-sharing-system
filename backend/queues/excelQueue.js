import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

const excelQueue = new Queue('excel-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});

excelQueue.on('waiting', (job) => {
  console.log('Queue Event: Job waiting in queue - Job ID:', job.id);
});

excelQueue.on('added', (job) => {
  console.log('Queue Event: Job added - Job ID:', job.id);
  console.log('Queue Event: Job data:', job.data);
});

excelQueue.on('completed', (job) => {
  console.log('Queue Event: Job completed - Job ID:', job.id);
});

excelQueue.on('failed', (job, err) => {
  console.log('Queue Event: Job failed - Job ID:', job?.id);
  console.log('Queue Event: Error:', err);
});

excelQueue.on('progress', (job, progress) => {
  console.log('Queue Event: Job progress - Job ID:', job.id, 'Progress:', progress);
});

excelQueue.on('delayed', (job) => {
  console.log('Queue Event: Job delayed - Job ID:', job.id);
});

excelQueue.on('paused', () => {
  console.log('Queue Event: Queue paused');
});

excelQueue.on('resumed', () => {
  console.log('Queue Event: Queue resumed');
});

excelQueue.on('cleaned', (jobs, type) => {
  console.log('Queue Event: Queue cleaned - Type:', type, 'Jobs:', jobs.map(j => j.id));
});

excelQueue.on('error', (err) => {
  console.error('Queue Event: Queue error -', err);
});

export const addExcelProcessingJob = async (workbookId, filePath) => {
  const job = await excelQueue.add('parse-excel', {
    workbookId,
    filePath
  });
  return job;
};


export const getJobStatus = async (jobId) => {
  console.log('Starting for job ID', jobId, '---');
  
  const job = await excelQueue.getJob(jobId);
  if (!job) {
    console.log('No job found with ID:', jobId);
    return null;
  }
  
  const state = await job.getState();
  const result = {
    id: job.id,
    state,
    data: job.data,
    progress: job.progress,
    attempts: job.attemptsMade
  };
  
  console.log('Job found:', result);
  console.log('Job Complete');
  
  return result;
};

export default excelQueue;
