import { prisma } from "../config/prisma.js";

export const isFileDeleted = async (req, res, next) => {
    try {
        const fileId = Number(req.params.id);
        if (!Number.isInteger(fileId) || fileId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid file id."
            })
        }

        const file = await prisma.file.findUnique({
            where: {
                id: fileId,
            },
            select: {
                id: true,
                isDeleted: true,
            }
        })

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File Not Found",
            })
        }

        if (file.isDeleted) {
            req.fileId = file.id
            return next();
        }

        return res.status(409).json({
            success: false,
            message: "File Not Deleted"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
            error: error.message,
        });
    }
}