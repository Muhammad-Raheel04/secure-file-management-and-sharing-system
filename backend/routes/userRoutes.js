import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { addRole, assignRole } from '../controllers/userController.js';
import { isAdmin } from '../middlewares/isAdmin.js';
const router = express.Router();

router.post("/add-role", isAuthenticated, isAdmin, addRole)
router.patch("/assign-role", isAuthenticated, isAdmin, assignRole);

export default router;