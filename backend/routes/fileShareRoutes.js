import express from 'express';
const router = express.Router();

import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import { requireFileAccess } from '../middlewares/requireFileAccess.js';
import { createFileShareLink, serveSharedFile } from '../controllers/fileShareController.js';
import { validateShareLink } from '../middlewares/validateSharedLink.js';

router.get('/:id', isAuthenticated, requirePermission("SHARE"), requireFileAccess("SHARE"), createFileShareLink);
router.get('/public/:token', validateShareLink,serveSharedFile);
export default router;