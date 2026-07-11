import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { addPermission, deletePermission } from '../controllers/permissionController.js';
const router = express.Router();

router.post("/add-permission", isAuthenticated, isAdmin, addPermission);
router.delete("/delete-permission", isAuthenticated, isAdmin, deletePermission);

export default router;