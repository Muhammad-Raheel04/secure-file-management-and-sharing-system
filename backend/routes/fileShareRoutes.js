import express from 'express';
const router=express.Router();

import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { requirePermission } from '../middlewares/requirePermission.js';
import { requireFileAccess } from '../middlewares/requireFileAccess.js';
import { createFileShareLink } from '../controllers/fileShareController.js';

router.get('/:id',isAuthenticated,requirePermission("SHARE"),requireFileAccess("SHARE"),createFileShareLink);

export default router;