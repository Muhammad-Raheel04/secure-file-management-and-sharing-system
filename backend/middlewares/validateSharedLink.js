import { prisma } from "../config/prisma.js";

export const validateShareLink = async (req, res, next) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token missing"
            })
        }

        const share = await prisma.fileShare.findUnique({
            where: {
                token,
            },
            include: {
                file: true
            }
        })

        if (!share) {
            return res.status(404).json({
                success: false,
                message: "Share link not found",
            })
        }

        if (share.isRevoked) {
            return res.status(403).json({
                success: false,
                message: "This share link has been revoked",
            })
        }

        if (share.expiresAt <= new Date()) {
            return res.status(403).json({
                success: false,
                message: "This share link has expired"
            })
        }

        req.share = share;
        req.file = share.file;

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}