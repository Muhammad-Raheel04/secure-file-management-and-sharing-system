import FS from "fs/promises";
import fs from 'fs';
import { prisma } from "../config/prisma.js";
import { removeFileFromDisk } from "../utils/fileUtility.js";
import path from 'path';

const VALID_PERMISSION_ACCESS = new Set(["READ", "WRITE"]);


const parsePositiveInt = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};


export const uploadFile = async (req, res) => {
  const uploadedBinary = req.file;

  try {
    if (!uploadedBinary) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const file = await prisma.file.create({
      data: {
        originalName: uploadedBinary.originalname,
        storedName: uploadedBinary.filename,
        mimeType: uploadedBinary.mimetype,
        size: uploadedBinary.size,
        filePath: uploadedBinary.path,
        categoryId: req.category.id,
        documentTypeId: req.documentType.id,
        ownerId: req.user.id,
        uploadedById: req.user.id,
      },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        filePath: true,
        size: true,
        createdAt: true,
      }
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file,
    });
  } catch (error) {
    removeFileFromDisk(uploadedBinary?.path);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateFile = async (req, res) => {
  const uploadedBinary = req.file;

  try {
    const data = {};

    if (req.category) {
      data.categoryId = req.category.id;
    }

    if (req.documentType) {
      data.documentTypeId = req.documentType.id;
    }

    if (uploadedBinary) {
      data.originalName = uploadedBinary.originalname;
      data.storedName = uploadedBinary.filename;
      data.mimeType = uploadedBinary.mimetype;
      data.size = uploadedBinary.size;
      data.filePath = uploadedBinary.path;
      data.uploadedById = req.user.id;
    }

    const updatedFile = await prisma.file.update({
      where: { id: req.fileId },
      data,
    });

    if (uploadedBinary) {
      removeFileFromDisk(uploadedBinary?.path);
    }

    return res.status(200).json({
      success: true,
      message: "File updated successfully",
      file: updatedFile,
    });
  } catch (error) {
    removeFileFromDisk(uploadedBinary?.path);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const deletedFile = await prisma.file.update({
      where: {
        id: req.fileId
      },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: "File moved to trash",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const grantFilePermission = async (req, res) => {
  try {
    const fileId = parsePositiveInt(req.params.id);
    const userId = parsePositiveInt(req.body.userId);
    const access = req.body.access;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "Invalid file id",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    if (!VALID_PERMISSION_ACCESS.has(access)) {
      return res.status(400).json({
        success: false,
        message: "Access must be READ or WRITE",
      });
    }

    const [file, targetUser] = await Promise.all([
      prisma.file.findUnique({
        where: { id: fileId },
        select: {
          id: true,
          ownerId: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      }),
    ]);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (targetUser.role === "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Admins already have full access",
      });
    }

    if (file.ownerId === targetUser.id) {
      return res.status(400).json({
        success: false,
        message: "Owner already has full access",
      });
    }

    const permission = await prisma.filePermission.upsert({
      where: {
        fileId_userId: {
          fileId,
          userId,
        },
      },
      update: {
        access,
        grantedById: req.user.id,
      },
      create: {
        fileId,
        userId,
        access,
        grantedById: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        grantedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Permission granted successfully",
      permission,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const listFilePermissions = async (req, res) => {
  try {
    const fileId = parsePositiveInt(req.params.id);

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "Invalid file id",
      });
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        originalName: true,
        ownerId: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const permissions = await prisma.filePermission.findMany({
      where: { fileId },
      orderBy: [
        { access: "desc" },
        { createdAt: "asc" },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        grantedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      file,
      permissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const revokeFilePermission = async (req, res) => {
  try {
    const fileId = parsePositiveInt(req.params.id);
    const userId = parsePositiveInt(req.params.userId);

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "Invalid file id",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        ownerId: true,
      },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    if (file.ownerId === userId) {
      return res.status(400).json({
        success: false,
        message: "Owner access cannot be revoked",
      });
    }

    const deletedPermission = await prisma.filePermission.deleteMany({
      where: {
        fileId,
        userId,
      },
    });

    if (deletedPermission.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Permission revoked successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const serveFile = async (req, res) => {
  try {
    const file = req.fileRecord;
    const absolutePath = path.resolve(file.filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${file.originalName}"`);
    res.sendFile(absolutePath);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const restoreFile = async (req, res) => {
  try {
    await prisma.file.update({
      where: {
        id: req.fileId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      }
    })

    return res.status(200).json({
      success: true,
      message: "File Restored Successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
}
