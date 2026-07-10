import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { addRole, assignRole, removeRole, revokeRole } from '../controllers/userController.js';
import { isAdmin } from '../middlewares/isAdmin.js';
const router = express.Router();

router.post("/add-role", isAuthenticated, isAdmin, addRole);
router.delete("/remove-role", isAuthenticated, isAdmin, removeRole);
router.patch("/assign-role", isAuthenticated, isAdmin, assignRole);
router.delete("/revoke-role", isAuthenticated, isAdmin, revokeRole)
export default router;