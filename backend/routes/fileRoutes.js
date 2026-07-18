import express from "express";
import { deleteFile, grantFilePermission, revokeFilePermission, updateFile, uploadFile, serveFile, restoreFile, getUploadStatus, uploadChunk, initUpload, completeUpload, cancelUpload, downloadFile, getWorkbookInfo, getWorksheetData, getWorkbookStatus, getFile } from "../controllers/fileController.js";
import { chunkUpload, upload } from "../middlewares/uploadMiddleware.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { requirePermissionGrantAccess } from "../middlewares/requirePermissionGrantAccess.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import { validateFileMetaData } from "../middlewares/validateFileMetaData.js";
import { requireFileAccess } from "../middlewares/requireFileAccess.js";
import { checkFileNotDeleted } from "../middlewares/checkFileNotDeleted.js";
import { isFileDeleted } from "../middlewares/isFileDeleted.js";

const router = express.Router();

router.post("/upload", isAuthenticated, requirePermission("UPLOAD"), upload.single("file"), validateFileMetaData, uploadFile);
router.get("/:id", isAuthenticated, checkFileNotDeleted, requireFileAccess("VIEW"), getFile);
router.get("/:id/view", isAuthenticated, checkFileNotDeleted, requireFileAccess("VIEW"), serveFile);
router.patch("/:id", isAuthenticated, checkFileNotDeleted, requireFileAccess("EDIT"), upload.single("file"), validateFileMetaData, updateFile);
router.delete("/:id", isAuthenticated, checkFileNotDeleted, requireFileAccess("DELETE"), deleteFile);
router.patch('/:id/restore', isAuthenticated, isFileDeleted, requirePermission("RESTORE"), requireFileAccess("RESTORE"), restoreFile)

router.patch("/:id/grant-view-permission", isAuthenticated, requirePermission("VIEW"), requireFileAccess("VIEW"), (req, res, next) => { req.access = "VIEW"; next() }, grantFilePermission);
router.delete("/:id/revoke-view-permission", isAuthenticated, requirePermission("VIEW"), requireFileAccess("VIEW"), (req, res, next) => { req.access = "VIEW"; next() }, revokeFilePermission);

router.patch("/:id/grant-edit-permission", isAuthenticated, requirePermission("EDIT"), requireFileAccess("EDIT"), (req, res, next) => { req.access = "EDIT"; next() }, grantFilePermission);
router.delete("/:id/revoke-edit-permission", isAuthenticated, requirePermission("EDIT"), requireFileAccess("EDIT"), (req, res, next) => { req.access = "EDIT"; next() }, revokeFilePermission);

router.post('/upload/init', isAuthenticated, requirePermission("UPLOAD"), chunkUpload.single('file'), initUpload);
router.get('/upload/:uploadId/status', isAuthenticated, getUploadStatus);
router.post('/upload/chunk', isAuthenticated, requirePermission("UPLOAD"), chunkUpload.single("file"), uploadChunk);
router.post('/upload/complete', isAuthenticated, requirePermission("UPLOAD"), completeUpload);
router.delete('/upload/:uploadId/cancel', isAuthenticated, cancelUpload);


router.get('/:id/download', isAuthenticated, requireFileAccess('DOWNLOAD'), downloadFile);
router.get('/:id/workbook', isAuthenticated, requireFileAccess('VIEW'), getWorkbookInfo);
router.get('/:id/workbook/status', isAuthenticated, requireFileAccess("VIEW"), getWorkbookStatus);
router.get('/:id/sheets/:worksheetId', isAuthenticated, requireFileAccess('VIEW'), getWorksheetData);

export default router;