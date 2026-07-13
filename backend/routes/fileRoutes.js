import express from "express";
import { deleteFile, grantFilePermission, revokeFilePermission, updateFile, uploadFile, serveFile, restoreFile } from "../controllers/fileController.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
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

router.patch("/:id/grant-view-permission", isAuthenticated, requirePermission("VIEW"), requireFileAccess("VIEW"), (req, res, next) => { req.access = "VIEW"; next() }, grantFilePermission);
router.delete("/:id/revoke-view-permission", isAuthenticated, requirePermission("VIEW"), requireFileAccess("VIEW"), (req, res, next) => { req.access = "VIEW"; next() }, revokeFilePermission);

router.patch("/:id/grant-edit-permission", isAuthenticated, requirePermission("EDIT"), requireFileAccess("EDIT"), (req, res, next) => { req.access = "EDIT"; next() }, grantFilePermission);
router.delete("/:id/revoke-edit-permission", isAuthenticated, requirePermission("EDIT"), requireFileAccess("EDIT"), (req, res, next) => { req.access = "EDIT"; next() }, revokeFilePermission);

export default router;