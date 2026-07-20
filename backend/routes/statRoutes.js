import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { getStats } from '../controllers/statController.js';
const router = express.Router();

router.get('/', isAuthenticated, isAdmin, getStats);

export default router;