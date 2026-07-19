import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { prisma } from '../config/prisma.js';
import { addExcelFailedEmailJob } from '../queues/emailQueue.js';

const deadLetterWorker = new Worker(
    'excel-dlq',
    async (job) => {
        console.log("DLQ Recieved the job", job.id)
        const { originalJob, reason } = job.data;
        const { workbookId, filePath } = originalJob;
        try {
            const [, workbook] = await Promise.all([
                prisma.workbook.update({
                    where: {
                        id: workbookId
                    },
                    data: {
                        status: 'FAILED',
                        errorMessage: reason
                    }
                }),
                prisma.workbook.findUnique({
                    where: {
                        id: workbookId,
                    },
                    include: {
                        file: {
                            include: {
                                owner: true,
                            }
                        }
                    }
                })
            ])
            await addExcelFailedEmailJob(workbook.file.owner.name, workbook.file.owner.email, workbook.file.originalName, reason)
        } catch (error) {
            console.error("Failed to process job with dlq", error.message)
        }

    },
    {
        connection: redisConnection,
    }
)
