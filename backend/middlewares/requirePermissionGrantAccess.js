import { prisma } from "../config/prisma.js"

export const requirePermissionGrantAccess = async (req, res, next) => {
    try {
        const file = await prisma.file.findUnique({
            where: {
                id: Number(req.params.id),
            },
            select: {
                id: true,
                ownerId: true,
            }
        })
        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found",
            });
        }

        if (req.user.role !== "ADMIN" && file.ownerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Forbidden",
            });
        }

        req.file = file;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}