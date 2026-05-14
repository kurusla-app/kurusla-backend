import { Router } from 'express';
import { createGroup } from './groups.controller';

const router = Router();

// POST /api/groups/create
router.post('/create', createGroup);

export default router;
