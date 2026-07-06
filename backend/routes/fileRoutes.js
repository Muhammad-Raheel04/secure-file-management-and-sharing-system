import express from "express";
import { deleteFile, getFile, grantFilePermission, listFilePermissions, revokeFilePermission, updateFile, uploadFile } from "../controllers/fileController.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { requireFileDeleteAccess, requireFileReadAccess, requireFileWriteAccess } from "../middlewares/fileAccess.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();

router.post("/upload", isAuthenticated, upload.single("file"), uploadFile);
router.get("/:id", isAuthenticated, requireFileReadAccess, getFile);
router.patch("/:id", isAuthenticated, requireFileWriteAccess, upload.single("file"), updateFile);
router.delete("/:id", isAuthenticated, requireFileDeleteAccess, deleteFile);

router.post("/:id/permissions", isAuthenticated, authorizeRole("ADMIN"), grantFilePermission);
router.get("/:id/permissions", isAuthenticated, authorizeRole("ADMIN"), listFilePermissions);
router.delete("/:id/permissions/:userId", isAuthenticated, authorizeRole("ADMIN"), revokeFilePermission);

export default router;