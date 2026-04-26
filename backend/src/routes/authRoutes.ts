import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.use(authenticate);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/password', authController.updatePassword);

export default router;
