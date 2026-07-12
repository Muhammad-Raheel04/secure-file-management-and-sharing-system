import crypto from 'crypto';
import { prisma } from '../config/prisma.js';

export const createFileShareLink = async (req, res) => {
    try {
        const { expiryTime } = req.body;

        if (!Number.isInteger(expiryTime) || expiryTime <= 0) {
            return res.status(400).json({
                success: false,
                message: "expiry hours must be a positive integer."
            })
        }

        const expiresAt = new Date(Date.now() + expiryTime * 60 * 60 * 1000);

        const token = crypto.randomUUID();

        const share = await prisma.fileShare.create({
            data: {
                token,
                fileId: req.fileId,
                sharedById: req.user.id,
                expiresAt,
            }
        })

        return res.status(201).json({
            success: true,
            message: "Share Link created succcessfully",
            shareUrl:`${process.env.BACKEND_API_URL}/share/${token}`,
            expiresAt,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}