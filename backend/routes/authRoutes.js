import express from 'express';
import { login, logout, refresh, register } from '../controllers/authController.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', isAuthenticated, logout);
router.post('/refresh', isAuthenticated, refresh);
export default router;