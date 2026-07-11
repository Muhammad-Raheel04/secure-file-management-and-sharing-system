import { prisma } from "../config/prisma.js";

export const requireFileAccess = (access) => {
    return async (req, res, next) => {
        try {
            const fileId = Number(req.params.id);

            if (!Number.isInteger(fileId) || fileId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid file id."
                })
            }

            const normalizeAccess = access.trim().toUpperCase();

            const file = await prisma.file.findUnique({
                where: {
                    id: fileId,
                },
                include: {
                    permissions: {
                        include: {
                            access: true
                        }
                    }
                }
            })

            if (!file) {
                return res.status(404).json({
                    success: false,
                    message: "File Not Found",
                })
            }

            if (req.user?.roles.some((role) => role.name === 'ADMIN')) {
                req.fileId = fileId;
                req.fileRecord = file;
                return next();
            }
            if (file.ownerId === req.user.id) {
                req.fileId = fileId;
                req.fileRecord = file;
                return next();
            }

            const permission = file.permissions.find(
                (permission) =>
                    permission.userId === req.user.id && permission.access.name === normalizeAccess
            )

            if (!permission) {
                return res.status(403).json({
                    success: false,
                    message: `You don't have ${normalizeAccess} access to this file`
                })
            }

            req.fileId = fileId;
            req.fileRecord = file;

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message,
            });
        }
    }
}