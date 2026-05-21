import { Router } from 'express';
import { createGroup, joinGroup, getGroup } from './groups.controller';

const router = Router();

router.post('/create', createGroup);
router.post('/join', joinGroup);
router.get('/:groupId', getGroup);

export default router;
