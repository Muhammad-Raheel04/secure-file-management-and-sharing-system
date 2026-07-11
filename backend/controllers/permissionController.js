import { prisma } from "../config/prisma.js";

export const addPermission = async (req, res) => {
    try {
        const { permission } = req.body;
        if (!permission) {
            return res.status(400).json({
                success: false,
                message: "Reuired field is missing",
            })
        }
        const normalizedPermission = permission.trim().toUpperCase();

        const exisitingPermission = await prisma.permission.findUnique({
            where: {
                name: normalizedPermission
            }
        })
        if (exisitingPermission) {
            return res.status(409).json({
                success: false,
                message: "Permission Already Exists"
            })
        }
        await prisma.permission.create({
            data: {
                name: normalizedPermission
            }
        })
        return res.status(200).json({
            success: true,
            message: `${normalizedPermission} Permission Added Scucessfully`,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

export const deletePermission = async (req, res) => {
    try {
        const { permission } = req.body;
        if (!permission) {
            return res.status(400).json({
                success: false,
                message: "Reuired field is missing",
            })
        }
        const normalizedPermission = permission.trim().toUpperCase();

        const exisitingPermission = await prisma.permission.findUnique({
            where: {
                name: normalizedPermission
            }
        })
        if (!exisitingPermission) {
            return res.status(404).json({
                success: false,
                message: `${normalizedPermission} Permission doesn't Exists`
            })
        }
        await prisma.permission.delete({
            where: {
                name: normalizedPermission
            }
        })
        return res.status(200).json({
            success: true,
            message: `${normalizedPermission} Permission deleted Scucessfully`,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}

export const grantRoleLevelPermissions = async (req, res) => {
    try {
        const { role, permission } = req.body;
        if (!permission || !role) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing",
            })
        }
        const normalizedRole = role.trim().toUpperCase();
        const normalizedPermission = permission.trim().toUpperCase();

        const exisitinRole = await prisma.role.findUnique({
            where: {
                name: normalizedRole
            }
        })
        if (!exisitinRole) {
            return res.status(409).json({
                success: false,
                message: `${normalizedPermission} Role Doesn't Exist`
            })
        }
        const exisitingPermission = await prisma.permission.findUnique({
            where: {
                name: normalizedPermission
            }
        })
        if (!exisitingPermission) {
            return res.status(409).json({
                success: false,
                message: `${normalizedPermission} Permission Doesn't Exists`
            })
        }

        const existingRolePermission = await prisma.rolePermission.findUnique({
            where: {
                roleId_permissionId: {
                    roleId: exisitinRole.id,
                    permissionId: exisitingPermission.id,
                }
            }
        })

        if (existingRolePermission) {
            return res.status(409).json({
                success: false,
                message: `${normalizedPermission} permission has already been granted to ${normalizedRole}.`
            })
        }

        await prisma.rolePermission.create({
            data: {
                roleId: exisitinRole.id,
                permissionId: exisitingPermission.id,
            }
        })

        return res.status(200).json({
            success: true,
            message: `Permission for ${role} Added Scucessfully`,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}

export const revokeRoleLevelPermissions = async (req, res) => {
    try {
        const { role, permission } = req.body;
        if (!permission || !role) {
            return res.status(400).json({
                success: false,
                message: "Reuired fields are missing",
            })
        }
        const normalizedRole = role.trim().toUpperCase();

        const exisitinRole = await prisma.role.findUnique({
            where: {
                name: normalizedRole
            }
        })
        if (!exisitinRole) {
            return res.status(409).json({
                success: false,
                message: `${normalizedRole} Role Doesn't Exist`
            })
        }
        const exisitingPermission = await prisma.permission.findUnique({
            where: {
                name: permission
            }
        })
        if (!exisitingPermission) {
            return res.status(409).json({
                success: false,
                message: `${normalizedPermission} Permission Doesn't Exists`
            })
        }

        const existingRolePermission = await prisma.rolePermission.findUnique({
            where: {
                roleId_permissionId: {
                    roleId: exisitinRole.id,
                    permissionId: exisitingPermission.id,
                }
            }
        })

        if (!existingRolePermission) {
            return res.status(409).json({
                success: false,
                message: `${normalizedPermission} Permission isn't assigned for this role(${normalizedRole})`
            })
        }

        await prisma.rolePermission.delete({
            where: {
                roleId: exisitinRole.id,
                permissionId: exisitingPermission.id,
            }
        })

        return res.status(200).json({
            success: true,
            message: `${normalizedPermission} Permission deleted Scucessfully for role(${normalizedRole})`,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}