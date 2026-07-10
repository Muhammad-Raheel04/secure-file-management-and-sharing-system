import { prisma } from "../config/prisma.js";

export const addRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!role) {
            // Bad Request
            return res.status(400).json({
                success: false,
                message: "Required Fields are missing",
            })
        }

        const normalizedRole = role.trim().toUpperCase();
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

export const assignRole = async (req, res) => {
    try {
        const { userEmail, role } = req.body;

        if (!userEmail || !role) {
            return res.status(400).json({
                success: false,
                message: "Required Field is missing",
            })
        }

        const user = await prisma.user.findUnique({
            where: {
                email: userEmail
            },
            include: {
                userRoles: true,
            }
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const normalizeRole = role.trim().toUpperCase();

        const existingRole = await prisma.role.findUnique({
            where: {
                name: normalizeRole,
            }
        })

        if (!existingRole) {
            return res.status(404).json({
                success: false,
                message: "Role does not exist",
            });
        }

        const hasRole = user.userRoles.some((role) => role.name === normalizeRole);

        if (hasRole) {
            return res.status(409).json({
                success: false,
                message: "User already has this role",
            });
        }

        await prisma.user.update({
            where: {
                email: userEmail
            },
            data: {
                userRoles: {
                    connect: {
                        id: existingRole.id
                    }
                }
            }
        })

        return res.status(200).json({
            success: true,
            message: "Role assigned successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}