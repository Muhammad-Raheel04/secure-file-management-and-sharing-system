import { Queue } from "bullmq";
import { redisConnection } from '../config/redis.js';

export const deadLetterQueue = new Queue('excel-dlq', {
    connection: redisConnection,
})

export const addDLQJob = async (originalJob, err) => {
    const dlqJob = await deadLetterQueue.add('failed-job', {
        originalJob: originalJob.data,
        reason: err.message,
        failedAt: new Date()
    })

    return dlqJob;
}