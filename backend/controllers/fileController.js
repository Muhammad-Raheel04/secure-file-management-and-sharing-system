import fsPromises from "fs/promises";
import fs from 'fs';
import fsExtra from 'fs-extra';
import { randomUUID } from "crypto";
import { prisma } from "../config/prisma.js";
import { getUploadedChunks, getUploadSessionDir, removeFileFromDisk, sanitizeFileName } from "../utils/fileUtility.js";
import path from 'path';
import { UPLOAD_TEMP_DIR } from "../constants/fileConstants.js";

export const initUpload = async (req, res) => {
  try {
    const { fileName, totalChunks, category, documentType } = req.body;

    if (!fileName || !totalChunks || !category || !documentType) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      })
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
    ]);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Invalid category."
      });
    }

    if (!existingDocumentType) {
      return res.status(404).json({
        success: false,
        message: "Invalid document type."
      });
    }

    const uploadId = randomUUID();
    const uploadDir = getUploadSessionDir(uploadId);
    await fsExtra.ensureDir(uploadDir);

    await fsExtra.writeJSON(path.join(uploadDir, 'metadata.json'), {
      fileName,
      totalChunks: parseInt(totalChunks),
      category,
      documentType,
      categoryId: existingCategory.id,
      documentTypeId: existingDocumentType.id,
      uploadId,
      createdAt: new Date().toISOString()
    })

    return res.status(200).json({
      success: true,
      message: "Upload Session initialized",
      uploadId,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to Initialize upload",
      error: error.message,
    })
  }
}

export const getUploadStatus = async (req, res) => {
  try {
    const { uploadId } = req.params;

    if (!uploadId) {
      return res.status(400).json({
        success: false,
        message: "uploadId is required",
      })
    }

    const uploadDir = getUploadSessionDir(uploadId);

    if (!fs.existsSync(uploadDir)) {
      return res.status(404).json({
        success: false,
        message: "Upload Session not found",
      })
    }

    const metaData = await fsExtra.readJSON(path.join(uploadDir, 'metadata.json'));
    const uploadedChunks = await getUploadedChunks(uploadDir);

    return res.status(200).json({
      success: true,
      uploadId,
      fileName: metaData.fileName,
      totalChunks: metaData.totalChunks,
      uploadedChunks,
      progress: Math.round((uploadedChunks.length / metaData.totalChunks) * 100),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get upload status",
      error: error.message,
    })
  }
}

export const uploadChunk = async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    if (!uploadId || chunkIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "uploadId and chunkIndex are required",
      })
    }

    const uploadDir = getUploadSessionDir(uploadId);

    if (!fs.existsSync(uploadDir)) {
      return res.status(404).json({
        success: false,
        message: "Upload session not found",
      })
    }

    const chunkPath = path.join(uploadDir, `chunk_${chunkIndex}`);
    await fsExtra.move(req.file.path, chunkPath, { overwrite: true });

    const uploadedChunks = await getUploadedChunks(uploadDir);

    return res.status(200).json({
      success: true,
      chunkIndex: parseInt(chunkIndex),
      uploadedChunks,
      progress: Math.round((uploadedChunks.length / parseInt(totalChunks) * 100))
    })
  } catch (error) {
    removeFileFromDisk(req.file?.path);
    return res.status(500).json({
      success: false,
      message: "Failed to get upload status",
      error: error.message,
    })
  }
}

export const completeUpload = async (req, res) => {
  try {
    const { uploadId } = req.body;

    if (!uploadId) {
      return res.status(400).json({
        success: false,
        message: "uploadId is required",
      })
    }

    const uploadDir = getUploadSessionDir(uploadId);

    if (!fs.existsSync(uploadDir)) {
      return res.status(404).json({
        success: false,
        message: "Upload session not found",
      })
    }

    const metadata = await fsExtra.readJSON(path.join(uploadDir, 'metadata.json'));
    const uploadedChunks = await getUploadedChunks(uploadDir);

    if (uploadedChunks.length !== metadata.totalChunks) {
      return res.status(409).json({
        success: false,
        message: "Not all chunks are uploaded",
        uploaded: uploadedChunks.length,
        total: metadata.totalChunks,
      })
    }

    const safeCategory = sanitizeFileName(metadata.category);
    const safeFileName = sanitizeFileName(metadata.fileName);
    const uploadDir_ = path.join(process.cwd(), "uploads", safeCategory);
    await fsExtra.ensureDir(uploadDir_);

    const finalPath = path.join(uploadDir_, `${Date.now()}-${safeFileName}`);
    const writeStream = fs.createWriteStream(finalPath);

    for (let i = 0; i < metadata.totalChunks; i++) {
      const chunkPath = path.join(uploadDir, `chunk_${i}`);
      const chunkData = await fsExtra.readFile(chunkPath);
      writeStream.write(chunkData);
    }

    await new Promise((resolve, reject) => {
      writeStream.end();
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const stats = await fsExtra.stat(finalPath);

    const file = await prisma.file.create({
      data: {
        originalName: metadata.fileName,
        storedName: path.basename(finalPath),
        mimeType: req.body.mimeType,


        size: stats.size,
        filePath: finalPath,
        categoryId: metadata.categoryId,
        documentTypeId: metadata.documentTypeId,
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

    try {
      await fsExtra.remove(uploadDir);
      console.log("Temporary upload directory removed.");
    } catch (err) {
      console.error("Failed to remove upload directory:", err);
    }
    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to complete upload",
      error: error.message
    });
  }
}

export const cancelUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;

    if (!uploadId) {
      return res.status(400).json({
        success: false,
        message: "uploadId is required"
      });
    }

    const uploadDir = getUploadSessionDir(uploadId);

    if (fs.existsSync(uploadDir)) {
      await fsExtra.remove(uploadDir);
    }

    return res.status(200).json({
      success: true,
      message: "Upload cancelled and cleaned up"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cancel upload",
      error: error.message
    });
  }
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
    const file = req.fileRecord;
    const fileId = req.fileId;
    const normalizedAccess = req.access;
    const { userEmail } = req.body

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "Required field is missing",
      });
    }


    const targetUser = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isAdmin = targetUser.userRoles.some(
      (userRole) => userRole.role.name === "ADMIN"
    )

    if (isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admins already have full access",
      })
    }

    if (file.ownerId === targetUser.id) {
      return res.status(400).json({
        success: false,
        message: "Owner already has full access",
      });
    }
    const fileAccess = await prisma.fileAccess.findUnique({
      where: {
        name: normalizedAccess,
      },
    });

    if (!fileAccess) {
      return res.status(400).json({
        success: false,
        message: "Invalid access type.",
      });
    }

    const permission = await prisma.filePermission.upsert({
      where: {
        fileId_userId: {
          fileId,
          userId: targetUser.id,
        },
      },
      update: {
        fileAccessId: fileAccess.id,
        grantedById: req.user.id,
      },
      create: {
        fileId,
        userId: targetUser.id,
        fileAccessId: fileAccess.id,
        grantedById: req.user.id,
      },
      include: {
        access: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        grantedBy: {
          select: {
            id: true,
            name: true,
            email: true,
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

export const revokeFilePermission = async (req, res) => {
  try {
    const file = req.fileRecord;
    const fileId = req.fileId;
    const normalizedAccess = req.access;
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }


    const targetUser = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isAdmin = targetUser.userRoles.some(
      (userRole) => userRole.role.name === "ADMIN"
    )

    if (isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Can't revoke permissions from Admin",
      })
    }

    if (file.ownerId === targetUser.id) {
      return res.status(400).json({
        success: false,
        message: "Owner access can't be revoked",
      });
    }
    const permission = await prisma.filePermission.findUnique({
      where: {
        fileId_userId: {
          fileId,
          userId: targetUser.id,
        },
      },
      include: {
        access: true,
      },
    });

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    if (permission.access.name !== normalizedAccess) {
      return res.status(400).json({
        success: false,
        message: `User does not have ${normalizedAccess} permission`,
      });
    }

    await prisma.filePermission.delete({
      where: {
        fileId_userId: {
          fileId,
          userId: targetUser.id,
        },
      },
    });

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