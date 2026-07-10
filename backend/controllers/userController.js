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

export const removeRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Required field missing",
            })
        }

        const normalizedRole = role.trim().toUpperCase();

        const existingRole = await prisma.role.findUnique({
            where: {
                name: normalizedRole
            }
        })

        if (!existingRole) {
            return res.status(404).json({
                success: false,
                message: "Role Doesn't Exist",
            })
        }

        await prisma.role.delete({
            where: {
                name: normalizedRole
            }
        })

        return res.status(200).json({
            success: true,
            message: "Role deleted successfully",
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
                userRoles: {
                    include: {
                        role: true,
                    }
                }
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

        const hasRole = user.userRoles.some((userRole) => userRole.role?.name === normalizeRole);

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
                    create: {
                        roleId: existingRole.id
                    }
                }
            }
        })

        return res.status(200).json({
            success: true,
            message: "Role assigned successfully to user",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}

export const revokeRole = async (req, res) => {
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
                userRoles: {
                    include: {
                        role: true,
                    }
                }
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

        const hasRole = user.userRoles.some((userRole) => userRole.role?.name === normalizeRole);

        if (!hasRole) {
            return res.status(409).json({
                success: false,
                message: "User hasn't this role",
            });
        }

        await prisma.user.update({
            where: {
                email: userEmail
            },
            data: {
                userRoles: {
                    disconnect: {
                        userId_roleId: {
                            userId: user.id,
                            roleId: existingRole.id
                        }
                    }
                }
            }
        })

        return res.status(200).json({
            success: true,
            message: "Role Revoked successfully from user",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}