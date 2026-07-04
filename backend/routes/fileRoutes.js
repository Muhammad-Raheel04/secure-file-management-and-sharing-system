import express from "express";
import { uploadFile } from "../controllers/fileController.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
const router = express.Router();

router.post('/upload', isAuthenticated, upload.single("file"), uploadFile);

export default router;