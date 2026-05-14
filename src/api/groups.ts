import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create group endpoint (Beşir/Taha logic)
router.post('/create', async (req, res) => {
  try {
    const { name } = req.body;
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const group = await prisma.group.create({
      data: {
        name,
        inviteCode,
      }
    });
    
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: 'Grup oluşturulamadı.' });
  }
});

export default router;
