import { prisma } from "../config/prisma.js";
import { removeFileFromDisk } from "../utils/fileUtility.js";

export const validateFileMetaData = async (req, res, next) => {
    try {
        const { category, documentType } = req.body;

        if (!category || !documentType) {
            removeFileFromDisk(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Category and document type are required.",
            });
        }

        const normalizedCategory = category.trim().toUpperCase();
        const normalizedDocumentType = documentType.trim().toUpperCase();

        const [existingCategory, existingDocumentType] = await Promise.all([
            prisma.fileCategory.findUnique({
                where: {
                    name: normalizedCategory
                }
            }),

            prisma.documentType.findUnique({
                where: {
                    name: normalizedDocumentType
                }
            })
        ])


        if (!existingCategory) {
            removeFileFromDisk(req.file.path)
            return res.status(404).json({
                success: false,
                message: "Invalid category.",
            });
        }

        if (!existingDocumentType) {
            removeFileFromDisk(req.file.path)
            return res.status(404).json({
                success: false,
                message: "Invalid document type.",
            });
        }

        req.category = existingCategory;
        req.documentType = existingDocumentType;

        next();
    } catch (error) {
        removeFileFromDisk(req.file.path)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}