import { Router } from 'express';
import { executeTool } from './ai.controller';
import { executeAction } from './actions.controller';

const router = Router();

// AI Tool Çalıştırma (Sandbox - Salt Okunur veya Hafif İşlemler)
router.post('/execute-tool', executeTool);

// AI Aksiyon Yürütme (Kritik İşlemler, Validasyon ve Onay Gerektirenler)
router.post('/execute-action', executeAction);

export default router;

