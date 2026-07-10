import { prisma } from "../config/prisma.js";

export const addRole = async (req, res) => {
    try {
        const { role } = req.body;
        const normalizedRole=role.trim().toUpperCase();
        if (!role) {
            // Bad Request
            return res.status(400).json({
                success: false,
                message: "Required Fields are missing",
            })
        }

        const existingRole = await prisma.role.findUnique({
            where: {
                name: normalizedRole
            }
        })

        if (existingRole) {
            // Not Found
            return res.status(409).json({
                success: false,
                message: "Role Already Defined"
            })
        }

        const addRole = await prisma.role.create({
            data: {
                name: normalizedRole
            }
        })

        return res.status(200).json({
            success: true,
            message: "Role added successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}