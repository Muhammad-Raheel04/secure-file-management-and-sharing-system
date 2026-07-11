import express from "express";
import { deleteFile, grantFilePermission, listFilePermissions, revokeFilePermission, updateFile, uploadFile, serveFile } from "../controllers/fileController.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { requireFileDeleteAccess, requireFileReadAccess, requireFileWriteAccess } from "../middlewares/fileAccess.js";
import { requirePermissionGrantAccess } from "../middlewares/requirePermissionGrantAccess.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import { validateFileMetaData } from "../middlewares/validateFileMetaData.js";
import { requireFileAccess } from "../middlewares/requireFileAccess.js";

const router = express.Router();

router.post("/upload", isAuthenticated, requirePermission("UPLOAD"), upload.single("file"), validateFileMetaData, uploadFile);
router.get("/:id/view", isAuthenticated, requireFileAccess("VIEW"), serveFile);
router.patch("/:id", isAuthenticated, requireFileAccess("EDIT"), upload.single("file"), validateFileMetaData, updateFile);
router.delete("/:id", isAuthenticated, requireFileAccess("DELETE"), deleteFile);

router.post("/:id/grant-permissions", isAuthenticated, requirePermission("SHARE"), requireFileAccess("SHARE"),grantFilePermission);
router.get("/:id/list-permissions", isAuthenticated, requirePermissionGrantAccess, listFilePermissions);
router.delete("/:id/revoke-permissions/:userId", isAuthenticated, requirePermissionGrantAccess, revokeFilePermission);

export default router;