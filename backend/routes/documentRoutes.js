import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { addDocumentType, deleteDocumentType } from '../controllers/documentTypeController.js';
const router = express.Router();

router.post("/add-documentType", isAuthenticated, isAdmin, addDocumentType);
router.delete("/delete-documentType", isAuthenticated, isAdmin, deleteDocumentType);

export default router;