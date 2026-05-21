import { Router } from 'express';
import { PotController } from './pots.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.post('/', PotController.create);
router.get('/group/:groupId', PotController.listByGroup);
router.post('/:potId/join', PotController.join);
router.get('/:potId/participants', PotController.listParticipants);
router.post('/:potId/contribute', PotController.contribute);
router.post('/:potId/withdraw', PotController.requestWithdrawal);
router.post('/approve/:requestId', PotController.approve);

export default router;
