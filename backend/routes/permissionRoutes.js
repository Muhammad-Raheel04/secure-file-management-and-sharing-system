import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { addPermission, deletePermission, grantRoleLevelPermissions, revokeRoleLevelPermissions } from '../controllers/permissionController.js';
const router = express.Router();

router.post("/add-permission", isAuthenticated, isAdmin, addPermission);
router.delete("/delete-permission", isAuthenticated, isAdmin, deletePermission);
router.post("/grant-role-permission",isAuthenticated,isAdmin,grantRoleLevelPermissions);
router.delete('/revoke-role-permission',isAuthenticated,isAdmin,revokeRoleLevelPermissions);

export default router;