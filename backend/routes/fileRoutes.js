import express from "express";
import { deleteFile, getFile, grantFilePermission, listFilePermissions, revokeFilePermission, updateFile, uploadFile, serveFile } from "../controllers/fileController.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { requireFileDeleteAccess, requireFileReadAccess, requireFileWriteAccess } from "../middlewares/fileAccess.js";
import { requirePermissionGrantAccess } from "../middlewares/requirePermissionGrantAccess.js";

const router = express.Router();

router.post("/upload", isAuthenticated, upload.single("file"), uploadFile);
router.get("/:id", isAuthenticated, requireFileReadAccess, getFile);
router.get("/:id/view", isAuthenticated, requireFileReadAccess, serveFile);
router.patch("/:id", isAuthenticated, requireFileWriteAccess, upload.single("file"), updateFile);
router.delete("/:id", isAuthenticated, requireFileDeleteAccess, deleteFile);

router.post("/:id/grant-permissions", isAuthenticated, requirePermissionGrantAccess, grantFilePermission);
router.get("/:id/list-permissions", isAuthenticated, requirePermissionGrantAccess, listFilePermissions);
router.delete("/:id/revoke-permissions/:userId", isAuthenticated, requirePermissionGrantAccess, revokeFilePermission);

export default router;