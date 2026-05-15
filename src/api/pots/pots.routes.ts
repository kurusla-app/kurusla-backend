import { Router } from 'express';
import { PotController } from './pots.controller';

const router = Router();

router.post('/', PotController.create);
router.get('/group/:groupId', PotController.listByGroup);
router.post('/approve/:requestId', PotController.approve);

export default router;
