import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { addRole } from '../controllers/userController.js';
import { isAdmin } from '../middlewares/isAdmin.js';
const router = express.Router();

router.post("/add-role",isAuthenticated,addRole)

export default router;