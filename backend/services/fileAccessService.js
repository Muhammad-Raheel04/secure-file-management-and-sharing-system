import { prisma } from "../config/prisma.js";

export const FILE_ACTIONS = {
  READ: "READ",
  WRITE: "WRITE",
  DELETE: "DELETE",
};

const fileAccessSelect = (userId) => ({
  id: true,
  originalName: true,
  storedName: true,
  mimeType: true,
  size: true,
  filePath: true,
  category: true,
  documentType: true,
  ownerId: true,
  uploadedById: true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  uploadedBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  permissions: {
    where: { userId },
    select: {
      id: true,
      userId: true,
      access: true,
      grantedById: true,
      createdAt: true,
      updatedAt: true,
    },
  },
});

const permissionAllowsAction = (permission, action) => {
  if (!permission) {
    return false;
  }

  if (action === FILE_ACTIONS.READ) {
    return permission.access === "READ" || permission.access === "WRITE";
  }

  if (action === FILE_ACTIONS.WRITE) {
    return permission.access === "WRITE";
  }

  return false;
};

export const getFileWithAccessContext = async (fileId, userId) => {
  return prisma.file.findUnique({
    where: { id: fileId },
    select: fileAccessSelect(userId),
  });
};

export const evaluateFileAccess = (user, file, action) => {
  if (!file) {
    return {
      allowed: false,
      statusCode: 404,
      message: "File not found",
      file: null,
    };
  }

  if (user.role === "ADMIN") {
    return {
      allowed: true,
      statusCode: 200,
      message: "Admin override",
      file,
    };
  }

  if (file.ownerId === user.id) {
    return {
      allowed: true,
      statusCode: 200,
      message: "Owner access",
      file,
    };
  }

  const permission = file.permissions[0] ?? null;

  if (action === FILE_ACTIONS.DELETE) {
    return {
      allowed: false,
      statusCode: 403,
      message: "You are not allowed to delete this file",
      file,
    };
  }

  if (permissionAllowsAction(permission, action)) {
    return {
      allowed: true,
      statusCode: 200,
      message: "Explicit permission access",
      file,
    };
  }

  return {
    allowed: false,
    statusCode: 403,
    message: `You are not allowed to ${action.toLowerCase()} this file`,
    file,
  };
};

export const canReadFile = async (user, fileId, existingFile = null) => {
  const file = existingFile ?? await getFileWithAccessContext(fileId, user.id);
  return evaluateFileAccess(user, file, FILE_ACTIONS.READ);
};

export const canWriteFile = async (user, fileId, existingFile = null) => {
  const file = existingFile ?? await getFileWithAccessContext(fileId, user.id);
  return evaluateFileAccess(user, file, FILE_ACTIONS.WRITE);
};

export const canDeleteFile = async (user, fileId, existingFile = null) => {
  const file = existingFile ?? await getFileWithAccessContext(fileId, user.id);
  return evaluateFileAccess(user, file, FILE_ACTIONS.DELETE);
};
