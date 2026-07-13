import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { addAccess, removeAccess } from '../controllers/fileAccessController.js';
const router = express.Router();

router.post("/add", isAuthenticated, isAdmin, addAccess);
router.delete("/delete",isAuthenticated,isAdmin,removeAccess);

export default router;