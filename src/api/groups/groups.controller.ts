import { Request, Response } from 'express';
import { GroupService } from '../../services/group.service';

export async function createGroup(req: Request, res: Response): Promise<any> {
  try {
    const { name, userId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Grup ismi zorunludur.' });
    }

    const group = await GroupService.createGroup(name, userId ? Number(userId) : undefined);

    return res.status(201).json({
      success: true,
      data: group,
      message: 'Grup oluşturuldu. Davet kodunu paylaşarak üye ekleyebilirsiniz.',
    });
  } catch (error: any) {
    console.error('[Group Controller Hata]:', error);
    return res.status(500).json({ error: error.message || 'Grup oluşturulamadı.' });
  }
}

/**
 * Kuruşla Paylaş — davet kodu ile gruba katıl
 */
export async function joinGroup(req: Request, res: Response): Promise<any> {
  try {
    const { inviteCode, userId } = req.body;

    if (!inviteCode || !userId) {
      return res.status(400).json({ error: 'inviteCode ve userId zorunludur.' });
    }

    const result = await GroupService.joinGroup(inviteCode, Number(userId));

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Gruba başarıyla katıldınız.',
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function getGroup(req: Request, res: Response): Promise<any> {
  try {
    const { groupId } = req.params;
    const group = await GroupService.getGroupById(Number(groupId));

    if (!group) {
      return res.status(404).json({ error: 'Grup bulunamadı.' });
    }

    return res.status(200).json({ success: true, data: group });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
