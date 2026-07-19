import { Worker } from "bullmq";
import { redisConnection } from '../config/redis.js';
import { sendExcelProcessingFailureEmail, sendExcelProcessingSuccessEmail } from "../services/emailService.js";


const emailWorker = new Worker(
    'email-queue',
    async (job) => {
        switch (job.name) {
            case 'send-email':
                await sendExcelProcessingSuccessEmail(job.data.name, job.data.email, job.data.fileName)
                break;
            case 'excel-processing-failed':
                await sendExcelProcessingFailureEmail(job.data.name, job.data.email, job.data.fileName, job.data.reason)
                break;
            default:
                throw new Error(`Unkown job: ${job.name}`)
        }

    },
    {
        connection: redisConnection
    }
)

emailWorker.on("active", (job) => {
  console.log("Email Worker Active:", job.name, job.data);
});

emailWorker.on("completed", (job) => {
  console.log("Email sent:", job.id);
});

emailWorker.on("failed", (job, err) => {
  console.error("Email failed:", err);
});

emailWorker.on("error", (err) => {
  console.error("Worker error:", err);
});
