import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { addCategory, deleteCategory } from '../controllers/categoryController.js';
const router = express.Router();

router.post("/add-category", isAuthenticated, isAdmin, addCategory);
router.delete("/delete-category", isAuthenticated, isAdmin, deleteCategory);

export default router;