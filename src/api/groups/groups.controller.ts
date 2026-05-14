import { Request, Response } from 'express';
import prisma from '../../config/db';

/**
 * Grup oluşturma mantığını yönetir.
 */
export async function createGroup(req: Request, res: Response): Promise<any> {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Grup ismi zorunludur.' });
    }

    // Rastgele 6 haneli davet kodu üret
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const group = await prisma.group.create({
      data: {
        name,
        inviteCode,
      }
    });
    
    return res.status(201).json(group);
  } catch (error) {
    console.error('[Group Controller Hata]:', error);
    return res.status(500).json({ error: 'Grup oluşturulamadı.' });
  }
}
