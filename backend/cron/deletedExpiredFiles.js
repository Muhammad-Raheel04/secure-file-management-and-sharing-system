import cron from 'node-cron';
import { prisma } from '../config/prisma.js';
import { removeFileFromDisk } from '../utils/fileUtility.js';

cron.schedule("0 0 1 * *", async () => {
    try {
        console.log("Checking trahs...");

        const aMonthAgo = new Date();

        aMonthAgo.setMonth(aMonthAgo.getMonth() - 1);

        const files = await prisma.file.findMany({
            where: {
                isDeleted: true,
                deletedAt: {
                    lte: aMonthAgo
                }
            }
        })

        for (const file of files) {
            removeFileFromDisk(file.filePath);

            await prisma.file.delete({
                where: {
                    id: file.id
                }
            })
        }
        console.log(`${files.length} files permanently deleted.`);
    } catch (e) {
        console.error("Cron job failed:", e);
    }
})