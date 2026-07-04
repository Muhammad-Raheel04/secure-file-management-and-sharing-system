import { prisma } from "../config/prisma.js";
import fs from 'fs';
import { isDocumentTypeValid } from "../utils/isDocumentTypeValid.js";
import { isValidCategory } from "../utils/isValidCategory.js";

export const uploadFile = async (req, res) => {
    let filePath;
    try {
        const file = req.file;
        filePath = file?.path;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a file",
            })
        }

        const { category, documentType } = req.body;

        if (!category || !documentType) {
            return res.status(400).json({
                success: false,
                message: "category and documentType are required."
            })
        }

        if (!isValidCategory(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category",
            });
        }
        
        if (!isDocumentTypeValid(documentType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid documentType",
            });
        }
        
        const uploadedFile = await prisma.file.create({
            data: {
                originalName: file.originalname,
                filePath: file.path,
                storedName: file.filename,
                mimeType: file.mimetype,
                size: file.size,

                category,
                documentType,

                employeeId: req.user.id,
                uploadedById: req.user.id,
            }
        })

        return res.status(201).json({
            success: true,
            message: "File uploaded successfully",
            file: uploadedFile,
        })
    } catch (error) {
        if (filePath) {
            fs.unlink(filePath, () => { });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}