import { prisma } from "../config/prisma.js"
import excelQueue from '../queues/excelQueue.js';

export const getStats = async (req, res) => {
    try {
        const [totalFiles, statusCounts, totalRecordsProcessed, totalWorkSheetsProcessed, completedWorkbooks, activeJobsCount, waitingJobsCount,failedJobsCount] = await Promise.all([
            prisma.workbook.count(),
            prisma.workbook.groupBy({
                by: ['status'],
                _count: {
                    status: true,
                },
            }),
            prisma.worksheetRow.count(),
            prisma.worksheet.count(),
            prisma.workbook.findMany({
                where: {
                    status: 'COMPLETED'
                },
                select: {
                    createdAt: true,
                    updatedAt: true,
                }
            }),
            await excelQueue.getActiveCount(),
            await excelQueue.getWaitingCount(),
            await excelQueue.getFailedCount(),
        ])


        const completed = statusCounts.find((item) => item.status === 'COMPLETED');
        const failed = statusCounts.find((item) => item.status === 'FAILED');
        const processing = statusCounts.find((item) => item.status === 'PROCESSING');
        const totalProcessingTime = completedWorkbooks.reduce((total, workbook) => {
            const processingTime = workbook.updatedAt - workbook.createdAt;
            return total + processingTime;
        }, 0);

        return res.status(200).json({
            success: true,
            message: "Stats fetched successfully",
            summary: {
                totalFiles: totalFiles,
                completed: completed?._count.status || 0,
                failed: failed?._count.status || 0,
                processing: processing?._count.status || 0,
                succesRate: totalFiles > 0 ? (completed?._count.status / totalFiles) * 100 : 0,
                totalRecordsProcessed,
                totalWorkSheetsProcessed,
                avgProcessingTime: completedWorkbooks.length > 0 ? (totalProcessingTime / completedWorkbooks.length) / 1000 : 0,
                waitingJobsCount,
                activeJobsCount,
                failedJobsCount,
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}
