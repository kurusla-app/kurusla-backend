import { Router } from 'express';
import { executeTool } from './ai.controller';

const router = Router();

// AI Tool Çalıştırma (Sandbox)
router.post('/execute-tool', executeTool);

export default router;
