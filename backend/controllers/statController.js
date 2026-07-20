import { prisma } from "../config/prisma.js"

// this one is ok 
// but below this one is more optimized
// export const getStats = async (req, res) => {
//     try {
//         const [totalFiles, completed, failed, processing] = await Promise.all([
//             prisma.workbook.aggregate({
//                 _count: {
//                     id: true
//                 }
//             }),
//             prisma.workbook.aggregate({
//                 _count: {
//                     id: true,
//                 },
//                 where: {
//                     status: 'COMPLETED'
//                 }
//             }),
//             prisma.workbook.aggregate({
//                 _count: {
//                     id: true,
//                 },
//                 where: {
//                     status: 'FAILED'
//                 }
//             }),
//             prisma.workbook.aggregate({
//                 _count: {
//                     id: true,
//                 },
//                 where: {
//                     status: 'PROCESSING'
//                 }
//             })
//         ])

//         return res.status(200).json({
//             success: true,
//             summary: {
//                 totalFiles: totalFiles._count.id,
//                 completed: completed._count.id,
//                 failed: failed._count.id,
//                 processing: processing._count.id,
//                 successRate: totalFiles._count.id > 0 ? (completed._count.id / totalFiles._count.id) * 100 : 0
//             }
//         })
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message,
//         })
//     }
// }

export const getStats = async (req, res) => {
    try {
        const [totalFiles, statusCounts] = await Promise.all([
            prisma.workbook.count(),
            prisma.workbook.groupBy({
                by: ['status'],
                _count: {
                    status: true,
                }
            })
        ])

        const completed = statusCounts.find((item) => item.status === 'COMPLETED');
        const failed = statusCounts.find((item) => item.status === 'FAILED');
        const processing = statusCounts.find((item) => item.status === 'PROCESSING');

        return res.status(200).json({
            success: true,
            message: "Stats fetched successfully",
            summary: {
                totalFiles: totalFiles,
                completed: completed?._count.status,
                failed: failed?._count.status,
                processing: processing?._count.status,
                succesRate: totalFiles > 0 ? (completed?._count.status / totalFiles) * 100 : 0
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}
