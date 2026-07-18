import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js'

const emailQueue = new Queue('email-queue', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        }
    }
})

export const addEmailJob = async (name, email, fileName) => {
    const job = await emailQueue.add('send-email', {
        name,
        email,
        fileName,
    })

    return job;
}