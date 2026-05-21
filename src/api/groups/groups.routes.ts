import { Router } from 'express';
import { createGroup, joinGroup, getGroup } from './groups.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.post('/create', createGroup);
router.post('/join', joinGroup);
router.get('/:groupId', getGroup);

export default router;
