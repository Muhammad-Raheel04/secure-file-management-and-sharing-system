import { prisma } from "../config/prisma.js";

export const addCategory = async (req, res) => {
    try {
        const { category } = req.body;
        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Reuired field is missing",
            })
        }
        const normalizedCategory=category.trim().toUpperCase();
        const exisitingCategory = await prisma.fileCategory.findUnique({
            where: {
                name: normalizedCategory,
            }
        })
        if (exisitingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category Already Exists"
            })
        }
        await prisma.fileCategory.create({
            data: {
                name: normalizedCategory
            }
        })
        return res.status(200).json({
            success: true,
            message: "Category Added Scucessfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

export const deleteCategory = async (req, res) => {
    try {
        const { category } = req.body;
        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Reuired field is missing",
            })
        }
        const exisitingCategory = await prisma.fileCategory.findUnique({
            where: {
                name: category
            }
        })
        if (!exisitingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category doesn't Exists"
            })
        }
        await prisma.fileCategory.delete({
            where: {
                name: category
            }
        })
        return res.status(200).json({
            success: true,
            message: "Category deleted Scucessfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}
