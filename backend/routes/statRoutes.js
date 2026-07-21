import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { getStats } from '../controllers/statController.js';
import { cache } from '../middlewares/cache.js';
const router = express.Router();

router.get('/', isAuthenticated, isAdmin, cache("stats:dashboard", 300), getStats);

export default router;