import { Router } from 'express';
import { StatsController } from './stats.controller';

const router = Router();

router.get('/savings', StatsController.getSavingsStats);

export default router;
