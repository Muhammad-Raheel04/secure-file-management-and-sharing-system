import { prisma } from "../config/prisma.js";

export const addAccess = async (req, res) => {
    try {
        const { fileAccess } = req.body;

        if (!fileAccess) {
            return res.status(400).json({
                success: false,
                message: "Required field missing",
            })
        }
        const normalizedAccess = fileAccess.trim().toUpperCase();

        const existingAccess = await prisma.fileAccess.findUnique({
            where: {
                name: normalizedAccess,
            }
        })

        if (existingAccess) {
            return res.status(409).json({
                success: false,
                message: "Access Already Exist",
            })
        }

        await prisma.fileAccess.create({
            data: {
                name: normalizedAccess,
            }
        })

        return res.status(201).json({
            success: true,
            message: `${normalizedAccess} Access added to system successfully`,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

export const removeAccess = async (req, res) => {
    try {
        const { fileAccess } = req.body;

        if (!fileAccess) {
            return res.status(400).json({
                success: false,
                message: "Required field missing",
            })
        }
        const normalizedAccess = fileAccess.trim().toUpperCase();

        const existingAccess = await prisma.fileAccess.findUnique({
            where: {
                name: normalizedAccess,
            }
        })

        if (!existingAccess) {
            return res.status(404).json({
                success: false,
                message: "System doesn't have this access",
            })
        }

        await prisma.fileAccess.delete({
            where: {
                name: normalizedAccess,
            }
        })

        return res.status(201).json({
            success: true,
            message: `${normalizedAccess} Access removed from system successfully`,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}