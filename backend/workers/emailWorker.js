import { Worker } from "bullmq";
import { redisConnection } from '../config/redis.js';
import { sendExcelProcessingSuccessEmail } from "../services/emailService.js";


const emailWorker = new Worker(
    'email-queue',
    async (job) => {
        switch (job.name) {
            case 'send-email':
                await sendExcelProcessingSuccessEmail(job.data.name, job.data.email, job.data.fileName)
                break;
            default:
                throw new Error(`Unkown job: ${job.name}`)
        }

    },
    {
        connection: redisConnection
    }
)