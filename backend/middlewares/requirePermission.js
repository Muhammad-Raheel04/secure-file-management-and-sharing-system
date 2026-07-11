import { prisma } from "../config/prisma.js";

export const requirePermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: `Unauthorized`
                })
            }
            const normalizedPermission = permissionName.trim().toUpperCase();

            const user = await prisma.user.findUnique({
                where: {
                    id: req.user.id,
                },
                include: {
                    userRoles: {
                        include: {
                            role: {
                                include: {
                                    rolePermissions: {
                                        include: {
                                            permission: true,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User Not Found",
                })
            }

            const hasPermission = user.userRoles.some((userRole) =>
                userRole.role.rolePermissions.some(
                    (rolePermission) => (
                        rolePermission.permission.name === normalizedPermission
                    )
                ));

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `U don't have ${normalizedPermission} permission`
                })
            }
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            })
        }
    }
}