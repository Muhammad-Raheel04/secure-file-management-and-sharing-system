import {
  canDeleteFile,
  canReadFile,
  canWriteFile,
} from "../services/fileAccessService.js";

const parseFileId = (value) => {
  const fileId = Number(value);
  return Number.isInteger(fileId) && fileId > 0 ? fileId : null;
};

const createFileAccessMiddleware = (accessResolver) => {
  return async (req, res, next) => {
    try {
      const fileId = parseFileId(req.params.id);

      if (!fileId) {
        return res.status(400).json({
          success: false,
          message: "Invalid file id",
        });
      }

      const access = await accessResolver(req.user, fileId);

      if (!access.allowed) {
        return res.status(access.statusCode).json({
          success: false,
          message: access.message,
        });
      }

      req.fileId = fileId;
      req.fileRecord = access.file;
      req.message = access.message;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
};

export const requireFileReadAccess = createFileAccessMiddleware(canReadFile);
export const requireFileWriteAccess = createFileAccessMiddleware(canWriteFile);
export const requireFileDeleteAccess = createFileAccessMiddleware(canDeleteFile);
