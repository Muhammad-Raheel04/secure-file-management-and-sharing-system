import express from "express";
import { deleteFile, grantFilePermission, listFilePermissions, revokeFilePermission, updateFile, uploadFile, serveFile, restoreFile } from "../controllers/fileController.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
// import { requireFileDeleteAccess, requireFileReadAccess, requireFileWriteAccess } from "../middlewares/fileAccess.js";
import { requirePermissionGrantAccess } from "../middlewares/requirePermissionGrantAccess.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import { validateFileMetaData } from "../middlewares/validateFileMetaData.js";
import { requireFileAccess } from "../middlewares/requireFileAccess.js";
import { checkFileNotDeleted } from "../middlewares/checkFileNotDeleted.js";
import { isFileDeleted } from "../middlewares/isFileDeleted.js";

const router = express.Router();

router.post("/upload", isAuthenticated, requirePermission("UPLOAD"), upload.single("file"), validateFileMetaData, uploadFile);
router.get("/:id/view", isAuthenticated, checkFileNotDeleted, requireFileAccess("VIEW"), serveFile);
router.patch("/:id", isAuthenticated, checkFileNotDeleted, requireFileAccess("EDIT"), upload.single("file"), validateFileMetaData, updateFile);
router.delete("/:id", isAuthenticated, checkFileNotDeleted, requireFileAccess("DELETE"), deleteFile);
router.patch('/:id/restore', isAuthenticated, isFileDeleted, requirePermission("RESTORE"), requireFileAccess("RESTORE"), restoreFile)
// router.post("/:id/grant-permissions", isAuthenticated, requirePermission("SHARE"), requireFileAccess("SHARE"),grantFilePermission);
// router.get("/:id/list-permissions", isAuthenticated, requirePermissionGrantAccess, listFilePermissions);
// router.delete("/:id/revoke-permissions/:userId", isAuthenticated, requirePermissionGrantAccess, revokeFilePermission);

export default router;