import { prisma } from "../config/prisma.js";

export const addDocumentType = async (req, res) => {
    try {
        const { documentType } = req.body;
        if (!documentType) {
            return res.status(400).json({
                success: false,
                message: "Reuired field is missing",
            })
        }
        const normalizeDocumentType=documentType.trim().toUpperCase();
        const exisitingDocumentType = await prisma.documentType.findUnique({
            where: {
                name: normalizeDocumentType
            }
        })
        if (exisitingDocumentType) {
            return res.status(409).json({
                success: false,
                message: "DocumentType Already Exists"
            })
        }
        await prisma.documentType.create({
            data: {
                name: normalizeDocumentType
            }
        })
        return res.status(200).json({
            success: true,
            message: "DocumentType Added Scucessfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

export const deleteDocumentType = async (req, res) => {
    try {
        const { documentType } = req.body;
        if (!documentType) {
            return res.status(400).json({
                success: false,
                message: "Reuired field is missing",
            })
        }
        const exisitingDocumentType = await prisma.documentType.findUnique({
            where: {
                name: documentType
            }
        })
        if (!exisitingDocumentType) {
            return res.status(404).json({
                success: false,
                message: "DocumentType doesn't Exists"
            })
        }
        await prisma.documentType.delete({
            where: {
                name: documentType
            }
        })
        return res.status(200).json({
            success: true,
            message: "DocumentType deleted Scucessfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        })
    }
}
