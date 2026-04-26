import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetail);
router.put('/users/:id/status', adminController.updateUserStatus);

// Logs management
router.get('/logs/all', adminController.getAllLogs);
router.get('/logs/today', adminController.getTodayLogs);

// Activity logs
router.get('/activity-logs', adminController.getActivityLogs);

export default router;
