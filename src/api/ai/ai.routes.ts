import { Router } from 'express';
import { executeTool } from './ai.controller';
import { executeAction } from './actions.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.post('/execute-tool', executeTool);

// AI Aksiyon Yürütme (Kritik İşlemler, Validasyon ve Onay Gerektirenler)
router.post('/execute-action', executeAction);

export default router;

