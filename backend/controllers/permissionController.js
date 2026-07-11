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
        const exisitingPermission = await prisma.permission.findUnique({
            where: {
                name: permission
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
                name: permission
            }
        })
        return res.status(200).json({
            success: true,
            message: "Permission Added Scucessfully",
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
        const exisitingPermission = await prisma.permission.findUnique({
            where: {
                name: permission
            }
        })
        if (!exisitingPermission) {
            return res.status(404).json({
                success: false,
                message: "Permission doesn't Exists"
            })
        }
        await prisma.permission.delete({
            where: {
                name: permission
            }
        })
        return res.status(200).json({
            success: true,
            message: "Permission deleted Scucessfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}