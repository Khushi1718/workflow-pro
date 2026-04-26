import { Router } from 'express';
import * as workLogController from '../controllers/workLogController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/', workLogController.createWorkLog);
router.get('/my-logs', workLogController.getMyLogs);
router.get('/:id', workLogController.getLogDetail);
router.put('/:id', workLogController.updateWorkLog);
router.delete('/:id', workLogController.deleteWorkLog);

export default router;
